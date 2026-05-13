"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchMyOrders, cancelOrder, returnOrder } from "../../services/api";
import { Order } from "../../types";

const STATUS_STYLES: Record<string, string> = {
  PLACED:    "bg-blue-500/15 text-blue-300 border border-blue-500/25",
  DELIVERED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  CANCELLED: "bg-red-500/15 text-red-400 border border-red-500/25",
  RETURNED:  "bg-purple-500/15 text-purple-300 border border-purple-500/25",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<Record<number, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchMyOrders()
      .then(setOrders)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this order? Stock will be restored.")) return;
    setActionLoading(id);
    setActionError((prev) => ({ ...prev, [id]: "" }));
    try {
      const updated = await cancelOrder(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err: unknown) {
      setActionError((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : "Failed to cancel order",
      }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm("Return this order? Stock will be restored.")) return;
    setActionLoading(id);
    setActionError((prev) => ({ ...prev, [id]: "" }));
    try {
      const updated = await returnOrder(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err: unknown) {
      setActionError((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : "Failed to return order",
      }));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Orders</h1>
          {!loading && (
            <p className="text-slate-400 text-sm mt-1">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300 transition">
          ← Back to Shop
        </Link>
      </div>

      {loading && (
        <div className="text-center py-20 text-slate-500">Loading orders…</div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">📋</p>
          <p className="text-xl font-semibold text-white mb-2">No orders yet</p>
          <p className="text-slate-400 mb-8">Start shopping to see your orders here</p>
          <Link href="/" className="btn-primary px-8 py-3 text-base inline-block">
            Start Shopping
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.id} className="glass hover:border-white/15 transition-all p-5">
            <div className="flex justify-between items-start gap-4">
              {/* Left: order info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-bold text-white text-lg">Order #{order.id}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] ?? STATUS_STYLES.PLACED}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  Product ID: {order.productId} &nbsp;·&nbsp; Qty: {order.quantity}
                </p>
                {actionError[order.id] && (
                  <p className="text-red-400 text-xs mt-2">{actionError[order.id]}</p>
                )}
              </div>

              {/* Right: price + actions */}
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <p className="text-2xl font-black text-white">
                  ${Number(order.totalPrice).toFixed(2)}
                </p>

                <div className="flex gap-2">
                  {order.status === "PLACED" && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={actionLoading === order.id}
                      className="px-4 py-1.5 text-sm border border-red-500/40 text-red-400 rounded-full hover:bg-red-500/15 hover:border-red-400/60 transition font-medium disabled:opacity-50"
                    >
                      {actionLoading === order.id ? "Cancelling…" : "Cancel Order"}
                    </button>
                  )}

                  {order.status === "DELIVERED" && (
                    <button
                      onClick={() => handleReturn(order.id)}
                      disabled={actionLoading === order.id}
                      className="px-4 py-1.5 text-sm border border-purple-500/40 text-purple-300 rounded-full hover:bg-purple-500/15 hover:border-purple-400/60 transition font-medium disabled:opacity-50"
                    >
                      {actionLoading === order.id ? "Returning…" : "Return Order"}
                    </button>
                  )}

                  {order.status === "CANCELLED" && (
                    <span className="text-xs text-slate-500 italic py-1.5">Cancelled</span>
                  )}

                  {order.status === "RETURNED" && (
                    <span className="text-xs text-slate-500 italic py-1.5">Returned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
