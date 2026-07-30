import Link from "next/link";
import { ProfileNavAvatar } from "@/components/profile/ProfileNavAvatar";
import { APP_NAME } from "@/utils/texts";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex h-16 max-w-container-max flex-row-reverse items-center justify-between rounded-full glass-nav px-6 shadow-lg shadow-primary/5 md:px-8">
        <Link
          href="/dashboard"
          className="font-display text-2xl font-black tracking-tight text-primary focus-visible:ring-2 focus-visible:ring-primary"
        >
          {APP_NAME}
        </Link>

        <div className="flex flex-row-reverse items-center gap-3">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="חיפוש..."
              aria-label="חיפוש"
              className="w-56 rounded-full border border-white/50 bg-white/60 py-2 pr-10 pl-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            aria-label="התראות"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-white/60 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border border-white bg-error" />
          </button>
          <ProfileNavAvatar />
        </div>
      </div>
    </header>
  );
}
