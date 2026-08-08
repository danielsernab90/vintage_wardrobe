"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { JAMES_WHITAKER_SUBSCRIBER_ID } from "@/lib/messages";
import {
  addWishlistItem,
  fetchWishlistItemIds,
  removeWishlistItem,
} from "@/lib/wishlist";

type WishlistContextValue = {
  savedIds: Set<string>;
  loading: boolean;
  busyId: string | null;
  error: string | null;
  isSaved: (itemId: string) => boolean;
  saveItem: (itemId: string) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = await fetchWishlistItemIds(JAMES_WHITAKER_SUBSCRIBER_ID);
      setSavedIds(new Set(ids));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, role]);

  const isSaved = useCallback(
    (itemId: string) => savedIds.has(itemId),
    [savedIds],
  );

  const saveItem = useCallback(async (itemId: string) => {
    setBusyId(itemId);
    setError(null);
    try {
      await addWishlistItem(JAMES_WHITAKER_SUBSCRIBER_ID, itemId);
      setSavedIds((prev) => new Set(prev).add(itemId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
      return false;
    } finally {
      setBusyId(null);
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setBusyId(itemId);
    setError(null);
    try {
      await removeWishlistItem(JAMES_WHITAKER_SUBSCRIBER_ID, itemId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
      return false;
    } finally {
      setBusyId(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      savedIds,
      loading,
      busyId,
      error,
      isSaved,
      saveItem,
      removeItem,
      refresh,
    }),
    [savedIds, loading, busyId, error, isSaved, saveItem, removeItem, refresh],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}
