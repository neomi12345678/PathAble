import type { Metadata } from "next";
import { ChatInterface } from "@/components/chat/ChatInterface";
import {
  getAssessmentResult,
  getJobs,
  getProfessions,
  getProfile,
  getSavedProfessionIds,
  getUserProgress,
} from "@/lib/data";
import {
  DIAGNOSIS_FILTER_MIN_SCORE,
  getJobMatchScore,
  jobMatchesDiagnosis,
  professionMatchesDiagnosis,
} from "@/lib/disability-matching";
import { getUserProfilePrefsAsync } from "@/lib/user-profile.server";
import { CHAT } from "@/utils/texts";

export const metadata: Metadata = {
  title: `${CHAT.title} | עתיד מתאים`,
  description: CHAT.subtitle,
};

export default async function ChatPage() {
  const [profile, prefs, assessment, savedIds, progress, professions, jobs] =
    await Promise.all([
      getProfile(),
      getUserProfilePrefsAsync(),
      getAssessmentResult(),
      getSavedProfessionIds(),
      getUserProgress(),
      getProfessions(),
      getJobs(),
    ]);

  const diagnosis = prefs?.disability_type?.trim() ?? profile?.disability_type?.trim() ?? "";

  let completionPercent = 0;
  if (prefs?.onboardingComplete) completionPercent += 25;
  if (assessment?.summary) completionPercent += 25;
  if (progress.length > 0) completionPercent += 25;
  if (savedIds.length > 0) completionPercent += 25;

  const matchingProfessions = diagnosis
    ? professions.filter((p) => professionMatchesDiagnosis(p, diagnosis)).length
    : professions.length;
  const matchingJobs = diagnosis
    ? jobs.filter((j) => {
        const score = getJobMatchScore(
          j,
          diagnosis,
          prefs?.autism_level,
          prefs?.city ?? profile?.city,
          prefs?.sector ?? profile?.sector
        );
        return (
          jobMatchesDiagnosis(j, diagnosis) ||
          score >= DIAGNOSIS_FILTER_MIN_SCORE
        );
      }).length
    : jobs.length;

  return (
    <ChatInterface
      stats={{ completionPercent, matchingProfessions, matchingJobs }}
    />
  );
}
