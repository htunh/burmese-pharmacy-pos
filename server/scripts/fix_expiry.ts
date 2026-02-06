import pool from "../db/database";

const fixExpiry = async () => {
  console.log("Fixing expiry dates...");
  try {
    const result = await pool.query(
      `
      UPDATE inventory_batches 
      SET expiry_date = '2027-01-01' 
      WHERE batch_no = 'INIT'
      `,
    );

    console.log(`Updated ${result.rowCount} batches to expire in 2027.`);
  } catch (error) {
    console.error("Error updating expiry dates:", error);
  } finally {
    pool.end();
  }
};

fixExpiry();
