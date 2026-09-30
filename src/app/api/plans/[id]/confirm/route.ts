import { NextResponse } from "next/server";
import { createPaymentLink, mooveMockEnabled } from "@/lib/moove/client";
import { getPlan, getStore, saveStore, updatePlan } from "@/lib/db/store";
import { applySpend, checkPolicy } from "@/lib/policy/checkPolicy";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }
  if (plan.status !== "draft" && plan.status !== "policy_blocked") {
    return NextResponse.json(
      { error: `Plan is already ${plan.status}` },
      { status: 409 },
    );
  }

  const store = await getStore();
  const policyCheck = checkPolicy(
    store.policy,
    store.usage,
    plan.amountUsd,
    plan.beneficiaryHandle,
  );

  if (!policyCheck.ok) {
    await updatePlan(id, {
      status: "policy_blocked",
      policyMessage: policyCheck.message,
    });
    return NextResponse.json(
      { error: policyCheck.message, violation: policyCheck.violation },
      { status: 403 },
    );
  }

  const configuredHandle =
    process.env.BENEFICIARY_HANDLE?.trim().toLowerCase() ?? "";
  if (
    configuredHandle &&
    plan.beneficiaryHandle.toLowerCase() !== configuredHandle
  ) {
    return NextResponse.json(
      {
        error: `This demo key is tied to @${configuredHandle}. Intent was @${plan.beneficiaryHandle}.`,
      },
      { status: 422 },
    );
  }

  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 14);

  try {
    const link = await createPaymentLink({
      toAmount: plan.amountUsd,
      description: `homeward:${plan.id}:@${plan.beneficiaryHandle}`,
      maxUsage: 1,
      expirationDate: expiration.toISOString(),
    });

    store.usage = applySpend(store.usage, plan.amountUsd);
    await saveStore(store);

    const updated = await updatePlan(id, {
      status: "awaiting_payment",
      moovePaymentLinkId: link.id,
      mooveCheckoutUrl: link.url,
      policyMessage: undefined,
    });

    return NextResponse.json({
      plan: updated,
      mock: mooveMockEnabled(),
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to create payment link";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
