CREATE TABLE users (
  id BIGINT PRIMARY KEY NOT NULL,
  nickname VARCHAR(16) UNIQUE NOT NULL,
  api VARCHAR(32) DEFAULT NULL,
  admin BOOLEAN DEFAULT FALSE NOT NULL,
  blocked BOOLEAN DEFAULT FALSE NOT NULL
);

INSERT INTO users (id, nickname, admin)
VALUES
  (494209756, 'Ziozyun', TRUE),
  (873687184, 'NeMoKyryl', FALSE);

CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_transactions ON transactions (sender_id, receiver_id);

CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  transaction_id BIGINT REFERENCES transactions(id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoices ON invoices (transaction_id, user_id);

CREATE TABLE invoice_items (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  description TEXT
);

CREATE INDEX idx_invoice_items ON invoice_items (invoice_id);

CREATE TABLE warehouses (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE INDEX idx_warehouses ON warehouses (user_id);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stack INTEGER CHECK (quantity BETWEEN 1 AND 64) NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);

CREATE INDEX idx_products ON products (warehouse_id);

CREATE OR REPLACE FUNCTION calculate_balance(user_id BIGINT) RETURNS INTEGER AS $$
DECLARE
  balance INTEGER;
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN sender_id = user_id THEN -amount
      ELSE amount
    END), 0)
  INTO balance
  FROM transactions
  WHERE user_id IN (sender_id, receiver_id);

  RETURN balance;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION perform_transaction(
  sender_id BIGINT,
  receiver_id BIGINT,
  amount INTEGER,
  OUT status TEXT,
  OUT transaction_id BIGINT
) AS $$
DECLARE
BEGIN
  -- Перевірка, чи відправник вірна сума транзакції
  IF amount < 1 THEN
    status := 'INVALID_AMOUNT';
    RETURN;
  END IF;

  -- Перевірка, чи відправник і отримувач не є однією і тією ж самою особою
  IF sender_id = receiver_id THEN
    status := 'INVALID_OPERATION';
    RETURN;
  END IF;

  IF sender_id IS NOT NULL THEN
    -- Перевірка, чи відправник існує
    IF (SELECT COUNT(*) FROM users WHERE id = sender_id) = 0 THEN
      status := 'SENDER_NOT_FOUND';
      RETURN;
    END IF;
    
    -- Перевірка, чи відправник заблокований
    IF (SELECT blocked FROM users WHERE id = sender_id) THEN
      status := 'SENDER_IS_BLOCKED';
      RETURN;
    END IF;
  
    -- Перевірка балансу відправника
    IF calculate_balance(sender_id) < amount THEN
      status := 'NO_COST';
      RETURN;
    END IF;
  END IF;

  IF receiver_id IS NOT NULL THEN
    -- Перевірка, чи отримувач існує
    IF (SELECT COUNT(*) FROM users WHERE id = receiver_id) = 0 THEN
      status := 'RECEIVER_NOT_FOUND';
      RETURN;
    END IF;
    
    -- Перевірка, чи отримувач заблокований
    IF (SELECT blocked FROM users WHERE id = receiver_id) THEN
      status := 'RECEIVER_IS_BLOCKED';
      RETURN;
    END IF;
  END IF;

  -- Створюємо транзакцію і отримуємо її ID
  INSERT INTO transactions (sender_id, receiver_id, amount)
  VALUES (sender_id, receiver_id, amount)
  RETURNING id INTO transaction_id;
  
  -- Повертаємо успішну операцію та ID транзакції
  status := 'SUCCESS';
END;
$$ LANGUAGE plpgsql;

CREATE TYPE invoice_item_data AS (
  name TEXT,
  price INTEGER,
  quantity INTEGER,
  description TEXT
);

CREATE OR REPLACE FUNCTION create_invoice(
  user_id BIGINT,
  items invoice_item_data[],
  OUT status TEXT,
  OUT invoice_id BIGINT
) AS $$
BEGIN
  -- Перевірка, чи користувач існує
  IF (SELECT COUNT(*) FROM users WHERE id = user_id) = 0 THEN
    status := 'USER_NOT_FOUND';
    RETURN;
  END IF;

  -- Перевірка, чи користувач заблокований
  IF (SELECT blocked FROM users WHERE id = user_id) THEN
    status := 'USER_BLOCKED';
    RETURN;
  END IF;

  -- Перевірка валідності items
  IF NOT (SELECT bool_and(price > 0 AND quantity > 0 AND name IS NOT NULL) FROM UNNEST(items) AS i) THEN
    status := 'INVALID_FORMAT';
    RETURN;
  END IF;

  -- Створення інвойсу
  INSERT INTO invoices (user_id)
  VALUES (user_id)
  RETURNING id INTO invoice_id;

  INSERT INTO invoice_items (invoice_id, name, price, quantity, description)
  SELECT invoice_id, i.name, i.price, i.quantity, i.description
  FROM UNNEST(items) AS i;

  status := 'SUCCESS';
END;
$$ LANGUAGE plpgsql;
