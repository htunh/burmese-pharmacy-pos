import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";
import type { Product } from "../services/api";
import clsx from "clsx";
import { ShoppingBag, Clock } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name_en,
        name_mm: product.name_mm,
        price: product.sale_price,
        stock: product.usable_qty, // Use usable_qty for stock checking
      }),
    );
  };

  const isOutOfStock = product.total_qty <= 0;
  // If we have stock, but usable_qty is 0, it means everything is expired
  const isExpired = !isOutOfStock && product.usable_qty <= 0;

  // Low stock warning (if not expired/out)
  // Default reorder level 5 if not set
  const reorderLevel = product.reorder_level || 5;
  const isLowStock =
    !isOutOfStock && !isExpired && product.total_qty <= reorderLevel;

  // Expiring soon warning (if not expired)
  const isExpiring = !isExpired && !!product.has_expiring_batch;

  const isDisabled = isOutOfStock || isExpired;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={clsx(
        "relative flex flex-col justify-between p-4 rounded-xl shadow-sm border transition-all active:scale-95 touch-manipulation min-h-[120px] overflow-hidden",
        isDisabled
          ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-75"
          : "bg-white hover:shadow-md",
        isLowStock && "border-yellow-400 border-2",
        !isDisabled && !isLowStock && "border-blue-100 hover:border-blue-500",
      )}
    >
      {/* Expiring Indicator */}
      {isExpiring && (
        <div
          className="absolute top-2 right-2 text-red-500 animate-pulse"
          title="Batch Expiring Soon"
        >
          <Clock size={16} />
        </div>
      )}

      {/* Expired Overlay */}
      {isExpired && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 z-10">
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 transform -rotate-12">
            သက်တမ်းကုန် (EXPIRED)
          </span>
        </div>
      )}

      <div className="w-full text-left">
        <h3
          className={clsx(
            "font-bold text-lg leading-tight line-clamp-2",
            isDisabled ? "text-gray-500" : "text-gray-800",
          )}
        >
          {product.name_mm || product.name_en}
        </h3>
        {product.name_mm && (
          <p className="text-sm text-gray-400 truncate">{product.name_en}</p>
        )}
      </div>

      <div className="flex justify-between items-end w-full mt-2">
        <span
          className={clsx(
            "font-semibold text-lg",
            isDisabled ? "text-gray-500" : "text-blue-600",
          )}
        >
          {product.sale_price.toLocaleString()} Ks
        </span>
        <div
          className={clsx(
            "text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium",
            isOutOfStock
              ? "bg-gray-200 text-gray-500"
              : isExpired
                ? "bg-red-50 text-red-400"
                : isLowStock
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700",
          )}
        >
          <ShoppingBag size={12} />
          {isExpired ? "အသုံးမပြုနိုင်" : `${product.usable_qty ?? 0} လက်ကျန်`}
        </div>
      </div>
    </button>
  );
}
