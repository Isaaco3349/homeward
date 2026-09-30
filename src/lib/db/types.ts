import type { ScheduleKind } from "@/lib/intent/parseRemittanceIntent";

export type PlanStatus =
  | "draft"
  | "awaiting_payment"
  | "settled"
  | "cancelled"
  | "policy_blocked";

export interface PaymentPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  amountUsd: string;
  beneficiaryHandle: string;
  schedule: ScheduleKind;
  dayOfMonth?: number;
  status: PlanStatus;
  moovePaymentLinkId?: string;
  mooveCheckoutUrl?: string;
  policyMessage?: string;
  sourceTransaction?: string;
}

export interface HomewardStore {
  policy: import("@/lib/policy/types").SpendPolicy;
  usage: import("@/lib/policy/types").PolicyUsage;
  plans: PaymentPlan[];
  processedWebhookEventIds: string[];
}
