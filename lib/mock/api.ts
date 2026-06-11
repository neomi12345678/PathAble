import type {
  AssessmentResult,
  ChatMessage,
  Job,
  LearningModule,
  Profession,
  Profile,
  SkillsModule,
} from "@/types";
import { mockAssessmentResult, mockAssessmentResultResponse } from "./assessment";
import {
  DEFAULT_CHAT_RESPONSE,
  mockChatMessages,
  mockChatResponses,
} from "./chat";
import { MOCK_DELAY_MS, DEMO_SESSION_ID } from "./constants";
import { mockJobs } from "./jobs";
import { mockLearningModules } from "./learning";
import { mockProfile } from "./profile";
import { mockProfessions } from "./professions";
import { mockQuestions } from "./questions";
import { mockAchievementBadges } from "./achievements";
import { mockRightsFaqs, mockRightsTopics, mockHelperOrgs } from "./rights";
import { mockSkillsModules } from "./skills";
import { mockSavedProfessions, mockUserProgress } from "./user-data";

function delay<T>(data: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export async function getMockProfile(): Promise<Profile> {
  return delay(mockProfile);
}

export async function getMockProfessions(): Promise<Profession[]> {
  return delay(mockProfessions.filter((p) => p.active));
}

export async function getMockProfessionById(
  id: string
): Promise<Profession | null> {
  const profession = mockProfessions.find((p) => p.id === id) ?? null;
  return delay(profession);
}

export async function getMockJobs(filters?: {
  city?: string;
  work_from_home?: boolean;
  accessibility?: boolean;
}): Promise<Job[]> {
  let jobs = mockJobs.filter((j) => j.active);

  if (filters?.city) {
    jobs = jobs.filter((j) => j.city === filters.city);
  }
  if (filters?.work_from_home !== undefined) {
    jobs = jobs.filter((j) => j.work_from_home === filters.work_from_home);
  }
  if (filters?.accessibility !== undefined) {
    jobs = jobs.filter((j) => j.accessibility === filters.accessibility);
  }

  return delay(jobs);
}

export async function getMockQuestions() {
  return delay(mockQuestions.filter((q) => q.active));
}

export async function getMockAssessmentResult(): Promise<AssessmentResult> {
  return delay(mockAssessmentResult);
}

export async function submitMockAssessment(
  _answers: Record<string, number>
): Promise<typeof mockAssessmentResultResponse> {
  return delay(mockAssessmentResultResponse, 800);
}

export async function getMockChatMessages(): Promise<ChatMessage[]> {
  return delay(mockChatMessages);
}

export async function sendMockChatMessage(
  message: string
): Promise<ChatMessage> {
  const responseText =
    mockChatResponses[message] ?? DEFAULT_CHAT_RESPONSE;

  const response: ChatMessage = {
    id: `msg-${Date.now()}`,
    session_id: DEMO_SESSION_ID,
    role: "assistant",
    message: responseText,
    created_at: new Date().toISOString(),
  };

  return delay(response, 600);
}

export async function getMockLearningModules(): Promise<LearningModule[]> {
  return delay(mockLearningModules);
}

export async function getMockSkillsModules(): Promise<SkillsModule[]> {
  return delay(mockSkillsModules);
}

export async function getMockSavedProfessionIds(): Promise<string[]> {
  return delay(mockSavedProfessions.map((s) => s.profession_id));
}

export async function getMockUserProgress() {
  return delay(mockUserProgress);
}

export async function getMockAchievementBadges() {
  return delay(mockAchievementBadges);
}

export async function getMockRightsData() {
  return delay({
    topics: mockRightsTopics,
    faqs: mockRightsFaqs,
    organizations: mockHelperOrgs,
  });
}
