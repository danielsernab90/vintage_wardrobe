"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { DecisionProvider } from "@/context/DecisionContext";
import { WaitlistProvider } from "@/context/WaitlistContext";
import { WaitlistModal } from "@/components/WaitlistModal";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <DecisionProvider>
          <WaitlistProvider>
            {children}
            <WaitlistModal />
          </WaitlistProvider>
        </DecisionProvider>
      </CartProvider>
    </AuthProvider>
  );
}
