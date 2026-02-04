import { useEffect, useState } from "react";
import { api } from "../services/api";
import { ReceiptModal } from "../components/ReceiptModal";
import { Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import clsx from "clsx";

export default function LedgerPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [ledgerData, setLedgerData] = useState<
    import("../services/api").LedgerResponse
  >({
    items: [],
    summary: { totalIncome: 0, totalExpense: 0, netCash: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true);
      try {
        const data = await api.getLedger(date);
        setLedgerData(data);
      } catch (error) {
        console.error("Failed to load ledger", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [date]);

  const handlePrevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            နေ့စဉ်စာရင်း (Daily Ledger)
          </h1>
          <p className="text-gray-500 text-sm">
            Track daily sales and expenses
          </p>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2 px-2">
            <Calendar size={18} className="text-blue-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent font-medium text-gray-800 outline-none"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Total Income
          </span>
          <span className="text-2xl font-bold text-green-600">
            +{ledgerData.summary.totalIncome?.toLocaleString() || 0} Ks
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Total Expense
          </span>
          <span className="text-2xl font-bold text-red-500">
            -{ledgerData.summary.totalExpense?.toLocaleString() || 0} Ks
          </span>
        </div>
        <div className="bg-blue-600 p-5 rounded-2xl shadow-md border border-blue-500 flex flex-col text-white">
          <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">
            Net Cash
          </span>
          <span className="text-3xl font-bold">
            {ledgerData.summary.netCash?.toLocaleString() || 0} Ks
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 border-b">
                    Time
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                    Particulars (အကြောင်းအရာ)
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-40 border-b">
                    Income (ဝင်ငွေ)
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-40 border-b">
                    Expense (ထွက်ငွေ)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      Loading ledger data...
                    </td>
                  </tr>
                ) : ledgerData.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      No transactions for this date
                    </td>
                  </tr>
                ) : (
                  ledgerData.items.map((item, index) => (
                    <tr
                      key={`${item.type}-${item.id}-${index}`}
                      onClick={() =>
                        item.type === "INCOME" && setSelectedSaleId(item.id)
                      }
                      className={clsx(
                        "transition-colors",
                        item.type === "INCOME"
                          ? "hover:bg-blue-50 cursor-pointer"
                          : "hover:bg-red-50",
                      )}
                    >
                      <td className="py-3 px-6 text-sm text-gray-500">
                        {new Date(item.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-6 text-gray-800 font-medium">
                        {item.particulars}
                      </td>
                      <td className="py-3 px-6 text-right font-bold text-green-600">
                        {item.type === "INCOME"
                          ? item.amount.toLocaleString()
                          : "-"}
                      </td>
                      <td className="py-3 px-6 text-right font-bold text-red-500">
                        {item.type === "EXPENSE"
                          ? item.amount.toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ReceiptModal
        saleId={selectedSaleId}
        onClose={() => setSelectedSaleId(null)}
      />
    </div>
  );
}
