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
