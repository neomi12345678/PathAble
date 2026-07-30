import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { APP_NAME, FOOTER } from "@/utils/texts";

export const metadata: Metadata = {
  title: `מדיניות פרטיות | ${APP_NAME}`,
  description: `מדיניות הפרטיות של ${APP_NAME}`,
};

export default function PrivacyPage() {
  return (
    <LegalPage title="מדיניות פרטיות">
      <p>
        {APP_NAME} מכבד/ת את פרטיות המשתמשים. מסמך זה מתאר אילו נתונים נאספים,
        כיצד הם משמשים, ומהן זכויותיך.
      </p>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          אילו נתונים נאספים
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>פרטי הרשמה: שם, כתובת אימייל, סיסמה (מוצפנת).</li>
          <li>פרטי פרופיל: גיל, עיר, מגזר, סוג מוגבלות, העדפות תעסוקה.</li>
          <li>נתוני שימוש: תוצאות אבחון, התקדמות בלמידה, הודעות בצ&apos;at.</li>
          <li>נתונים טכניים: עוגיות session לצורך התחברות מאובטחת.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          מטרות השימוש
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>מתן שירותי הכוונה תעסוקתית מותאמים אישית.</li>
          <li>שיפור חוויית המשתמש והמלצות AI.</li>
          <li>שליחת הודעות שירות (ברוכים הבאים, איפוס סיסמה).</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          שיתוף עם צד שלישי
        </h2>
        <p>
          אנו משתמשים בספקים מהימנים: Supabase (מסד נתונים ואימות), Vercel
          (אחסון), Resend (דוא&quot;ל), OpenAI (יועץ AI). הנתונים אינם נמכרים
          לגורמים חיצוניים.
        </p>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          זכויותיך
        </h2>
        <p>
          ניתן לפנות אלינו לעדכון, מחיקה או העתקת הנתונים שלך. לפניות:{" "}
          <a
            href={`mailto:${FOOTER.contactEmail}`}
            className="font-bold text-primary hover:underline"
          >
            {FOOTER.contactEmail}
          </a>
        </p>
      </section>

      <p className="text-sm text-outline">עודכן לאחרונה: יולי 2026</p>
    </LegalPage>
  );
}
