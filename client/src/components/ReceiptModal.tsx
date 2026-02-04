import { useEffect, useState } from "react";
import { api } from "../services/api";
import { X, Receipt } from "lucide-react";

interface ReceiptModalProps {
  saleId: number | null;
  onClose: () => void;
}

export function ReceiptModal({ saleId, onClose }: ReceiptModalProps) {
  const [data, setData] = useState<
    import("../services/api").SaleDetails | null
  >(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (saleId) {
      loadData(saleId);
    }
  }, [saleId]);

  const loadData = async (id: number) => {
    setLoading(true);
    try {
      const result = await api.getSaleDetails(id);
      setData(result);
    } catch (error) {
      console.error("Failed to load receipt", error);
    } finally {
      setLoading(false);
    }
  };

  if (!saleId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-blue-600" />
            Receipt Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12 text-gray-400">
              Loading receipt...
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="text-center pb-6 border-b border-dashed border-gray-200">
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {data.sale.total.toLocaleString()}{" "}
                  <span className="text-lg text-gray-500 font-normal">Ks</span>
                </div>
                <p className="text-sm text-gray-400">{data.sale.invoice_no}</p>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm mt-3 font-medium">
                  {data.payment?.method}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Items
                </h3>
                <div className="space-y-3">
                  {data.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.name_mm || item.name_en}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.qty} x {item.unit_price.toLocaleString()}
                        </p>
                      </div>
                      <span className="font-medium text-gray-700">
                        {item.line_total.toLocaleString()} Ks
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                <span>Date</span>
                <span>{new Date(data.sale.sold_at).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500">Failed to load data</div>
          )}
        </div>
      </div>
    </div>
  );
}
