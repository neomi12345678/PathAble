import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ data: { success: true } });
  const supabase = await createRouteHandlerClient(response);
  await supabase.auth.signOut();
  response.cookies.delete("pathable_onboarded");
  return response;
}

export async function GET(request: Request): Promise<NextResponse> {
  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/auth/register";
  const path = next.startsWith("/") ? next : `/${next}`;
  const response = NextResponse.redirect(new URL(path, origin));
  const supabase = await createRouteHandlerClient(response);
  await supabase.auth.signOut();
  response.cookies.delete("pathable_onboarded");
  return response;
}
