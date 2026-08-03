import { getResendClient } from "@/lib/resend";
import { APP_NAME } from "@/utils/texts";
import { logger } from "@/lib/logger";

function getFromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!raw) return "onboarding@resend.dev";
  const bracketMatch = raw.match(/<([^>]+)>/);
  if (bracketMatch?.[1]) return bracketMatch[1].trim();
  return raw;
}

function getAlertRecipient(): string | null {
  const admin = process.env.ADMIN_ALERT_EMAIL?.trim();
  if (admin) return admin;
  return process.env.RESEND_FROM_EMAIL?.trim() ?? null;
}

export async function sendJobSyncAlertEmail(
  kind: string,
  detail: string
): Promise<void> {
  const to = getAlertRecipient();
  if (!to) {
    logger.warn("Job sync alert (no ADMIN_ALERT_EMAIL)", { kind, detail });
    return;
  }

  const resend = getResendClient();
  if (!resend) {
    logger.warn("Job sync alert (no Resend)", { kind, detail });
    return;
  }

  const subject =
    kind === "consecutive_failures"
      ? `[${APP_NAME}] כשל חוזר בסנכron משרות`
      : `[${APP_NAME}] אין משרות חדשות מ-24 שעות`;

  const result = await resend.emails.send({
    from: `${APP_NAME} Alerts <${getFromAddress()}>`,
    to,
    subject,
    text: [`התראת סנכron משרות — ${APP_NAME}`, "", detail, "", new Date().toISOString()].join(
      "\n"
    ),
  });

  if (result.error) {
    logger.error("Job sync alert email failed", { error: result.error.message });
  }
}
