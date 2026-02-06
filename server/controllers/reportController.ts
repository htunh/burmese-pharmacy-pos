import { Request, Response } from "express";
import { query } from "../db/database";

export const getProfit = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `
      SELECT SUM(line_total) - SUM(cost_at_sale * qty) as profit
      FROM sale_items
      `,
    );
    const row = result.rows[0] as { profit: number };
    res.json({ totalProfit: row?.profit || 0 });
  } catch (error) {
    console.error("Error calculating profit:", error);
    res.status(500).json({ error: "Failed to calculate profit" });
  }
};

export const getLedger = async (req: Request, res: Response) => {
  const date = req.query.date as string; // YYYY-MM-DD

  if (!date) {
    res.status(400).json({ error: "Date parameter is required (YYYY-MM-DD)" });
    return;
  }

  try {
    // 1. Get Sales for the date
    const salesRes = await query(
      `
      SELECT id, sold_at as time, 'INCOME' as type, 'Sale #' || invoice_no as particulars, total as amount
      FROM sales 
      WHERE CAST(sold_at AS TEXT) LIKE $1
      `,
      [`${date}%`],
    );
    const sales = salesRes.rows;

    // 2. Get Expenses for the date
    const expensesRes = await query(
      `
      SELECT id, spent_at as time, 'EXPENSE' as type, particulars, amount
      FROM expenses
      WHERE CAST(spent_at AS TEXT) LIKE $1
      `,
      [`${date}%`],
    );
    const expenses = expensesRes.rows;

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

export const getDetailedProfit = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400).json({ error: "Start date and End date are required" });
    return;
  }

  try {
    // Postgres date() function works on timestamps
    const result = await query(
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
      WHERE date(s.sold_at) BETWEEN date($1) AND date($2)
      ORDER BY s.sold_at DESC
      `,
      [startDate, endDate],
    );
    const items = result.rows;

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
