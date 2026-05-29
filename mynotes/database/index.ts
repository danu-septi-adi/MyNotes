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
  `);

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
