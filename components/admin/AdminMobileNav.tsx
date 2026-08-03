"use client";

import { useState } from "react";
import Link from "next/link";

const NAV = [
  { icon: "dashboard", label: "לוח בקרה", active: true },
  { icon: "group", label: "משתמשים", active: false },
  { icon: "work", label: "מקצועות", active: false },
  { icon: "menu_book", label: "שיעורים", active: false },
  { icon: "analytics", label: "סטטיסטיקות", active: false },
];

export function AdminMobileNav({
  appName,
  adminName,
}: {
  appName: string;
  adminName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-outline-variant/20 bg-background/95 px-4 py-3 backdrop-blur-lg md:hidden">
        <button
          type="button"
          aria-label="תפריט ניהול"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <span className="material-symbols-outlined">
            {open ? "close" : "menu"}
          </span>
        </button>
        <span className="font-display text-lg font-bold text-primary">
          {appName}
        </span>
        <Link
          href="/dashboard"
          className="rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-on-secondary"
        >
          לאתר
        </Link>
      </header>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-gradient-to-b from-[#001e2f] to-[#003751] p-6 text-white shadow-2xl md:hidden"
            aria-label="ניווט ניהול"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <span className="material-symbols-outlined icon-fill">rocket_launch</span>
              </div>
              <div>
                <p className="font-display text-lg font-bold">{appName}</p>
                <p className="text-xs text-white/60">שלום, {adminName}</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  onClick={() => setOpen(false)}
                  className={
                    item.active
                      ? "flex items-center gap-3 rounded-xl bg-primary-container px-4 py-3 text-on-primary-container"
                      : "flex items-center gap-3 rounded-xl px-4 py-3 text-white/70 hover:bg-white/10"
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="mt-4 block w-full rounded-lg bg-secondary py-3 text-center text-sm font-bold text-on-secondary"
            >
              חזרה לאתר
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
