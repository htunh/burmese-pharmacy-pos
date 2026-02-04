import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "../../pharmacy.db");
const db = new Database(dbPath, { verbose: console.log });

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDb() {
  const schema = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_mm TEXT,
      name_en TEXT,
      barcode TEXT,
      sale_price INTEGER,
      reorder_level INTEGER
    );

    CREATE TABLE IF NOT EXISTS inventory_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      batch_no TEXT,
      expiry_date TEXT,
      cost_price INTEGER,
      qty_on_hand INTEGER,
      received_at TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no TEXT,
      sold_at TEXT,
      subtotal INTEGER,
      discount INTEGER,
      total INTEGER
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      product_id INTEGER,
      batch_id INTEGER,
      qty INTEGER,
      unit_price INTEGER,
      line_total INTEGER,
      cost_at_sale INTEGER,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (batch_id) REFERENCES inventory_batches(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      method TEXT CHECK(method IN ('CASH', 'KPAY', 'WAVE')),
      amount INTEGER,
      FOREIGN KEY (sale_id) REFERENCES sales(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spent_at TEXT,
      particulars TEXT,
      method TEXT,
      amount INTEGER,
      notes TEXT
    );
  `;

  db.exec(schema);
  console.log("Database schema initialized.");
}

export default db;
