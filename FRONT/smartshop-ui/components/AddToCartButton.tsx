"use client";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Product } from "../types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.stockQuantity === 0) {
    return (
      <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-700/50 text-slate-500 border border-slate-600/30">
        Sold Out
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="w-6 h-6 rounded-full bg-white/8 hover:bg-white/15 text-white font-bold text-xs transition flex items-center justify-center"
        >
          −
        </button>
        <span className="w-5 text-center font-semibold text-white text-sm">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
          className="w-6 h-6 rounded-full bg-white/8 hover:bg-white/15 text-white font-bold text-xs transition flex items-center justify-center"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        className={`px-3 py-1.5 rounded-full font-semibold text-xs text-white transition-all ${
          added
            ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
            : "bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 hover:shadow-lg hover:shadow-orange-500/25"
        }`}
      >
        {added ? "✓ Added" : "Add to Cart"}
      </button>
    </div>
  );
}
