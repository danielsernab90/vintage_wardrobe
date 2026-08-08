"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { QueueDecision } from "@/data/inventory";

export type { QueueDecision };

export const QUEUE_DECISIONS: QueueDecision[] = [
  "Keep As Is",
  "Repair",
  "Discount",
  "Retire",
];

type DecisionContextValue = {
  decisions: Record<string, QueueDecision>;
  getDecision: (itemId: string) => QueueDecision | undefined;
  setDecision: (itemId: string, decision: QueueDecision) => void;
  clearDecision: (itemId: string) => void;
};

const DecisionContext = createContext<DecisionContextValue | null>(null);

export function DecisionProvider({ children }: { children: ReactNode }) {
  const [decisions, setDecisions] = useState<Record<string, QueueDecision>>(
    {},
  );

  const getDecision = useCallback(
    (itemId: string) => decisions[itemId],
    [decisions],
  );

  const setDecision = useCallback((itemId: string, decision: QueueDecision) => {
    setDecisions((prev) => ({ ...prev, [itemId]: decision }));
  }, []);

  const clearDecision = useCallback((itemId: string) => {
    setDecisions((prev) => {
      if (!(itemId in prev)) return prev;
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ decisions, getDecision, setDecision, clearDecision }),
    [decisions, getDecision, setDecision, clearDecision],
  );

  return (
    <DecisionContext.Provider value={value}>{children}</DecisionContext.Provider>
  );
}

export function useDecisions() {
  const ctx = useContext(DecisionContext);
  if (!ctx) {
    throw new Error("useDecisions must be used within DecisionProvider");
  }
  return ctx;
}
