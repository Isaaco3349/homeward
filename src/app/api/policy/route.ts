import { NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/db/store";
import type { SpendPolicy } from "@/lib/policy/types";

export async function GET() {
  const store = await getStore();
  return NextResponse.json({
    policy: store.policy,
    usage: store.usage,
  });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Partial<SpendPolicy>;
  const store = await getStore();

  if (body.monthlyCapUsd != null) {
    if (body.monthlyCapUsd <= 0 || body.monthlyCapUsd > 100_000) {
      return NextResponse.json({ error: "Invalid monthlyCapUsd" }, { status: 422 });
    }
    store.policy.monthlyCapUsd = body.monthlyCapUsd;
  }
  if (body.perTransferMaxUsd != null) {
    if (body.perTransferMaxUsd <= 0 || body.perTransferMaxUsd > 50_000) {
      return NextResponse.json(
        { error: "Invalid perTransferMaxUsd" },
        { status: 422 },
      );
    }
    store.policy.perTransferMaxUsd = body.perTransferMaxUsd;
  }
  if (body.allowedHandles != null) {
    const handles = body.allowedHandles
      .map((h) => h.replace(/^@/, "").trim().toLowerCase())
      .filter(Boolean);
    if (handles.length === 0) {
      return NextResponse.json(
        { error: "At least one allowed handle required" },
        { status: 422 },
      );
    }
    store.policy.allowedHandles = handles;
  }

  await saveStore(store);
  return NextResponse.json({ policy: store.policy, usage: store.usage });
}
