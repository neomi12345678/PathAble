import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { APP_NAME, FOOTER } from "@/utils/texts";

export const metadata: Metadata = {
  title: `הצהרת נגישות | ${APP_NAME}`,
  description: `הצהרת הנגישות של ${APP_NAME}`,
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="הצהרת נגישות">
      <p>
        {APP_NAME} פועל/ת להנגשת השירות לאנשים עם מוגבלות, בהתאם לעקרונות
        WCAG 2.1 ברמה AA, ככל הניתן.
      </p>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          מה בוצע
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>ממשק בעברית עם כיוון RTL.</li>
          <li>ניגודיות צבעים מותאמת לקריאה.</li>
          <li>ניווט מקלדת בטפסים ובקישורים עיקריים.</li>
          <li>תיאורי alt לתמונות מרכזיות.</li>
          <li>מבנה כותרות היררכי בדפים.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          שיפורים מתוכננים
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>בדיקת נגישות אוטומטית ב-CI.</li>
          <li>תמיכה מלאה בקוראי מסך בכל רכיבי ה-UI.</li>
          <li>מצב ניגודיות גבוהה.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          פניות בנושא נגישות
        </h2>
        <p>
          נתקלת בבעיית נגישות? נשמח לעזור:{" "}
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
