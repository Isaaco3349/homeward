import { createPaymentLink } from "@/lib/moove/client";
import type { PaymentPlan } from "@/lib/db/types";

export async function createPaymentLinkForPlan(plan: PaymentPlan) {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 14);

  return createPaymentLink({
    toAmount: plan.amountUsd,
    description: `homeward:${plan.id}:@${plan.beneficiaryHandle}`,
    maxUsage: 1,
    expirationDate: expiration.toISOString(),
  });
}
