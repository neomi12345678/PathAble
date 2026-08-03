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

  const greeting = firstName?.trim() ? `שלום ${firstName.trim()},` : "שלום,";
  const toAddress = to.trim().toLowerCase();
  const fromAddress = getFromAddress();

  // Temporary debug: warn level so it shows in Vercel production logs
  logger.warn("Resend send attempt", {
    from: `PathAble <${fromAddress}>`,
    to: toAddress,
  });

  const result = await resend.emails.send({
    from: `PathAble <${fromAddress}>`,
    to: toAddress,
    subject: `ברוכים הבאים ל-${APP_NAME}`,
    html: `
      <div dir="rtl" style="font-family: Heebo, Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <h1 style="color: #0284c7;">${greeting}</h1>
        <p>שמחים שהצטרפת ל-${APP_NAME} — פלטפורמת ההכוונה התעסוקתית שלך.</p>
        <p>השלב הבא: השלם/י את תהליך ההיכרות, בצע/י אבחון קצר, וקבל/י המלצות מותאמות אישית למסלולי קריירה, מיומנויות ומשרות.</p>
        <p style="margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard"
             style="background:#0284c7;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;">
            כניסה לדשבורד
          </a>
        </p>
        <p style="margin-top: 32px; font-size: 14px; color: #64748b;">
          אם לא נרשמת ל-${APP_NAME}, ניתן להתעלם מהודעה זו.
        </p>
      </div>
    `,
  });

  if (result.error) {
    logger.error("Welcome email failed", {
      response: JSON.stringify(result),
      to: toAddress,
      from: fromAddress,
    });
    return { sent: false, error: result.error.message };
  }

  logger.warn("Welcome email sent", { id: result.data?.id, to: toAddress });
  return { sent: true };
}
