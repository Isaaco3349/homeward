import { addPlan, getStore, saveStore } from "@/lib/db/store";
import type { PaymentPlan } from "@/lib/db/types";
import { confirmPlan } from "@/lib/plans/confirmPlan";

export interface DueRunResult {
  checked: number;
  created: number;
  planIds: string[];
  errors: string[];
}

export async function runDueSchedules(now = new Date()): Promise<DueRunResult> {
  const store = await getStore();
  const utcDay = now.getUTCDate();
  const today = now.toISOString().slice(0, 10);
  const result: DueRunResult = {
    checked: 0,
    created: 0,
    planIds: [],
    errors: [],
  };

  for (const schedule of store.schedules) {
    if (!schedule.active) continue;
    result.checked += 1;
    if (schedule.dayOfMonth !== utcDay) continue;
    if (schedule.lastGeneratedOn === today) continue;

    const plan: PaymentPlan = {
      id: crypto.randomUUID(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      amountUsd: schedule.amountUsd,
      beneficiaryHandle: schedule.beneficiaryHandle,
      schedule: "monthly",
      dayOfMonth: schedule.dayOfMonth,
      status: "draft",
    };

    await addPlan(plan);
    const confirmed = await confirmPlan(plan.id);
    if (!confirmed.ok) {
      result.errors.push(`${schedule.id}: ${confirmed.error}`);
      continue;
    }

    schedule.lastGeneratedOn = today;
    result.created += 1;
    result.planIds.push(plan.id);
  }

  await saveStore(store);
  return result;
}
