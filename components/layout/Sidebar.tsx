"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ראשי" },
  { href: "/dashboard/assessment", label: "אבחון תעסוקתי" },
  { href: "/dashboard/professions", label: "מאגר מקצועות" },
  { href: "/dashboard/jobs", label: "לוח משרות" },
  { href: "/dashboard/learning", label: "מרכז למידה" },
  { href: "/dashboard/skills", label: "מיומנויות" },
  { href: "/dashboard/rights", label: "זכויות" },
  { href: "/dashboard/chat", label: "יועץ AI" },
  { href: "/dashboard/profile", label: "אזור אישי" },
  { href: "/dashboard/achievements", label: "הישגים" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-l border-border bg-surface p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary">עתיד מתאים</h1>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "text-text-main"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
