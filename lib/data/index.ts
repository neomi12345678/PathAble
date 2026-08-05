import { getAuthUser } from "./auth";
import {
  getJobsFromDb,
  getJobByIdFromDb,
  getProfessionByIdFromDb,
  getProfessionsFromDb,
  getQuestionsFromDb,
  getSavedProfessionIdsFromDb,
  getSavedJobIdsFromDb,
} from "./catalog";
import {
  getLearningModuleByIdFromDb,
  getLearningModulesFromDb,
  getModuleProgressFromDb,
  getSkillModuleByIdFromDb,
  getSkillsModulesFromDb,
  getUserProgressFromDb,
  type DbUserProgress,
} from "./modules";
import {
  getCurrentProfile,
  getProfileExtras,
  getProfilePrefsForUser,
} from "./profile";
import {
  getAssessmentResultFromDb,
  submitAssessmentToDb,
} from "./assessment";
import { getChatMessagesFromDb, sendChatMessageFromDb } from "./chat";
import {
  getAchievementBadgesFromDb,
  getActivityFeedFromDb,
  getCareerPathFromDb,
  getLeaderboardFromDb,
  getRightsDataFromDb,
} from "./rights-achievements";

export async function getProfile() {
  return getCurrentProfile();
}

export async function getProfilePrefs() {
  const user = await getAuthUser();
  if (!user) return null;
  return getProfilePrefsForUser(user.id);
}

export async function getProfessions() {
  return getProfessionsFromDb();
}

export async function getProfessionById(id: string) {
  return getProfessionByIdFromDb(id);
}

export async function getJobs(filters?: Parameters<typeof getJobsFromDb>[0]) {
  return getJobsFromDb(filters);
}

export async function getJobById(id: string) {
  return getJobByIdFromDb(id);
}

export async function getQuestions() {
  return getQuestionsFromDb();
}

export async function getAssessmentResult() {
  const user = await getAuthUser();
  if (!user) return null;
  return getAssessmentResultFromDb(user.id);
}

export async function submitAssessment(answers: Record<string, number>) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  const { result } = await submitAssessmentToDb(user.id, answers);
  return {
    summary: result.summary,
    strengths: result.strengths,
    challenges: result.challenges,
    recommendations: result.recommendations,
  };
}

export async function getChatMessages() {
  const user = await getAuthUser();
  if (!user) return [];
  return getChatMessagesFromDb(user.id);
}

export async function sendChatMessage(message: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return sendChatMessageFromDb(user.id, message);
}

export async function getLearningModules() {
  return getLearningModulesFromDb();
}

export async function getLearningModuleById(id: string) {
  return getLearningModuleByIdFromDb(id);
}

export async function getLearningProgress() {
  const user = await getAuthUser();
  if (!user) return [];
  return getUserProgressFromDb(user.id, "learning");
}

export async function getModuleProgressAsync(moduleId: string) {
  const user = await getAuthUser();
  if (!user) return undefined;
  return getModuleProgressFromDb(user.id, moduleId, "learning");
}

export async function getSkillsModules() {
  return getSkillsModulesFromDb();
}

export async function getSkillModuleDetailAsync(id: string) {
  return getSkillModuleByIdFromDb(id);
}

export async function getSkillsProgress() {
  const user = await getAuthUser();
  if (!user) return [];
  return getUserProgressFromDb(user.id, "skill");
}

export async function getSkillModuleProgressAsync(
  skillId: string
): Promise<DbUserProgress | undefined> {
  const user = await getAuthUser();
  if (!user) return undefined;
  return getModuleProgressFromDb(user.id, skillId, "skill");
}

export async function getSavedProfessionIds() {
  const user = await getAuthUser();
  if (!user) return [];
  return getSavedProfessionIdsFromDb(user.id);
}

export async function getSavedJobIds() {
  const user = await getAuthUser();
  if (!user) return [];
  return getSavedJobIdsFromDb(user.id);
}

export async function getUserProgress() {
  const user = await getAuthUser();
  if (!user) return [];
  return getUserProgressFromDb(user.id);
}

export async function getAchievementBadges() {
  const user = await getAuthUser();
  return getAchievementBadgesFromDb(user?.id);
}

export async function getActivityFeed() {
  const user = await getAuthUser();
  if (!user) return [];
  return getActivityFeedFromDb(user.id);
}

export async function getCareerPath() {
  const user = await getAuthUser();
  if (!user) {
    return {
      title: "מסלול קריירה: עבודה מותאמת",
      step: 1,
      totalSteps: 5,
      percent: 0,
      steps: [
        { label: "השלמת פרופיל", status: "active" as const },
        { label: "אבחון תעסוקתי", status: "pending" as const },
        { label: "למידה והכשרה", status: "pending" as const },
        { label: "בחירת מקצוע", status: "pending" as const },
        { label: "השמה בעבודה", status: "pending" as const },
      ],
    };
  }
  return getCareerPathFromDb(user.id);
}

export async function getLeaderboard() {
  const user = await getAuthUser();
  return getLeaderboardFromDb(user?.id);
}

export async function getProfileExtrasData() {
  const user = await getAuthUser();
  if (!user) {
    return { bio: "", skills: [], interests: [], emailNotifications: true };
  }
  return getProfileExtras(user.id);
}

export async function getRightsData() {
  return getRightsDataFromDb();
}

export { isSupabaseConfigured } from "@/lib/supabase/env";
