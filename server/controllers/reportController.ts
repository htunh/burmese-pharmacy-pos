import { Request, Response } from "express";
import db from "../db/database";

export const getProfit = (req: Request, res: Response) => {
  try {
    const result = db
      .prepare(
        `
      SELECT SUM(line_total) - SUM(cost_at_sale * qty) as profit
      FROM sale_items
    `,
      )
      .get() as { profit: number };
    res.json({ totalProfit: result.profit || 0 });
  } catch (error) {
    console.error("Error calculating profit:", error);
    res.status(500).json({ error: "Failed to calculate profit" });
  }
};

export const getLedger = (req: Request, res: Response) => {
  const date = req.query.date as string;

  if (!date) {
    res.status(400).json({ error: "Date parameter is required (YYYY-MM-DD)" });
    return;
  }

  try {
    // 1. Get Sales for the date
    const sales = db
      .prepare(
        `
      SELECT id, sold_at as time, 'INCOME' as type, 'Sale #' || invoice_no as particulars, total as amount
      FROM sales 
      WHERE sold_at LIKE ?
    `,
      )
      .all(`${date}%`);

    // 2. Get Expenses for the date
    const expenses = db
      .prepare(
        `
      SELECT id, spent_at as time, 'EXPENSE' as type, particulars, amount
      FROM expenses
      WHERE spent_at LIKE ?
    `,
      )
      .all(`${date}%`);

    // 3. Merge and Sort
    const ledger = [...sales, ...expenses].sort(
      (a: any, b: any) =>
        new Date(a.time).getTime() - new Date(b.time).getTime(),
    );

    // 4. Calculate Summary
    const totalIncome = sales.reduce(
      (sum: number, item: any) => sum + item.amount,
      0,
    );
    const totalExpense = expenses.reduce(
      (sum: number, item: any) => sum + item.amount,
      0,
    );

    res.json({
      items: ledger,
      summary: {
        totalIncome,
        totalExpense,
        netCash: totalIncome - totalExpense,
      },
    });
  } catch (error) {
    console.error("Error fetching ledger:", error);
    res.status(500).json({ error: "Failed to fetch ledger" });
  }
};

export const getDetailedProfit = (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400).json({ error: "Start date and End date are required" });
    return;
  }

  try {
    const items = db
      .prepare(
        `
      SELECT 
        s.sold_at,
        s.invoice_no,
        p.name_mm,
        p.name_en,
        si.qty,
        si.unit_price, 
        si.cost_at_sale
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      WHERE date(s.sold_at) BETWEEN date(?) AND date(?)
      ORDER BY s.sold_at DESC
    `,
      )
      .all(startDate, endDate);

    const detailedItems = items.map((item: any) => ({
      ...item,
      profit: (item.unit_price - item.cost_at_sale) * item.qty,
    }));

    const summary = detailedItems.reduce(
      (acc: any, item: any) => ({
        totalRevenue: acc.totalRevenue + item.unit_price * item.qty,
        totalCost: acc.totalCost + item.cost_at_sale * item.qty,
        netProfit: acc.netProfit + item.profit,
      }),
      { totalRevenue: 0, totalCost: 0, netProfit: 0 },
    );

    res.json({ items: detailedItems, summary });
  } catch (error) {
    console.error("Error fetching detailed profit:", error);
    res.status(500).json({ error: "Failed to fetch detailed profit report" });
  }
};
