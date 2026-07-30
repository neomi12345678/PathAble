import { ACHIEVEMENTS } from "@/utils/texts";

interface AchievementsHeroProps {
  userName: string;
  badgeCount: number;
  journeyPercent: number;
}

export function AchievementsHero({
  userName,
  badgeCount,
  journeyPercent,
}: AchievementsHeroProps) {
  return (
    <section className="glass-card depth-shadow relative mb-8 overflow-hidden rounded-[32px] p-6 md:p-8">
      <div className="pointer-events-none absolute right-0 top-0 p-6 opacity-20">
        <span className="material-symbols-outlined text-[80px] text-primary md:text-[120px]">
          auto_awesome
        </span>
      </div>
      <div className="relative z-10 max-w-2xl">
        <span className="mb-3 inline-block rounded-full bg-secondary-container/20 px-4 py-1 text-xs font-bold text-secondary">
          {ACHIEVEMENTS.subtitle}
        </span>
        <h1 className="mb-3 font-display text-2xl font-extrabold text-on-surface md:text-4xl">
          {ACHIEVEMENTS.title}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-on-surface-variant md:text-base">
          {ACHIEVEMENTS.heroDesc(userName, badgeCount, journeyPercent)}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#badges"
            className="rounded-xl bg-secondary-container px-6 py-2.5 text-sm font-bold text-on-secondary-container shadow-lg transition-all hover:-translate-y-0.5"
          >
            {ACHIEVEMENTS.showCertificates}
          </a>
          <button
            type="button"
            className="rounded-xl border border-primary/30 px-6 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary/5"
          >
            {ACHIEVEMENTS.shareProfile}
          </button>
        </div>
      </div>
    </section>
  );
}
