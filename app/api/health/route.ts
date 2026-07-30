import { NextResponse } from "next/server";
import { getSupabaseHealthStatus } from "@/lib/supabase/health";

export async function GET(): Promise<NextResponse> {
  const status = await getSupabaseHealthStatus();
  const ok =
    status.connected &&
    status.tablesReady &&
    status.error === null;

  return NextResponse.json(
    {
      ok,
      ...status,
    },
    { status: ok ? 200 : status.configured ? 503 : 200 }
  );
}
