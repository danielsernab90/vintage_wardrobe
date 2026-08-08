"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.25" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M5.5 19.5c1.4-3.2 3.7-4.75 6.5-4.75s5.1 1.55 6.5 4.75"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

const itemClass =
  "block w-full px-4 py-3 text-left font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-ink transition-opacity hover:opacity-60";

export function AccountMenu() {
  const { role, signInAsCustomer, signInAsAdmin, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showSignInOptions, setShowSignInOptions] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setShowSignInOptions(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setShowSignInOptions(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggleMenu() {
    setOpen((prev) => {
      const next = !prev;
      if (!next) setShowSignInOptions(false);
      return next;
    });
  }

  function handleSignOut() {
    signOut();
    setShowSignInOptions(false);
    setOpen(false);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="p-0.5 transition-opacity hover:opacity-60"
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggleMenu}
      >
        <AccountIcon />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 min-w-[12rem] max-w-[calc(100vw-2rem)] border border-brass bg-paper"
        >
          {role === null ? (
            showSignInOptions ? (
              <>
                <button
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  onClick={() => {
                    signInAsCustomer();
                    setShowSignInOptions(false);
                    setOpen(false);
                    router.push("/account");
                  }}
                >
                  Continue as Customer
                </button>
                <div className="h-px bg-parchment" aria-hidden="true" />
                <button
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  onClick={() => {
                    signInAsAdmin();
                    setShowSignInOptions(false);
                    setOpen(false);
                    router.push("/admin");
                  }}
                >
                  Continue as Admin
                </button>
              </>
            ) : (
              <button
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={() => setShowSignInOptions(true)}
              >
                Sign In
              </button>
            )
          ) : null}

          {role === "customer" ? (
            <>
              <Link
                href="/account"
                role="menuitem"
                className={itemClass}
                onClick={() => setOpen(false)}
              >
                My Closet
              </Link>
              <div className="h-px bg-parchment" aria-hidden="true" />
              <button
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </>
          ) : null}

          {role === "admin" ? (
            <>
              <Link
                href="/admin"
                role="menuitem"
                className={itemClass}
                onClick={() => setOpen(false)}
              >
                Admin Dashboard
              </Link>
              <div className="h-px bg-parchment" aria-hidden="true" />
              <button
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
