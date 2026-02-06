import { Request, Response } from "express";
import { query } from "../db/database";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `
      SELECT 
        p.*, 
        COALESCE(SUM(ib.qty_on_hand), 0) as total_qty,
        COALESCE(SUM(CASE WHEN ib.expiry_date::DATE > CURRENT_DATE THEN ib.qty_on_hand ELSE 0 END), 0) as usable_qty,
        MAX(CASE WHEN ib.expiry_date::DATE > CURRENT_DATE AND ib.expiry_date::DATE <= CURRENT_DATE + INTERVAL '60 days' THEN 1 ELSE 0 END) as has_expiring_batch
      FROM products p
      LEFT JOIN inventory_batches ib ON p.id = ib.product_id
      GROUP BY p.id
      `,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name_mm, name_en, barcode, sale_price, reorder_level } = req.body;

  if (!name_mm || !sale_price) {
    res.status(400).json({ error: "Name (MM) and Sale Price are required" });
    return;
  }

  try {
    const result = await query(
      `
      INSERT INTO products (name_mm, name_en, barcode, sale_price, reorder_level)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [name_mm, name_en, barcode, sale_price, reorder_level || 10],
    );

    res.json({ id: result.rows[0].id, success: true });
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};
