import type { AssessmentResult } from "@/types";
import { DEMO_USER_ID } from "./constants";

export const mockAssessmentResult: AssessmentResult = {
  id: "result-001",
  user_id: DEMO_USER_ID,
  summary:
    "דני, על בסיס התשובות שלך, אתה מציג חוזקות בחשיבה לוגית, ריכוז במשימות מובנות ויכולת ללמוד טכנולוגיות חדשות. אתה מתאים במיוחד לתחומים שמאפשרים עבודה עצמאית עם מעט לחץ חברתי.",
  strengths: [
    "חשיבה לוגית ופתרון בעיות",
    "ריכוז במשימות מובנות",
    "למידה עצמאית של טכנולוגיות",
  ],
  challenges: [
    "עבודה בסביבה רועשת",
    "לחץ של דדליינים צפופים",
  ],
  recommendations: [
    "בדיקות תוכנה (QA)",
    "הזנת נתונים",
    "פיתוח תוכנה",
    "עיצוב UX",
  ],
  created_at: "2025-02-10T14:30:00Z",
};

export const mockAssessmentResultResponse = {
  summary: mockAssessmentResult.summary,
  strengths: mockAssessmentResult.strengths,
  challenges: mockAssessmentResult.challenges,
  recommendations: mockAssessmentResult.recommendations,
};
