"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  CUSTOM_AVATAR_ID,
  PROFILE_AVATAR_PRESETS,
  type ProfileAvatarId,
  type ProfileAvatarPresetId,
} from "@/lib/profile-avatar";
import {
  clearCustomAvatarDataUrl,
  notifyAvatarUpdated,
  readAvatarFile,
  setCustomAvatarDataUrl,
} from "@/lib/profile-avatar.client";
import { PROFILE } from "@/utils/texts";

interface AvatarPickerProps {
  open: boolean;
  currentId: ProfileAvatarId | undefined;
  onClose: () => void;
  onSaved: (id: ProfileAvatarId, previewUrl: string) => void;
}

async function saveAvatarChoice(id: ProfileAvatarId): Promise<boolean> {
  const res = await fetch("/api/profile/avatar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatar: id }),
  });
  if (!res.ok) {
    const json = (await res.json()) as { error?: string };
    toast.error(json.error ?? PROFILE.avatarSaveError);
    return false;
  }
  return true;
}

export function AvatarPicker({
  open,
  currentId,
  onClose,
  onSaved,
}: AvatarPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handlePreset = async (id: ProfileAvatarPresetId): Promise<void> => {
    setSaving(true);
    clearCustomAvatarDataUrl();
    const ok = await saveAvatarChoice(id);
    setSaving(false);
    if (!ok) return;
    notifyAvatarUpdated();
    onSaved(id, PROFILE_AVATAR_PRESETS[id].url);
    toast.success(PROFILE.avatarSaved);
    onClose();
  };

  const handleFile = async (file: File): Promise<void> => {
    setSaving(true);
    try {
      const dataUrl = await readAvatarFile(file);
      setCustomAvatarDataUrl(dataUrl);
      const ok = await saveAvatarChoice(CUSTOM_AVATAR_ID);
      if (!ok) {
        clearCustomAvatarDataUrl();
        return;
      }
      notifyAvatarUpdated();
      onSaved(CUSTOM_AVATAR_ID, dataUrl);
      toast.success(PROFILE.avatarSaved);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : PROFILE.avatarSaveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-picker-title"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className="glass-card glow-shadow w-full max-w-md rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="avatar-picker-title" className="font-display text-lg font-bold">
            {PROFILE.changeAvatar}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container"
            aria-label="סגירה"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="mb-4 text-sm text-on-surface-variant">{PROFILE.avatarPickerHint}</p>

        <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {(Object.keys(PROFILE_AVATAR_PRESETS) as ProfileAvatarPresetId[]).map(
            (id) => {
              const preset = PROFILE_AVATAR_PRESETS[id];
              const selected = currentId === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={saving}
                  onClick={() => void handlePreset(id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-2 transition-all hover:bg-surface-container-low disabled:opacity-50 ${
                    selected ? "ring-2 ring-primary-container" : ""
                  }`}
                >
                  <div
                    className="h-14 w-14 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${preset.url}')` }}
                  />
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    {preset.label}
                  </span>
                </button>
              );
            }
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/10 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">upload</span>
          {PROFILE.uploadAvatar}
        </button>
      </div>
    </div>
  );
}
