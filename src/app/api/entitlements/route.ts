import { NextResponse } from "next/server";
import type { PlanId } from "@/lib/builder/planRules";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId =
    url.searchParams.get("session_id") ??
    url.searchParams.get("sessionId") ??
    "";

  if (!sessionId) {
    return NextResponse.json({ active: false });
  }

  let supabase;
  try {
    supabase = getSupabaseServiceClient();
  } catch (error) {
    return NextResponse.json(
      {
        error: "missing_service_key",
        message:
          error instanceof Error ? error.message : "Service key missing.",
      },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("entitlements")
    .select("plan, status, session_id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error || !data || data.status !== "active") {
    return NextResponse.json({ active: false });
  }

  return NextResponse.json({
    active: true,
    plan: data.plan as PlanId,
    sessionId: data.session_id,
  });
}
