import { Request, Response } from "express";
import db from "../db/database";

export const createSale = (req: Request, res: Response) => {
  const { items, payment } = req.body;
  // items: [{ productId, qty }], payment: { method, amount }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Invalid items data" });
    return;
  }
  if (!payment || !payment.method || !payment.amount) {
    res.status(400).json({ error: "Invalid payment data" });
    return;
  }

  const transaction = db.transaction(() => {
    let subtotal = 0;
    const saleDate = new Date().toISOString();
    const invoiceNo = `INV-${Date.now()}`;

    // 1. Create Sale Record
    const insertSale = db.prepare(`
      INSERT INTO sales (invoice_no, sold_at, subtotal, discount, total)
      VALUES (?, ?, ?, ?, ?)
    `);

    const saleFields = insertSale.run(invoiceNo, saleDate, 0, 0, 0);
    const saleId = saleFields.lastInsertRowid;

    // 2. Process Items
    for (const item of items) {
      if (item.qty <= 0) continue;

      const product = db
        .prepare("SELECT sale_price FROM products WHERE id = ?")
        .get(item.productId) as { sale_price: number };
      if (!product) throw new Error(`Product ID ${item.productId} not found`);

      let qtyNeeded = item.qty;
      const unitPrice = product.sale_price;
      let lineTotal = 0;

      // FIFO: Get batches ordered by expiry
      const batches = db
        .prepare(
          `
        SELECT * FROM inventory_batches 
        WHERE product_id = ? AND qty_on_hand > 0 
        ORDER BY expiry_date ASC
      `,
        )
        .all(item.productId) as any[];

      for (const batch of batches) {
        if (qtyNeeded <= 0) break;

        const qtyToTake = Math.min(batch.qty_on_hand, qtyNeeded);

        // Update batch
        db.prepare(
          "UPDATE inventory_batches SET qty_on_hand = qty_on_hand - ? WHERE id = ?",
        ).run(qtyToTake, batch.id);

        // Insert sale item
        db.prepare(
          `
          INSERT INTO sale_items (sale_id, product_id, batch_id, qty, unit_price, line_total, cost_at_sale)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        ).run(
          saleId,
          item.productId,
          batch.id,
          qtyToTake,
          unitPrice,
          qtyToTake * unitPrice,
          batch.cost_price,
        );

        qtyNeeded -= qtyToTake;
        lineTotal += qtyToTake * unitPrice;
      }

      if (qtyNeeded > 0) {
        throw new Error(`Insufficient stock for Product ID ${item.productId}`);
      }

      subtotal += lineTotal;
    }

    // 3. Insert Payment
    db.prepare(
      `
      INSERT INTO payments (sale_id, method, amount)
      VALUES (?, ?, ?)
    `,
    ).run(saleId, payment.method, payment.amount);

    // 4. Update Sale Totals
    db.prepare("UPDATE sales SET subtotal = ?, total = ? WHERE id = ?").run(
      subtotal,
      subtotal,
      saleId,
    );

    return { saleId, invoiceNo, total: subtotal };
  });

  try {
    const result = transaction();
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Sale transaction failed:", err.message);
    res.status(400).json({ error: err.message });
  }
};

export const getSaleDetails = (req: Request, res: Response) => {
  const saleId = req.params.id;

  try {
    const sale = db.prepare("SELECT * FROM sales WHERE id = ?").get(saleId);

    if (!sale) {
      res.status(404).json({ error: "Sale not found" });
      return;
    }

    const items = db
      .prepare(
        `
      SELECT si.*, p.name_en, p.name_mm 
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `,
      )
      .all(saleId);

    const payment = db
      .prepare("SELECT * FROM payments WHERE sale_id = ?")
      .get(saleId);

    res.json({
      sale,
      items,
      payment,
    });
  } catch (error) {
    console.error("Error fetching sale details:", error);
    res.status(500).json({ error: "Failed to fetch sale details" });
  }
};
