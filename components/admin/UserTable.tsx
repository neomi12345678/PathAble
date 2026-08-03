"use client";

import { useMemo, useState } from "react";

export interface AdminUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  status: "active" | "pending";
  track: string;
  joined: string;
  accent: "primary" | "secondary";
}

const STATUS_STYLES: Record<AdminUser["status"], { label: string; cls: string }> = {
  active: {
    label: "פעיל",
    cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  pending: {
    label: "בהמתנה",
    cls: "bg-amber-100 text-amber-700 border border-amber-200",
  },
};

export function UserTable({
  users,
  totalUsers,
}: {
  users: AdminUser[];
  totalUsers: number;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [query, users]);

  return (
    <section className="glass-card mb-12 overflow-hidden rounded-[32px] border-none shadow-2xl">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-outline-variant/30 bg-white/50 p-4 sm:flex-row sm:items-center sm:p-8">
        <h3 className="font-display text-2xl font-semibold text-primary">
          ניהול משתמשים אחרונים
        </h3>
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="חיפוש משתמשים"
            placeholder="חיפוש לפי שם או דוא״ל..."
            className="w-full rounded-full border border-outline-variant/50 bg-surface py-2 pr-10 pl-4 text-sm focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-outline-variant/20 text-on-surface-variant">
              <th className="px-8 py-5 text-sm font-semibold">שם מלא</th>
              <th className="px-8 py-5 text-sm font-semibold">סטטוס</th>
              <th className="px-8 py-5 text-sm font-semibold">מסלול</th>
              <th className="px-8 py-5 text-sm font-semibold">תאריך הצטרפות</th>
              <th className="px-8 py-5 text-center text-sm font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filtered.map((user) => (
              <tr
                key={user.id}
                className="group transition-colors hover:bg-primary/5"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high font-bold ${
                        user.accent === "primary"
                          ? "text-primary"
                          : "text-secondary"
                      }`}
                    >
                      {user.initials}
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">{user.name}</div>
                      <div className="text-xs text-on-surface-variant">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold ${STATUS_STYLES[user.status].cls}`}
                  >
                    {STATUS_STYLES[user.status].label}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">
                  {user.track}
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">
                  {user.joined}
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      aria-label={`עריכת ${user.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white"
                    >
                      <span className="material-symbols-outlined text-sm">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`מחיקת ${user.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-error/10 text-error transition-all hover:bg-error hover:text-white"
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-12 text-center text-on-surface-variant"
                >
                  לא נמצאו משתמשים התואמים לחיפוש.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-outline-variant/10 md:hidden">
        {filtered.map((user) => (
          <div key={user.id} className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-bold ${
                  user.accent === "primary" ? "text-primary" : "text-secondary"
                }`}
              >
                {user.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-on-surface">{user.name}</div>
                <div className="truncate text-xs text-on-surface-variant">
                  {user.email}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold ${STATUS_STYLES[user.status].cls}`}
              >
                {STATUS_STYLES[user.status].label}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>{user.track}</span>
              <span>{user.joined}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label={`עריכת ${user.name}`}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary/10 py-2 text-sm font-bold text-primary"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                עריכה
              </button>
              <button
                type="button"
                aria-label={`מחיקת ${user.name}`}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-error/10 py-2 text-sm font-bold text-error"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                מחיקה
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-5 py-12 text-center text-on-surface-variant">
            לא נמצאו משתמשים התואמים לחיפוש.
          </p>
        )}
      </div>

      <div className="flex justify-center bg-surface-container-low/50 p-6">
        <button
          type="button"
          className="text-sm font-bold text-primary hover:underline"
        >
          צפה בכל המשתמשים ({totalUsers})
        </button>
      </div>
    </section>
  );
}
