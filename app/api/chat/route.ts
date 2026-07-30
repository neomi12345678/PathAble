import { NextResponse } from "next/server";
import { getChatMessages, sendChatMessage } from "@/lib/data";
import { getAuthUser } from "@/lib/data/auth";
import { logger } from "@/lib/logger";
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

    const response = await sendChatMessage(parsed.data.message);
    return NextResponse.json({ data: response });
  } catch (error) {
    logger.error("Chat send failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה פנימית" }, { status: 500 });
  }
}
