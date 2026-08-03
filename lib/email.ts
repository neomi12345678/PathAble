import { APP_NAME } from "@/utils/texts";
import { getResendClient } from "@/lib/resend";
import { logger } from "@/lib/logger";

function getFromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!raw) return "onboarding@resend.dev";

  // Allow pasting "Name <email@domain.com>" in env — extract email only.
  const bracketMatch = raw.match(/<([^>]+)>/);
  if (bracketMatch?.[1]) return bracketMatch[1].trim();

  return raw;
}

function buildWelcomeHtml(greetingName: string, appUrl: string): string {
  const preheader =
    "החשבון שלך מוכן — השלב הבא: היכרות קצרה והמלצות מותאמות אישית";

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#eef6fb;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#eef6fb;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef6fb;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header / Hero -->
          <tr>
            <td style="background:linear-gradient(135deg,#0284c7 0%,#0369a1 60%,#075985 100%);border-radius:24px 24px 0 0;padding:44px 40px 36px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:999px;padding:10px 22px;margin-bottom:18px;">
                <span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">
                  ✨ ${APP_NAME}
                </span>
              </div>
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:30px;line-height:1.3;color:#ffffff;font-weight:800;">
                ברוכים הבאים!
              </h1>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#bae6fd;">
                הכוונה תעסוקתית מותאמת אישית — בדיוק בשבילך
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;text-align:right;">
              <h2 style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:22px;color:#0f172a;font-weight:800;">
                ${greetingName}
              </h2>
              <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#334155;">
                שמחים שהצטרפת ל-${APP_NAME}! החשבון שלך מוכן, ומחכה לך מסע אישי
                למציאת הקריירה שמתאימה בדיוק לך — לפי החוזקות, ההעדפות והקצב שלך.
              </p>

              <!-- Steps -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#f0f9ff;border-radius:16px;padding:20px 24px;">
                    <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;color:#0284c7;letter-spacing:0.3px;">
                      מה עושים עכשיו? 3 צעדים פשוטים:
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#334155;text-align:right;">
                          <span style="display:inline-block;width:26px;height:26px;line-height:26px;background:#0284c7;color:#fff;border-radius:50%;text-align:center;font-weight:bold;font-size:13px;margin-left:10px;">1</span>
                          משלימים היכרות קצרה — כמה שאלות עליך
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#334155;text-align:right;">
                          <span style="display:inline-block;width:26px;height:26px;line-height:26px;background:#0284c7;color:#fff;border-radius:50%;text-align:center;font-weight:bold;font-size:13px;margin-left:10px;">2</span>
                          עוברים אבחון תעסוקתי קצר ומותאם
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#334155;text-align:right;">
                          <span style="display:inline-block;width:26px;height:26px;line-height:26px;background:#0284c7;color:#fff;border-radius:50%;text-align:center;font-weight:bold;font-size:13px;margin-left:10px;">3</span>
                          מקבלים המלצות אישיות: מקצועות, מיומנויות ומשרות
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:4px 0 8px;">
                    <a href="${appUrl}/dashboard"
                       style="display:inline-block;background:#f9bd22;color:#1e293b;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:14px;">
                      כניסה למערכת ←
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#64748b;text-align:center;">
                יש שאלה? אפשר פשוט להשיב למייל הזה ונשמח לעזור 💙
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-radius:0 0 24px 24px;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#94a3b8;">
                ${APP_NAME} — הכוונה תעסוקתית מותאמת אישית
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#cbd5e1;">
                אם לא נרשמת ל-${APP_NAME}, אפשר להתעלם מהודעה זו בבטחה.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeText(greetingName: string, appUrl: string): string {
  return [
    greetingName,
    "",
    `שמחים שהצטרפת ל-${APP_NAME} — פלטפורמת ההכוונה התעסוקתית שלך.`,
    "",
    "מה עושים עכשיו?",
    "1. משלימים היכרות קצרה",
    "2. עוברים אבחון תעסוקתי קצר",
    "3. מקבלים המלצות אישיות: מקצועות, מיומנויות ומשרות",
    "",
    `כניסה למערכת: ${appUrl}/dashboard`,
    "",
    `אם לא נרשמת ל-${APP_NAME}, אפשר להתעלם מהודעה זו.`,
  ].join("\n");
}

export async function sendWelcomeEmail(
  to: string,
  firstName?: string
): Promise<{ sent: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    const message = "RESEND_API_KEY is not configured";
    logger.warn("Welcome email skipped", { message });
    return { sent: false, error: message };
  }

  const greetingName = firstName?.trim()
    ? `שלום ${firstName.trim()},`
    : "שלום,";
  const toAddress = to.trim().toLowerCase();
  const fromAddress = getFromAddress();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

  const result = await resend.emails.send({
    from: `${APP_NAME} | PathAble <${fromAddress}>`,
    to: toAddress,
    subject: `החשבון שלך ב-${APP_NAME} מוכן 🎉`,
    html: buildWelcomeHtml(greetingName, appUrl),
    text: buildWelcomeText(greetingName, appUrl),
  });

  if (result.error) {
    logger.error("Welcome email failed", {
      error: result.error.message,
      to: toAddress,
      from: fromAddress,
    });
    return { sent: false, error: result.error.message };
  }

  return { sent: true };
}
