"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Job } from "@/types";
import {
  getJobMatchScore,
  jobMatchesDiagnosis,
  jobMatchesUserCity,
  sortJobsByDiagnosis,
  DIAGNOSIS_FILTER_MIN_SCORE,
} from "@/lib/disability-matching";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  getJobCategoryLabel,
  JOB_CATEGORY_IDS,
  type JobCategoryId,
} from "@/lib/jobs/job-categories";
import {
  SUPPORT_LEVELS,
  SUPPORT_LEVEL_TOOLTIP,
  type SupportLevel,
} from "@/lib/jobs/support-level";
import {
  getWorkModeLabel,
  type WorkMode,
} from "@/lib/jobs/job-details-extract";
import { SupportLevelBadge } from "@/components/jobs/SupportLevelBadge";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { JOBS } from "@/utils/texts";

const PAGE_SIZE = 50;

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

function buildPageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

export function JobsBoard({
  jobs: initialJobs,
  savedJobIds = [],
  lastSyncedAt = null,
  syncInProgress = false,
}: {
  jobs: Job[];
  savedJobIds?: string[];
  lastSyncedAt?: string | null;
  syncInProgress?: boolean;
}) {
  const { diagnosis, autismLevel, city, sector, diagnosisLabel, loading: profileLoading } =
    useUserProfile();
  const [search, setSearch] = useState("");
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [onlyFlexibleHours, setOnlyFlexibleHours] = useState(false);
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | "all">("all");
  const [onlyLowSocial, setOnlyLowSocial] = useState(false);
  const [onlyWithSupport, setOnlyWithSupport] = useState(false);
  const [onlyMyDiagnosis, setOnlyMyDiagnosis] = useState(false);
  const [onlyMyArea, setOnlyMyArea] = useState(false);
  const [scope, setScope] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<JobCategoryId[]>(
    []
  );
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [supportLevelFilter, setSupportLevelFilter] = useState<
    SupportLevel | "all"
  >("all");
  const [page, setPage] = useState(1);

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
      if (
        onlyFlexibleHours &&
        !job.structured_details.flexibleHours
      ) {
        return false;
      }
      if (
        workModeFilter !== "all" &&
        job.structured_details.workMode !== workModeFilter
      ) {
        return false;
      }
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

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(job.category as JobCategoryId)
      ) {
        return false;
      }

      if (
        supportLevelFilter !== "all" &&
        job.support_level !== supportLevelFilter
      ) {
        return false;
      }

      if (q) {
        const haystack =
          `${job.title} ${job.company} ${job.city} ${job.description} ${job.autism_match_reason} ${job.support_features.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    jobs,
    search,
    onlyRemote,
    onlyFlexibleHours,
    workModeFilter,
    onlyLowSocial,
    onlyWithSupport,
    onlyMyDiagnosis,
    onlyMyArea,
    scope,
    selectedCategories,
    supportLevelFilter,
    diagnosis,
    autismLevel,
    city,
    sector,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [
    search,
    onlyRemote,
    onlyFlexibleHours,
    workModeFilter,
    onlyLowSocial,
    onlyWithSupport,
    onlyMyDiagnosis,
    onlyMyArea,
    scope,
    selectedCategories,
    supportLevelFilter,
  ]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => buildPageItems(page, totalPages),
    [page, totalPages]
  );

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  const goToPage = (next: number): void => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = (): void => {
    setSearch("");
    setOnlyRemote(false);
    setOnlyFlexibleHours(false);
    setWorkModeFilter("all");
    setOnlyLowSocial(false);
    setOnlyWithSupport(false);
    setOnlyMyDiagnosis(false);
    setOnlyMyArea(false);
    setScope("all");
    setSelectedCategories([]);
    setSupportLevelFilter("all");
    setPage(1);
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
                  ? `עודכן אוטומטית ${timeAgo(lastSyncedAt)} · Cron יומי + רענון בכניסה`
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
                  href="/onboarding?update=1"
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
            <select
              value={workModeFilter}
              onChange={(e) => {
                const v = e.target.value;
                setWorkModeFilter(v === "all" ? "all" : (v as WorkMode));
                setPage(1);
              }}
              aria-label={JOBS.workModeAll}
              className="h-10 cursor-pointer rounded-xl border border-outline-variant/40 bg-white/70 px-3 text-xs font-bold text-on-surface focus:border-primary focus:ring-0"
            >
              <option value="all">{JOBS.workModeAll}</option>
              <option value="remote">{JOBS.workModeRemote}</option>
              <option value="hybrid">{JOBS.workModeHybrid}</option>
              <option value="office">{JOBS.workModeOffice}</option>
            </select>
            <select
              value={supportLevelFilter}
              onChange={(e) => {
                const v = e.target.value;
                setSupportLevelFilter(
                  v === "all" ? "all" : (v as SupportLevel)
                );
                setPage(1);
              }}
              aria-label="רמת מבניות ותמיכה בתפקיד"
              title={SUPPORT_LEVEL_TOOLTIP}
              className="h-10 max-w-[11rem] cursor-pointer rounded-xl border border-outline-variant/40 bg-white/70 px-3 text-xs font-bold text-on-surface focus:border-primary focus:ring-0"
            >
              <option value="all">כל רמות המבניות</option>
              {SUPPORT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level === "structured"
                    ? "מובנה מאוד"
                    : level === "moderate"
                      ? "בינוני"
                      : "עצמאי"}
                </option>
              ))}
            </select>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen((v) => !v)}
                aria-expanded={categoriesOpen}
                aria-haspopup="listbox"
                className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all ${
                  selectedCategories.length > 0
                    ? "bg-violet-100 text-violet-800 shadow-md"
                    : "border border-outline-variant/40 bg-white/70 text-on-surface-variant hover:border-violet-400"
                }`}
              >
                <span className="material-symbols-outlined text-base">category</span>
                {selectedCategories.length > 0
                  ? `${selectedCategories.length} תחומים`
                  : "כל התחומים"}
              </button>
              {categoriesOpen && (
                <div
                  role="listbox"
                  aria-label="סינון לפי תחום"
                  className="absolute left-0 top-full z-20 mt-2 max-h-64 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                >
                  {JOB_CATEGORY_IDS.filter((id) => id !== "other").map((id) => {
                    const checked = selectedCategories.includes(id);
                    return (
                      <label
                        key={id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedCategories((prev) =>
                              checked
                                ? prev.filter((c) => c !== id)
                                : [...prev, id]
                            );
                            setPage(1);
                          }}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        {getJobCategoryLabel(id)}
                      </label>
                    );
                  })}
                  {selectedCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategories([]);
                        setPage(1);
                      }}
                      className="mt-1 w-full rounded-lg px-2 py-2 text-xs font-bold text-primary hover:bg-primary/5"
                    >
                      נקה תחומים
                    </button>
                  )}
                </div>
              )}
            </div>
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
              onClick={() => setOnlyFlexibleHours((v) => !v)}
              aria-pressed={onlyFlexibleHours}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-colors ${
                onlyFlexibleHours
                  ? "bg-indigo-100 text-indigo-800"
                  : "border border-outline-variant/40 bg-white/70 text-on-surface-variant hover:border-indigo-400"
              }`}
            >
              <span className="material-symbols-outlined text-base">schedule</span>
              {JOBS.onlyFlexibleHours}
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

      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="font-bold text-outline">
          <span className="text-on-surface">{filtered.length}</span> {JOBS.results}
          {filtered.length > PAGE_SIZE && (
            <span className="mr-2 text-xs font-medium text-on-surface-variant">
              · מציג {rangeStart}–{rangeEnd}
            </span>
          )}
        </p>
        {totalPages > 1 && (
          <p className="text-xs font-bold text-on-surface-variant">
            עמוד {page} מתוך {totalPages}
          </p>
        )}
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paged.map((job) => {
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
                  className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary-container/10 font-display text-sm font-black text-primary">
                      {companyInitials(job.company)}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {diagnosis ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${matchBadgeClass(matchScore)}`}
                        >
                          {matchScore}% {JOBS.matchLabel}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-outline">
                          השלם/י onboarding לציון התאמה
                        </span>
                      )}
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-800">
                      {getJobCategoryLabel(job.category)}
                    </span>
                    <SupportLevelBadge level={job.support_level} />
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
                    {job.structured_details.workMode !== "unknown" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-800">
                        <span className="material-symbols-outlined text-sm">
                          location_on
                        </span>
                        {getWorkModeLabel(job.structured_details.workMode)}
                      </span>
                    )}
                    {job.structured_details.flexibleHours && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-800">
                        <span className="material-symbols-outlined text-sm">
                          schedule
                        </span>
                        {JOBS.flexibleHoursYes}
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
                      <SaveJobButton
                        jobId={job.id}
                        initialSaved={savedJobIds.includes(job.id)}
                        compact
                      />
                    </div>
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="flex items-center justify-center gap-1 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-colors hover:brightness-110"
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

          {totalPages > 1 && (
            <nav
              aria-label="עימוד משרות"
              className="glass-card flex flex-col items-center gap-4 rounded-2xl border border-slate-100/80 bg-gradient-to-b from-white to-slate-50/80 px-4 py-5 shadow-sm sm:flex-row sm:justify-between sm:px-6"
            >
              <p className="text-sm font-medium text-on-surface-variant">
                משרות{" "}
                <span className="font-black text-on-surface">
                  {rangeStart}–{rangeEnd}
                </span>{" "}
                מתוך{" "}
                <span className="font-black text-on-surface">{filtered.length}</span>
              </p>

              <div className="flex items-center gap-1.5" dir="rtl">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  aria-label="עמוד קודם"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/40 bg-white text-on-surface transition-all hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <span className="material-symbols-outlined text-xl">
                    chevron_right
                  </span>
                </button>

                {pageItems.map((item, idx) =>
                  item === "ellipsis" ? (
                    <span
                      key={`e-${idx}`}
                      className="flex h-10 w-8 items-center justify-center text-sm font-bold text-outline"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      aria-label={`עמוד ${item}`}
                      aria-current={item === page ? "page" : undefined}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-black transition-all ${
                        item === page
                          ? "bg-primary text-white shadow-md shadow-primary/25"
                          : "border border-outline-variant/40 bg-white text-on-surface hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="עמוד הבא"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/40 bg-white text-on-surface transition-all hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <span className="material-symbols-outlined text-xl">
                    chevron_left
                  </span>
                </button>
              </div>
            </nav>
          )}
        </>
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
            className="mt-2 rounded-2xl bg-primary px-8 py-3 text-sm font-black text-white shadow-lg transition-colors hover:brightness-110"
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
