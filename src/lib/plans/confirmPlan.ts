import { getPlan, getStore, saveStore, updatePlan } from "@/lib/db/store";
import type { PaymentPlan, RecurringSchedule } from "@/lib/db/types";
import { mooveMockEnabled } from "@/lib/moove/client";
import { checkPolicy } from "@/lib/policy/checkPolicy";
import { reservedUsdThisMonth } from "@/lib/policy/reserved";
import { createPaymentLinkForPlan } from "./createPaymentLinkForPlan";

export type ConfirmPlanResult =
  | { ok: true; plan: PaymentPlan; mock: boolean }
  | { ok: false; status: number; error: string; violation?: string };

export async function confirmPlan(planId: string): Promise<ConfirmPlanResult> {
  const plan = await getPlan(planId);
  if (!plan) {
    return { ok: false, status: 404, error: "Plan not found" };
  }
  if (plan.status !== "draft" && plan.status !== "policy_blocked") {
    return {
      ok: false,
      status: 409,
      error: `Plan is already ${plan.status}`,
    };
  }

  const store = await getStore();
  const reserved = reservedUsdThisMonth(store.plans);
  const policyCheck = checkPolicy(
    store.policy,
    store.usage,
    plan.amountUsd,
    plan.beneficiaryHandle,
    reserved,
  );

  if (!policyCheck.ok) {
    await updatePlan(planId, {
      status: "policy_blocked",
      policyMessage: policyCheck.message,
    });
    return {
      ok: false,
      status: 403,
      error: policyCheck.message ?? "Policy blocked",
      violation: policyCheck.violation,
    };
  }

  const configuredHandle =
    process.env.BENEFICIARY_HANDLE?.trim().toLowerCase() ?? "";
  if (
    configuredHandle &&
    plan.beneficiaryHandle.toLowerCase() !== configuredHandle
  ) {
    return {
      ok: false,
      status: 422,
      error: `This demo key is tied to @${configuredHandle}. Intent was @${plan.beneficiaryHandle}.`,
    };
  }

  try {
    const link = await createPaymentLinkForPlan(plan);

    const updated = await updatePlan(planId, {
      status: "awaiting_payment",
      moovePaymentLinkId: link.id,
      mooveCheckoutUrl: link.url,
      policyMessage: undefined,
    });

    if (updated) await upsertScheduleFromPlan(updated);

    return { ok: true, plan: updated!, mock: mooveMockEnabled() };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to create payment link";
    return { ok: false, status: 502, error: message };
  }
}

async function upsertScheduleFromPlan(plan: PaymentPlan) {
  if (plan.schedule !== "monthly" || !plan.dayOfMonth) return;

  const store = await getStore();
  const handle = plan.beneficiaryHandle.toLowerCase();
  const existing = store.schedules.find(
    (s) =>
      s.active &&
      s.beneficiaryHandle === handle &&
      s.dayOfMonth === plan.dayOfMonth &&
      s.amountUsd === plan.amountUsd,
  );
  const today = new Date().toISOString().slice(0, 10);
  if (existing) {
    existing.lastGeneratedOn = today;
  } else {
    const schedule: RecurringSchedule = {
      id: crypto.randomUUID(),
      beneficiaryHandle: handle,
      amountUsd: plan.amountUsd,
      dayOfMonth: plan.dayOfMonth,
      active: true,
      createdAt: new Date().toISOString(),
      lastGeneratedOn: today,
    };
    store.schedules.push(schedule);
  }
  await saveStore(store);
}
