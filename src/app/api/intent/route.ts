import { NextResponse } from "next/server";
import { addPlan } from "@/lib/db/store";
import type { PaymentPlan } from "@/lib/db/types";
import { parseRemittanceIntent } from "@/lib/intent/parseRemittanceIntent";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string };
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const parsed = parseRemittanceIntent(text);
    const now = new Date().toISOString();
    const plan: PaymentPlan = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      amountUsd: parsed.amountUsd,
      beneficiaryHandle: parsed.beneficiaryHandle,
      schedule: parsed.schedule,
      dayOfMonth: parsed.dayOfMonth,
      status: "draft",
    };

    await addPlan(plan);

    return NextResponse.json({ plan, parsedText: parsed.rawText });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid intent";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
