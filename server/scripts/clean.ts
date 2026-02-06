import pool from "../db/database";

const cleanDb = async () => {
  console.log("Cleaning database...");
  try {
    await pool.query("DELETE FROM sale_items");
    await pool.query("DELETE FROM payments");
    await pool.query("DELETE FROM sales");
    await pool.query("DELETE FROM inventory_batches");
    await pool.query("DELETE FROM products");
    await pool.query("DELETE FROM expenses");

    console.log("Database cleaned successfully.");
  } catch (error) {
    console.error("Error cleaning database:", error);
  } finally {
    pool.end();
  }
};

cleanDb();
