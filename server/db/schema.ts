import { query } from "./database";

export async function initDb() {
  const schema = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name_mm TEXT,
      name_en TEXT,
      barcode TEXT,
      sale_price INTEGER,
      reorder_level INTEGER
    );

    CREATE TABLE IF NOT EXISTS inventory_batches (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id),
      batch_no TEXT,
      expiry_date TEXT, -- Storing as ISO string YYYY-MM-DD
      cost_price INTEGER,
      qty_on_hand INTEGER,
      received_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      invoice_no TEXT,
      sold_at TIMESTAMP DEFAULT NOW(),
      subtotal INTEGER,
      discount INTEGER,
      total INTEGER
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER REFERENCES sales(id),
      product_id INTEGER REFERENCES products(id),
      batch_id INTEGER REFERENCES inventory_batches(id),
      qty INTEGER,
      unit_price INTEGER,
      line_total INTEGER,
      cost_at_sale INTEGER
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER REFERENCES sales(id),
      method TEXT CHECK(method IN ('CASH', 'KPAY', 'WAVE')),
      amount INTEGER
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      spent_at TIMESTAMP DEFAULT NOW(),
      particulars TEXT,
      method TEXT,
      amount INTEGER,
      notes TEXT
    );
  `;

  try {
    await query(schema);
    console.log("Database schema initialized (Postgres).");
  } catch (error) {
    console.error("Error initializing schema:", error);
    throw error;
  }
}
