"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserAvatar } from "@/components/profile/UserAvatar";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "לוח בקרה", icon: "dashboard" },
  { href: "/dashboard/assessment", label: "אבחון תעסוקתי", icon: "quiz" },
  { href: "/dashboard/professions", label: "מאגר מקצועות", icon: "work" },
  { href: "/dashboard/jobs", label: "לוח משרות", icon: "business_center" },
  { href: "/dashboard/learning", label: "מרכז למידה", icon: "school" },
  { href: "/dashboard/skills", label: "מיומנויות", icon: "psychology" },
  { href: "/dashboard/rights", label: "זכויות עובדים", icon: "gavel" },
  { href: "/dashboard/chat", label: "יועץ AI", icon: "smart_toy" },
  { href: "/dashboard/profile", label: "הפרופיל שלי", icon: "person" },
  { href: "/dashboard/achievements", label: "הישגים", icon: "emoji_events" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <aside className="sticky top-20 m-4 hidden h-[calc(100vh-7rem)] w-72 shrink-0 flex-col rounded-3xl glass-panel px-4 py-6 shadow-xl lg:flex">
      <div className="mb-6 flex flex-row-reverse items-center gap-3 px-3">
        <UserAvatar className="h-12 w-12" showOnline />
        <div className="text-right">
          <p className="text-sm font-bold text-on-surface">
            שלום, {userName}
          </p>
          <p className="text-xs font-medium text-on-surface-variant">
            מסלול למידה פעיל
          </p>
        </div>
      </div>

      <nav className="scroll-hide flex-1 space-y-1 overflow-y-auto" aria-label="ניווט ראשי">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-row-reverse items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "bg-gradient-to-l from-primary to-primary-container text-white shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:bg-white/60"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${isActive ? "icon-fill" : ""}`}
              >
                {item.icon}
              </span>
              <span className="flex-1 text-right">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-haredi-primary p-5 text-white shadow-lg">
          <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
          <p className="relative text-sm font-bold">צריך עזרה אישית?</p>
          <p className="relative mt-1 text-xs text-white/80">
            יועץ קריירה זמין עבורך
          </p>
          <Link
            href="/dashboard/chat"
            className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-bold text-primary transition-all hover:bg-secondary-container hover:text-on-secondary-container"
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            שיחת ייעוץ
          </Link>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full flex-row-reverse items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-all hover:bg-error-container hover:text-on-error-container focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="flex-1 text-right">התנתקות</span>
        </button>
      </div>
    </aside>
  );
}
