"use client";

import { useState } from "react";

export function NavbarSearch() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="חיפוש"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-white/60 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary sm:hidden"
      >
        <span className="material-symbols-outlined text-[22px]">
          {open ? "close" : "search"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 px-2 sm:hidden">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="חיפוש..."
              aria-label="חיפוש"
              autoFocus
              className="w-full rounded-full border border-white/50 bg-white py-2.5 pr-10 pl-4 text-sm shadow-lg outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      <div className="relative hidden sm:block">
        <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline">
          search
        </span>
        <input
          type="text"
          placeholder="חיפוש..."
          aria-label="חיפוש"
          className="w-40 rounded-full border border-white/50 bg-white/60 py-2 pr-10 pl-4 text-sm outline-none transition-all focus:w-56 focus:ring-2 focus:ring-primary md:w-56"
        />
      </div>
    </>
  );
}
