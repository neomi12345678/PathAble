/**
 * Seed Supabase from scripts/seed-data.
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Run: npm run seed
 */
// הערה: מכונת הפיתוח המקומית מריצה פרוקסי שמיירט TLS, ולכן אימות תעודות נכשל.
// העקיפה חלה על סקריפטים מקומיים בלבד — קוד הפרודקשן לא מבטל אימות TLS.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { createAdminClient } from "../lib/supabase/admin";
import { mockProfessions } from "./seed-data/professions";
import { mockQuestions } from "./seed-data/questions";
import { mockLearningModules } from "./seed-data/learning";
import { getLearningModuleDetail } from "./seed-data/learning-content";
import { mockSkillsModules } from "./seed-data/skills";
import { getSkillModuleDetail } from "./seed-data/skills-content";
import {
  mockAchievementBadges,
} from "./seed-data/achievements";
import {
  mockRightsTopics,
  mockRightsFaqs,
  mockHelperOrgs,
} from "./seed-data/rights";

async function seed(): Promise<void> {
  const supabase = createAdminClient();

  console.log("Seeding professions...");
  const { error: profErr } = await supabase.from("professions").upsert(
    mockProfessions.map((p) => ({
      slug: p.id,
      name: p.name,
      description: p.description,
      salary_range: p.salary_range,
      education: p.education,
      skills: p.skills,
      work_environment: p.work_environment,
      social_interaction_level: p.social_interaction_level,
      disability_fit: p.disability_fit,
      video_url: p.video_url,
      active: p.active,
    })),
    { onConflict: "slug" }
  );
  if (profErr) throw profErr;

  console.log("Seeding jobs skipped — run: npm run sync:jobs");

  console.log("Seeding questions...");
  const { error: qErr } = await supabase.from("questions").upsert(
    mockQuestions.map((q) => ({
      slug: q.id,
      title: q.title,
      category: q.category,
      weight: q.weight,
      active: q.active,
    })),
    { onConflict: "slug" }
  );
  if (qErr) throw qErr;

  console.log("Seeding learning modules...");
  const learningRows = mockLearningModules.map((m) => {
    const detail = getLearningModuleDetail(m.id);
    return {
      slug: m.id,
      title: m.title,
      category: m.category,
      description: m.content,
      video_url: m.video_url,
      order_index: m.order_index,
      content_json: detail
        ? {
            sections: detail.sections,
            quiz: detail.quiz,
            resources: detail.resources,
            durationMinutes: detail.durationMinutes,
            takeaways: detail.takeaways,
          }
        : null,
    };
  });
  const { error: learnErr } = await supabase
    .from("learning_modules")
    .upsert(learningRows, { onConflict: "slug" });
  if (learnErr) throw learnErr;

  console.log("Seeding skills modules...");
  const skillsRows = mockSkillsModules.map((m) => {
    const detail = getSkillModuleDetail(m.id);
    return {
      slug: m.id,
      title: m.title,
      description: m.description,
      difficulty: m.difficulty,
      order_index: m.order_index,
      content_json: detail
        ? {
            questions: detail.questions,
            practicalExample: detail.practicalExample,
          }
        : null,
    };
  });
  const { error: skillsErr } = await supabase
    .from("skills_modules")
    .upsert(skillsRows, { onConflict: "slug" });
  if (skillsErr) throw skillsErr;

  console.log("Seeding achievement badges...");
  const { error: badgeErr } = await supabase.from("achievement_badges").upsert(
    mockAchievementBadges.map((b) => ({
      slug: b.id,
      title: b.title,
      description: b.condition,
      icon: b.icon,
      category: "general",
    })),
    { onConflict: "slug" }
  );
  if (badgeErr) throw badgeErr;

  console.log("Seeding rights...");
  const { error: rtErr } = await supabase.from("rights_topics").upsert(
    mockRightsTopics.map((t, i) => ({
      slug: t.id,
      title: t.title,
      content: t.content,
      order_index: i,
    })),
    { onConflict: "slug" }
  );
  if (rtErr) throw rtErr;

  const { error: rfErr } = await supabase.from("rights_faqs").upsert(
    mockRightsFaqs.map((f, i) => ({
      slug: f.id,
      question: f.question,
      answer: f.answer,
      order_index: i,
    })),
    { onConflict: "slug" }
  );
  if (rfErr) throw rfErr;

  const { error: roErr } = await supabase.from("rights_organizations").upsert(
    mockHelperOrgs.map((o, i) => ({
      slug: o.id,
      name: o.name,
      description: o.description,
      url: o.url,
      phone: null,
      order_index: i,
    })),
    { onConflict: "slug" }
  );
  if (roErr) throw roErr;

  console.log("Seed complete.");
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
