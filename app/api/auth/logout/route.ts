import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ data: { success: true } });
  const supabase = createRouteHandlerClient(response);
  await supabase.auth.signOut();
  return response;
}
