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
  (494209756, 'Ziozyun', TRUE, NULL, NULL),
  (873687184, 'Kyryl_Kruhliak', FALSE, NULL, NULL),
  (5300000961, 'Capybarsk', FALSE, '🌃', 'Капібарськ'),
  (543592260, 'Han__Salo', FALSE, NULL, NULL);

CREATE TABLE quotes (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  text TEXT NOT NULL
);

INSERT INTO quotes (text)
VALUES
  ('Гроші - це єдине, що ти можеш втратити, іншого варіанту немає!'),
  ('Фінансовий стан мене не турбує - у мене його просто немає!'),
  ('Якщо ви думаєте, що гроші не можуть купити щастя, спробуйте виплатити рахунок за лікування.'),
  ('Мій банківський рахунок - це як моя дівчина, я завжди з ним сперечаюся.'),
  ('Фінанси - це коли ти обираєш між платити за оренду або купувати піццу. Піцца завжди перемагає!'),
  ('У мене є два види людей: ті, у кого є гроші, і ті, хто платить за піццу.'),
  ('Якщо ваші фінанси не виглядають як бізнес-план наркоторговця, ви робите їх не правильно.'),
  ('Запасайтеся грошима, бо у кінці місяця вони доволі рідкісні.'),
  ('Завжди думайте про гроші, але ніколи не говоріть про них. Вони чують вас!'),
  ('Фінанси - це як забавка для дорослих, де правила гри здаються незрозумілими, а всі здорово виграють головний приз - податки!'),
  ('Гроші - це корінь всього зла, але вони дуже корисні для оплати рахунків.'),
  ('Фінансова незалежність - це коли ваші гроші роблять більше грошей, ніж ви.'),
  ('Якщо гроші зробили б щасливими, всі б були б щасливі, купивши піццу.'),
  ('Мої фінанси - це мова, якою я не розмовляю.'),
  ('Гроші - це те, що ти отримуєш, коли ти не отримуєш щось краще.'),
  ('Якщо б діти витрачали гроші так, як моя дружина, ми б жили в іншій країні.'),
  ('Фінанси - це та гра, де правила змінюються, а кермани нашої зарплати - це вже не багато паперів.'),
  ('Я дізнався, що гроші не можуть купити щастя, коли я вирішив купити новий іфон замість торта.'),
  ('Фінанси - це як підручник географії: ми завжди знаємо, де розташовані наші гроші.'),
  ('Вираз "фінансовий успіх" означає те, коли ви маєте декілька доларів у банківському рахунку і намагаєтеся виглядати як мільйонер.'),
  ('Фінанси - це коли гроші залишають твою кишеню так швидко, як ти заходиш у магазин.'),
  ('Гроші - це тільки цифри на екрані, але вони дуже впливають на моє емоційне становище.'),
  ('Фінансова незалежність - це той момент, коли твоя зарплата надходить до тебе, а не до рахунків і кредиторів.'),
  ('Гроші можуть бути проблемою, але вони також розв''язують багато проблем, особливо ті, які стосуються грошей.'),
  ('Фінансовий порадник - це людина, яка бере гроші за те, щоб сказати вам, що ви вже витратили їх зайвий раз.'),
  ('Гроші - це те, що робить світ оберненим сірим місцем, буквально і фігурально.'),
  ('Фінанси - це те, що змушує тебе обговорювати справи за обіднім столом.'),
  ('Якщо б гроші можна було купити, я би купив багато грошей.'),
  ('Фінансовий успіх - це коли ви можете купити каву без перевірки балансу на банківському рахунку.'),
  ('Гроші - це те, що змушує нас працювати, але також змушує нас пити.'),
  ('Фінанси - це мова, яку не можна розмовляти з порожньою кишенею.'),
  ('Якщо гроші не роблять вас щасливими, ви просто не знаєте, як їх витратити.'),
  ('Якщо б банк відмовив мені в кредиті ще раз, я думаю, я просто розгрібався на столі.'),
  ('Кредит - це той момент, коли банк допомагає вам відкласти розгром на майбутнє.'),
  ('Гроші - це не єдина річ, яку банки можуть вам відмовити.'),
  ('Банкіри - це ті, хто позичає вам парасольку, коли сонце сяє, і забирають, коли дощ ллє.'),
  ('Я відкрив зберігаючи рахунок у банку. Вони вчили мене зберігати гроші - просто не у ньому.'),
  ('Якщо банк відкрив для мене рахунок, це вже смішно, якщо б я вже щось мав, я б засмітився.'),
  ('У кожного свій собі банк, поки не виявляється, що банк - це той, хто має вас.'),
  ('Я б назвав банкіра друзянкою, але друзі не збирають відсотки.'),
  ('Коли ви берете кредит у банку, ви купуєте кілька років безсонних ночей.'),
  ('Банки - це місце, де ви запитуєте про кредит і вам дають книжку бажань з розшифровками.'),
  ('Щоб знайти банкомат, вам потрібно мати гроші, щоб придбати мобільний інтернет та шукати в Google Maps.'),
  ('Банкіри - це єдина професія, де вони питають вас, скільки у вас грошей, і вам доводиться їм відповідати.'),
  ('Гроші - це те, заради чого багато людей ідуть на роботу, інші роблять весільні фотографії.'),
  ('Банкіри - це ті, хто найбільше багається за вашу фінансову стабільність... коли ви в їх боргах.'),
  ('Гроші - це корінь багатьох бід, але вони допомагають покрити витрати на адвоката.'),
  ('Якщо б банкір розумів гроші, він би не працював у банку, а перепрошував би нас у супермаркеті.'),
  ('Ваш банк завжди готовий вас підтримати... на багато більшу кількість грошей, ніж у вас є.'),
  ('Бізнес - це мистецтво робити гроші і затратити їх, перш ніж зрозуміти, що вони були.'),
  ('Я відкрив свій бізнес. Тепер я маю два джоби - один для грошей, інший для боргів.'),
  ('Якщо ви не готові віддати свій організм бізнесу, ви, ймовірно, занадто добре виглядаєте.'),
  ('Бізнес - це як гірка шоколадка: солодка на початку, але потім залишає післясмак.'),
  ('Коли ваш бізнес іде на спад, ви стаєте експертом з розваг та музики на робочому місці.'),
  ('Бізнес - це як іграшка "Монополія", але гроші витрачаються реальні.'),
  ('У бізнесі немає жодних обмежень, окрім обмежень в бюджеті.'),
  ('Я мрію відкрити свій бізнес. Інколи я навіть прокидаюся і роблю каву.'),
  ('Бізнес - це як виховання дітей: ніколи не знаєш, як це важко, доки не спробуєш.'),
  ('Якщо ви хочете знати, чому бізнес називається "гроші", зверніться до бухгалтера.'),
  ('Бізнес - це мистецтво заробити гроші, щоб вони могли зникнути в витрати.'),
  ('В бізнесі найголовніше - бути готовим віддати гроші, якщо ви хочете їх заробити.'),
  ('Якщо бізнес був би легкою справою, всі би цим займалися, але вони б не заробляли грошей.'),
  ('Бізнес - це мова цифр і кавових перерв.'),
  ('Коли ви ведете свій бізнес, ви знаєте, що завтрашній день завжди буде рухатися швидше, ніж ви.'),
  ('Бізнес - це як гра в шахи, але шахи з занадто багатьма фігурами і нульовими паузами.'),
  ('Життя - це гра, а бізнес - це спосіб виграти її, зберігаючи свої гроші.') ;

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
  IF (SELECT banned FROM users WHERE id = user_id) THEN
    status := 'USER_BANNED';
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
