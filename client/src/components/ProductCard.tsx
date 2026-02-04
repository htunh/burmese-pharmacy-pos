import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";
import type { Product } from "../services/api";
import clsx from "clsx";
import { ShoppingBag } from "lucide-react";

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
        stock: product.total_qty,
      }),
    );
  };

  const isOutOfStock = product.total_qty <= 0;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className={clsx(
        "flex flex-col justify-between p-4 rounded-xl shadow-sm border transition-all active:scale-95 touch-manipulation min-h-[120px]",
        isOutOfStock
          ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60"
          : "bg-white border-blue-100 hover:border-blue-500 hover:shadow-md",
      )}
    >
      <div className="w-full text-left">
        <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
          {product.name_mm || product.name_en}
        </h3>
        {product.name_mm && (
          <p className="text-sm text-gray-500 truncate">{product.name_en}</p>
        )}
      </div>

      <div className="flex justify-between items-end w-full mt-2">
        <span className="font-semibold text-blue-600 text-lg">
          {product.sale_price.toLocaleString()} Ks
        </span>
        <div
          className={clsx(
            "text-xs px-2 py-1 rounded-full flex items-center gap-1",
            isOutOfStock
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700",
          )}
        >
          <ShoppingBag size={12} />
          {product.total_qty} left
        </div>
      </div>
    </button>
  );
}
