CREATE TABLE users (
  id BIGINT PRIMARY KEY NOT NULL,
  nickname VARCHAR(16) UNIQUE NOT NULL,
  emoji TEXT,
  business_name TEXT,
  api TEXT DEFAULT NULL,
  admin BOOLEAN DEFAULT FALSE NOT NULL,
  banned BOOLEAN DEFAULT FALSE NOT NULL
);

INSERT INTO users (id, nickname, admin, emoji, business_name)
VALUES
  (494209756, 'Ziozyun', TRUE, NULL, NULL);

CREATE TABLE quotes (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  text TEXT NOT NULL
);

INSERT INTO quotes (text)
VALUES
  ('Долина Капібар 2 сезон');

CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  comment TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_transactions ON transactions (sender_id, receiver_id);

CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  transaction_id BIGINT REFERENCES transactions(id) ON DELETE SET NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSON NOT NULL
);

CREATE INDEX idx_invoices ON invoices (transaction_id, user_id);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stack INTEGER CHECK (stack BETWEEN 1 AND 64) NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);

CREATE INDEX idx_products ON products (user_id);

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
  comment TEXT,
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
    IF (SELECT banned FROM users WHERE id = sender_id) THEN
      status := 'SENDER_IS_BANNED';
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
    IF (SELECT banned FROM users WHERE id = receiver_id) THEN
      status := 'RECEIVER_IS_BANNED';
      RETURN;
    END IF;
  END IF;

  -- Створюємо транзакцію і отримуємо її ID
  INSERT INTO transactions (sender_id, receiver_id, amount, comment)
  VALUES (sender_id, receiver_id, amount, comment)
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
