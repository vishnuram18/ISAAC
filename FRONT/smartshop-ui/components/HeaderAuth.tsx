"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function HeaderAuth() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
  };

  return (
    <div className="flex items-center gap-3">
      <Link href="/cart" className="relative flex items-center gap-1 text-gray-600 hover:text-blue-600 transition px-2 py-1">
        <span className="text-xl">🛒</span>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </Link>

      {username ? (
        <>
          <Link href="/orders" className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">
            Orders
          </Link>
          <Link href="/profile" className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">
            Hi, <strong>{username}</strong>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1.5 rounded-full hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </>
      ) : (
        <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition text-sm">
          Login
        </Link>
      )}
    </div>
  );
}
