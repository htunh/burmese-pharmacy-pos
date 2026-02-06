import { Request, Response } from "express";
import { query } from "../db/database";

export const receiveStock = async (req: Request, res: Response) => {
  const { product_id, batch_no, expiry_date, cost_price, qty } = req.body;

  if (!product_id || !batch_no || !expiry_date || !cost_price || !qty) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  // Validate expiry date is in the future
  if (new Date(expiry_date) <= new Date()) {
    res.status(400).json({ error: "Expiry date must be in the future" });
    return;
  }

  try {
    const received_at = new Date().toISOString();

    const result = await query(
      `
      INSERT INTO inventory_batches (product_id, batch_no, expiry_date, cost_price, qty_on_hand, received_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [product_id, batch_no, expiry_date, cost_price, qty, received_at],
    );

    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error("Error receiving stock:", error);
    res.status(500).json({ error: "Failed to receive stock" });
  }
};

export const getStockHistory = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `
      SELECT 
        ib.id,
        ib.batch_no,
        ib.expiry_date,
        ib.cost_price,
        ib.qty_on_hand as qty,
        ib.received_at,
        p.name_mm,
        p.name_en
      FROM inventory_batches ib
      JOIN products p ON ib.product_id = p.id
      ORDER BY ib.received_at DESC
      `,
    );

    const history = result.rows;

    const totalValue = history.reduce(
      (sum: number, item: any) => sum + item.cost_price * item.qty,
      0,
    );

    res.json({
      history,
      totalValue,
    });
  } catch (error) {
    console.error("Error fetching stock history:", error);
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
};
