"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "../../services/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "SELLER">("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, password, email, role);
      router.push("/login");
    } catch {
      setError("Registration failed. Username or email may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-4">
            <span className="text-white font-black text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Create account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join Isaac SmartShop today</p>
        </div>

        {/* Card */}
        <div className="glass-strong p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("USER")}
                  className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                    role === "USER"
                      ? "border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-lg shadow-indigo-500/10"
                      : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
                  }`}
                >
                  🛍️ Shop as Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("SELLER")}
                  className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                    role === "SELLER"
                      ? "border-orange-500 bg-orange-500/15 text-orange-300 shadow-lg shadow-orange-500/10"
                      : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
                  }`}
                >
                  🏪 Sell Products
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="username">Username</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="input-glass" placeholder="your_username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-glass" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-glass" placeholder="••••••••" />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-1 text-base font-semibold rounded-full transition-all disabled:opacity-50 text-white ${
                role === "SELLER"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
              }`}
            >
              {loading ? "Creating account…" : `Register as ${role === "SELLER" ? "Seller" : "Buyer"}`}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
