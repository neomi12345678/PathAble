import { NextResponse } from "next/server";
import { submitAssessment } from "@/lib/data";
import { mapAssessmentError } from "@/lib/data/assessment";
import { getAuthUser } from "@/lib/data/auth";
import { logger } from "@/lib/logger";
import { assessmentSubmitSchema, parseBody } from "@/utils/validation";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "לא מחובר — התחבר מחדש" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = parseBody(assessmentSubmitSchema, body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await submitAssessment(parsed.data.answers);
    return NextResponse.json({ data: result });
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    logger.error("Assessment submit failed", { error: raw });
    return NextResponse.json(
      { error: mapAssessmentError(raw) },
      { status: 500 }
    );
  }
}
