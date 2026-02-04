import db from "../db/database";

const cleanDb = () => {
  console.log("Cleaning database...");

  try {
    db.exec(`
      DELETE FROM sale_items;
      DELETE FROM payments;
      DELETE FROM sales;
      DELETE FROM inventory_batches;
      DELETE FROM products;
      DELETE FROM expenses;
      DELETE FROM sqlite_sequence;
    `);
    console.log("Database cleaned successfully.");
  } catch (error) {
    console.error("Error cleaning database:", error);
  }
};

cleanDb();
