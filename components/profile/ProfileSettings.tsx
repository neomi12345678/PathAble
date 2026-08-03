"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Toggle } from "@/components/ui/Toggle";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { PROFILE } from "@/utils/texts";
import type { ProfileInterest } from "@/types";
import {
  PROFILE_AVATAR_UPDATED_EVENT,
  type ProfileAvatarId,
} from "@/lib/profile-avatar";
import {
  getCustomAvatarDataUrl,
  resolveAvatarUrl,
} from "@/lib/profile-avatar.client";

export interface ProfileSettingsData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  sector: string;
  disabilityType: string;
  bio: string;
  roleLine: string;
  completionPercent: number;
  avatarUrl: string;
  avatarId?: ProfileAvatarId;
  skills: string[];
  interests: ProfileInterest[];
  emailNotifications: boolean;
}

interface ProfileSettingsProps {
  data: ProfileSettingsData;
}

const inputClass =
  "w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-container focus:ring-1 focus:ring-primary-container";

function CompletionRing({ percent }: { percent: number }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg className="absolute h-16 w-16 -rotate-90" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          className="text-surface-container-highest"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary-container"
        />
      </svg>
      <span className="text-xs font-bold text-primary">{percent}%</span>
    </div>
  );
}

export function ProfileSettings({ data }: ProfileSettingsProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    bio: data.bio,
  });
  const [skills, setSkills] = useState(data.skills);
  const [interests, setInterests] = useState(data.interests);
  const [emailNotifications, setEmailNotifications] = useState(
    data.emailNotifications
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);
  const [avatarId, setAvatarId] = useState<ProfileAvatarId | undefined>(
    data.avatarId
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAvatarUrl(resolveAvatarUrl(data.avatarId, getCustomAvatarDataUrl()));
    setAvatarId(data.avatarId);
  }, [data.avatarId, data.avatarUrl]);

  useEffect(() => {
    const syncAvatar = (): void => {
      setAvatarUrl(resolveAvatarUrl(avatarId, getCustomAvatarDataUrl()));
    };
    window.addEventListener(PROFILE_AVATAR_UPDATED_EVENT, syncAvatar);
    return () =>
      window.removeEventListener(PROFILE_AVATAR_UPDATED_EVENT, syncAvatar);
  }, [avatarId]);

  const fullName = `${form.firstName} ${form.lastName}`;

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          bio: form.bio.trim(),
          skills,
          interests: interests.filter((item) => item.checked).map((item) => item.id),
          email_notifications: emailNotifications,
        }),
      });

      const payload = (await res.json()) as { error?: string };

      if (!res.ok) {
        toast.error(payload.error ?? PROFILE.saveError);
        return;
      }

      toast.success(PROFILE.saved);
      router.refresh();
    } catch {
      toast.error(PROFILE.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (): Promise<void> => {
    setDeleting(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        toast.error(payload.error ?? PROFILE.deleteError);
        return;
      }
      window.location.href = "/";
    } catch {
      toast.error(PROFILE.deleteError);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = (): void => {
    setForm({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      bio: data.bio,
    });
    setSkills(data.skills);
    setInterests(data.interests);
    setEmailNotifications(data.emailNotifications);
  };

  const removeSkill = (skill: string): void => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const addSkill = (): void => {
    const next = window.prompt("הוסף כישור:");
    if (next?.trim()) {
      setSkills((prev) => [...prev, next.trim()]);
    }
  };

  return (
    <div className="mx-auto max-w-container-max space-y-6 pb-24 md:pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-primary md:text-3xl">
            {PROFILE.title}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant md:text-base">
            {PROFILE.subtitle}
          </p>
        </div>
        <div className="hidden gap-3 md:flex">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="rounded-full border-2 border-primary-container px-6 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
          >
            {PROFILE.cancel}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-full bg-primary-container px-8 py-2 text-sm font-bold text-white shadow-lg transition-all hover:shadow-primary/30 disabled:opacity-50"
          >
            {PROFILE.save}
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="glass-card glow-shadow flex flex-col items-center gap-6 rounded-[32px] p-6 md:flex-row md:items-start lg:col-span-8">
          <div className="relative shrink-0">
            <div
              className="h-28 w-28 overflow-hidden rounded-3xl border-4 border-white bg-cover bg-center shadow-2xl md:h-32 md:w-32"
              style={{ backgroundImage: `url('${avatarUrl}')` }}
            />
            <button
              type="button"
              aria-label={PROFILE.changeAvatar}
              onClick={() => setPickerOpen(true)}
              className="absolute -bottom-2 -right-2 rounded-2xl bg-primary-container p-2.5 text-white shadow-lg transition-transform hover:scale-110"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>
          <div className="flex-1 text-center md:text-right">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-on-surface md:text-2xl">
                  {fullName}
                </h2>
                <p className="text-sm font-medium text-primary">{data.roleLine}</p>
              </div>
              <span className="inline-flex self-center rounded-full bg-secondary-fixed px-4 py-1 text-xs font-bold text-on-secondary-fixed-variant md:self-start">
                {PROFILE.statusLooking}
              </span>
            </div>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder={PROFILE.bioPlaceholder}
              className="w-full resize-none rounded-2xl border-none bg-surface-container-low/50 p-4 text-sm text-on-surface-variant outline-none transition-all focus:ring-2 focus:ring-primary-container"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:col-span-4">
          <div className="glass-card glow-shadow flex items-center justify-between rounded-[32px] p-5">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {PROFILE.completion}
              </p>
              <h4 className="font-display text-xl font-bold text-primary">
                {data.completionPercent}%
              </h4>
            </div>
            <CompletionRing percent={data.completionPercent} />
          </div>
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-primary p-5 text-white shadow-2xl">
            <div className="relative z-10">
              <h4 className="mb-2 font-display text-lg font-bold">
                {PROFILE.advisorTitle}
              </h4>
              <p className="mb-4 text-sm opacity-80">{PROFILE.advisorDesc}</p>
              <Link
                href="/dashboard/chat"
                className="inline-block rounded-xl bg-white px-6 py-2 text-sm font-bold text-primary transition-colors hover:bg-secondary-fixed"
              >
                {PROFILE.advisorCta}
              </Link>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -left-4 rotate-12 text-8xl opacity-10">
              auto_awesome
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person_edit</span>
            <h3 className="font-display text-lg font-bold text-on-surface">
              {PROFILE.personalInfo}
            </h3>
          </div>
          <div className="glass-card glow-shadow space-y-3 rounded-3xl p-5">
            <div className="space-y-1">
              <label htmlFor="fullName" className="mr-1 text-xs font-bold text-on-surface-variant">
                {PROFILE.name}
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  const parts = e.target.value.split(" ");
                  setForm((f) => ({
                    ...f,
                    firstName: parts[0] ?? "",
                    lastName: parts.slice(1).join(" "),
                  }));
                }}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="mr-1 text-xs font-bold text-on-surface-variant">
                {PROFILE.email}
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                readOnly
                aria-readonly="true"
                className={`${inputClass} cursor-not-allowed opacity-70`}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className="mr-1 text-xs font-bold text-on-surface-variant">
                {PROFILE.phone}
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="city" className="mr-1 text-xs font-bold text-on-surface-variant">
                {PROFILE.city}
              </label>
              <div className="relative">
                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className={`${inputClass} pr-10`}
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">
                  location_on
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1 text-sm">
              <div>
                <p className="text-xs font-bold text-on-surface-variant">{PROFILE.sector}</p>
                <p className="font-medium">{data.sector}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant">{PROFILE.disability}</p>
                <p className="font-bold text-primary">{data.disabilityType}</p>
              </div>
            </div>
            <Link
              href="/onboarding?update=1"
              className="inline-flex text-sm font-bold text-primary hover:underline"
            >
              {PROFILE.updateDiagnosis} ←
            </Link>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">psychology</span>
            <h3 className="font-display text-lg font-bold text-on-surface">
              {PROFILE.skillsInterests}
            </h3>
          </div>
          <div className="glass-card glow-shadow rounded-3xl p-5">
            <div className="mb-5">
              <label className="mb-2 block text-xs font-bold text-on-surface-variant">
                {PROFILE.mainSkills}
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold text-on-primary-fixed-variant"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-error"
                      aria-label={`הסר ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={addSkill}
                  className="rounded-full border border-dashed border-primary px-3 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/5"
                >
                  {PROFILE.addSkill}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-on-surface-variant">
                {PROFILE.interests}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {interests.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-container-low p-3 transition-colors hover:bg-surface-container"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) =>
                        setInterests((prev) =>
                          prev.map((i) =>
                            i.id === item.id ? { ...i, checked: e.target.checked } : i
                          )
                        )
                      }
                      className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">tune</span>
            <h3 className="font-display text-lg font-bold text-on-surface">
              {PROFILE.preferences}
            </h3>
          </div>
          <div className="glass-card glow-shadow space-y-5 rounded-3xl p-5">
            <Toggle
              id="email-notifications"
              checked={emailNotifications}
              onChange={setEmailNotifications}
              label={PROFILE.emailNotifications}
              description={PROFILE.emailNotificationsDesc}
            />
            <p className="text-xs leading-relaxed text-on-surface-variant">
              {PROFILE.preferencesHint}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">security</span>
            <h3 className="font-display text-lg font-bold text-on-surface">
              {PROFILE.security}
            </h3>
          </div>
          <div className="glass-card glow-shadow space-y-3 rounded-3xl p-5">
            <Link
              href="/auth/forgot-password"
              className="group flex w-full items-center justify-between rounded-xl bg-surface-container-low p-4 transition-all hover:bg-surface-container"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                <span className="text-sm font-medium">{PROFILE.changePassword}</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant transition-transform group-hover:-translate-x-1">
                chevron_left
              </span>
            </Link>
            {confirmDelete ? (
              <div className="space-y-3 rounded-xl border border-error/30 bg-error-container/30 p-4">
                <p className="text-sm font-bold text-error">
                  {PROFILE.deleteConfirmText}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleDeleteAccount()}
                    disabled={deleting}
                    className="flex-1 rounded-lg bg-error py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {deleting ? PROFILE.deleting : PROFILE.deleteConfirmCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="flex-1 rounded-lg bg-white py-2.5 text-sm font-bold text-on-surface transition-all hover:bg-surface-container disabled:opacity-50"
                  >
                    {PROFILE.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="group flex w-full items-center justify-between rounded-xl bg-error-container/30 p-4 transition-all hover:bg-error-container/50"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-error">delete_forever</span>
                  <span className="text-sm font-medium text-error">{PROFILE.deleteAccount}</span>
                </div>
                <span className="material-symbols-outlined text-error transition-transform group-hover:-translate-x-1">
                  chevron_left
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="fixed bottom-20 left-0 right-0 z-40 flex gap-2 px-4 md:hidden">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-primary-container py-3.5 text-sm font-bold text-primary disabled:opacity-50"
        >
          {PROFILE.cancel}
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-container py-3.5 text-sm font-bold text-white shadow-2xl disabled:opacity-50"
        >
          <span className="material-symbols-outlined">save</span>
          {PROFILE.save}
        </button>
      </div>

      <AvatarPicker
        open={pickerOpen}
        currentId={avatarId}
        onClose={() => setPickerOpen(false)}
        onSaved={(id, url) => {
          setAvatarId(id);
          setAvatarUrl(url);
        }}
      />
    </div>
  );
}
