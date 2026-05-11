"use client";
import { useState } from "react";
import { login, register } from "../../services/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await login(username, password);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        router.push("/");
      } else {
        await register(username, password, email);
        setMode("login");
        setMessage({ text: "Account created! Please sign in.", ok: true });
        setUsername("");
        setPassword("");
        setEmail("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setMessage({ text: msg, ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-blue-600 mb-6 text-center">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {mode === "register" && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === "login" ? "No account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setMessage(null);
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
