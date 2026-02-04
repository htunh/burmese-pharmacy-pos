import axios from "axios";

const API_URL = "http://localhost:5000";

export interface Product {
  id: number;
  name_en: string;
  name_mm: string;
  barcode: string;
  sale_price: number;
  total_qty: number;
}

export interface LedgerItem {
  id: number;
  time: string;
  type: "INCOME" | "EXPENSE";
  particulars: string;
  amount: number;
}

export interface LedgerSummary {
  totalIncome: number;
  totalExpense: number;
  netCash: number;
}

export interface LedgerResponse {
  items: LedgerItem[];
  summary: LedgerSummary;
}

export interface SaleItem {
  id: number;
  name_en: string;
  name_mm?: string;
  qty: number;
  unit_price: number;
  line_total: number;
}

export interface SaleDetails {
  sale: {
    id: number;
    invoice_no: string;
    sold_at: string;
    total: number;
  };
  items: SaleItem[];
  payment: {
    method: string;
    amount: number;
  };
}

export const api = {
  getProducts: async () => {
    const response = await axios.get<Product[]>(`${API_URL}/products`);
    return response.data;
  },

  createSale: async (payload: {
    items: { productId: number; qty: number }[];
    payment: { method: string; amount: number };
  }) => {
    const response = await axios.post(`${API_URL}/sale`, payload);
    return response.data;
  },

  getProfit: async () => {
    const response = await axios.get<{ totalProfit: number }>(
      `${API_URL}/report/profit`,
    );
    return response.data;
  },

  getLedger: async (date: string) => {
    const response = await axios.get<LedgerResponse>(
      `${API_URL}/api/ledger?date=${date}`,
    );
    return response.data;
  },

  getSaleDetails: async (id: number) => {
    const response = await axios.get<SaleDetails>(`${API_URL}/api/sales/${id}`);
    return response.data;
  },
};
