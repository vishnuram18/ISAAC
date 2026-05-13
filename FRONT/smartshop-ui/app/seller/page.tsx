"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchMyProducts, deleteProduct } from "../../services/api";
import { Product } from "../../types";

export default function SellerDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "SELLER") { router.push("/login"); return; }
    fetchMyProducts()
      .then(setProducts)
      .catch(() => setError("Failed to load your products."))
      .finally(() => setLoading(false));
  }, [router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete product.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">My Shop</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""} listed`}
          </p>
        </div>
        <Link href="/seller/add-product" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition">
          <span className="text-lg leading-none">+</span> Add Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {loading && <div className="text-center py-20 text-slate-500">Loading your products…</div>}

      {!loading && products.length === 0 && (
        <div className="text-center py-24">
          <p className="text-7xl mb-5">📦</p>
          <p className="text-2xl font-bold text-white mb-2">No products yet</p>
          <p className="text-slate-400 mb-8">Add your first product and start selling</p>
          <Link href="/seller/add-product" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition">
            + Add First Product
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <div key={product.id} className="glass flex items-center gap-5 p-5 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">📦</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-lg truncate">{product.name}</p>
              {product.description && (
                <p className="text-slate-400 text-sm truncate mt-0.5">{product.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xl font-black text-white">${Number(product.price).toFixed(2)}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  product.stockQuantity > 0
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                    : "bg-red-500/15 text-red-400 border border-red-500/25"
                }`}>
                  {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href={`/seller/edit-product/${product.id}`} className="px-4 py-1.5 text-sm border border-indigo-500/40 text-indigo-300 rounded-full hover:bg-indigo-500/15 transition font-medium">
                Edit
              </Link>
              <button onClick={() => handleDelete(product.id)} className="px-4 py-1.5 text-sm border border-red-500/30 text-red-400 rounded-full hover:bg-red-500/15 transition font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
