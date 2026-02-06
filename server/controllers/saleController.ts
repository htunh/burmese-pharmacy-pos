import { Request, Response } from "express";
import pool from "../db/database";

export const createSale = async (req: Request, res: Response) => {
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

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let subtotal = 0;
    const saleDate = new Date().toISOString(); // Postgres timestamp accepts ISO string
    const invoiceNo = `INV-${Date.now()}`;

    // 1. Create Sale Record
    const insertSaleRes = await client.query(
      `
      INSERT INTO sales (invoice_no, sold_at, subtotal, discount, total)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [invoiceNo, saleDate, 0, 0, 0],
    );
    const saleId = insertSaleRes.rows[0].id;

    // 2. Process Items
    for (const item of items) {
      if (item.qty <= 0) continue;

      const productRes = await client.query(
        "SELECT sale_price FROM products WHERE id = $1",
        [item.productId],
      );
      const product = productRes.rows[0];

      if (!product) throw new Error(`Product ID ${item.productId} not found`);

      let qtyNeeded = item.qty;
      const unitPrice = product.sale_price;
      let lineTotal = 0;

      // FIFO: Get batches ordered by expiry
      const batchesRes = await client.query(
        `
        SELECT * FROM inventory_batches 
        WHERE product_id = $1 AND qty_on_hand > 0 
        ORDER BY expiry_date ASC
        `,
        [item.productId],
      );
      const batches = batchesRes.rows;

      for (const batch of batches) {
        if (qtyNeeded <= 0) break;

        const qtyToTake = Math.min(batch.qty_on_hand, qtyNeeded);

        // Update batch
        await client.query(
          "UPDATE inventory_batches SET qty_on_hand = qty_on_hand - $1 WHERE id = $2",
          [qtyToTake, batch.id],
        );

        // Insert sale item
        await client.query(
          `
          INSERT INTO sale_items (sale_id, product_id, batch_id, qty, unit_price, line_total, cost_at_sale)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            saleId,
            item.productId,
            batch.id,
            qtyToTake,
            unitPrice,
            qtyToTake * unitPrice,
            batch.cost_price,
          ],
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
    await client.query(
      `
      INSERT INTO payments (sale_id, method, amount)
      VALUES ($1, $2, $3)
      `,
      [saleId, payment.method, payment.amount],
    );

    // 4. Update Sale Totals
    await client.query(
      "UPDATE sales SET subtotal = $1, total = $2 WHERE id = $3",
      [subtotal, subtotal, saleId],
    );

    await client.query("COMMIT");

    res.json({ success: true, saleId, invoiceNo, total: subtotal });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Sale transaction failed:", err.message);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const getSaleDetails = async (req: Request, res: Response) => {
  const saleId = req.params.id;

  try {
    const saleRes = await pool.query("SELECT * FROM sales WHERE id = $1", [
      saleId,
    ]);
    const sale = saleRes.rows[0];

    if (!sale) {
      res.status(404).json({ error: "Sale not found" });
      return;
    }

    const itemsRes = await pool.query(
      `
      SELECT si.*, p.name_en, p.name_mm 
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = $1
      `,
      [saleId],
    );
    const items = itemsRes.rows;

    const paymentRes = await pool.query(
      "SELECT * FROM payments WHERE sale_id = $1",
      [saleId],
    );
    const payment = paymentRes.rows[0];

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
