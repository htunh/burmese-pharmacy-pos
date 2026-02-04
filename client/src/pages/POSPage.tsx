import { useEffect, useState } from "react";
import { api, type Product } from "../services/api";
import { ProductCard } from "../components/ProductCard";
import { CartSidebar } from "../components/CartSidebar";
import { CheckoutModal } from "../components/CheckoutModal";
import { ReportsWidget } from "../components/ReportsWidget";
import { Search, TrendingUp } from "lucide-react";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name_en.toLowerCase().includes(query) ||
      (p.name_mm && p.name_mm.includes(query)) ||
      p.barcode?.includes(query)
    );
  });

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Left Side: Product Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header / Search */}
        <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products (Name EN, MM or Barcode)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              autoFocus
            />
          </div>

          <button
            onClick={() => setIsReportsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
            title="View Reports"
          >
            <TrendingUp size={20} />
            <span className="hidden sm:inline font-medium">Reports</span>
          </button>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              Loading products...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-12">
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Cart */}
      <div className="w-[400px] shrink-0 h-full">
        <CartSidebar onCheckout={() => setIsCheckoutOpen(true)} />
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          fetchProducts(); // Refresh stock
          // Potentially show success toast
        }}
      />

      {/* Reports Widget */}
      <ReportsWidget
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
      />
    </div>
  );
}
