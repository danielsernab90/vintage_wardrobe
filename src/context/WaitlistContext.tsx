"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WaitlistTierContext = {
  name: string;
  price: number;
  piecesLabel: string; // e.g. "5 pieces"
};

type WaitlistContextValue = {
  isOpen: boolean;
  tier: WaitlistTierContext | null;
  openWaitlist: (tier?: WaitlistTierContext) => void;
  closeWaitlist: () => void;
};

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tier, setTier] = useState<WaitlistTierContext | null>(null);

  const openWaitlist = useCallback((nextTier?: WaitlistTierContext) => {
    setTier(nextTier ?? null);
    setIsOpen(true);
  }, []);

  const closeWaitlist = useCallback(() => {
    setIsOpen(false);
    setTier(null);
  }, []);

  const value = useMemo(
    () => ({ isOpen, tier, openWaitlist, closeWaitlist }),
    [isOpen, tier, openWaitlist, closeWaitlist],
  );

  return (
    <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>
  );
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext);
  if (!ctx) {
    throw new Error("useWaitlist must be used within WaitlistProvider");
  }
  return ctx;
}
