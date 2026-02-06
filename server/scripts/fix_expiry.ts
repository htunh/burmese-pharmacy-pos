import db from "../db/database";

const fixExpiry = () => {
  console.log("Fixing expiry dates...");
  try {
    const result = db
      .prepare(
        `
      UPDATE inventory_batches 
      SET expiry_date = '2027-01-01' 
      WHERE batch_no = 'INIT'
    `,
      )
      .run();

    console.log(`Updated ${result.changes} batches to expire in 2027.`);
  } catch (error) {
    console.error("Error updating expiry dates:", error);
  }
};

fixExpiry();
