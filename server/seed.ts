import db from "./db/database";

const productsData = [
  { name_en: "Biogesic 250mg", name_mm: "Biogesic", sale_price: 10000 },
  { name_en: "Tiffy Big", name_mm: "Tiffy ကြီး", sale_price: 5500 },
  { name_en: "Ameprolol Xl 25", name_mm: "Ameprolol", sale_price: 30000 },
  { name_en: "Enervon C", name_mm: "Enervon C", sale_price: 9500 },
  { name_en: "Silo 1000", name_mm: "Silo 1000", sale_price: 1000 },
  { name_en: "Parasafe 250", name_mm: "Parasafe", sale_price: 5300 },
  { name_en: "Solmux", name_mm: "Solmux", sale_price: 1000 },
];

function seed() {
  console.log("🌱 Starting database seed...");

  const insertProduct = db.prepare(`
    INSERT INTO products (name_mm, name_en, barcode, sale_price, reorder_level)
    VALUES (@name_mm, @name_en, @barcode, @sale_price, @reorder_level)
  `);

  const insertBatch = db.prepare(`
    INSERT INTO inventory_batches (product_id, batch_no, expiry_date, cost_price, qty_on_hand, received_at)
    VALUES (@product_id, @batch_no, @expiry_date, @cost_price, @qty_on_hand, @received_at)
  `);

  const deleteAllProducts = db.prepare("DELETE FROM products");
  const deleteAllBatches = db.prepare("DELETE FROM inventory_batches");

  db.transaction(() => {
    // Optional: Clear existing data
    // deleteAllBatches.run();
    // deleteAllProducts.run();

    for (const [index, p] of productsData.entries()) {
      // Generate dummy barcode and reorder level
      const barcode = `885${String(index + 1).padStart(5, "0")}`;
      const reorder_level = 10;

      const info = insertProduct.run({
        name_mm: p.name_mm,
        name_en: p.name_en,
        barcode,
        sale_price: p.sale_price,
        reorder_level,
      });

      const productId = info.lastInsertRowid as number;
      console.log(`Inserted product: ${p.name_en} (ID: ${productId})`);

      // Create 2-3 dummy batches
      const numBatches = Math.floor(Math.random() * 2) + 2; // 2 or 3
      for (let i = 0; i < numBatches; i++) {
        const costPrice = Math.floor(p.sale_price * 0.7);
        const qty = Math.floor(Math.random() * 50) + 20; // 20-70
        const batchNo = `B${Date.now().toString().slice(-6)}-${productId}-${i}`;

        // Random expiry date next year (2027)
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(
          2,
          "0",
        );
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
        const expiryDate = `2027-${month}-${day}`;

        insertBatch.run({
          product_id: productId,
          batch_no: batchNo,
          expiry_date: expiryDate,
          cost_price: costPrice,
          qty_on_hand: qty,
          received_at: new Date().toISOString(),
        });
        console.log(
          `  - Added batch ${batchNo}: Qty ${qty}, Cost ${costPrice}`,
        );
      }
    }
  })();

  console.log("✅ Seeding completed.");
}

seed();
