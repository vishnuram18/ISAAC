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
    if (!token) {
      router.push("/login");
      return;
    }
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
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-500 mb-6">Your cart is empty.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Continue Shopping
        </Link>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-4 bg-white border rounded-xl p-4 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-gray-400 text-xs text-center">No Image</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{item.product.name}</p>
              <p className="text-gray-500 text-sm">${item.product.price} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 font-bold text-sm"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 font-bold text-sm"
              >
                +
              </button>
            </div>
            <p className="font-bold w-20 text-right">${(item.product.price * item.quantity).toFixed(2)}</p>
            <button
              onClick={() => removeItem(item.product.id)}
              className="text-red-400 hover:text-red-600 ml-2 text-lg"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-black">${total.toFixed(2)}</span>
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-60"
        >
          {loading ? "Placing Orders…" : "Place Order"}
        </button>
      </div>
    </div>
  );
}
