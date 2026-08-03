"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/Sidebar";

const PRIMARY_HREFS = [
  "/dashboard",
  "/dashboard/jobs",
  "/dashboard/learning",
  "/dashboard/chat",
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const primaryItems = PRIMARY_HREFS.map(
    (href) => NAV_ITEMS.find((item) => item.href === href)
  ).filter((item): item is (typeof NAV_ITEMS)[number] => Boolean(item));

  const moreItems = NAV_ITEMS.filter(
    (item) => !PRIMARY_HREFS.includes(item.href)
  );

  const isActive = (href: string): boolean =>
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(href));

  const moreActive = moreItems.some((item) => isActive(item.href));

  const handleLogout = async (): Promise<void> => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {moreOpen && (
        <div
          className="fixed bottom-20 left-3 right-3 z-50 rounded-3xl bg-white p-3 shadow-2xl lg:hidden"
          role="menu"
          aria-label="ניווט נוסף"
        >
          <div className="grid grid-cols-2 gap-1">
            {moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex flex-row-reverse items-center justify-end gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                  isActive(item.href)
                    ? "bg-primary text-white"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleLogout()}
              className="flex flex-row-reverse items-center justify-end gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-error transition-all hover:bg-error-container/30"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
              התנתקות
            </button>
          </div>
        </div>
      )}

      <nav
        aria-label="ניווט תחתון"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/20 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
      >
        <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
          {primaryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
                isActive(item.href) ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive(item.href) ? "icon-fill" : ""
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-label="עוד אפשרויות"
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
              moreActive || moreOpen ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {moreOpen ? "close" : "menu"}
            </span>
            עוד
          </button>
        </div>
      </nav>
    </>
  );
}
