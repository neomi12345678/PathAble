import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type {
  LearningModule,
  LearningModuleDetail,
  LearningQuizQuestion,
  LearningResource,
  SkillsModule,
  SkillModuleDetail,
  UserProgress,
} from "@/types";

interface LearningContentJson {
  sections?: string[];
  quiz?: LearningQuizQuestion[];
  resources?: LearningResource[];
  durationMinutes?: number;
  takeaways?: string[];
}

interface SkillContentJson {
  questions?: SkillModuleDetail["questions"];
  practicalExample?: string;
}

export async function getLearningModulesFromDb(): Promise<LearningModule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .order("order_index");
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.slug,
    title: row.title,
    category: row.category,
    content: row.description ?? "",
    video_url: row.video_url,
    order_index: row.order_index,
  }));
}

export async function getLearningModuleByIdFromDb(
  id: string
): Promise<LearningModuleDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("slug", id)
    .maybeSingle();
  if (error || !data) return null;
  const content = (data.content_json ?? {}) as LearningContentJson;
  return {
    id: data.slug,
    title: data.title,
    category: data.category,
    content: data.description ?? "",
    video_url: data.video_url,
    order_index: data.order_index,
    sections: content.sections ?? [],
    quiz: content.quiz ?? [],
    resources: content.resources ?? [],
    durationMinutes: content.durationMinutes ?? 10,
    takeaways: content.takeaways ?? [],
  };
}

export async function getSkillsModulesFromDb(): Promise<SkillsModule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills_modules")
    .select("*")
    .order("order_index");
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.slug,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty,
    order_index: row.order_index,
  }));
}

export async function getSkillModuleByIdFromDb(
  id: string
): Promise<SkillModuleDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills_modules")
    .select("*")
    .eq("slug", id)
    .maybeSingle();
  if (error || !data) return null;
  const content = (data.content_json ?? {}) as SkillContentJson;
  return {
    id: data.slug,
    title: data.title,
    description: data.description,
    difficulty: data.difficulty,
    order_index: data.order_index,
    questions: content.questions ?? [],
    practicalExample: content.practicalExample ?? "",
  };
}

export async function getUserProgressFromDb(
  userId: string,
  moduleType?: "learning" | "skill"
): Promise<UserProgress[]> {
  const supabase = await createClient();
  let query = supabase.from("user_progress").select("*").eq("user_id", userId);
  if (moduleType) query = query.eq("module_type", moduleType);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    module_id: row.module_id,
    module_type: row.module_type as UserProgress["module_type"],
    progress: row.progress,
    completed: row.completed,
    updated_at: row.updated_at,
  }));
}

export async function upsertUserProgress(
  userId: string,
  moduleId: string,
  moduleType: "learning" | "skill",
  progress: number,
  completed: boolean,
  progressMeta?: Json
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      module_id: moduleId,
      module_type: moduleType,
      progress,
      completed,
      progress_meta: progressMeta ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module_id,module_type" }
  );
  if (error) throw new Error(error.message);
}

export type DbUserProgress = UserProgress & {
  progress_meta: Json | null;
};

export async function getModuleProgressFromDb(
  userId: string,
  moduleId: string,
  moduleType: "learning" | "skill"
): Promise<DbUserProgress | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .eq("module_type", moduleType)
    .maybeSingle();
  if (error || !data) return undefined;
  return {
    id: data.id,
    user_id: data.user_id,
    module_id: data.module_id,
    module_type: data.module_type as UserProgress["module_type"],
    progress: data.progress,
    completed: data.completed,
    updated_at: data.updated_at,
    progress_meta: (data.progress_meta as Json | null) ?? null,
  };
}

export interface SkillProgressMeta {
  answeredQuestionIds: string[];
  correctCount: number;
}

export function parseSkillProgressMeta(
  meta: Json | null
): SkillProgressMeta {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return { answeredQuestionIds: [], correctCount: 0 };
  }
  const obj = meta as Record<string, unknown>;
  return {
    answeredQuestionIds: Array.isArray(obj.answeredQuestionIds)
      ? (obj.answeredQuestionIds as string[])
      : [],
    correctCount: typeof obj.correctCount === "number" ? obj.correctCount : 0,
  };
}
