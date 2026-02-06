import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { removeFromCart, updateQuantity, clearCart } from "../store/cartSlice";
import { Trash2, Plus, Minus, Receipt } from "lucide-react";
import clsx from "clsx";

interface CartSidebarProps {
  onCheckout: () => void;
}

export function CartSidebar({ onCheckout }: CartSidebarProps) {
  const { items, total } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl w-full max-w-md">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Receipt className="text-blue-600" />
          လက်ရှိ အရောင်း (Sale)
        </h2>
        {items.length > 0 && (
          <button
            onClick={() => dispatch(clearCart())}
            className="text-red-500 text-sm hover:underline"
          >
            ရှင်းမည် (Clear)
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Receipt size={64} className="mb-4 opacity-20" />
            <p>ခြင်းတောင်း ရှင်းနေပါသည်</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">
                  {item.name_mm || item.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {item.price.toLocaleString()} Ks
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white rounded-md border border-gray-300">
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({ id: item.id, qty: item.qty - 1 }),
                      )
                    }
                    className="p-1 hover:bg-gray-100 text-gray-600"
                    disabled={item.qty <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium text-sm">
                    {item.qty}
                  </span>
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({ id: item.id, qty: item.qty + 1 }),
                      )
                    }
                    className="p-1 hover:bg-gray-100 text-gray-600"
                    disabled={item.qty >= item.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={() => dispatch(removeFromCart(item.id))}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-4 text-gray-600">
          <span>ကျသင့်ငွေ (Subtotal)</span>
          <span>{total.toLocaleString()} Ks</span>
        </div>
        <div className="flex justify-between items-center mb-6 text-2xl font-bold text-gray-900">
          <span>စုစုပေါင်း (Total)</span>
          <span>{total.toLocaleString()} Ks</span>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className={clsx(
            "w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98]",
            items.length === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200",
          )}
        >
          ငွေချေမည် (Checkout)
        </button>
      </div>
    </div>
  );
}
