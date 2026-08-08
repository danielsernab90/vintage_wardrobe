"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WaitlistProvider } from "@/context/WaitlistContext";
import { WaitlistModal } from "@/components/WaitlistModal";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WaitlistProvider>
          {children}
          <WaitlistModal />
        </WaitlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
