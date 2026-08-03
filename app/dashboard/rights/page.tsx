import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, RIGHTS } from "@/utils/texts";
import { getRightsData } from "@/lib/data";
import { IMAGES } from "@/lib/assets/images";
import { RightsCalculator } from "@/components/rights/RightsCalculator";

export const metadata: Metadata = {
  title: `${RIGHTS.title} | ${APP_NAME}`,
  description: RIGHTS.subtitle,
};

const QUICK = [
  { icon: "payments", title: "שכר ובונוסים", text: "מינימום, שעות נוספות והבראה", wrap: "bg-primary-container/20 text-primary", href: "#calculator" },
  { icon: "event_busy", title: "חופשות ומחלה", text: "צבירת ימים, פדיון והודעה מוקדמת", wrap: "bg-secondary-container/20 text-secondary", href: "#topics" },
  { icon: "work_history", title: "סיום העסקה", text: "פיצויים, שימוע ומכתב המלצה", wrap: "bg-tertiary-container/20 text-tertiary", href: "#faq" },
];

export default async function RightsPage() {
  const { topics, faqs, organizations } = await getRightsData();

  return (
    <div className="flex flex-col gap-12 text-right">
      <header className="text-center">
        <div className="mb-6 inline-flex flex-row-reverse items-center gap-2 rounded-full border border-secondary-fixed-dim/30 bg-secondary-fixed px-4 py-1.5 text-on-secondary-fixed">
          <span className="material-symbols-outlined icon-fill text-[18px]">
            verified_user
          </span>
          <span className="text-sm font-bold">מידע כללי מונגש בשפה פשוטה</span>
        </div>
        <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-on-surface md:text-5xl">
          זכויות העובדים שלך,
          <br />
          <span className="text-primary">מונגשות בשפה שלך.</span>
        </h1>
        <p className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
          {RIGHTS.subtitle}. הכנו עבורך מרכז מידע מקיף, ברור ומותאם אישית שיעזור
          לך לממש את כל הזכויות המגיעות לך.
        </p>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {QUICK.map((q) => (
            <a
              key={q.title}
              href={q.href}
              className="glass-card group flex flex-col items-center rounded-2xl p-8 text-center transition-all duration-300 hover:scale-[1.03]"
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${q.wrap}`}
              >
                <span className="material-symbols-outlined text-3xl">{q.icon}</span>
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">{q.title}</h3>
              <p className="text-on-surface-variant">{q.text}</p>
            </a>
          ))}
        </div>
      </header>

      <section id="topics">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="border-r-4 border-primary pr-4 font-display text-3xl font-bold">
            {RIGHTS.topics}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {topics.map((topic, idx) =>
            idx === 0 ? (
              <div
                key={topic.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:shadow-2xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-700 hover:scale-110"
                    style={{ backgroundImage: `url('${IMAGES.rightsGuide}')` }}
                  />
                  <span className="absolute right-4 top-4 rounded-full bg-primary px-4 py-1 text-xs font-bold text-on-primary shadow-lg">
                    חדש
                  </span>
                </div>
                <div className="flex flex-grow flex-col p-8">
                  <h3 className="mb-3 font-display text-xl font-semibold">
                    {topic.title}
                  </h3>
                  <p className="leading-relaxed text-on-surface-variant">
                    {topic.content}
                  </p>
                </div>
              </div>
            ) : (
              <div
                key={topic.id}
                className="flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container/20 text-primary">
                  <span className="material-symbols-outlined text-3xl">gavel</span>
                </div>
                <h3 className="mb-3 font-display text-xl font-semibold">
                  {topic.title}
                </h3>
                <p className="leading-relaxed text-on-surface-variant">
                  {topic.content}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <RightsCalculator />

      <section className="relative overflow-hidden rounded-3xl border-r-[12px] border-error bg-error-container/40 p-8">
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-error text-white shadow-lg">
            <span className="material-symbols-outlined text-3xl">gavel</span>
          </div>
          <div className="flex-1 text-right">
            <h4 className="mb-1 font-display text-xl font-bold text-on-error-container">
              חשוב לדעת: המידע אינו מהווה ייעוץ משפטי
            </h4>
            <p className="leading-relaxed text-on-error-container/80">
              התוכן באתר נועד להנגיש מידע כללי בלבד. במקרה של מחלוקת או שאלה
              ספציפית, מומלץ לפנות לעורך דין לדיני עבודה או לגוף מסייע מוסמך.
            </p>
          </div>
          <Link
            href="/dashboard/chat"
            className="shrink-0 rounded-xl bg-white px-6 py-3 font-bold text-error shadow-sm transition-all hover:bg-error hover:text-white"
          >
            קבל הכוונה
          </Link>
        </div>
      </section>

      <section id="faq" className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 transition-colors hover:border-primary/30">
          <h4 className="mb-6 flex items-center gap-3 font-display text-primary">
            <span className="material-symbols-outlined">help</span>
            {RIGHTS.faq}
          </h4>
          <ul className="space-y-4">
            {faqs.map((faq) => (
              <li key={faq.id}>
                <p className="font-bold text-on-surface">{faq.question}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {faq.answer}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 transition-colors hover:border-primary/30">
          <h4 className="mb-6 flex items-center gap-3 font-display text-primary">
            <span className="material-symbols-outlined">balance</span>
            {RIGHTS.organizations}
          </h4>
          <ul className="space-y-4">
            {organizations.map((org) => (
              <li key={org.id}>
                <Link
                  href={org.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between font-bold text-on-surface-variant transition-colors hover:text-primary"
                >
                  <span>{org.name}</span>
                  <span className="material-symbols-outlined text-[18px]">
                    open_in_new
                  </span>
                </Link>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {org.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Link
        href="/dashboard/chat"
        aria-label="שאל את היועץ על זכויות"
        className="group fixed bottom-20 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-all hover:scale-110 active:scale-95 lg:bottom-10 lg:left-10 lg:h-16 lg:w-16"
      >
        <span className="material-symbols-outlined text-3xl">question_answer</span>
        <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg bg-white px-4 py-2 font-bold text-primary opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
          יש לך שאלה על זכויות?
        </span>
      </Link>
    </div>
  );
}
