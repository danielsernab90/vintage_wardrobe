"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Role = "customer" | "admin" | null;

type AuthContextValue = {
  role: Role;
  signInAsCustomer: () => void;
  signInAsAdmin: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  const signInAsCustomer = useCallback(() => setRole("customer"), []);
  const signInAsAdmin = useCallback(() => setRole("admin"), []);
  const signOut = useCallback(() => setRole(null), []);

  const value = useMemo(
    () => ({ role, signInAsCustomer, signInAsAdmin, signOut }),
    [role, signInAsCustomer, signInAsAdmin, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
