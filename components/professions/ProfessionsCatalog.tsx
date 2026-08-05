"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { Profession } from "@/types";
import { ProfessionCard } from "@/components/professions/ProfessionCard";
import { getProfessionMatchScore, professionMatchesDiagnosis } from "@/lib/disability-matching";
import {
  getJobCategoryLabel,
  JOB_CATEGORY_IDS,
  type JobCategoryId,
} from "@/lib/jobs/job-categories";
import { useUserProfile } from "@/hooks/useUserProfile";

const PAGE_SIZE = 9;

const CATEGORY_FILTER_IDS = JOB_CATEGORY_IDS.filter((id) => id !== "other");

type SortKey = "match" | "salary" | "demand";

function getProfessionCategoryLabel(profession: Profession): string {
  return getJobCategoryLabel(profession.category);
}

function getSalaryAvg(range: string): number {
  const nums = range.replace(/[,]/g, "").match(/\d+/g);
  if (!nums || nums.length === 0) return 0;
  const values = nums.map(Number);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function getDemandScore(profession: Profession): number {
  return profession.skills.length;
}

interface ProfessionsCatalogProps {
  professions: Profession[];
  savedIds: string[];
}

export function ProfessionsCatalog({
  professions,
  savedIds,
}: ProfessionsCatalogProps) {
  const [saved, setSaved] = useState<Set<string>>(new Set(savedIds));
  const [search, setSearch] = useState("");

  const toggleSave = async (
    professionId: string,
    nextSaved: boolean
  ): Promise<void> => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (nextSaved) next.add(professionId);
      else next.delete(professionId);
      return next;
    });
    try {
      const res = await fetch("/api/professions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionId, saved: nextSaved }),
      });
      if (!res.ok) throw new Error();
      toast.success(nextSaved ? "המקצוע נשמר" : "המקצוע הוסר מהשמורים");
    } catch {
      setSaved((prev) => {
        const next = new Set(prev);
        if (nextSaved) next.delete(professionId);
        else next.add(professionId);
        return next;
      });
      toast.error("שגיאה בשמירת המקצוע");
    }
  };
  const [activeCategories, setActiveCategories] = useState<Set<JobCategoryId>>(
    new Set()
  );
  const [minMatch, setMinMatch] = useState(0);
  const [sort, setSort] = useState<SortKey>("match");
  const [page, setPage] = useState(1);

  const [onlyMyDiagnosis, setOnlyMyDiagnosis] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { diagnosis, autismLevel, diagnosisLabel, loading: profileLoading } =
    useUserProfile();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = professions
      .map((p) => ({
        profession: p,
        match: getProfessionMatchScore(p, diagnosis, autismLevel),
        salary: getSalaryAvg(p.salary_range),
        demand: getDemandScore(p),
        category: p.category as JobCategoryId,
        categoryLabel: getProfessionCategoryLabel(p),
        fitsDiagnosis: professionMatchesDiagnosis(p, diagnosis),
      }))
      .filter((item) => {
        if (onlyMyDiagnosis && diagnosis && !item.fitsDiagnosis) return false;
        if (item.match < minMatch) return false;
        if (
          activeCategories.size > 0 &&
          !activeCategories.has(item.category)
        ) {
          return false;
        }
        if (q) {
          const haystack = [
            item.profession.name,
            item.profession.description,
            ...item.profession.skills,
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });

    result.sort((a, b) => {
      if (sort === "salary") return b.salary - a.salary;
      if (sort === "demand") return b.demand - a.demand;
      return b.match - a.match;
    });

    return result;
  }, [professions, search, activeCategories, minMatch, sort, diagnosis, autismLevel, onlyMyDiagnosis]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleCategory = (cat: JobCategoryId): void => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
    setPage(1);
  };

  const clearFilters = (): void => {
    setActiveCategories(new Set());
    setMinMatch(0);
    setSearch("");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 text-right">
      <header className="flex flex-col items-center gap-4 text-center">
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-primary-container/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-primary-container">
            גלה את העתיד שלך
          </span>
          <h1 className="font-display text-2xl font-black leading-tight text-on-surface md:text-3xl">
            מצא את הייעוד המקצועי שלך
          </h1>
          <p className="mx-auto max-w-xl text-sm text-on-surface-variant">
            {profileLoading ? (
              "טוען פרופיל..."
            ) : diagnosis ? (
              <>
                מקצועות מותאמים לאבחנה שלך:{" "}
                <span className="font-black text-primary">{diagnosisLabel}</span>
              </>
            ) : (
              <>
                כדי לדרג התאמה אישית,{" "}
                <a
                  href="/onboarding?update=1"
                  className="font-black text-primary underline-offset-2 hover:underline"
                >
                  השלימו את האבחנה
                </a>
                .
              </>
            )}
          </p>
        </div>
        <div className="search-container relative w-full max-w-xl">
          <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-outline">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="מה תרצה להיות כשתהיה גדול?..."
            aria-label="חיפוש מקצוע"
            className="glass-card h-11 w-full rounded-2xl border-none pl-4 pr-11 text-base font-medium outline-none placeholder:text-outline-variant focus:ring-0 sm:pl-24"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              aria-label="נקה חיפוש"
              className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-outline transition-colors hover:bg-slate-100 sm:left-28"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
          <span className="absolute left-3 top-1/2 hidden h-10 -translate-y-1/2 items-center justify-center rounded-2xl bg-primary-container px-6 text-sm font-bold text-white shadow-md sm:flex">
            חיפוש
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row-reverse lg:gap-10">
        <aside className="w-full shrink-0 lg:w-80">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="glass-card mb-4 flex w-full items-center justify-between rounded-2xl px-5 py-3.5 font-bold text-on-surface lg:hidden"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">tune</span>
              מסננים
            </span>
            <span className="material-symbols-outlined text-outline">
              {filtersOpen ? "expand_less" : "expand_more"}
            </span>
          </button>
          <div className={`glass-card rounded-[2rem] p-6 sm:p-8 ${filtersOpen ? "block" : "hidden"} lg:block lg:sticky lg:top-28`}>
            <div className="mb-8 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-black">
                <span className="material-symbols-outlined text-primary-container">
                  tune
                </span>
                מסננים
              </h3>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-bold text-primary-container hover:underline"
              >
                נקה
              </button>
            </div>

            <div className="mb-10">
              <p className="mb-5 text-xs font-black uppercase tracking-widest text-outline">
                התאמה לאבחנה
              </p>
              <label
                className={`group flex flex-row-reverse items-center justify-end gap-3 ${
                  diagnosis ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
              >
                <span className="font-bold text-on-surface/80 transition-colors group-hover:text-primary-container">
                  {diagnosis
                    ? `רק מקצועות שמתאימים ל-${diagnosisLabel}`
                    : "השלימו אבחנה בהיכרות / בפרופיל כדי לסנן לפי התאמה"}
                </span>
                <input
                  type="checkbox"
                  checked={onlyMyDiagnosis}
                  disabled={!diagnosis}
                  onChange={(e) => {
                    setOnlyMyDiagnosis(e.target.checked);
                    setPage(1);
                  }}
                  className="h-5 w-5 rounded-md border-outline-variant text-primary-container focus:ring-primary-container/20 disabled:opacity-40"
                />
              </label>
            </div>

            <div className="mb-10">
              <p className="mb-5 text-xs font-black uppercase tracking-widest text-outline">
                תחומי עניין
              </p>
              <div className="space-y-4">
                {CATEGORY_FILTER_IDS.map((catId) => (
                  <label
                    key={catId}
                    className="group flex cursor-pointer flex-row-reverse items-center justify-end gap-3"
                  >
                    <span className="font-bold text-on-surface/80 transition-colors group-hover:text-primary-container">
                      {getJobCategoryLabel(catId)}
                    </span>
                    <input
                      type="checkbox"
                      checked={activeCategories.has(catId)}
                      onChange={() => toggleCategory(catId)}
                      className="h-5 w-5 rounded-md border-outline-variant text-primary-container focus:ring-primary-container/20"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <p className="mb-5 text-xs font-black uppercase tracking-widest text-outline">
                אחוז התאמה מינימלי
              </p>
              <div className="px-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={minMatch}
                  onChange={(e) => {
                    setMinMatch(Number(e.target.value));
                    setPage(1);
                  }}
                  aria-label="רמת התאמה מינימלית"
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-secondary-container"
                />
                <div className="mt-3 flex justify-between text-xs font-bold text-outline">
                  <span>0%</span>
                  <span className="rounded-md bg-primary-container/10 px-2 py-0.5 text-primary-container">
                    {minMatch}%+
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPage(1)}
              className="w-full rounded-2xl bg-on-surface py-4 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            >
              הצג תוצאות
            </button>
          </div>
        </aside>

        <section className="flex-grow">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 px-2">
            <p className="font-bold text-outline">
              נמצאו{" "}
              <span className="text-on-surface">{filtered.length}</span> מסלולים
              מתאימים
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-outline">מיין לפי:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortKey);
                  setPage(1);
                }}
                className="cursor-pointer border-none bg-transparent text-sm font-black text-on-surface focus:ring-0"
              >
                <option value="match">התאמה גבוהה</option>
                <option value="salary">שכר ממוצע</option>
                <option value="demand">ביקוש בשוק</option>
              </select>
            </div>
          </div>

          {visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => (
                <ProfessionCard
                  key={item.profession.id}
                  profession={item.profession}
                  isSaved={saved.has(item.profession.id)}
                  match={diagnosis ? item.match : undefined}
                  diagnosisLabel={diagnosisLabel}
                  onToggleSave={(id, next) => void toggleSave(id, next)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center gap-4 rounded-[2rem] px-8 py-24 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant">
                search_off
              </span>
              <h3 className="font-display text-2xl font-black text-on-surface">
                לא נמצאו מסלולים מתאימים
              </h3>
              <p className="max-w-sm text-on-surface-variant">
                נסה לשנות את מילות החיפוש או להרחיב את הסינון כדי לגלות עוד
                אפשרויות.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 rounded-2xl bg-primary-container px-8 py-3 text-sm font-black text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
              >
                נקה את כל המסננים
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-20 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="הקודם"
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-outline transition-all hover:bg-white hover:shadow-md disabled:opacity-40"
              >
                <span className="material-symbols-outlined rotate-180">
                  chevron_left
                </span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={p === currentPage ? "page" : undefined}
                  className={
                    p === currentPage
                      ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container font-black text-white shadow-lg shadow-primary-container/20"
                      : "flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-on-surface transition-all hover:bg-white hover:shadow-md"
                  }
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="הבא"
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-outline transition-all hover:bg-white hover:shadow-md disabled:opacity-40"
              >
                <span className="material-symbols-outlined rotate-180">
                  chevron_right
                </span>
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
