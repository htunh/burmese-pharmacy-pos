import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../services/api";
import { Plus, Barcode, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const productSchema = z.object({
  name_mm: z.string().min(1, "Medicine Name (MM) is required"),
  name_en: z.string().optional(),
  barcode: z.string().optional(),
  sale_price: z.coerce.number().min(1, "Sale Price must be greater than 0"),
  reorder_level: z.coerce.number().default(10),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      reorder_level: 10,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await api.createProduct(data);
      alert("Product Created Successfully");
      reset();
      // Optionally navigate back or stay to add more
      // navigate('/');
    } catch (error) {
      console.error("Failed to create product", error);
      alert("Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Plus size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Add New Product</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name MM */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ဆေးအမည် (မြန်မာ) <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name_mm")}
                placeholder="e.g. Biogesic"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              {errors.name_mm && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name_mm.message}
                </p>
              )}
            </div>

            {/* Name EN */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Name (English)
              </label>
              <input
                {...register("name_en")}
                placeholder="e.g. Biogesic 500mg"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Barcode */}
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Barcode size={16} /> ဘားကုဒ် (Barcode)
              </label>
              <input
                {...register("barcode")}
                placeholder="Scan or enter code"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Sale Price */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ရောင်းဈေး (Sale Price) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register("sale_price")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all pl-4"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  Ks
                </span>
              </div>
              {errors.sale_price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.sale_price.message}
                </p>
              )}
            </div>

            {/* Reorder Level */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                အနည်းဆုံးလက်ကျန် (Reorder Level)
              </label>
              <input
                type="number"
                {...register("reorder_level")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md flex items-center gap-2 disabled:opacity-70 transition-all"
            >
              <Save size={18} />
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
