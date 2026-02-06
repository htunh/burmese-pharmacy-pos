import { useEffect, useState, useCallback } from "react";
import { api, type ProfitReportItem } from "../services/api";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Calendar,
  FileText,
} from "lucide-react";

export default function ProfitReportPage() {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [items, setItems] = useState<ProfitReportItem[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalCost: 0,
    netProfit: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDetailedProfit(startDate, endDate);
      setItems(data.items);
      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to fetch profit report", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              အမြတ်/အရှုံး စာရင်း (Profit & Loss)
            </h1>
            <p className="text-gray-500 text-sm">
              Revenue, Cost and Profit Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 px-2">
            <Calendar size={16} className="text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none text-gray-700"
            />
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2 px-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none text-gray-700"
            />
          </div>
          <button
            onClick={fetchReport}
            className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            ထုတ်မည် (Generate)
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <DollarSign size={24} />
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                  Revenue
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">
                စုစုပေါင်း ဝင်ငွေ (Total Revenue)
              </p>
              <h3 className="text-2xl font-bold text-gray-800">
                {summary.totalRevenue.toLocaleString()} Ks
              </h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <CreditCard size={24} />
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                  Cost
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">
                စုစုပေါင်း အရင်း (Total Cost)
              </p>
              <h3 className="text-2xl font-bold text-gray-800">
                {summary.totalCost.toLocaleString()} Ks
              </h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 ring-4 ring-green-50">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                  <TrendingUp size={24} />
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                  Profit
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">
                အသားတင်အမြတ် (Net Profit)
              </p>
              <h3 className="text-3xl font-bold text-green-600">
                {summary.netProfit.toLocaleString()} Ks
              </h3>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2 text-gray-800 font-bold">
                <FileText size={18} className="text-gray-400" />
                အသေးစိတ် စာရင်း (Brief Breakdown)
              </div>
              <span className="text-xs text-gray-500">
                {items.length} records found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-3 font-medium">နေ့စွဲ (Date)</th>
                    <th className="px-6 py-3 font-medium">ဘောင်ချာ (Inv)</th>
                    <th className="px-6 py-3 font-medium">ဆေးအမည် (Name)</th>
                    <th className="px-6 py-3 font-medium text-center">
                      အရေအတွက်
                    </th>
                    <th className="px-6 py-3 font-medium text-right">
                      ရောင်းဈေး (Price)
                    </th>
                    <th className="px-6 py-3 font-medium text-right">
                      အရင်း (Cost)
                    </th>
                    <th className="px-6 py-3 font-medium text-right">
                      အမြတ် (Profit)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        Loading Report...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        အရောင်းစာရင်း မရှိပါ (No sales found)
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                          {new Date(item.sold_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 font-mono text-gray-500 text-xs">
                          #{item.invoice_no}
                        </td>
                        <td className="px-6 py-3">
                          <span className="font-medium text-gray-800">
                            {item.name_mm}
                          </span>
                          <span className="block text-xs text-gray-400">
                            {item.name_en}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center font-medium">
                          {item.qty}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {item.unit_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-500">
                          {item.cost_at_sale.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-green-600">
                          {item.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
