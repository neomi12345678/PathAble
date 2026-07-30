import type { Question } from "@/types";

export const ASSESSMENT_CATEGORIES = [
  "תחומי עניין",
  "יכולות טכניות",
  "יכולות חברתיות",
  "סגנון עבודה",
  "רגישות סביבתית",
  "עצמאות ויוזמה",
  "ארגון ומיקוד",
  "יצירתיות",
] as const;

export const mockQuestions: Question[] = [
  { id: "q-001", title: "אני מתעניין/ת בטכנולוגיה ומחשבים", category: "תחומי עניין", weight: 1, active: true },
  { id: "q-002", title: "אני אוהב/ת לעבוד עם אנשים", category: "תחומי עניין", weight: 1, active: true },
  { id: "q-003", title: "יצירה ועיצוב מעניינים אותי", category: "תחומי עניין", weight: 1, active: true },
  { id: "q-004", title: "אני מסתדר/ת טוב עם מספרים ונתונים", category: "תחומי עניין", weight: 1, active: true },
  { id: "q-005", title: "אני יודע/ת להשתמש במחשב ברמה בסיסית", category: "יכולות טכניות", weight: 1, active: true },
  { id: "q-006", title: "אני לומד/ת טכנולוגיות חדשות בקלות", category: "יכולות טכניות", weight: 1, active: true },
  { id: "q-007", title: "אני מסוגל/ת לפתור בעיות טכניות", category: "יכולות טכניות", weight: 1, active: true },
  { id: "q-008", title: "אני מרגיש/ה בנוח לדבר מול קבוצה", category: "יכולות חברתיות", weight: 1, active: true },
  { id: "q-009", title: "אני יודע/ת להקשיב ולתמוך באחרים", category: "יכולות חברתיות", weight: 1, active: true },
  { id: "q-010", title: "אני מעדיף/ה לעבוד לבד", category: "סגנון עבודה", weight: 1, active: true },
  { id: "q-011", title: "אני נהנה/ית מעבודה בצוות", category: "סגנון עבודה", weight: 1, active: true },
  { id: "q-012", title: "רעש וסביבה רועשת מפריעים לי", category: "רגישות סביבתית", weight: 1, active: true },
  { id: "q-013", title: "לחץ ודדליינים מקשים עליי", category: "רגישות סביבתית", weight: 1, active: true },
  { id: "q-014", title: "אני יוזם/ת ומתחיל/ה משימות בעצמי", category: "עצמאות ויוזמה", weight: 1, active: true },
  { id: "q-015", title: "אני מסוגל/ת לעבוד בלי הנחיה צמודה", category: "עצמאות ויוזמה", weight: 1, active: true },
  { id: "q-016", title: "אני מארגן/ת את הזמן והמשימות שלי היטב", category: "ארגון ומיקוד", weight: 1, active: true },
  { id: "q-017", title: "אני שומר/ת על ריכוז לאורך זמן", category: "ארגון ומיקוד", weight: 1, active: true },
  { id: "q-018", title: "אני אוהב/ת לחשוב מחוץ לקופסה", category: "יצירתיות", weight: 1, active: true },
  { id: "q-019", title: "אני מגיע/ה לפתרונות יצירתיים לבעיות", category: "יצירתיות", weight: 1, active: true },
  { id: "q-020", title: "טבע וסביבה חיצונית מעניינים אותי", category: "תחומי עניין", weight: 1, active: true },
];
