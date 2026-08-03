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
import { professionMatchesDiagnosis } from "@/lib/disability-matching";
import { CHAT } from "@/utils/texts";

export const metadata: Metadata = {
  title: `${CHAT.title} | עתיד מתאים`,
  description: CHAT.subtitle,
};

export default async function ChatPage() {
  const [profile, assessment, savedIds, progress, professions, jobs] =
    await Promise.all([
      getProfile(),
      getAssessmentResult(),
      getSavedProfessionIds(),
      getUserProgress(),
      getProfessions(),
      getJobs(),
    ]);

  const diagnosis = profile?.disability_type ?? "";

  let completionPercent = 0;
  if (profile?.disability_type) completionPercent += 25;
  if (assessment?.summary) completionPercent += 25;
  if (progress.length > 0) completionPercent += 25;
  if (savedIds.length > 0) completionPercent += 25;

  const matchingProfessions = diagnosis
    ? professions.filter((p) => professionMatchesDiagnosis(p, diagnosis)).length
    : professions.length;
  const matchingJobs = diagnosis
    ? jobs.filter((j) => j.disability_fit.includes(diagnosis)).length
    : jobs.length;

  return (
    <ChatInterface
      stats={{ completionPercent, matchingProfessions, matchingJobs }}
    />
  );
}
