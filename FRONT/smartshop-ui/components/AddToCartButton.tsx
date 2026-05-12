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

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold text-sm"
        >
          −
        </button>
        <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
          className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold text-sm"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        disabled={product.stockQuantity === 0}
        className={`px-4 py-2 rounded-lg font-medium transition text-white text-sm ${
          added
            ? "bg-green-500"
            : product.stockQuantity === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        {product.stockQuantity === 0 ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}
