import Link from "next/link";
import Image from "next/image";
import type { LearningModule } from "@/types";
import { LEARNING } from "@/utils/texts";
import { courseImageForCategory } from "@/lib/assets/images";

interface LearningModuleCardProps {
  module: LearningModule;
  progress: number;
  completed: boolean;
  index?: number;
}

function getProgressBarClass(progress: number): string {
  if (progress >= 100) return "w-full";
  if (progress >= 75) return "w-3/4";
  if (progress >= 50) return "w-1/2";
  if (progress >= 25) return "w-1/4";
  return "w-1/12";
}

export function LearningModuleCard({
  module,
  progress,
  completed,
  index = 0,
}: LearningModuleCardProps) {
  const ctaLabel =
    progress > 0 && !completed ? LEARNING.continueModule : LEARNING.startModule;
  const image = courseImageForCategory(module.category, index);

  return (
    <div className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-card">
      <div className="relative h-40 overflow-hidden">
        <Image
          src={image}
          alt={module.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute right-3 top-3 rounded-md border border-outline-variant/30 bg-white/95 px-2 py-1 text-[10px] font-bold uppercase text-primary shadow-sm backdrop-blur-sm">
          {module.category}
        </div>
        {completed && (
          <div className="absolute left-3 top-3 rounded-md bg-secondary px-2 py-1 text-[10px] font-bold text-on-secondary shadow-sm">
            {LEARNING.completed}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 text-right">
        <h3 className="mb-2 font-display text-base font-bold text-on-background transition-colors group-hover:text-primary">
          {module.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
          {module.content}
        </p>

        <div className="mt-auto space-y-3">
          <p className="text-xs font-black text-on-surface">{progress}% הושלם</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              className={`h-full rounded-full bg-primary transition-all duration-1000 ${getProgressBarClass(progress)}`}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <Link
            href={`/dashboard/learning/${module.id}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-bold text-on-primary transition-all hover:shadow-md hover:shadow-primary/30 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>{ctaLabel}</span>
            <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">
              chevron_left
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
