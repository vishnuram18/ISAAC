"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchMyOrders } from "../../services/api";
import { Order } from "../../types";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchMyOrders()
      .then(setOrders)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Shop
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading orders…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">
            Start Shopping
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">Order #{order.id}</p>
                <p className="text-gray-500 text-sm mt-1">
                  Product ID: {order.productId} &nbsp;·&nbsp; Qty: {order.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black">${Number(order.totalPrice).toFixed(2)}</p>
                <span
                  className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${
                    order.status === "PLACED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
