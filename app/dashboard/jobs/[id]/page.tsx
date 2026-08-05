import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { APP_NAME, JOBS } from "@/utils/texts";
import { getJobById, getProfilePrefs, getProfessionById } from "@/lib/data";
import { getJobMatchScore } from "@/lib/disability-matching";
import { getJobCategoryLabel } from "@/lib/jobs/job-categories";
import { SupportLevelBadge } from "@/components/jobs/SupportLevelBadge";
import { JobStructuredPanel } from "@/components/jobs/JobStructuredPanel";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { jobIdSchema } from "@/utils/validation";
import { getSavedJobIds } from "@/lib/data";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatPostedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function companyInitials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const idResult = jobIdSchema.safeParse(id);
  if (!idResult.success) {
    return { title: `משרה לא נמצאה | ${APP_NAME}` };
  }

  const job = await getJobById(idResult.data);
  return {
    title: job ? `${job.title} | ${JOBS.title}` : `משרה לא נמצאה | ${APP_NAME}`,
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const idResult = jobIdSchema.safeParse(id);
  if (!idResult.success) notFound();

  const job = await getJobById(idResult.data);
  if (!job) notFound();

  const [prefs, profession, savedJobIds] = await Promise.all([
    getProfilePrefs(),
    job.profession_id ? getProfessionById(job.profession_id) : Promise.resolve(null),
    getSavedJobIds(),
  ]);

  const diagnosis = prefs?.disability_type?.trim() ?? "";
  const matchScore = getJobMatchScore(
    job,
    diagnosis,
    prefs?.autism_level,
    prefs?.city,
    prefs?.sector
  );

  return (
    <div className="mx-auto max-w-3xl text-right">
      <Link
        href="/dashboard/jobs"
        className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
      >
        <span className="material-symbols-outlined text-base">arrow_forward</span>
        {JOBS.backToBoard}
      </Link>

      <article className="glass-card overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary-container/10 font-display text-lg font-black text-primary">
                {companyInitials(job.company)}
              </div>
              <div>
                <p className="mb-1 text-xs font-bold text-outline">
                  {JOBS.detailTitle}
                </p>
                <h1 className="font-display text-2xl font-black text-on-surface md:text-3xl">
                  {job.title}
                </h1>
                <p className="mt-2 text-sm font-bold text-on-surface-variant">
                  {job.company} · {job.city}
                </p>
                <p className="mt-1 text-xs font-bold text-violet-700">
                  {getJobCategoryLabel(job.category)}
                </p>
              </div>
            </div>
            {diagnosis ? (
              <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-black text-emerald-800">
                {matchScore}% {JOBS.matchLabel}
              </span>
            ) : (
              <Link
                href="/onboarding?update=1"
                className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-bold text-outline hover:bg-slate-200"
              >
                השלם/י פרופיל לציון התאמה
              </Link>
            )}
          </div>

          {job.created_at && (
            <p className="text-xs font-bold text-outline">
              פורסם: {formatPostedAt(job.created_at)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6 p-6 md:p-8">
          <JobStructuredPanel
            details={job.structured_details}
            salary={job.salary}
          />

          {job.autism_match_reason && (
            <section className="rounded-2xl bg-primary/5 px-4 py-3">
              <p className="text-sm leading-relaxed text-primary">
                <span className="font-black">{JOBS.whyFits}: </span>
                {job.autism_match_reason}
              </p>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-on-surface">
              תיאור המשרה
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-on-surface-variant">
              {job.description}
            </p>
          </section>

          <section className="flex flex-wrap gap-2">
            <SupportLevelBadge level={job.support_level} className="text-xs" />
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              <span className="material-symbols-outlined text-sm">groups</span>
              {JOBS.socialLevel}: {job.social_interaction_level}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {job.scope}
            </span>
            {job.work_from_home && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="material-symbols-outlined text-sm">home_work</span>
                {JOBS.workFromHome}
              </span>
            )}
            {job.accessibility && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                <span className="material-symbols-outlined text-sm">accessible</span>
                {JOBS.accessibility}
              </span>
            )}
            {job.support_features.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                {feature}
              </span>
            ))}
          </section>

          {profession && (
            <Link
              href={`/dashboard/professions/${profession.id}`}
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              {JOBS.viewProfession}
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 p-6 md:flex-row md:items-center md:p-8">
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-colors hover:brightness-110"
          >
            {JOBS.applyExternal}
            <span className="material-symbols-outlined text-base">open_in_new</span>
          </a>
          <SaveJobButton
            jobId={job.id}
            initialSaved={savedJobIds.includes(job.id)}
          />
          <p className="text-center text-xs leading-relaxed text-on-surface-variant md:max-w-xs md:text-right">
            קישור ישיר למשרה בדרושים IL — לא לדף חיפוש כללי.
          </p>
        </div>
      </article>
    </div>
  );
}
