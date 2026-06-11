export type Sector = "חילוני" | "דתי" | "חרדי" | "מסורתי";

export type UserRole = "user" | "parent" | "professional" | "admin";

export type ChatRole = "user" | "assistant";

export type ModuleType = "learning" | "skill";

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  age: number;
  city: string;
  sector: Sector;
  disability_type: string;
  role: UserRole;
  created_at: string;
}

export interface Question {
  id: string;
  title: string;
  category: string;
  weight: number;
  active: boolean;
}

export interface Assessment {
  id: string;
  user_id: string;
  created_at: string;
}

export interface Answer {
  id: string;
  assessment_id: string;
  question_id: string;
  answer: number;
}

export interface AssessmentResult {
  id: string;
  user_id: string;
  summary: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  created_at: string;
}

export interface Profession {
  id: string;
  name: string;
  description: string;
  salary_range: string;
  education: string;
  skills: string[];
  work_environment: string;
  social_interaction_level: string;
  disability_fit: string[];
  video_url: string | null;
  active: boolean;
}

export interface Job {
  id: string;
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
}

export interface LearningModule {
  id: string;
  title: string;
  category: string;
  content: string;
  video_url: string | null;
  order_index: number;
}

export interface SkillsModule {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  order_index: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  module_id: string;
  module_type: ModuleType;
  progress: number;
  completed: boolean;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: ChatRole;
  message: string;
  created_at: string;
}

export interface SavedProfession {
  id: string;
  user_id: string;
  profession_id: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  earned_at: string;
}

export interface RightsTopic {
  id: string;
  title: string;
  content: string;
}

export interface RightsFaq {
  id: string;
  question: string;
  answer: string;
}

export interface RightsHelperOrg {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface AchievementBadge {
  id: string;
  emoji: string;
  title: string;
  condition: string;
  earned: boolean;
}
