"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface AuthState {
  username: string | null;
  role: string | null;
  signIn: (token: string, username: string, role: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState>({
  username: null,
  role: null,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
    setRole(localStorage.getItem("role"));
  }, []);

  const signIn = (token: string, username: string, role: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
    setUsername(username);
    setRole(role);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setUsername(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ username, role, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
