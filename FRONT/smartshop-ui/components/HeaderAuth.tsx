"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HeaderAuth() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setUsername(user.username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (username) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-600 text-sm">Hi, <strong>{username}</strong></span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">
      Login
    </Link>
  );
}
