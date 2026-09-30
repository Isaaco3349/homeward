import type { PaymentPlan } from "@/lib/db/types";
import { getCurrentMonthKey } from "./checkPolicy";

/** Unpaid links reserve cap headroom until settled or cancelled. */
export function reservedUsdThisMonth(plans: PaymentPlan[]): number {
  const month = getCurrentMonthKey();
  return plans
    .filter((p) => {
      if (p.status !== "awaiting_payment") return false;
      return p.updatedAt.slice(0, 7) === month;
    })
    .reduce((sum, p) => sum + Number.parseFloat(p.amountUsd), 0);
}
