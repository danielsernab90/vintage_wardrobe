"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MessagesUiValue = {
  open: boolean;
  /** When set, admin panel opens directly into this subscriber's thread. */
  focusSubscriberId: string | null;
  openInbox: () => void;
  openThreadForSubscriber: (subscriberId: string) => void;
  clearFocus: () => void;
  close: () => void;
};

const MessagesUiContext = createContext<MessagesUiValue | null>(null);

export function MessagesUiProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [focusSubscriberId, setFocusSubscriberId] = useState<string | null>(
    null,
  );

  const openInbox = useCallback(() => {
    setFocusSubscriberId(null);
    setOpen(true);
  }, []);

  const openThreadForSubscriber = useCallback((subscriberId: string) => {
    setFocusSubscriberId(subscriberId);
    setOpen(true);
  }, []);

  const clearFocus = useCallback(() => {
    setFocusSubscriberId(null);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setFocusSubscriberId(null);
  }, []);

  const value = useMemo(
    () => ({
      open,
      focusSubscriberId,
      openInbox,
      openThreadForSubscriber,
      clearFocus,
      close,
    }),
    [
      open,
      focusSubscriberId,
      openInbox,
      openThreadForSubscriber,
      clearFocus,
      close,
    ],
  );

  return (
    <MessagesUiContext.Provider value={value}>
      {children}
    </MessagesUiContext.Provider>
  );
}

export function useMessagesUi() {
  const ctx = useContext(MessagesUiContext);
  if (!ctx) {
    throw new Error("useMessagesUi must be used within MessagesUiProvider");
  }
  return ctx;
}
