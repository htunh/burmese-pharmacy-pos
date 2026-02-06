import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, type Product } from "../services/api";
import { Plus, Search, Calendar, Save } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

const stockSchema = z.object({
  product_id: z.number().min(1, "Product is required"),
  batch_no: z.string().min(1, "Batch No is required"),
  expiry_date: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Expiry date must be in the future",
  }),
  cost_price: z.coerce.number().min(1, "Cost Price must be greater than 0"),
  qty: z.coerce.number().min(1, "Quantity must be at least 1"),
});

type StockFormData = z.infer<typeof stockSchema>;

export default function ReceiveStockPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCombobox, setShowCombobox] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<StockFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(stockSchema) as any,
  });
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name_mm?.includes(searchQuery) ||
      p.barcode?.includes(searchQuery),
  );

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setValue("product_id", product.id);
    setSearchQuery(product.name_mm || product.name_en);
    setShowCombobox(false);
  };

  const onSubmit = async (data: StockFormData) => {
    setIsSubmitting(true);
    try {
      await api.receiveStock(data);
      alert("Stock Received Successfully");
      reset();
      setSelectedProduct(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to receive stock", error);
      alert("Failed to receive stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Plus size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            ဝယ်ယူသွင်းကုန် (Receive Stock)
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Product Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ဆေးရွေးပါ (Select Product)
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="ဆေးအမည် (သို့) ဘားကုဒ်ဖြင့် ရှာရန်..."
                value={searchQuery}
                onFocus={() => setShowCombobox(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowCombobox(true);
                  if (!e.target.value) setSelectedProduct(null);
                }}
                className={clsx(
                  "w-full pl-10 pr-4 py-3 rounded-xl border focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all",
                  errors.product_id ? "border-red-300" : "border-gray-200",
                  selectedProduct
                    ? "bg-blue-50 border-blue-200 text-blue-800 font-medium"
                    : "bg-white",
                )}
              />
            </div>
            {errors.product_id && (
              <p className="text-red-500 text-xs mt-1">
                Please select a product
              </p>
            )}

            {/* Combobox Dropdown */}
            {showCombobox && searchQuery && !selectedProduct && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    ဆေးမတွေ့ပါ (No products found)
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {product.name_mm}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.name_en}
                        </p>
                      </div>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {product.sale_price} Ks
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batch No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ဘတ်ချ်နံပါတ် (Batch No)
              </label>
              <input
                {...register("batch_no")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="e.g. B-12345"
              />
              {errors.batch_no && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.batch_no.message}
                </p>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                သက်တမ်းကုန်ရက် (Expiry Date)
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  {...register("expiry_date")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              {errors.expiry_date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.expiry_date.message}
                </p>
              )}
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                အဝယ်ဈေး (Cost Price)
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register("cost_price")}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  Ks
                </span>
              </div>
              {errors.cost_price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.cost_price.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                အရေအတွက် (Quantity)
              </label>
              <input
                type="number"
                {...register("qty")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="0"
              />
              {errors.qty && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.qty.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              မလုပ်တော့ပါ (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md flex items-center gap-2 disabled:opacity-70 transition-all"
            >
              <Save size={18} />
              {isSubmitting ? "Saving..." : "အတည်ပြုမည် (Confirm)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
