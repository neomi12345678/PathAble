import Link from "next/link";
import { NavbarSearch } from "@/components/layout/NavbarSearch";
import { ProfileNavAvatar } from "@/components/profile/ProfileNavAvatar";
import { APP_NAME } from "@/utils/texts";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="relative mx-auto flex h-16 max-w-container-max flex-row-reverse items-center justify-between rounded-full glass-nav px-4 shadow-lg shadow-primary/5 sm:px-6 md:px-8">
        <Link
          href="/dashboard"
          className="font-display text-xl font-black tracking-tight text-primary focus-visible:ring-2 focus-visible:ring-primary sm:text-2xl"
        >
          {APP_NAME}
        </Link>

        <div className="flex flex-row-reverse items-center gap-2 sm:gap-3">
          <NavbarSearch />
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
