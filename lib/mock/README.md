# Mock Data – עתיד מתאים

כל הנתונים במערכת מגיעים מקבצים אלו. אין צורך ב-Supabase או OpenAI.

## מבנה

| קובץ | תוכן |
|------|------|
| `profile.ts` | משתמש דמו (דני כהן) |
| `professions.ts` | 15 מקצועות |
| `jobs.ts` | 10 משרות |
| `questions.ts` | 20 שאלות אבחון ב-8 קטגוריות |
| `assessment.ts` | תוצאות אבחון לדוגמה |
| `learning.ts` | 12 מודולי למידה |
| `skills.ts` | 8 מיומנויות |
| `chat.ts` | הודעות ותשובות צ'אט |
| `achievements.ts` | 5 תגי הישגים |
| `rights.ts` | זכויות, FAQ, גופים מסייעים |
| `user-data.ts` | מקצועות שמורים + התקדמות |
| `api.ts` | פונקציות אסינכרוניות עם delay |
| `schema.sql` | סכמת DB לייחוס (לעתיד) |

## שימוש

```typescript
import { getMockProfessions } from "@/lib/mock/api";

const professions = await getMockProfessions();
```

## מעבר לפרודקשן

1. הריצי `schema.sql` ב-Supabase
2. החליפי קריאות מ-`lib/mock/api` ב-`lib/supabase.ts`
3. הוסיפי מפתחות ב-`.env.local`
