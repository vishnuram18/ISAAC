"use client";
import { useState } from "react";
import { placeOrder } from "../services/api";

type Status = "idle" | "loading" | "success" | "error";

export default function AddToCartButton({ productId }: { productId: number }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleOrder = async () => {
    setStatus("loading");
    setMessage("");
    try {
      await placeOrder({ productId, quantity: 1 });
      setStatus("success");
      setMessage("Ordered!");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setStatus("error");
      setMessage(msg);
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const colorClass =
    status === "success"
      ? "bg-green-500"
      : status === "error"
      ? "bg-red-500"
      : "bg-orange-500 hover:bg-orange-600";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleOrder}
        disabled={status === "loading"}
        className={`${colorClass} text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50`}
      >
        {status === "loading" ? "Ordering..." : status === "success" ? "Ordered!" : "Add to Cart"}
      </button>
      {message && (
        <span className={`text-xs ${status === "success" ? "text-green-600" : "text-red-500"}`}>
          {message}
        </span>
      )}
    </div>
  );
}