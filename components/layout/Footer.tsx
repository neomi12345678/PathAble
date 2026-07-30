import Link from "next/link";
import { APP_NAME, FOOTER } from "@/utils/texts";

const NAV_LINKS = [
  { label: "בית", href: "/dashboard" },
  { label: "מסלולי קריירה", href: "/dashboard/professions" },
  { label: "זכויות עובדים", href: "/dashboard/rights" },
  { label: "מרכז למידה", href: "/dashboard/learning" },
];

const HELP_LINKS = [
  { label: "שאלות נפוצות", href: "/dashboard/rights" },
  { label: "תמיכה טכנית", href: "/dashboard/chat" },
  { label: "הצהרת נגישות", href: "/accessibility" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-haredi-primary px-6 pb-10 pt-16 text-white md:px-8">
      <div className="mx-auto max-w-container-max">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="flex flex-col gap-4 text-right md:col-span-2">
            <span className="font-display text-3xl font-black tracking-tight text-white">
              {APP_NAME}
            </span>
            <p className="max-w-md leading-relaxed text-white/70">
              {FOOTER.tagline}
            </p>
            <div className="flex flex-row-reverse gap-3">
              {["alternate_email", "call", "share"].map((icon) => (
                <span
                  key={icon}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"
                >
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            <h4 className="mb-6 text-lg font-bold">ניווט</h4>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-right">
            <h4 className="mb-6 text-lg font-bold">עזרה</h4>
            <ul className="flex flex-col gap-3">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row-reverse">
          <div className="flex flex-row-reverse gap-6">
            <Link href="/terms" className="transition-colors hover:text-white">
              תנאי שימוש
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              מדיניות פרטיות
            </Link>
            <Link href="/accessibility" className="transition-colors hover:text-white">
              נגישות
            </Link>
          </div>
          <span>
            © {year} {APP_NAME} - {FOOTER.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
