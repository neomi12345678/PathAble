import Link from "next/link";
import type { Profession } from "@/types";
import { PROFESSION_IMAGES } from "@/lib/assets/images";

interface ProfessionCardProps {
  profession: Profession;
  isSaved?: boolean;
  index?: number;
  match?: number;
  diagnosisLabel?: string;
}

function hashId(id: string): number {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return sum;
}

/** @deprecated השתמשו ב-getProfessionMatchScore עם אבחנה */
export function getProfessionImage(id: string): string {
  return PROFESSION_IMAGES[hashId(id) % PROFESSION_IMAGES.length];
}

export function ProfessionCard({
  profession,
  isSaved = false,
  match,
  diagnosisLabel,
}: ProfessionCardProps) {
  const image = getProfessionImage(profession.id);

  return (
    <div className="profession-card group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="relative h-44 w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {match !== undefined && (
          <div className="absolute right-3 top-3 max-w-[85%] truncate rounded-full bg-secondary-container px-2.5 py-1 text-[10px] font-black text-on-secondary-fixed shadow-md">
            {match}% התאמה
            {diagnosisLabel ? ` · ${diagnosisLabel}` : ""}
          </div>
        )}
        {isSaved && (
          <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-secondary shadow-md">
            <span className="material-symbols-outlined icon-fill text-base">
              star
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col p-5 text-right">
        <h3 className="mb-2 font-display text-lg font-bold text-on-surface transition-colors group-hover:text-primary-container">
          {profession.name}
        </h3>
        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
          {profession.description}
        </p>
        <div className="mt-auto">
          <Link
            href={`/dashboard/professions/${profession.id}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-xs font-black text-on-surface transition-all group-hover:bg-primary-container group-hover:text-white focus-visible:ring-2 focus-visible:ring-secondary"
          >
            לצפייה במסלול
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
