import { NextResponse } from "next/server";
import { reconcilePlansWithMoove } from "@/lib/moove/reconcile";
import { mooveMockEnabled } from "@/lib/moove/client";

export async function POST() {
  if (mooveMockEnabled()) {
    const store = await import("@/lib/db/store").then((m) => m.getStore());
    return NextResponse.json({
      mock: true,
      mooveLinksFetched: 0,
      plansUpdated: 0,
      plans: store.plans,
    });
  }

  try {
    const summary = await reconcilePlansWithMoove();
    return NextResponse.json(summary);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Reconcile failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
