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
