import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { APP_NAME, FOOTER } from "@/utils/texts";

export const metadata: Metadata = {
  title: `תנאי שימוש | ${APP_NAME}`,
  description: `תנאי השימוש של ${APP_NAME}`,
};

export default function TermsPage() {
  return (
    <LegalPage title="תנאי שימוש">
      <p>
        השימוש ב-{APP_NAME} מהווה הסכמה לתנאים אלו. אם אינך מסכים/ה — אל תשתמש/י
        בשירות.
      </p>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          השירות
        </h2>
        <p>
          {APP_NAME} מספק/ת כלי הכוונה תעסוקתית, מידע על זכויות, המלצות AI
          ותוכן לימודי. המידע אינו מהווה ייעוץ משפטי, רפואי או תעסוקתי מחייב.
        </p>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          חשבון משתמש
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>עליך לספק פרטים נכונים בעת ההרשמה.</li>
          <li>את/ה אחראי/ת לשמירה על סיסמתך.</li>
          <li>אסור להשתמש בשירות לצורך בלתי חוקי או פוגע.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          קניין רוחני
        </h2>
        <p>
          התוכן, העיצוב והקוד של {APP_NAME} מוגנים בזכויות יוצרים. אין להעתיק
          או להפיץ ללא אישור.
        </p>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-on-surface">
          יצירת קשר
        </h2>
        <p>
          שאלות בנוגע לתנאים:{" "}
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
