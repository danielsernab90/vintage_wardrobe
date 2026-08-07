"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getGarmentById, type Garment } from "@/data/garments";

export const MAX_ITEM_QTY = 3;

export type CartLine = {
  garment: Garment;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  estimatedMonthlyTotal: number;
  isOpen: boolean;
  checkoutComplete: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (garmentId: string) => void;
  removeItem: (garmentId: string) => void;
  setQuantity: (garmentId: string, quantity: number) => void;
  checkout: () => void;
  dismissCheckout: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const openCart = useCallback(() => {
    setCheckoutComplete(false);
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => setIsOpen(false), []);

  const toggleCart = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setCheckoutComplete(false);
      return !prev;
    });
  }, []);

  const addItem = useCallback((garmentId: string) => {
    const garment = getGarmentById(garmentId);
    if (!garment) return;

    setCheckoutComplete(false);
    setItems((prev) => {
      const existing = prev.find((line) => line.garment.id === garmentId);
      if (existing) {
        if (existing.quantity >= MAX_ITEM_QTY) return prev;
        return prev.map((line) =>
          line.garment.id === garmentId
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...prev, { garment, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((garmentId: string) => {
    setItems((prev) => prev.filter((line) => line.garment.id !== garmentId));
  }, []);

  const setQuantity = useCallback((garmentId: string, quantity: number) => {
    const next = Math.max(0, Math.min(MAX_ITEM_QTY, quantity));
    setItems((prev) => {
      if (next === 0) {
        return prev.filter((line) => line.garment.id !== garmentId);
      }
      return prev.map((line) =>
        line.garment.id === garmentId ? { ...line, quantity: next } : line,
      );
    });
  }, []);

  const checkout = useCallback(() => {
    setCheckoutComplete(true);
    setItems([]);
  }, []);

  const dismissCheckout = useCallback(() => {
    setCheckoutComplete(false);
    setIsOpen(false);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  );

  const estimatedMonthlyTotal = useMemo(
    () => items.reduce((sum, line) => sum + line.garment.price * line.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      estimatedMonthlyTotal,
      isOpen,
      checkoutComplete,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQuantity,
      checkout,
      dismissCheckout,
    }),
    [
      items,
      itemCount,
      estimatedMonthlyTotal,
      isOpen,
      checkoutComplete,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQuantity,
      checkout,
      dismissCheckout,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
