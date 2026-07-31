import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getAdminStatsFromDb, getAdminUsersFromDb } from "@/lib/data/admin";
import { getProfile } from "@/lib/data";
import { IMAGES } from "@/lib/assets/images";
import { APP_NAME } from "@/utils/texts";
import { UserTable } from "@/components/admin/UserTable";

export const metadata: Metadata = {
  title: `פאנל ניהול | ${APP_NAME}`,
};

export const dynamic = "force-dynamic";

const NAV = [
  { icon: "dashboard", label: "לוח בקרה", active: true },
  { icon: "group", label: "משתמשים", active: false },
  { icon: "work", label: "מקצועות", active: false },
  { icon: "menu_book", label: "שיעורים", active: false },
  { icon: "analytics", label: "סטטיסטיקות", active: false },
];

function chartClass(tone: string): string {
  switch (tone) {
    case "secondary":
      return "bg-secondary/30";
    case "highlight":
      return "bg-primary-container shadow-lg shadow-primary/20";
    case "muted":
      return "bg-primary/10";
    default:
      return "bg-primary/20";
  }
}

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/dashboard");
  }

  const [stats, users, profile] = await Promise.all([
    getAdminStatsFromDb(),
    getAdminUsersFromDb(),
    getProfile(),
  ]);

  const adminName = profile?.first_name ?? "מנהל";

  return (
    <div className="flex min-h-screen bg-background text-on-surface" dir="rtl">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] right-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[-5%] h-[30%] w-[30%] rounded-full bg-secondary-fixed-dim/10 blur-[100px]" />
      </div>

      <aside className="sticky top-0 z-50 hidden h-screen w-72 flex-col bg-gradient-to-b from-[#001e2f] to-[#003751] p-6 text-white shadow-2xl md:flex">
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary shadow-lg shadow-secondary/20">
            <span className="material-symbols-outlined icon-fill text-white">
              rocket_launch
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            {APP_NAME}
          </h1>
        </div>
        <nav className="flex flex-grow flex-col gap-2">
          {NAV.map((item) => (
            <a
              key={item.label}
              href="#"
              className={
                item.active
                  ? "flex items-center gap-3 rounded-xl bg-primary-container px-4 py-3 text-on-primary-container shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                  : "flex items-center gap-3 rounded-xl px-4 py-3 text-white/70 transition-all hover:-translate-x-1 hover:bg-white/10"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-secondary">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${IMAGES.adminAvatar}')` }}
              />
            </div>
            <div>
              <p className="text-xs text-white">שלום, {adminName}</p>
              <p className="text-[10px] text-white/50">מנהל מערכת</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="mt-4 block w-full rounded-lg bg-secondary py-2 text-center text-sm font-bold text-on-secondary transition-transform active:scale-95"
          >
            חזרה לאתר
          </Link>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-[1280px] flex-grow p-8 md:p-12">
        <header className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 font-display text-3xl font-extrabold text-primary">
              מרכז השליטה
            </h2>
            <p className="max-w-xl text-lg text-on-surface-variant">
              ניהול משתמשים ונתוני מערכת מ-Supabase.
            </p>
          </div>
          <div className="glass-card flex items-center gap-4 rounded-2xl px-6 py-4">
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant">
                משתמשים רשומים
              </span>
              <span className="text-2xl font-bold text-primary">
                {stats.totalUsers}
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-primary">
                trending_up
              </span>
            </div>
          </div>
        </header>

        <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="group glass-card relative overflow-hidden rounded-[32px] p-8 md:col-span-2">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-primary">
                הרשמות שבועיות
              </h3>
              <span className="rounded-full bg-surface px-4 py-1 text-sm font-medium text-on-surface-variant">
                7 ימים אחרונים
              </span>
            </div>
            <div className="flex h-64 w-full items-end gap-3 px-2">
              {stats.weeklySignups.map((bar) => (
                <div
                  key={bar.day}
                  className={`flex-grow rounded-t-xl transition-all duration-500 ${chartClass(bar.tone)}`}
                  style={{ height: `${bar.h}%` }}
                  title={`${bar.count} הרשמות`}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between px-1 text-xs font-medium text-on-surface-variant">
              {stats.weeklySignups.map((bar) => (
                <span key={bar.day}>{bar.day}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="glass-card flex items-center justify-between rounded-[32px] p-6">
              <div>
                <span className="mb-1 block text-sm opacity-70">
                  קורסים שהושלמו
                </span>
                <span className="text-3xl font-extrabold">
                  {stats.completedModules}
                </span>
              </div>
              <span className="material-symbols-outlined text-3xl text-secondary">
                workspace_premium
              </span>
            </div>
            <div className="glass-card flex items-center justify-between rounded-[32px] p-6">
              <div>
                <span className="mb-1 block text-sm opacity-70">
                  משרות פעילות
                </span>
                <span className="text-3xl font-extrabold text-primary">
                  {stats.totalJobs}
                </span>
              </div>
              <span className="material-symbols-outlined text-3xl text-primary">
                work_history
              </span>
            </div>
            <div className="glass-card flex items-center justify-between rounded-[32px] p-6">
              <div>
                <span className="mb-1 block text-sm opacity-70">
                  משתמשים פעילים
                </span>
                <span className="text-3xl font-extrabold">
                  {stats.activeUsers}
                </span>
              </div>
              <span className="material-symbols-outlined text-3xl text-primary">
                verified
              </span>
            </div>
          </div>
        </section>

        <UserTable users={users} totalUsers={stats.totalUsers} />
      </main>
    </div>
  );
}
