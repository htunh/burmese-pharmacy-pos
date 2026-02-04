import { useEffect, useState } from "react";
import { api } from "../services/api";
import { X, TrendingUp } from "lucide-react";

interface ReportsWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportsWidget({ isOpen, onClose }: ReportsWidgetProps) {
  const [profit, setProfit] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getProfit();
      setProfit(data.totalProfit);
    } catch (error) {
      console.error("Failed to load profit report", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            Financial Report
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 text-center">
          <p className="text-gray-500 font-medium mb-2 uppercase tracking-wide text-xs">
            Total Estimated Profit
          </p>
          {loading ? (
            <div className="h-12 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
          ) : (
            <div className="text-4xl font-extrabold text-green-600 flex items-center justify-center gap-1">
              {profit?.toLocaleString()}{" "}
              <span className="text-lg text-gray-400 font-normal">Ks</span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4 px-4">
            Calculated as: Total Sales - (Cost of Goods Sold based on Batch
            FIFO)
          </p>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
          <button
            onClick={onClose}
            className="text-blue-600 font-medium hover:underline text-sm"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
