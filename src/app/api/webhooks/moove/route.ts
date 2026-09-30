import { NextResponse } from "next/server";
import { recordWebhookEventId, updatePlan } from "@/lib/db/store";
import type { MooveWebhookPayload } from "@/lib/moove/types";
import { verifyMooveWebhook } from "@/lib/moove/verifyWebhook";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get("Moove-Signature");
  const timestamp = req.headers.get("Moove-Timestamp");
  const eventId = req.headers.get("Moove-Event-Id");

  const secret = process.env.MOOVE_WEBHOOK_SECRET;
  if (secret && !verifyMooveWebhook(rawBody, signature, timestamp, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: MooveWebhookPayload;
  try {
    payload = JSON.parse(rawBody.toString("utf8")) as MooveWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (eventId) {
    const isNew = await recordWebhookEventId(eventId);
    if (!isNew) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  const linkId = payload.data?.paymentLinkId;
  if (!linkId) {
    return NextResponse.json({ ok: true });
  }

  if (payload.type === "payment_link.transaction.succeeded") {
    const homewardId = parseHomewardPlanId(payload.data.description);
    const sourceTx = payload.data.transaction?.sourceTransaction;
    if (homewardId) {
      await updatePlan(homewardId, {
        status: "settled",
        sourceTransaction: sourceTx,
      });
    }
  }

  if (payload.type === "payment_link.completed") {
    const homewardId = parseHomewardPlanId(payload.data.description);
    if (homewardId) {
      await updatePlan(homewardId, { status: "settled" });
    }
  }

  return NextResponse.json({ ok: true });
}

function parseHomewardPlanId(description?: string | null): string | null {
  if (!description) return null;
  const match = description.match(/^homeward:([^:]+):/);
  return match?.[1] ?? null;
}
