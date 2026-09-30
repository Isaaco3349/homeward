import { NextResponse } from "next/server";
import { getPlan, updatePlan } from "@/lib/db/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }
  if (plan.status === "settled") {
    return NextResponse.json({ error: "Plan already settled" }, { status: 409 });
  }

  const updated = await updatePlan(id, { status: "cancelled" });
  return NextResponse.json({ plan: updated });
}
