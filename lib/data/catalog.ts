import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrichDisabilityFit } from "@/lib/jobs/job-posting";
import { triggerJobSyncIfStale } from "@/lib/jobs/auto-sync";
import type { Job, Profession, Question } from "@/types";

function mapJobRow(row: {
  slug: string;
  title: string;
  company: string;
  city: string;
  description: string;
  salary: string;
  apply_url: string;
  work_from_home: boolean;
  accessibility: boolean;
  scope: string;
  active: boolean;
  created_at: string;
  social_interaction_level: string | null;
  support_features: string[] | null;
  autism_match_reason: string | null;
  disability_fit: string[] | null;
  profession_id: string | null;
}): Job {
  const socialLevel = row.social_interaction_level ?? "בינוני";
  const disabilityFit = enrichDisabilityFit(
    row.title,
    row.description,
    row.work_from_home,
    socialLevel,
    row.disability_fit ?? []
  );

  return {
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
    social_interaction_level: socialLevel,
    support_features: row.support_features ?? [],
    autism_match_reason: row.autism_match_reason ?? "",
    disability_fit: disabilityFit,
    profession_id: row.profession_id ?? undefined,
  };
}
export async function getProfessionsFromDb(): Promise<Profession[]> {
  if (!isSupabaseConfigured()) return [];
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
  if (!isSupabaseConfigured()) return null;
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
  if (!isSupabaseConfigured()) return [];

  void triggerJobSyncIfStale();

  const supabase = createClient();
  let query = supabase.from("jobs").select("*").eq("active", true);
  if (filters?.city) query = query.eq("city", filters.city);
  if (filters?.work_from_home !== undefined)
    query = query.eq("work_from_home", filters.work_from_home);
  if (filters?.accessibility !== undefined)
    query = query.eq("accessibility", filters.accessibility);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapJobRow);
}

export async function getJobByIdFromDb(id: string): Promise<Job | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", id)
    .eq("active", true)
    .maybeSingle();
  if (error || !data) return null;
  return mapJobRow(data);
}

export async function getQuestionsFromDb(): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
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
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_professions")
    .select("profession_slug")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data.map((r) => r.profession_slug);
}

export async function setSavedProfessionInDb(
  userId: string,
  professionSlug: string,
  saved: boolean
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
  const supabase = createAdminClient();

  if (!saved) {
    const { error } = await supabase
      .from("saved_professions")
      .delete()
      .eq("user_id", userId)
      .eq("profession_slug", professionSlug);
    if (error) throw new Error(error.message);
    return;
  }

  const { data: existing } = await supabase
    .from("saved_professions")
    .select("id")
    .eq("user_id", userId)
    .eq("profession_slug", professionSlug)
    .maybeSingle();
  if (existing) return;

  const { error } = await supabase
    .from("saved_professions")
    .insert({ user_id: userId, profession_slug: professionSlug });
  if (error) throw new Error(error.message);
}
