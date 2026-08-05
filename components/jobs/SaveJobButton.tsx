"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SaveJobButtonProps {
  jobId: string;
  initialSaved?: boolean;
  compact?: boolean;
}

export function SaveJobButton({
  jobId,
  initialSaved = false,
  compact = false,
}: SaveJobButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const toggle = async (): Promise<void> => {
    if (pending) return;
    const next = !saved;
    setSaved(next);
    setPending(true);
    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, saved: next }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "שגיאה");
      toast.success(next ? "נשמר לעיון מאוחר" : "הוסר מהשמורים");
    } catch {
      setSaved(!next);
      toast.error("לא ניתן לשמור כרגע");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "הסר מעיון מאוחר" : "שמור לעיון מאוחר"}
      className={
        compact
          ? `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 ${
              saved
                ? "bg-amber-100 text-amber-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`
          : `inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50 ${
              saved
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-slate-200 bg-white text-on-surface hover:bg-slate-50"
            }`
      }
    >
      <span className="material-symbols-outlined text-base">
        {saved ? "bookmark" : "bookmark_add"}
      </span>
      {compact ? (saved ? "נשמר" : "שמור") : saved ? "שמור לעיון" : "שמור לעיון מאוחר"}
    </button>
  );
}
