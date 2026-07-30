import { createClient } from "@/lib/supabase/server";
import type { Job, Profession, Question } from "@/types";

export async function getProfessionsFromDb(): Promise<Profession[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("professions")
    .select("*")
    .eq("active", true);
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.slug,
    name: row.name,
    description: row.description,
    salary_range: row.salary_range,
    education: row.education,
    skills: row.skills,
    work_environment: row.work_environment,
    social_interaction_level: row.social_interaction_level,
    disability_fit: row.disability_fit,
    video_url: row.video_url,
    active: row.active,
  }));
}

export async function getProfessionByIdFromDb(
  id: string
): Promise<Profession | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("professions")
    .select("*")
    .eq("slug", id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.slug,
    name: data.name,
    description: data.description,
    salary_range: data.salary_range,
    education: data.education,
    skills: data.skills,
    work_environment: data.work_environment,
    social_interaction_level: data.social_interaction_level,
    disability_fit: data.disability_fit,
    video_url: data.video_url,
    active: data.active,
  };
}

export async function getJobsFromDb(filters?: {
  city?: string;
  work_from_home?: boolean;
  accessibility?: boolean;
}): Promise<Job[]> {
  const supabase = createClient();
  let query = supabase.from("jobs").select("*").eq("active", true);
  if (filters?.city) query = query.eq("city", filters.city);
  if (filters?.work_from_home !== undefined)
    query = query.eq("work_from_home", filters.work_from_home);
  if (filters?.accessibility !== undefined)
    query = query.eq("accessibility", filters.accessibility);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.slug,
    title: row.title,
    company: row.company,
    city: row.city,
    description: row.description,
    salary: row.salary,
    apply_url: row.apply_url,
    work_from_home: row.work_from_home,
    accessibility: row.accessibility,
    scope: row.scope,
    active: row.active,
    created_at: row.created_at,
    social_interaction_level: row.social_interaction_level ?? "בינוני",
    support_features: row.support_features ?? [],
    autism_match_reason: row.autism_match_reason ?? "",
    disability_fit: row.disability_fit ?? [],
    profession_id: row.profession_id ?? undefined,
  }));
}

export async function getJobByIdFromDb(id: string): Promise<Job | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", id)
    .eq("active", true)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.slug,
    title: data.title,
    company: data.company,
    city: data.city,
    description: data.description,
    salary: data.salary,
    apply_url: data.apply_url,
    work_from_home: data.work_from_home,
    accessibility: data.accessibility,
    scope: data.scope,
    active: data.active,
    created_at: data.created_at,
    social_interaction_level: data.social_interaction_level ?? "בינוני",
    support_features: data.support_features ?? [],
    autism_match_reason: data.autism_match_reason ?? "",
    disability_fit: data.disability_fit ?? [],
    profession_id: data.profession_id ?? undefined,
  };
}

export async function getQuestionsFromDb(): Promise<Question[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("active", true)
    .order("slug");
  if (error) return [];
  if (!data?.length) return [];
  return data.map((row) => ({
    id: row.slug,
    title: row.title,
    category: row.category,
    weight: row.weight,
    active: row.active,
  }));
}

export async function getSavedProfessionIdsFromDb(
  userId: string
): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_professions")
    .select("profession_slug")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data.map((r) => r.profession_slug);
}
