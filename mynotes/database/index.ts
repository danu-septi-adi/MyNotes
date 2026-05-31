import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mynotes.db');
let initialized = false;

export function initDB() {
  if (initialized) return;
  initialized = true;

  db.execSync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, type TEXT NOT NULL, icon TEXT, color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL, category_id INTEGER NOT NULL, type TEXT NOT NULL,
      date TEXT NOT NULL, note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER, amount REAL NOT NULL, month TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
    CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, amount REAL NOT NULL, type TEXT NOT NULL,
      due_date TEXT, status TEXT DEFAULT 'active', note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium', due_date TEXT, reminder_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL, content TEXT NOT NULL, mood TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS wishlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, price REAL NOT NULL, priority TEXT DEFAULT 'later',
      target_amount REAL, saved_amount REAL DEFAULT 0, link TEXT, note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS tradings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pair TEXT NOT NULL, volume REAL NOT NULL, entry_price REAL NOT NULL,
      stop_loss REAL, take_profit REAL, reason TEXT, result REAL,
      status TEXT DEFAULT 'open', date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS investings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_name TEXT NOT NULL, asset_type TEXT NOT NULL,
      units REAL NOT NULL, buy_price REAL NOT NULL, total_invest REAL NOT NULL,
      current_price REAL, note TEXT, date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS credential_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT,
      fields TEXT NOT NULL DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES credential_categories (id)
    );
    CREATE TABLE IF NOT EXISTS currency_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE, rate REAL NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try { db.runSync(`ALTER TABLE transactions ADD COLUMN currency TEXT NOT NULL DEFAULT 'IDR'`); } catch (e) {}
  try { db.runSync(`ALTER TABLE debts ADD COLUMN currency TEXT NOT NULL DEFAULT 'IDR'`); } catch (e) {}
  try { db.runSync(`ALTER TABLE budgets ADD COLUMN currency TEXT NOT NULL DEFAULT 'IDR'`); } catch (e) {}
  try { db.runSync(`ALTER TABLE wishlists ADD COLUMN currency TEXT NOT NULL DEFAULT 'IDR'`); } catch (e) {}
  try { db.runSync(`ALTER TABLE tradings ADD COLUMN currency TEXT NOT NULL DEFAULT 'IDR'`); } catch (e) {}
  try { db.runSync(`ALTER TABLE investings ADD COLUMN currency TEXT NOT NULL DEFAULT 'IDR'`); } catch (e) {}

  const ratesExist = db.getAllSync('SELECT count(*) as c FROM currency_rates') as any[];
  if (ratesExist[0]?.c === 0) {
    const defaultRates: Record<string, number> = { USD: 1, IDR: 16500, EUR: 0.92, GBP: 0.79, SGD: 1.35, MYR: 4.68, JPY: 156.5, CNY: 7.24, KRW: 1370, SAR: 3.75, CHF: 0.90, AUD: 1.53, THB: 36.5 };
    for (const [code, rate] of Object.entries(defaultRates)) {
      db.runSync('INSERT OR REPLACE INTO currency_rates (code, rate, updated_at) VALUES (?, ?, datetime("now"))', [code, rate]);
    }
  }

  const cats = db.getAllSync('SELECT count(*) as c FROM categories') as any[];
  if (cats[0]?.c === 0) {
    db.runSync(`INSERT INTO categories (name, type, icon, color) VALUES
      ('Makanan', 'expense', 'food', '#FF6B6B'),
      ('Transport', 'expense', 'car', '#4ECDC4'),
      ('Belanja', 'expense', 'cart', '#45B7D1'),
      ('Hiburan', 'expense', 'movie', '#FFA07A'),
      ('Tagihan', 'expense', 'receipt', '#98D8C8'),
      ('Gaji', 'income', 'cash', '#6BCF7F'),
      ('Bonus', 'income', 'gift', '#FFD93D'),
      ('Lainnya', 'both', 'dots', '#95A5A6');
    `);
  }
}

initDB();

export default db;
