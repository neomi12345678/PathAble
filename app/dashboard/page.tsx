import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/utils/texts";
import {
  getAchievementBadges,
  getProfile,
  getUserProgress,
} from "@/lib/data";
import { IMAGES } from "@/lib/assets/images";

export const metadata: Metadata = {
  title: `לוח בקרה | ${APP_NAME}`,
  description: `לוח בקרה אישי – ${APP_NAME}`,
};

export default async function DashboardPage() {
  const [profile, progress, badges] = await Promise.all([
    getProfile(),
    getUserProgress(),
    getAchievementBadges(),
  ]);

  const firstName = profile?.first_name ?? "משתמש";
  const completedCount = progress.filter((p) => p.completed).length;
  const earnedCount = badges.filter((b) => b.earned).length;
  const avgProgress =
    progress.length > 0
      ? Math.round(
          progress.reduce((sum, p) => sum + p.progress, 0) / progress.length
        )
      : 0;

  const stats = [
    {
      label: "מודולים שהושלמו",
      value: String(completedCount),
      icon: "school",
      tint: "bg-primary/5 text-primary border-primary/10",
      valueColor: "text-primary",
    },
    {
      label: "תגי הישג",
      value: String(earnedCount),
      icon: "auto_awesome",
      tint: "bg-secondary/5 text-secondary border-secondary/10",
      valueColor: "text-secondary",
    },
    {
      label: "התקדמות ממוצעת",
      value: `${avgProgress}%`,
      icon: "timer",
      tint: "bg-tertiary/5 text-tertiary border-tertiary/10",
      valueColor: "text-tertiary",
    },
  ];

  const earnedBadges = badges.filter((b) => b.earned).slice(0, 3);
  const displayBadges =
    earnedBadges.length > 0
      ? earnedBadges.map((b) => ({
          icon: b.icon,
          label: b.title,
          color: "text-primary",
          glow: "bg-primary/5",
        }))
      : badges.slice(0, 3).map((b) => ({
          icon: b.icon,
          label: b.title,
          color: "text-on-surface-variant",
          glow: "bg-surface-container/5",
        }));

  return (
    <div className="flex flex-col gap-12 text-right">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-black tracking-tight text-primary md:text-5xl">
            היי {firstName} 👋
          </h1>
          <p className="max-w-xl text-lg font-medium leading-relaxed text-on-surface-variant opacity-80">
            {completedCount > 0
              ? `השלמת ${completedCount} מודולים — המשך לבנות את העתיד שלך.`
              : "בוא נתחיל את המסלול שלך — אבחון, למידה והשמה."}
          </p>
        </div>
        <div className="flex flex-row-reverse items-center gap-3 rounded-2xl border border-white/60 bg-white/50 px-5 py-3 shadow-sm">
          <span className="material-symbols-outlined text-primary">
            calendar_today
          </span>
          <span className="font-bold text-on-surface-variant">היום</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass-card flex flex-col gap-6 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1"
          >
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${s.tint}`}
            >
              <span className="material-symbols-outlined icon-fill text-4xl">
                {s.icon}
              </span>
            </div>
            <div>
              <h4 className={`mb-1 font-display text-4xl font-black ${s.valueColor}`}>
                {s.value}
              </h4>
              <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="glass-card relative flex flex-col items-center gap-8 overflow-hidden rounded-[2rem] border-white/60 p-6 sm:gap-14 sm:rounded-[40px] sm:p-10 md:flex-row-reverse md:p-14">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />
        <div className="z-10 flex-1 space-y-8">
          <div className="inline-flex flex-row-reverse items-center gap-3 rounded-full bg-secondary-container/20 px-5 py-2 text-sm font-black uppercase tracking-widest text-secondary">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-secondary" />
            המסלול שלך
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-4xl font-black leading-tight text-on-primary-container md:text-5xl">
              מרכז הלמידה
            </h2>
            <p className="text-xl font-medium text-on-surface-variant opacity-80">
              קורסים ומיומנויות מותאמים לקריירה שלך
            </p>
          </div>
          <div className="max-w-md space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-primary">
                {avgProgress}%{" "}
                <span className="text-lg font-bold opacity-40">הושלמו</span>
              </span>
              <span className="text-sm font-bold text-on-surface-variant/50">
                {progress.length - completedCount} מודולים נותרו
              </span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full border border-white/40 bg-surface-container-high/40 p-1">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-container to-primary shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-1000"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
          <Link
            href="/dashboard/learning"
            className="inline-flex w-full items-center justify-center gap-4 rounded-2xl bg-primary px-8 py-4 text-base font-black text-on-primary shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95 sm:w-auto sm:px-10 sm:py-5 sm:text-lg"
          >
            המשך למידה
            <span className="material-symbols-outlined font-bold">arrow_back</span>
          </Link>
        </div>
        <div className="group relative z-10 aspect-square w-full overflow-hidden rounded-[32px] shadow-2xl md:w-[380px]">
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url('${IMAGES.learningFeature}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="glass-card space-y-8 rounded-[2rem] p-6 sm:space-y-10 sm:rounded-[40px] sm:p-10 md:col-span-8">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-3xl font-black text-primary">
              הישגים
            </h3>
            <Link
              href="/dashboard/achievements"
              className="text-sm font-black text-primary underline-offset-4 hover:underline"
            >
              לכל ההישגים
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            {displayBadges.map((a) => (
              <div
                key={a.label}
                className="group flex cursor-pointer flex-col items-center gap-5"
              >
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/60 bg-white shadow-xl transition-all duration-500 group-hover:scale-105 md:h-28 md:w-28">
                  <div
                    className={`absolute inset-0 rounded-[2rem] ${a.glow} opacity-0 blur-xl transition-opacity group-hover:opacity-100`}
                  />
                  <span
                    className={`material-symbols-outlined icon-fill text-5xl ${a.color}`}
                  >
                    {a.icon}
                  </span>
                </div>
                <span className="text-center text-lg font-black text-on-surface">
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card flex flex-col items-center gap-8 rounded-[40px] border-white/60 p-10 text-center md:col-span-4">
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-black text-primary">
              צריך עזרה?
            </h3>
            <p className="text-sm font-bold text-on-surface-variant/60">
              היועץ AI זמין עבורך
            </p>
          </div>
          <div className="group relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/30 to-secondary/20 blur-xl transition-opacity group-hover:opacity-100 opacity-70" />
            <div className="relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <img
                src={IMAGES.aiAvatar}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-4 border-white bg-green-500 shadow-lg" />
          </div>
          <div>
            <p className="mb-1 text-xl font-black text-on-surface">
              יועץ קריירה AI
            </p>
            <p className="text-sm font-semibold text-on-surface-variant">
              המלצות מותאמות לפי האבחון שלך
            </p>
          </div>
          <Link
            href="/dashboard/chat"
            className="w-full rounded-2xl border border-primary/20 bg-white py-4 font-black text-primary transition-all duration-300 hover:bg-primary hover:text-white active:scale-95"
          >
            התחל שיחה
          </Link>
        </div>
      </section>
    </div>
  );
}
