import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { clearCart } from "../store/cartSlice";
import { api } from "../services/api";
import { X, Check, Banknote, Smartphone, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = "CASH" | "KPAY" | "WAVE";

export function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const { items, total } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { handleSubmit, setValue, watch } = useForm<{
    method: PaymentMethod;
    amount: number;
  }>({
    defaultValues: {
      method: "CASH",
      amount: total,
    },
  });

  const selectedMethod = watch("method");

  if (!isOpen) return null;

  const onSubmit = async (data: { method: PaymentMethod; amount: number }) => {
    setLoading(true);
    try {
      const payload = {
        items: items.map((item) => ({ productId: item.id, qty: item.qty })),
        payment: {
          method: data.method,
          amount: total, // For simplicity, assume paid amount = total for now
        },
      };

      await api.createSale(payload);
      dispatch(clearCart());
      onSuccess();
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PaymentOption = ({
    method,
    label,
    icon: Icon,
  }: {
    method: PaymentMethod;
    label: string;
    icon: LucideIcon;
  }) => (
    <button
      type="button"
      onClick={() => setValue("method", method)}
      className={clsx(
        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 h-24",
        selectedMethod === method
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-gray-200 hover:border-gray-300 text-gray-600",
      )}
    >
      <Icon size={24} />
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            ငွေပေးချေမှု (Payment)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="mb-8 text-center">
            <p className="text-gray-500 mb-1">စုစုပေါင်း (Total)</p>
            <h3 className="text-4xl font-bold text-blue-600">
              {total.toLocaleString()} Ks
            </h3>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <PaymentOption method="CASH" label="ငွေသား" icon={Banknote} />
            <PaymentOption method="KPAY" label="KPay" icon={Smartphone} />
            <PaymentOption method="WAVE" label="Wave" icon={Smartphone} />
          </div>

          <button
            type="button" // Use submit button at bottom
            disabled
            className="hidden" // Hidden input to link form submit
          />

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-spin text-xl">◌</span>
              ) : (
                <>
                  <Check size={20} />
                  အတည်ပြုမည် (Confirm)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
