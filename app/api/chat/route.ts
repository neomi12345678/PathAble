import { NextResponse } from "next/server";
import { getChatMessages, sendChatMessage } from "@/lib/data";
import { getAuthUser } from "@/lib/data/auth";
import { awardBadge, BADGES } from "@/lib/data/achievements";
import { logger } from "@/lib/logger";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { chatMessageSchema, parseBody } from "@/utils/validation";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    const messages = await getChatMessages();
    return NextResponse.json({ data: messages });
  } catch (error) {
    logger.error("Chat fetch failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה פנימית" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = parseBody(chatMessageSchema, body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const rate = checkRateLimit(`chat:${user.id}`, 30, 60 * 60_000);
    if (!rate.ok) return rateLimitResponse(rate.retryAfterSec);

    const response = await sendChatMessage(parsed.data.message);
    await awardBadge(user.id, BADGES.firstChat);
    return NextResponse.json({ data: response });
  } catch (error) {
    logger.error("Chat send failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה פנימית" }, { status: 500 });
  }
}
