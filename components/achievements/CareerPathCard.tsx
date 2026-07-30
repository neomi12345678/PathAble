import Link from "next/link";
import type { CareerPath } from "@/types";
import { ACHIEVEMENTS } from "@/utils/texts";

interface CareerPathCardProps {
  path: CareerPath;
}

export function CareerPathCard({ path }: CareerPathCardProps) {
  return (
    <div className="glass depth-shadow rounded-[32px] p-6">
      <h3 className="mb-5 font-display text-lg font-bold">{path.title}</h3>
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-primary-container/10 px-2 py-1 text-xs font-bold uppercase text-primary">
          {ACHIEVEMENTS.stepOf(path.step, path.totalSteps)}
        </span>
        <span className="text-xs font-bold text-primary">{path.percent}%</span>
      </div>
      <div className="mb-6 flex h-3 overflow-hidden rounded-full bg-surface-container text-xs">
        <div
          className="career-progress-fill flex flex-col justify-center bg-primary text-center text-white"
          style={{ width: `${path.percent}%` }}
        />
      </div>
      <ul className="space-y-4">
        {path.steps.map((step, idx) => {
          const isActive = step.status === "active";
          const isDone = step.status === "done";
          const isPending = step.status === "pending";
          const showLine = idx < path.steps.length - 1;

          return (
            <li key={step.label} className={`flex items-center gap-3 ${isPending ? "opacity-50" : ""}`}>
              {isActive ? (
                <div className={`flex h-10 flex-col items-center ${showLine ? "" : "h-6"}`}>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-white">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  {showLine && <div className="h-full w-0.5 bg-outline-variant/30" />}
                </div>
              ) : (
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    isDone ? "bg-primary" : "border-2 border-outline"
                  }`}
                >
                  {isDone && (
                    <span className="material-symbols-outlined text-[16px] text-white">check</span>
                  )}
                </div>
              )}
              <span
                className={`text-sm ${isActive ? "font-bold text-primary" : "font-medium text-on-surface"}`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>
      <Link
        href="/dashboard/learning"
        className="mt-6 block w-full rounded-xl bg-primary py-3 text-center text-sm font-bold text-white shadow-lg transition-all hover:shadow-primary/30"
      >
        {ACHIEVEMENTS.continueLearning}
      </Link>
    </div>
  );
}
