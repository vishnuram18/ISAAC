"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { placeOrder } from "../../services/api";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setLoading(true);
    setError("");
    try {
      for (const item of items) {
        await placeOrder({ productId: item.product.id, quantity: item.quantity });
      }
      clearCart();
      router.push("/orders");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-7xl mb-5">🛒</p>
          <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
          <p className="text-slate-400 mb-8">Add some products to get started</p>
          <Link href="/" className="btn-primary px-8 py-3 text-base inline-block">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Cart</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300 transition">← Continue Shopping</Link>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {items.map((item) => (
          <div key={item.product.id} className="glass flex items-center gap-4 p-4 hover:border-white/15 transition-all">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{item.product.name}</p>
              <p className="text-slate-400 text-sm">${Number(item.product.price).toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 text-white font-bold text-sm transition flex items-center justify-center">−</button>
              <span className="w-6 text-center font-semibold text-white">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 text-white font-bold text-sm transition flex items-center justify-center">+</button>
            </div>
            <p className="font-bold text-white w-20 text-right">${(item.product.price * item.quantity).toFixed(2)}</p>
            <button onClick={() => removeItem(item.product.id)} className="text-slate-500 hover:text-red-400 transition ml-1 text-lg" title="Remove">✕</button>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="glass-strong p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span className="text-white font-semibold">${total.toFixed(2)}</span>
        </div>
        <div className="border-t border-white/10 my-4" />
        <div className="flex justify-between items-center mb-5">
          <span className="text-lg font-bold text-white">Total</span>
          <span className="text-2xl font-black grad-text">${total.toFixed(2)}</span>
        </div>
        {error && <p className="text-red-400 text-sm mb-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
        <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full py-3.5 text-base">
          {loading ? "Placing Orders…" : "Place Order →"}
        </button>
      </div>
    </div>
  );
}
