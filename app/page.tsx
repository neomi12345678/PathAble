import Link from "next/link";
import Image from "next/image";
import { APP_NAME, FOOTER } from "@/utils/texts";
import { getProfessions } from "@/lib/data";
import { getProfessionImage } from "@/components/professions/ProfessionCard";

const FEATURES = [
  {
    icon: "psychology",
    tint: "bg-primary/10 text-primary",
    title: "ניתוח AI חכם",
    text: "מערכת ה-AI המתקדמת שלנו מזהה דפוסי הצלחה ייחודיים ומתאימה לך מסלולים אישיים שבהם החוזקות שלך יבואו לידי ביטוי מקסימלי.",
  },
  {
    icon: "diversity_3",
    tint: "bg-secondary-container/15 text-accent-dark",
    title: "ליווי אישי",
    text: "מנטורים מומחים המכירים לעומק את עולם העבודה ואת הצרכים הייחודיים שלך, ילוו אותך בכל שלב בדרך לקריירה משגשגת.",
  },
  {
    icon: "groups",
    tint: "bg-primary-container/10 text-primary-container",
    title: "קהילה צומחת",
    text: "הצטרף לאקו-סיסטם תומך של צעירים, מעסיקים מובילים ואנשי מקצוע, המשתפים ידע, הזדמנויות וסיפורי הצלחה מעוררי השראה.",
  },
];

export default async function HomePage() {
  const year = new Date().getFullYear();
  const professions = (await getProfessions()).slice(0, 3);

  return (
    <div className="overflow-x-hidden">
      <header className="fixed inset-x-0 top-0 z-50 px-6 py-4">
        <div className="mx-auto max-w-container-max">
          <div className="glass-nav premium-shadow flex items-center justify-between rounded-2xl border border-white/40 px-6 py-4 md:px-10">
          <div className="flex items-center gap-12">
            <span className="font-display text-3xl font-black tracking-tight text-primary">
              {APP_NAME}
            </span>
            <nav className="hidden items-center gap-10 lg:flex">
              <Link href="/" className="relative font-bold text-primary">
                בית
                <span className="absolute -bottom-1 right-0 h-0.5 w-full rounded-full bg-primary" />
              </Link>
              <Link
                href="/dashboard/professions"
                className="font-medium text-on-surface-variant transition-colors hover:text-primary"
              >
                מסלולי קריירה
              </Link>
              <Link
                href="/dashboard/rights"
                className="font-medium text-on-surface-variant transition-colors hover:text-primary"
              >
                זכויות עובדים
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="hidden px-6 py-2.5 font-bold text-on-surface-variant transition-colors hover:text-primary sm:block"
            >
              התחברות
            </Link>
            <Link
              href="/auth/register"
              className="btn-premium rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/20"
            >
              הרשמה
            </Link>
          </div>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="overflow-hidden px-6 pb-24 pt-48">
          <div className="relative z-10 mx-auto max-w-container-max text-center">
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              העתיד המקצועי שלך מתחיל כאן
            </div>
            <h1 className="mb-8 font-display text-5xl font-black leading-[1.1] tracking-tight lg:text-8xl">
              <span className="hero-gradient-text">מצא את הדרך</span>
              <br />
              <span className="font-light italic text-on-surface/90">
                המדויקת עבורך
              </span>
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed text-on-surface-variant md:text-xl">
              ליווי מקצועי ואישי למציאת קריירה משמעותית המותאמת במיוחד לאנשים עם
              מוגבלויות. אנחנו כאן כדי לגשר על הפער ולהעניק לך את הכלים להצלחה.
            </p>
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link
                href="/auth/register"
                className="btn-premium w-full rounded-2xl bg-secondary-container px-12 py-5 text-lg font-black text-on-surface shadow-xl shadow-secondary-container/20 transition-transform hover:scale-105 sm:w-auto"
              >
                התחל עכשיו בחינם
              </Link>
              <Link
                href="/dashboard/professions"
                className="glass-card w-full rounded-2xl border border-outline px-12 py-5 text-lg font-bold text-primary transition-all hover:border-primary/30 hover:bg-white sm:w-auto"
              >
                למד עוד
              </Link>
            </div>
          </div>
          <div className="absolute right-[-10%] top-20 -z-10 h-[500px] w-[500px] rounded-full bg-primary-container/10 blur-[120px]" />
          <div className="absolute bottom-0 left-[-5%] -z-10 h-[400px] w-[400px] rounded-full bg-secondary-container/10 blur-[100px]" />
        </section>

        <section className="bg-slate-50/50 px-6 py-24">
          <div className="mx-auto max-w-container-max">
            <div className="mb-20 text-center">
              <h2 className="mb-6 font-display text-3xl font-black lg:text-5xl">
                למה לבחור ב-<span className="text-primary">{APP_NAME}?</span>
              </h2>
              <div className="mx-auto h-1.5 w-20 rounded-full bg-secondary-container" />
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="glass-card card-hover rounded-3xl border-white/60 p-10"
                >
                  <div
                    className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${f.tint}`}
                  >
                    <span className="material-symbols-outlined text-4xl">
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="mb-4 font-display text-2xl font-bold">
                    {f.title}
                  </h3>
                  <p className="font-light leading-relaxed text-on-surface-variant opacity-80">
                    {f.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-container-max">
            <div className="mb-12 max-w-xl">
              <h2 className="mb-4 font-display text-3xl font-black lg:text-4xl">
                מסלולים מומלצים
              </h2>
              <p className="text-lg font-light text-on-surface-variant">
                גילינו עבורך את המקצועות שבהם תוכל להצטיין ולהוביל.
              </p>
            </div>
            <div className="scroll-hide -mx-6 flex snap-x gap-8 overflow-x-auto px-6 pb-12 md:mx-0 md:px-0">
              {professions.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/professions/${p.id}`}
                  className="card-hover premium-shadow group min-w-[min(340px,85vw)] snap-start overflow-hidden rounded-3xl border border-outline bg-white sm:min-w-[340px] md:min-w-[400px]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={getProfessionImage(p.id)}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 340px, 400px"
                    />
                    <span className="absolute left-6 top-6 rounded-full bg-secondary-container/95 px-4 py-1.5 text-xs font-black shadow-lg backdrop-blur-md">
                      {p.work_environment}
                    </span>
                  </div>
                  <div className="p-8 text-right">
                    <h4 className="mb-3 font-display text-2xl font-bold transition-colors group-hover:text-primary">
                      {p.name}
                    </h4>
                    <p className="mb-8 line-clamp-2 font-light leading-relaxed text-on-surface-variant">
                      {p.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                      <span className="text-sm font-bold text-primary">
                        {p.skills.slice(0, 2).join(" · ") || p.education}
                      </span>
                      <span className="material-symbols-outlined text-primary transition-transform group-hover:-translate-x-1">
                        arrow_back
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-container-max">
            <div className="relative overflow-hidden rounded-[3rem] bg-primary p-12 text-white shadow-2xl md:p-24">
              <div className="absolute right-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-white/10 blur-[100px]" />
              <div className="absolute bottom-[-20%] left-[-10%] h-[400px] w-[400px] rounded-full bg-primary-container/20 blur-[80px]" />
              <div className="relative z-10 grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <h2 className="mb-8 font-display text-4xl font-black leading-tight lg:text-6xl">
                    מוכן להתחיל את
                    <br />
                    <span className="text-secondary-container">המסע שלך?</span>
                  </h2>
                  <p className="text-xl font-light leading-relaxed opacity-80">
                    התחילו בחינם — גישה למסלולי קריירה, כלי למידה וליווי אישי
                    מותאם לכם.
                  </p>
                </div>
                <div className="w-full">
                  <div className="flex items-center rounded-2xl border border-white/20 bg-white/10 p-2 shadow-xl backdrop-blur-xl focus-within:ring-2 focus-within:ring-white/30">
                    <input
                      className="w-full border-none bg-transparent px-6 py-4 text-lg text-white placeholder-white/50 outline-none"
                      placeholder="האימייל שלך..."
                      type="email"
                      aria-label="כתובת אימייל"
                    />
                    <Link
                      href="/auth/register"
                      className="whitespace-nowrap rounded-xl bg-white px-10 py-4 font-bold text-primary transition-all hover:bg-secondary-container hover:text-on-surface"
                    >
                      הרשמה
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 px-6 py-24 text-slate-400">
        <div className="mx-auto max-w-container-max">
          <div className="mb-20 grid grid-cols-1 gap-16 md:grid-cols-4">
            <div className="flex flex-col gap-6">
              <span className="font-display text-3xl font-black text-white">
                {APP_NAME}
              </span>
              <p className="font-light leading-relaxed opacity-70">
                {FOOTER.tagline}
              </p>
            </div>
            <div>
              <h4 className="mb-8 text-lg font-bold text-white">ניווט</h4>
              <ul className="flex flex-col gap-4 font-light">
                <li>
                  <Link href="/" className="transition-colors hover:text-primary">
                    בית
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/professions"
                    className="transition-colors hover:text-primary"
                  >
                    מסלולי קריירה
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/rights"
                    className="transition-colors hover:text-primary"
                  >
                    זכויות עובדים
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-8 text-lg font-bold text-white">עזרה</h4>
              <ul className="flex flex-col gap-4 font-light">
                <li>
                  <Link href="/dashboard/rights" className="transition-colors hover:text-primary">
                    שאלות נפוצות
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/chat" className="transition-colors hover:text-primary">
                    תמיכה טכנית
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="transition-colors hover:text-primary">
                    הצהרת נגישות
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-8 text-lg font-bold text-white">צרו קשר</h4>
              <ul className="mb-8 flex flex-col gap-4 font-light">
                <li>
                  <a
                    href={`mailto:${FOOTER.contactEmail}`}
                    className="transition-colors hover:text-primary"
                  >
                    {FOOTER.contactEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-8 border-t border-white/5 pt-12 text-sm font-light opacity-50 md:flex-row">
            <span>
              © {year} {APP_NAME} - {FOOTER.rights}
            </span>
            <div className="flex gap-8">
              <Link href="/privacy" className="transition-colors hover:text-white">
                פרטיות
              </Link>
              <Link href="/terms" className="transition-colors hover:text-white">
                תקנון
              </Link>
              <Link href="/accessibility" className="transition-colors hover:text-white">
                נגישות
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
