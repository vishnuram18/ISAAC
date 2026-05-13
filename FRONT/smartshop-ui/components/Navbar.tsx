"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { username, role, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-black/20 backdrop-blur-xl border-b border-white/8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={role === "SELLER" ? "/seller" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/30">
            S
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Isaac <span className="grad-text">SmartShop</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {username ? (
            <>
              {role === "SELLER" ? (
                <Link
                  href="/seller"
                  className="flex items-center gap-1.5 text-sm text-orange-300 hover:text-orange-200 transition font-medium px-3 py-1.5 rounded-full hover:bg-white/8"
                >
                  <span>🏪</span> My Shop
                </Link>
              ) : (
                <>
                  <Link
                    href="/orders"
                    className="text-sm text-slate-300 hover:text-white transition font-medium px-3 py-1.5 rounded-full hover:bg-white/8"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/cart"
                    className="relative flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition font-medium px-3 py-1.5 rounded-full hover:bg-white/8"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Cart
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </Link>
                </>
              )}

              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/8 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-slate-300 hover:text-white transition hidden sm:block">{username}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-red-400 transition px-3 py-1.5 rounded-full hover:bg-red-500/10 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-300 hover:text-white transition px-3 py-1.5 rounded-full hover:bg-white/8 font-medium">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm px-5 py-2">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
