"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Job } from "@/types";
import { getJobMatchScore, jobMatchesDiagnosis, jobMatchesUserCity, sortJobsByDiagnosis, DIAGNOSIS_FILTER_MIN_SCORE } from "@/lib/disability-matching";
import { useUserProfile } from "@/hooks/useUserProfile";
import { JOBS } from "@/utils/texts";

const SCOPE_ICONS: Record<string, string> = {
  "משרה מלאה": "schedule",
  "משרה חלקית": "hourglass_bottom",
  חוזה: "description",
  התמחות: "school",
  פרילנס: "laptop_mac",
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "היום";
  if (days === 1) return "אתמול";
  if (days < 7) return `לפני ${days} ימים`;
  if (days < 30) return `לפני ${Math.floor(days / 7)} שבועות`;
  return `לפני ${Math.floor(days / 30)} חודשים`;
}

function companyInitials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

function matchBadgeClass(score: number): string {
  if (score >= 90) return "bg-emerald-100 text-emerald-800";
  if (score >= 80) return "bg-primary/10 text-primary";
  return "bg-slate-100 text-slate-600";
}

export function JobsBoard({
  jobs: initialJobs,
  lastSyncedAt = null,
  syncInProgress = false,
}: {
  jobs: Job[];
  lastSyncedAt?: string | null;
  syncInProgress?: boolean;
}) {
  const { diagnosis, autismLevel, city, sector, diagnosisLabel, loading: profileLoading } =
    useUserProfile();
  const [search, setSearch] = useState("");
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [onlyLowSocial, setOnlyLowSocial] = useState(false);
  const [onlyWithSupport, setOnlyWithSupport] = useState(false);
  const [onlyMyDiagnosis, setOnlyMyDiagnosis] = useState(false);
  const [onlyMyArea, setOnlyMyArea] = useState(false);
  const [scope, setScope] = useState("all");

  const jobs = useMemo(
    () => sortJobsByDiagnosis(initialJobs, diagnosis, autismLevel, city, sector),
    [initialJobs, diagnosis, autismLevel, city, sector]
  );

  const scopes = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.scope))).filter(Boolean),
    [jobs]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((job) => {
      if (onlyRemote && !job.work_from_home) return false;
      if (onlyLowSocial && job.social_interaction_level !== "נמוך") return false;
      if (onlyWithSupport && job.support_features.length === 0) return false;

      if (onlyMyDiagnosis && diagnosis) {
        const score = getJobMatchScore(
          job,
          diagnosis,
          autismLevel,
          city,
          sector
        );
        const fits = jobMatchesDiagnosis(job, diagnosis);
        if (!fits && score < DIAGNOSIS_FILTER_MIN_SCORE) return false;
      }

      if (onlyMyArea) {
        if (!city?.trim()) return false;
        if (!jobMatchesUserCity(job, city)) return false;
      }

      if (scope !== "all" && job.scope !== scope) return false;
      if (q) {
        const haystack =
          `${job.title} ${job.company} ${job.city} ${job.description} ${job.autism_match_reason} ${job.support_features.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, search, onlyRemote, onlyLowSocial, onlyWithSupport, onlyMyDiagnosis, onlyMyArea, scope, diagnosis, autismLevel, city, sector]);

  const clearFilters = (): void => {
    setSearch("");
    setOnlyRemote(false);
    setOnlyLowSocial(false);
    setOnlyWithSupport(false);
    setOnlyMyDiagnosis(false);
    setOnlyMyArea(false);
    setScope("all");
  };

  return (
    <div className="flex flex-col gap-5 text-right">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-black text-on-surface md:text-3xl">
              {JOBS.title}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
              <span className="material-symbols-outlined text-sm">psychology</span>
              {JOBS.badge}
            </span>
          </div>
          <p className="max-w-2xl text-sm text-on-surface-variant">
            {JOBS.subtitle}{" "}
            <span className="mt-1 block text-xs text-on-surface-variant/80">
              {syncInProgress
                ? "מעדכן משרות ברקע מדרושים ואתרים נוספים…"
                : lastSyncedAt
                  ? `עודכן אוטומטית ${timeAgo(lastSyncedAt)} · מתרענן כל 3 שעות`
                  : "משרות מתעדכנות אוטומטית מאתרי דרושים"}
            </span>
            {!profileLoading && diagnosis && (
              <>
                ההתאמה מחושבת לפי:{" "}
                <span className="font-black text-primary">{diagnosisLabel}</span>
                {city?.trim() ? (
                  <>
                    {" "}
                    · אזור:{" "}
                    <span className="font-black text-primary">{city.trim()}</span>
                  </>
                ) : null}
              </>
            )}
            {!profileLoading && !diagnosis && (
              <>
                כדי לקבל דירוג התאמה אישי,{" "}
                <a
                  href="/onboarding?update"
                  className="font-black text-primary underline-offset-2 hover:underline"
                >
                  השלימו את האבחנה בפרופיל
                </a>
                .
              </>
            )}
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-xl text-primary">
              info
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-bold text-on-surface">{JOBS.infoTitle}</p>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                {JOBS.infoBody}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card flex flex-col gap-3 rounded-2xl p-4 lg:flex-row lg:items-center">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={JOBS.searchPlaceholder}
              aria-label={JOBS.searchPlaceholder}
              className="h-10 w-full rounded-xl border border-outline-variant/40 bg-white/70 pr-10 pl-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="scroll-hide flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:gap-3">
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              aria-label={JOBS.allScopes}
              className="h-10 cursor-pointer rounded-xl border border-outline-variant/40 bg-white/70 px-3 text-xs font-bold text-on-surface focus:border-primary focus:ring-0"
            >
              <option value="all">{JOBS.allScopes}</option>
              {scopes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setOnlyMyDiagnosis((v) => !v)}
              disabled={!diagnosis}
              aria-pressed={onlyMyDiagnosis}
              className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                onlyMyDiagnosis
                  ? "bg-amber-100 text-amber-800 shadow-md"
                  : "border border-outline-variant/40 bg-white/70 text-on-surface-variant hover:border-amber-400"
              }`}
            >
              <span className="material-symbols-outlined text-base">psychology</span>
              {diagnosis ? `מתאים ל-${diagnosisLabel}` : "השלימו אבחנה בפרופיל"}
            </button>
            <button
              type="button"
              onClick={() => setOnlyMyArea((v) => !v)}
              disabled={!city?.trim()}
              aria-pressed={onlyMyArea}
              className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                onlyMyArea
                  ? "bg-sky-100 text-sky-800 shadow-md"
                  : "border border-outline-variant/40 bg-white/70 text-on-surface-variant hover:border-sky-400"
              }`}
            >
              <span className="material-symbols-outlined text-base">location_on</span>
              {city?.trim() ? `באזור ${city.trim()}` : JOBS.onlyMyArea}
            </button>
            <button
              type="button"
              onClick={() => setOnlyLowSocial((v) => !v)}
              aria-pressed={onlyLowSocial}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all ${
                onlyLowSocial
                  ? "bg-tertiary text-on-tertiary shadow-md"
                  : "border border-outline-variant/40 bg-white/70 text-on-surface-variant hover:border-tertiary"
              }`}
            >
              <span className="material-symbols-outlined text-base">groups_2</span>
              {JOBS.onlyLowSocial}
            </button>
            <button
              type="button"
              onClick={() => setOnlyRemote((v) => !v)}
              aria-pressed={onlyRemote}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all ${
                onlyRemote
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "border border-outline-variant/40 bg-white/70 text-on-surface-variant hover:border-primary"
              }`}
            >
              <span className="material-symbols-outlined text-base">home_work</span>
              {JOBS.onlyRemote}
            </button>
            <button
              type="button"
              onClick={() => setOnlyWithSupport((v) => !v)}
              aria-pressed={onlyWithSupport}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all ${
                onlyWithSupport
                  ? "bg-secondary text-on-secondary shadow-md shadow-secondary/20"
                  : "border border-outline-variant/40 bg-white/70 text-on-surface-variant hover:border-secondary"
              }`}
            >
              <span className="material-symbols-outlined text-base">handshake</span>
              {JOBS.onlyWithSupport}
            </button>
          </div>
        </div>
      </header>

      <p className="px-1 font-bold text-outline">
        <span className="text-on-surface">{filtered.length}</span> {JOBS.results}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => {
            const matchScore = getJobMatchScore(
              job,
              diagnosis,
              autismLevel,
              city,
              sector
            );
            const fitTags = job.disability_fit.slice(0, 3);
            return (
              <article
                key={job.id}
                className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary-container/10 font-display text-sm font-black text-primary">
                    {companyInitials(job.company)}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${matchBadgeClass(matchScore)}`}
                    >
                      {matchScore}% {JOBS.matchLabel}
                    </span>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold text-outline">
                      {timeAgo(job.created_at)}
                    </span>
                  </div>
                </div>

                <h3 className="mb-1 font-display text-base font-bold leading-tight text-on-surface transition-colors group-hover:text-primary">
                  <Link href={`/dashboard/jobs/${job.id}`}>{job.title}</Link>
                </h3>
                <p className="mb-3 text-sm text-on-surface-variant">
                  {job.company} · {job.city}
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-bold text-primary">
                    <span className="material-symbols-outlined text-sm">
                      {SCOPE_ICONS[job.scope] ?? "work"}
                    </span>
                    {job.scope}
                  </span>
                  {job.work_from_home && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      <span className="material-symbols-outlined text-sm">
                        home_work
                      </span>
                      {JOBS.workFromHome}
                    </span>
                  )}
                  {fitTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-on-surface">
                      {job.salary && job.salary !== "לא צוין"
                        ? job.salary
                        : "שכר לא צוין"}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="flex items-center justify-center gap-1 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:brightness-110 active:scale-95"
                  >
                    {JOBS.apply}
                    <span className="material-symbols-outlined text-base">
                      arrow_back
                    </span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center gap-4 rounded-[2rem] px-8 py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant">
            work_off
          </span>
          <h3 className="font-display text-2xl font-black text-on-surface">
            {JOBS.noResults}
          </h3>
          <p className="max-w-md text-sm text-on-surface-variant">
            {onlyMyArea && city?.trim()
              ? `אין משרות באזור ${city.trim()} לפי הסינון הנוכחי. נסו לכבות «באזור שלי» או להרחיב מסננים אחרים.`
              : onlyMyDiagnosis && diagnosis
                ? `אין משרות שמתאימות מספיק ל-${diagnosisLabel}. נסו לכבות את סינון האבחנה.`
                : "נסו לנקות את המסננים או לשנות את החיפוש."}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 rounded-2xl bg-primary px-8 py-3 text-sm font-black text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
          >
            {JOBS.clearFilters}
          </button>
        </div>
      )}

      <section className="glass-card rounded-3xl p-6">
        <h2 className="mb-4 font-display text-xl font-black text-on-surface">
          {JOBS.externalTitle}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {JOBS.externalLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-outline-variant/30 bg-white/60 px-4 py-3 text-sm font-bold text-on-surface transition-all hover:border-primary hover:bg-primary/5"
            >
              <span className="material-symbols-outlined text-primary">
                open_in_new
              </span>
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
