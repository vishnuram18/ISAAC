"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchUserProfile, updateUserProfile } from "../../services/api";
import { UserProfile } from "../../types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUserProfile()
      .then((data: UserProfile) => {
        setProfile(data);
        setEmail(data.email);
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const updates: { email?: string; password?: string } = {};
      if (email && profile && email !== profile.email) updates.email = email;
      if (password) updates.password = password;
      if (Object.keys(updates).length === 0) {
        setMessage("No changes to save.");
        setSaving(false);
        return;
      }
      await updateUserProfile(updates);
      setMessage("Profile updated successfully!");
      setPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Shop
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading profile…</p>}
      {error && !loading && <p className="text-red-500">{error}</p>}

      {profile && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm text-gray-500">Username</p>
            <p className="text-xl font-bold">{profile.username}</p>
            <span className="inline-block mt-1 px-3 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {profile.role}
            </span>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && !loading && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition font-semibold disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
