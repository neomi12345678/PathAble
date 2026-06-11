import type { ChatMessage } from "@/types";
import { DEMO_SESSION_ID } from "./constants";

export const CHAT_SHORTCUTS = [
  "איזה מקצוע מתאים לי?",
  "איך להתכונן לראיון?",
  "מה הזכויות שלי?",
] as const;

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg-001",
    session_id: DEMO_SESSION_ID,
    role: "assistant",
    message:
      "שלום דני! אני יועץ הקריירה שלך בעתיד מתאים. איך אוכל לעזור לך היום?",
    created_at: "2025-03-01T10:00:00Z",
  },
  {
    id: "msg-002",
    session_id: DEMO_SESSION_ID,
    role: "user",
    message: "איזה מקצוע מתאים לי?",
    created_at: "2025-03-01T10:01:00Z",
  },
  {
    id: "msg-003",
    session_id: DEMO_SESSION_ID,
    role: "assistant",
    message:
      "לפי תוצאות האבחון שלך, מקצועות כמו בדיקות תוכנה (QA), הזנת נתונים ועיצוב UX מתאימים במיוחד. הם מאפשרים עבודה מובנית, ריכוז ולמידה עצמאית. רוצה שאפרט על אחד מהם?",
    created_at: "2025-03-01T10:01:30Z",
  },
];

export const mockChatResponses: Record<string, string> = {
  "איזה מקצוע מתאים לי?":
    "לפי האבחון שלך, אני ממליץ על QA, הזנת נתונים, פיתוח תוכנה ועיצוב UX. כולם מתאימים לחוזקות שלך בחשיבה לוגית ועבודה עצמאית.",
  "איך להתכונן לראיון?":
    "הכן תשובות לשאלות נפוצות, תרגל מול מישהו שאתה סומך עליו, והכן דוגמאות מהניסיון שלך. יש לנו מודול 'הכנה לראיון' במרכז הלמידה!",
  "מה הזכויות שלי?":
    "לפי חוק שוויון זכויות, מעסיקים חייבים לספק התאמות סבירות. ביטוח לאומי מציע שיקום מקצועי. פרטים נוספים בדף הזכויות.",
};

export const DEFAULT_CHAT_RESPONSE =
  "תודה על השאלה! אני כאן לעזור בנושאי קריירה, למידה, ראיונות וזכויות. איך אוכל לסייע?";
