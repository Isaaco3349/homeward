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
  /** Set when webhook applied this plan to monthly usage. */
  usageAppliedAt?: string;
}

/** Server-side only — stored in .data/homeward.json (never commit). */
export interface BeneficiaryAccount {
  handle: string;
  mooveApiKey: string;
}

export interface RecurringSchedule {
  id: string;
  beneficiaryHandle: string;
  amountUsd: string;
  dayOfMonth: number;
  active: boolean;
  createdAt: string;
  /** Last calendar day (UTC) a link was generated, YYYY-MM-DD */
  lastGeneratedOn?: string;
}

export interface HomewardStore {
  policy: import("@/lib/policy/types").SpendPolicy;
  usage: import("@/lib/policy/types").PolicyUsage;
  plans: PaymentPlan[];
  beneficiaries: BeneficiaryAccount[];
  schedules: RecurringSchedule[];
  processedWebhookEventIds: string[];
}
