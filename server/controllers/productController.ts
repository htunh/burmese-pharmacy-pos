import { Request, Response } from "express";
import db from "../db/database";

export const getProducts = (req: Request, res: Response) => {
  try {
    const products = db
      .prepare(
        `
      SELECT p.*, COALESCE(SUM(ib.qty_on_hand), 0) as total_qty
      FROM products p
      LEFT JOIN inventory_batches ib ON p.id = ib.product_id
      GROUP BY p.id
    `,
      )
      .all();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const createProduct = (req: Request, res: Response) => {
  const { name_mm, name_en, barcode, sale_price, reorder_level } = req.body;

  if (!name_mm || !sale_price) {
    res.status(400).json({ error: "Name (MM) and Sale Price are required" });
    return;
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO products (name_mm, name_en, barcode, sale_price, reorder_level)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name_mm,
      name_en,
      barcode,
      sale_price,
      reorder_level || 10,
    );
    res.json({ id: result.lastInsertRowid, success: true });
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};
