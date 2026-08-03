import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { APP_NAME, PROFESSIONS } from "@/utils/texts";
import {
  getProfessionById,
  getProfilePrefs,
  getSavedProfessionIds,
} from "@/lib/data";
import { getProfessionMatchScore } from "@/lib/disability-matching";
import { getDiagnosisLabel } from "@/lib/user-profile";
import { professionIdSchema } from "@/utils/validation";
import { IMAGES } from "@/lib/assets/images";
import { SaveProfessionButton } from "@/components/professions/SaveProfessionButton";

interface ProfessionDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: ProfessionDetailPageProps): Promise<Metadata> {
  const idResult = professionIdSchema.safeParse(params.id);
  if (!idResult.success) {
    return { title: `מקצוע לא נמצא | ${APP_NAME}` };
  }

  const profession = await getProfessionById(idResult.data);
  return {
    title: profession ? `${profession.name} | ${APP_NAME}` : "מקצוע לא נמצא",
  };
}

const PATHS = [
  {
    title: "מרכז הלמידה שלנו",
    text: "מודולים קצרים ומותאמים אישית: הכנה לראיונות, התנהלות בעבודה, עבודה בצוות ועוד — בחינם ובקצב שלך.",
    price: "חינם",
    border: "border-r-primary",
    hover: "group-hover:text-primary",
    recommended: true,
    items: [
      { icon: "schedule", label: "בקצב אישי" },
      { icon: "verified", label: "מותאם לאבחנה שלך" },
    ],
    cta: "למרכז הלמידה",
    href: "/dashboard/learning",
    external: false,
    ctaHover: "hover:bg-primary hover:text-on-primary",
    priceColor: "bg-primary-container/10 text-primary",
  },
  {
    title: "מסלול אקדמי / תעודה",
    text: "לימודים מוסדרים במוסד מוכר. בסיס תיאורטי חזק ותעודה מוכרת בשוק העבודה.",
    price: "₪₪₪₪",
    border: "border-r-secondary",
    hover: "group-hover:text-secondary",
    items: [
      { icon: "calendar_today", label: "1-3 שנים" },
      { icon: "school", label: "תעודה מוכרת" },
    ],
    cta: "מוסדות לימוד מוכרים (מל\"ג)",
    href: "https://che.org.il/",
    external: true,
    ctaHover: "hover:bg-secondary hover:text-on-secondary",
    priceColor: "bg-secondary-container/10 text-secondary",
  },
  {
    title: "למידה עצמית (Online)",
    text: "למידה בקצב אישי דרך קורסים מקוונים ב-Coursera, Udemy או קמפוס IL.",
    price: "₪",
    border: "border-r-tertiary-container",
    hover: "group-hover:text-tertiary",
    items: [
      { icon: "pace", label: "גמיש לחלוטין" },
      { icon: "devices", label: "לימוד מהבית" },
    ],
    cta: "קמפוס IL — קורסים בחינם",
    href: "https://campus.gov.il/",
    external: true,
    ctaHover: "hover:bg-tertiary hover:text-on-tertiary",
    priceColor: "bg-tertiary-container/10 text-tertiary",
  },
];

export default async function ProfessionDetailPage({
  params,
}: ProfessionDetailPageProps) {
  const idResult = professionIdSchema.safeParse(params.id);

  if (!idResult.success) {
    notFound();
  }

  const [profession, savedIds, prefs] = await Promise.all([
    getProfessionById(idResult.data),
    getSavedProfessionIds(),
    getProfilePrefs(),
  ]);

  if (!profession) {
    notFound();
  }

  const diagnosis = prefs?.disability_type?.trim() ?? "";
  const matchScore = getProfessionMatchScore(
    profession,
    diagnosis,
    prefs?.autism_level
  );
  const diagnosisLabel = prefs?.disability_type?.trim()
    ? getDiagnosisLabel(prefs)
    : "לא צוינה אבחנה";

  return (
    <div className="flex flex-col gap-12 text-right">
      <Link
        href="/dashboard/professions"
        className="flex w-fit flex-row-reverse items-center gap-1 text-sm font-bold text-primary hover:underline"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_forward
        </span>
        {PROFESSIONS.backToList}
      </Link>

      <section className="hero-mesh relative flex min-h-[400px] items-center overflow-hidden rounded-[3rem] border border-white/50 px-8 py-12 shadow-2xl md:px-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="text-right">
            <div className="glass-card mb-6 inline-flex flex-row-reverse items-center gap-2 rounded-full bg-primary-container/20 px-4 py-1 text-on-primary-container">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span className="text-sm uppercase tracking-wider">
                מקצוע העתיד
              </span>
            </div>
            <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-on-primary-fixed lg:text-5xl">
              {profession.name}
            </h1>
            <p className="mb-8 ml-auto max-w-xl text-lg leading-relaxed text-on-surface-variant">
              {profession.description}
            </p>
            <div className="flex flex-row-reverse flex-wrap gap-4">
              <Link
                href="/dashboard/learning"
                className="amber-glow rounded-xl bg-secondary px-8 py-4 text-lg font-bold text-on-secondary shadow-lg transition-transform hover:scale-105"
              >
                התחל מסלול הכשרה
              </Link>
              <SaveProfessionButton
                professionId={profession.id}
                initialSaved={savedIds.includes(profession.id)}
              />
              <Link
                href="/dashboard/chat"
                className="glass-card rounded-xl border border-primary px-8 py-4 text-lg font-bold text-primary transition-all hover:bg-primary-fixed"
              >
                שאל את היועץ
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="glass-card-premium animate-subtle-float relative z-20 rounded-[2.5rem] p-4">
              <div
                className="h-80 w-full rounded-[2rem] bg-cover bg-center shadow-inner"
                style={{ backgroundImage: `url('${IMAGES.professionHero}')` }}
              />
            </div>
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-secondary-container/40 blur-3xl" />
            <div className="absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-primary-container/30 blur-3xl" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-card flex flex-col items-center rounded-3xl p-8 text-center shadow-card">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container/20 text-primary">
            <span className="material-symbols-outlined text-4xl">payments</span>
          </div>
          <h3 className="mb-2 font-display text-2xl font-bold">שכר ממוצע</h3>
          <div className="mb-1 text-2xl font-bold tracking-tight text-primary">
            {profession.salary_range}
          </div>
          <p className="text-on-surface-variant">למתחילים בשוק הישראלי</p>
        </div>
        <div className="glass-card flex flex-col items-center rounded-3xl p-8 text-center shadow-card">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-container/20 text-secondary">
            <span className="material-symbols-outlined text-4xl">school</span>
          </div>
          <h3 className="mb-2 font-display text-2xl font-bold">השכלה נדרשת</h3>
          <div className="mb-1 text-xl font-bold tracking-tight text-secondary">
            {profession.education}
          </div>
          <p className="text-on-surface-variant">
            אינטראקציה חברתית: {profession.social_interaction_level}
          </p>
        </div>
        <div className="flex flex-col items-center rounded-3xl border border-primary/20 bg-primary-fixed p-8 text-center shadow-card">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <span className="material-symbols-outlined icon-fill text-4xl text-primary">
              star
            </span>
          </div>
          <h3 className="mb-2 font-display text-2xl font-bold text-on-primary-fixed">
            התאמה אישית
          </h3>
          <div className="mb-1 text-2xl font-bold tracking-tight text-on-primary-fixed">
            {matchScore}%
          </div>
          <p className="text-on-primary-fixed-variant">
            מחושב לפי: {diagnosisLabel}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-4">
          <div className="glass-card rounded-3xl p-8">
            <h4 className="mb-6 border-b border-primary/10 pb-4 font-display text-xl font-bold text-primary">
              כלים ומיומנויות מרכזיים
            </h4>
            <div className="flex flex-wrap gap-3">
              {profession.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-outline-variant bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface-variant shadow-sm transition-colors hover:border-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-3xl p-8">
            <h4 className="mb-6 border-b border-secondary/10 pb-4 font-display text-xl font-bold text-secondary">
              סביבת עבודה
            </h4>
            <ul className="space-y-5">
              {[
                profession.work_environment,
                ...profession.disability_fit,
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex flex-row-reverse items-center gap-4"
                >
                  <span className="material-symbols-outlined rounded-full bg-secondary/10 p-1 text-xl text-secondary">
                    check
                  </span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="h-64 rounded-3xl bg-cover bg-center shadow-xl"
            style={{ backgroundImage: `url('${IMAGES.professionWorkstation}')` }}
          />
        </aside>

        <div className="flex flex-col gap-6 lg:col-span-8">
          <h2 className="mb-2 flex flex-row-reverse items-center gap-3 font-display text-3xl font-black text-on-primary-fixed-variant">
            <span className="material-symbols-outlined text-3xl text-primary">
              school
            </span>
            מסלולי הכשרה מומלצים
          </h2>
          {PATHS.map((p) => (
            <div
              key={p.title}
              className={`glass-card-premium group relative overflow-hidden rounded-[2rem] border-r-[12px] p-8 ${p.border}`}
            >
              {p.recommended && (
                <div className="absolute left-0 top-0 rounded-br-3xl bg-primary px-6 py-2 text-xs font-black uppercase tracking-widest text-white">
                  מומלץ
                </div>
              )}
              <div className="mb-6 mt-2 flex flex-row-reverse items-start justify-between">
                <div className="text-right">
                  <h3
                    className={`mb-2 font-display text-2xl font-bold transition-colors ${p.hover}`}
                  >
                    {p.title}
                  </h3>
                  <p className="leading-relaxed text-on-surface-variant">
                    {p.text}
                  </p>
                </div>
                <div
                  className={`rounded-xl px-4 py-2 text-lg font-bold ${p.priceColor}`}
                >
                  {p.price}
                </div>
              </div>
              <div className="mb-8 grid grid-cols-2 gap-6">
                {p.items.map((it) => (
                  <div
                    key={it.label}
                    className="flex flex-row-reverse items-center gap-3 text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined font-bold text-primary">
                      {it.icon}
                    </span>
                    <span className="text-base font-semibold">{it.label}</span>
                  </div>
                ))}
              </div>
              {p.external ? (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high py-4 text-lg font-bold shadow-sm transition-all ${p.ctaHover}`}
                >
                  {p.cta}
                  <span className="material-symbols-outlined text-base">
                    open_in_new
                  </span>
                </a>
              ) : (
                <Link
                  href={p.href}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high py-4 text-lg font-bold shadow-sm transition-all ${p.ctaHover}`}
                >
                  {p.cta}
                  <span className="material-symbols-outlined text-base">
                    arrow_back
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/dashboard/chat"
        aria-label="יועץ AI"
        className="group fixed bottom-10 left-10 z-40 flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
      >
        <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-12">
          smart_toy
        </span>
        <span className="absolute -right-1 -top-1 h-5 w-5 animate-bounce rounded-full border-4 border-white bg-error" />
      </Link>
    </div>
  );
}
