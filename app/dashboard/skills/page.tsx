import type { Metadata } from "next";
import Link from "next/link";
import { SKILLS } from "@/utils/texts";
import { getProfile, getSkillsModules, getSkillsProgress } from "@/lib/data";
import { getSkillModuleByIdFromDb } from "@/lib/data/modules";
import { getProfileAvatarUrlForUser } from "@/lib/profile-avatar.server";
import { IMAGES } from "@/lib/assets/images";
import { SkillsAccordion } from "@/components/skills/SkillsAccordion";

export const metadata: Metadata = {
  title: `${SKILLS.title} | עתיד מתאים`,
  description: SKILLS.subtitle,
};

export default async function SkillsPage() {
  const [skills, userProgress, profile] = await Promise.all([
    getSkillsModules(),
    getSkillsProgress(),
    getProfile(),
  ]);

  const avatarUrl = profile
    ? await getProfileAvatarUrlForUser(profile.id)
    : IMAGES.profileAvatar;
  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    profile?.email ||
    "הפרופיל שלך";

  const skillsWithProgress = await Promise.all(
    skills.map(async (skill) => {
      const detail = await getSkillModuleByIdFromDb(skill.id);
      return {
        ...skill,
        progress:
          userProgress.find(
            (p) => p.module_id === skill.id && p.module_type === "skill"
          )?.progress ?? 0,
        practicalExample: detail?.practicalExample ?? "",
      };
    })
  );

  const learned = skillsWithProgress.filter((s) => s.progress >= 100).length;
  const inProgress = skillsWithProgress.filter(
    (s) => s.progress > 0 && s.progress < 100
  ).length;
  const overall =
    skillsWithProgress.length > 0
      ? Math.round(
          skillsWithProgress.reduce((sum, s) => sum + s.progress, 0) /
            skillsWithProgress.length
        )
      : 0;

  const nextSkill = skillsWithProgress
    .filter((s) => s.progress < 100)
    .sort((a, b) => b.progress - a.progress)[0];

  const progressTip = nextSkill
    ? `המשיכו ב"${nextSkill.title}" — ${nextSkill.progress}% הושלמו.`
    : skillsWithProgress.length > 0 && learned === skillsWithProgress.length
      ? "סיימתם את כל המיומנויות — כל הכבוד!"
      : "בחרו מיומנות מהרשימה והתחילו ללמוד.";

  return (
    <div className="text-right">
      <section className="mb-12">
        <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
          מיומנויות תעסוקה
        </div>
        <h1 className="mb-4 font-display text-4xl font-black text-primary md:text-5xl">
          {SKILLS.title}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          גלו את המיומנויות שיפתחו לכם דלתות בשוק העבודה המודרני. כלים פרקטיים
          המותאמים אישית לחוזקות הייחודיות שלכם.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SkillsAccordion skills={skillsWithProgress} />
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="glass-panel glow-blue rounded-3xl border border-primary/10 p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-primary-container">
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${avatarUrl}')` }}
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-primary">{displayName}</h4>
                <p className="text-sm text-on-surface-variant">
                  {profile?.disability_type
                    ? `מסלול מותאם · ${profile.disability_type}`
                    : "מסלול מיומנויות אישי"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">התקדמות כללית</span>
                <span className="font-bold text-primary">{overall}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-full rounded-full bg-primary-container shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-all duration-1000"
                  style={{ width: `${overall}%` }}
                />
              </div>
              <p className="rounded-xl bg-primary-fixed/30 p-3 text-xs leading-relaxed text-on-surface-variant">
                <strong>המשך למידה:</strong> {progressTip}
              </p>
            </div>
          </div>

          <div className="group relative h-64 cursor-pointer overflow-hidden rounded-3xl shadow-xl">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url('${IMAGES.coachPortrait}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h4 className="mb-1 text-xl font-bold text-white">
                שיחת ייעוץ אישית
              </h4>
              <p className="mb-4 text-sm text-primary-fixed">
                נציג מומחה ילווה אותך בבניית המיומנויות
              </p>
              <Link
                href="/dashboard/chat"
                className="block w-full rounded-xl bg-secondary-fixed py-3 text-center font-bold text-on-secondary-fixed shadow-lg transition-colors hover:bg-secondary-container"
              >
                תיאום שיחה
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-center">
              <span className="material-symbols-outlined mb-2 text-3xl text-secondary">
                stars
              </span>
              <span className="text-2xl font-bold text-on-surface">
                {learned}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                מיומנויות נלמדו
              </span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-center">
              <span className="material-symbols-outlined mb-2 text-3xl text-primary">
                workspace_premium
              </span>
              <span className="text-2xl font-bold text-on-surface">
                {inProgress}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                בתהליך למידה
              </span>
            </div>
          </div>
        </aside>
      </div>

      <Link
        href="/dashboard/chat"
        aria-label="יש לך שאלה?"
        className="group fixed bottom-8 left-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
      >
        <span className="material-symbols-outlined text-3xl">question_answer</span>
        <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg bg-white px-4 py-2 font-bold text-primary opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
          יש לך שאלה? אנחנו כאן
        </span>
      </Link>
    </div>
  );
}
