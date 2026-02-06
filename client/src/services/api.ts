import axios from "axios";

const API_URL = "http://localhost:5000";

export interface Product {
  id: number;
  name_en: string;
  name_mm: string;
  barcode: string;
  sale_price: number;
  total_qty: number;
  usable_qty: number;
  has_expiring_batch: number; // 1 or 0
  reorder_level?: number;
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

export interface StockHistoryItem {
  id: number;
  batch_no: string;
  expiry_date: string;
  cost_price: number;
  qty: number;
  received_at: string;
  name_mm: string;
  name_en: string;
}

export interface StockHistoryResponse {
  history: StockHistoryItem[];
  totalValue: number;
}

export interface ProfitReportItem {
  sold_at: string;
  invoice_no: string;
  name_mm: string;
  name_en: string;
  qty: number;
  unit_price: number;
  cost_at_sale: number;
  profit: number;
}

export interface ProfitReportResponse {
  items: ProfitReportItem[];
  summary: {
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
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

  createProduct: async (data: {
    name_mm: string;
    name_en?: string;
    barcode?: string;
    sale_price: number;
    reorder_level?: number;
  }) => {
    const response = await axios.post(`${API_URL}/products`, data);
    return response.data;
  },

  receiveStock: async (data: {
    product_id: number;
    batch_no: string;
    expiry_date: string;
    cost_price: number;
    qty: number;
  }) => {
    const response = await axios.post(`${API_URL}/api/stock/receive`, data);
    return response.data;
  },

  getStockHistory: async () => {
    const response = await axios.get<StockHistoryResponse>(
      `${API_URL}/api/stock/history`,
    );
    return response.data;
  },

  getDetailedProfit: async (startDate: string, endDate: string) => {
    const response = await axios.get<ProfitReportResponse>(
      `${API_URL}/report/detailed-profit`,
      {
        params: { startDate, endDate },
      },
    );
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
