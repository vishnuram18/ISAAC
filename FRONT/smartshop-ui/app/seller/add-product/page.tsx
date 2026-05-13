"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addProduct } from "../../../services/api";

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", price: "", stockQuantity: "", imageUrl: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "SELLER") router.push("/login");
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await addProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
        imageUrl: form.imageUrl.trim() || undefined,
      });
      router.push("/seller");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Add Product</h1>
          <p className="text-slate-400 text-sm mt-1">List a new product in your shop</p>
        </div>
        <Link href="/seller" className="text-sm text-indigo-400 hover:text-indigo-300 transition">← My Shop</Link>
      </div>

      <div className="glass-strong p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Product Name <span className="text-red-400">*</span></label>
            <input name="name" type="text" value={form.name} onChange={handleChange} required className="input-glass" placeholder="e.g. Wireless Headphones" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-glass resize-none" placeholder="Describe your product…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Price ($) <span className="text-red-400">*</span></label>
              <input name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} required className="input-glass" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Stock <span className="text-red-400">*</span></label>
              <input name="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={handleChange} required className="input-glass" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Image URL</label>
            <input name="imageUrl" type="url" value={form.imageUrl} onChange={handleChange} className="input-glass" placeholder="https://example.com/image.jpg" />
            {form.imageUrl && (
              <div className="mt-2 w-full h-32 rounded-xl overflow-hidden bg-white/5">
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 mt-1 text-base font-semibold rounded-full text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Adding product…" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
