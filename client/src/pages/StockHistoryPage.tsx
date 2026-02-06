import { useEffect, useState } from "react";
import { api, type StockHistoryItem } from "../services/api";
import {
  Clock,
  TrendingUp,
  Search,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

export default function StockHistoryPage() {
  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGrouped, setIsGrouped] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getStockHistory();
      setHistory(data.history);
      setTotalValue(data.totalValue);
    } catch (error) {
      console.error("Failed to load stock history", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name_mm.toLowerCase().includes(query) ||
      item.name_en.toLowerCase().includes(query) ||
      item.batch_no.toLowerCase().includes(query)
    );
  });

  const groupedHistory = filteredHistory.reduce(
    (acc, item) => {
      if (!acc[item.name_mm]) {
        acc[item.name_mm] = {
          name_mm: item.name_mm,
          name_en: item.name_en,
          items: [],
          totalQty: 0,
          totalVal: 0,
        };
      }
      acc[item.name_mm].items.push(item);
      acc[item.name_mm].totalQty += item.qty;
      acc[item.name_mm].totalVal += item.cost_price * item.qty;
      return acc;
    },
    {} as Record<
      string,
      {
        name_mm: string;
        name_en: string;
        items: StockHistoryItem[];
        totalQty: number;
        totalVal: number;
      }
    >,
  );

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              ကုန်ပစ္စည်း မှတ်တမ်း (Stock History)
            </h1>
            <p className="text-gray-500 text-sm">
              View and manage stock batches
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Total Value Card - Compact */}
          <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
            <div className="p-1.5 bg-blue-200 text-blue-700 rounded-lg">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium whitespace-nowrap">
                တန်ဖိုး စုစုပေါင်း (Total)
              </p>
              <p className="text-lg font-bold text-blue-900 leading-none">
                {totalValue.toLocaleString()} Ks
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-300 hidden md:block"></div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ဆေးအမည် (သို့) Batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
            />
          </div>

          <button
            onClick={() => setIsGrouped(!isGrouped)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm whitespace-nowrap",
              isGrouped
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            <Layers size={18} />
            {isGrouped ? "အသေးစိတ် (Ungroup)" : "ဆေးအလိုက် (Group)"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Content */}
          {isGrouped ? (
            <div className="space-y-4">
              {Object.values(groupedHistory).map((group) => (
                <div
                  key={group.name_mm}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div
                    onClick={() => toggleGroup(group.name_mm)}
                    className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedGroups[group.name_mm] ? (
                        <ChevronDown size={20} className="text-gray-500" />
                      ) : (
                        <ChevronRight size={20} className="text-gray-500" />
                      )}
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {group.name_mm}
                        </h3>
                        <p className="text-xs text-gray-500">{group.name_en}</p>
                      </div>
                    </div>
                    <div className="text-right flex gap-6">
                      <div>
                        <p className="text-xs text-gray-500">အရေအတွက်</p>
                        <p className="font-bold text-gray-800">
                          {group.totalQty}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          တန်ဖိုး စုစုပေါင်း
                        </p>
                        <p className="font-bold text-green-600">
                          {group.totalVal.toLocaleString()} Ks
                        </p>
                      </div>
                    </div>
                  </div>

                  {expandedGroups[group.name_mm] && (
                    <div className="border-t border-gray-100">
                      <table className="w-full text-left">
                        <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider">
                          <tr className="border-b border-gray-100">
                            <th className="px-6 py-3 font-medium">နေ့စွဲ</th>
                            <th className="px-6 py-3 font-medium">Batch</th>
                            <th className="px-6 py-3 font-medium text-right">
                              အဝယ်ဈေး
                            </th>
                            <th className="px-6 py-3 font-medium text-center">
                              အရေအတွက်
                            </th>
                            <th className="px-6 py-3 font-medium text-right">
                              စုစုပေါင်း
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                          {group.items.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/50">
                              <td className="px-6 py-3 text-gray-600">
                                {new Date(
                                  item.received_at,
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-3 font-mono text-gray-600">
                                {item.batch_no}
                              </td>
                              <td className="px-6 py-3 text-right">
                                {item.cost_price.toLocaleString()} Ks
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span
                                  className={clsx(
                                    "px-2 py-0.5 rounded text-xs",
                                    item.qty > 0
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700",
                                  )}
                                >
                                  {item.qty}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right font-medium">
                                {(item.cost_price * item.qty).toLocaleString()}{" "}
                                Ks
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
              {Object.keys(groupedHistory).length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 text-gray-500">
                  မှတ်တမ်း မရှိပါ
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">နေ့စွဲ (Date)</th>
                      <th className="px-6 py-4 font-medium">ဆေးအမည် (Name)</th>
                      <th className="px-6 py-4 font-medium">ဘတ်ချ် (Batch)</th>
                      <th className="px-6 py-4 font-medium text-right">
                        အဝယ်ဈေး (Cost)
                      </th>
                      <th className="px-6 py-4 font-medium text-center">
                        အရေအတွက် (Qty)
                      </th>
                      <th className="px-6 py-4 font-medium text-right">
                        စုစုပေါင်း (Total)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-gray-400"
                        >
                          Loading history...
                        </td>
                      </tr>
                    ) : filteredHistory.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-gray-400"
                        >
                          မှတ်တမ်း မရှိပါ (No stock history)
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {new Date(item.received_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">
                              {item.name_mm}
                            </div>
                            <div className="text-xs text-gray-400">
                              {item.name_en}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-mono">
                              {item.batch_no}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600 font-medium">
                            {item.cost_price.toLocaleString()} Ks
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={clsx(
                                "px-3 py-1 rounded-full text-xs font-bold",
                                item.qty > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700",
                              )}
                            >
                              {item.qty}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-800">
                            {(item.cost_price * item.qty).toLocaleString()} Ks
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
