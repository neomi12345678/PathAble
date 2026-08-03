"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface SaveProfessionButtonProps {
  professionId: string;
  initialSaved: boolean;
}

export function SaveProfessionButton({
  professionId,
  initialSaved,
}: SaveProfessionButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  const toggle = async (): Promise<void> => {
    const next = !saved;
    setSaved(next);
    setPending(true);
    try {
      const res = await fetch("/api/professions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionId, saved: next }),
      });
      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        setSaved(!next);
        toast.error(payload.error ?? "שגיאה בשמירת המקצוע");
        return;
      }
      toast.success(next ? "המקצוע נשמר למסלול שלך" : "המקצוע הוסר מהשמורים");
      router.refresh();
    } catch {
      setSaved(!next);
      toast.error("שגיאה בשמירת המקצוע");
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
      className={`flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-bold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-60 ${
        saved
          ? "bg-secondary-container text-on-secondary-container"
          : "glass-card border border-secondary text-secondary hover:bg-secondary-fixed"
      }`}
    >
      <span className={`material-symbols-outlined ${saved ? "icon-fill" : ""}`}>
        star
      </span>
      {saved ? "נשמר במסלול שלך" : "שמור מקצוע"}
    </button>
  );
}
