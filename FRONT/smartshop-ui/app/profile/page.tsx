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
    if (!token) { router.push("/login"); return; }
    fetchUserProfile()
      .then((data: UserProfile) => { setProfile(data); setEmail(data.email); })
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
      if (Object.keys(updates).length === 0) { setMessage("No changes to save."); setSaving(false); return; }
      await updateUserProfile(updates);
      setMessage("Profile updated successfully!");
      setPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const roleColor = (role: string) =>
    role === "SELLER"
      ? "bg-orange-500/15 text-orange-300 border border-orange-500/25"
      : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25";

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300 transition">← Back to Shop</Link>
      </div>

      {loading && <div className="text-center py-16 text-slate-500">Loading profile…</div>}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {profile && (
        <div className="flex flex-col gap-5">
          {/* Avatar + info card */}
          <div className="glass-strong p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-500/20 flex-shrink-0">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-white">{profile.username}</p>
              <p className="text-slate-400 text-sm">{profile.email}</p>
              <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold ${roleColor(profile.role)}`}>
                {profile.role}
              </span>
            </div>
          </div>

          {/* Edit form */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Update Details</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glass" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  New Password{" "}
                  <span className="text-slate-500 font-normal">(leave blank to keep current)</span>
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-glass" />
              </div>
              {message && <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">{message}</p>}
              {error && !loading && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
              <button type="submit" disabled={saving} className="btn-primary w-full py-3 mt-1">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
