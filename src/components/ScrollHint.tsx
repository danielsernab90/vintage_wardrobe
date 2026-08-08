"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Horizontal scroll container with a visible "scroll for more" hint
 * when content overflows the viewport.
 */
export function ScrollHint({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const overflow = el.scrollWidth > el.clientWidth + 4;
      setCanScroll(overflow);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={ref} className="overflow-x-auto">
        {children}
      </div>
      {canScroll && !atEnd ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex w-16 items-start justify-end bg-gradient-to-l from-paper via-paper/90 to-transparent pt-3 pr-2"
          aria-hidden="true"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-brass">
            Scroll →
          </span>
        </div>
      ) : null}
    </div>
  );
}
