import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/data/auth";
import { getJobByIdFromDb, setSavedJobInDb } from "@/lib/data/catalog";
import { logger } from "@/lib/logger";
import { jobIdSchema } from "@/utils/validation";

const bodySchema = z.object({
  jobId: jobIdSchema,
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

    const { jobId, saved } = parsed.data;

    const job = await getJobByIdFromDb(jobId);
    if (!job) {
      return NextResponse.json({ error: "משרה לא נמצאה" }, { status: 404 });
    }

    await setSavedJobInDb(user.id, jobId, saved);

    return NextResponse.json({ ok: true, saved });
  } catch (error) {
    logger.error("Save job failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה בשמירת המשרה" }, { status: 500 });
  }
}
