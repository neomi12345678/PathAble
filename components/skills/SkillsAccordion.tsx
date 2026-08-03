"use client";

import { useState } from "react";
import Link from "next/link";
import type { SkillsModule } from "@/types";

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ICON_PAIRS = [
  { explain: "info", example: "lightbulb" },
  { explain: "forum", example: "group" },
  { explain: "psychology", example: "extension" },
  { explain: "rocket_launch", example: "task_alt" },
];

type SkillWithProgress = SkillsModule & {
  progress: number;
  practicalExample: string;
};

export function SkillsAccordion({ skills }: { skills: SkillWithProgress[] }) {
  const [openId, setOpenId] = useState<string | null>(skills[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {skills.map((skill, idx) => {
        const isOpen = openId === skill.id;
        const amber = idx % 2 === 1;
        const offset = CIRCUMFERENCE - (skill.progress / 100) * CIRCUMFERENCE;
        const icons = ICON_PAIRS[idx % ICON_PAIRS.length];
        const example = skill.practicalExample.trim();

        return (
          <div
            key={skill.id}
            className="glass-panel overflow-hidden rounded-3xl border border-outline-variant/30 transition-all duration-300 hover:shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : skill.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 p-4 text-right outline-none sm:gap-6 sm:p-6 md:p-8"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 64 64">
                    <circle
                      className="text-surface-container-highest"
                      cx="32"
                      cy="32"
                      fill="transparent"
                      r={RADIUS}
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <circle
                      className={
                        amber
                          ? "progress-ring-circle text-secondary-fixed-dim"
                          : "progress-ring-circle text-primary-container"
                      }
                      cx="32"
                      cy="32"
                      fill="transparent"
                      r={RADIUS}
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={offset}
                    />
                  </svg>
                  <span
                    className={`absolute text-sm font-bold ${
                      amber ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {skill.progress}%
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <h3 className="truncate font-display text-lg font-bold text-on-surface sm:text-xl">
                    {skill.title}
                  </h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {skill.difficulty} · {skill.description.split(".")[0]}
                  </p>
                </div>
              </div>
              <span
                className={`material-symbols-outlined transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                } ${amber ? "text-secondary-fixed-dim" : "text-primary-container"}`}
              >
                expand_more
              </span>
            </button>

            <div
              className="overflow-hidden transition-all duration-400 ease-in-out"
              style={{ maxHeight: isOpen ? "2000px" : "0px" }}
            >
              <div className="px-6 pb-8 md:px-8">
                <div className="grid grid-cols-1 gap-8 border-t border-outline-variant/20 pt-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-primary">
                      <span className="material-symbols-outlined text-xl">
                        {icons.explain}
                      </span>
                      הסבר מונגש
                    </h4>
                    <p className="leading-relaxed text-on-surface-variant">
                      {skill.description}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-5">
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-secondary">
                      <span className="material-symbols-outlined text-xl">
                        {icons.example}
                      </span>
                      דוגמה מעשית
                    </h4>
                    <p className="italic text-on-surface-variant">
                      {example || "אין דוגמה זמינה"}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-col justify-end gap-4 sm:flex-row md:col-span-2">
                    <Link
                      href="/dashboard/chat"
                      className="rounded-xl border-2 border-primary px-6 py-3 text-center font-bold text-primary transition-colors hover:bg-primary/5"
                    >
                      מידע נוסף
                    </Link>
                    <Link
                      href={`/dashboard/skills/${skill.id}`}
                      className="flex items-center justify-center gap-2 rounded-xl bg-secondary-container px-8 py-3 font-bold text-on-secondary-container shadow-lg transition-transform hover:scale-105"
                    >
                      לתרגיל המיומנות
                      <span className="material-symbols-outlined">play_circle</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
