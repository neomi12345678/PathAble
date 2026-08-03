import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/data/auth";
import {
  getProfessionByIdFromDb,
  setSavedProfessionInDb,
} from "@/lib/data/catalog";
import { awardBadge, BADGES } from "@/lib/data/achievements";
import { logger } from "@/lib/logger";
import { professionIdSchema } from "@/utils/validation";

const bodySchema = z.object({
  professionId: professionIdSchema,
  saved: z.boolean(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
        { status: 400 }
      );
    }

    const { professionId, saved } = parsed.data;

    const profession = await getProfessionByIdFromDb(professionId);
    if (!profession) {
      return NextResponse.json({ error: "מקצוע לא נמצא" }, { status: 404 });
    }

    await setSavedProfessionInDb(user.id, professionId, saved);

    if (saved) {
      await awardBadge(user.id, BADGES.savedProfession);
    }

    return NextResponse.json({ ok: true, saved });
  } catch (error) {
    logger.error("Save profession failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה בשמירת המקצוע" }, { status: 500 });
  }
}
