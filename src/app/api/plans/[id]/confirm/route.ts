import { NextResponse } from "next/server";
import { confirmPlan } from "@/lib/plans/confirmPlan";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await confirmPlan(id);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, violation: result.violation },
      { status: result.status },
    );
  }

  return NextResponse.json({
    plan: result.plan,
    mock: result.mock,
  });
}
