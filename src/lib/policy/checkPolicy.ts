import type { SpendPolicy, PolicyUsage } from "./types";

export type PolicyViolation =
  | "handle_not_allowed"
  | "per_transfer_exceeded"
  | "monthly_cap_exceeded";

export interface PolicyCheckResult {
  ok: boolean;
  violation?: PolicyViolation;
  message?: string;
}

function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getCurrentMonthKey(): string {
  return monthKey();
}

export function checkPolicy(
  policy: SpendPolicy,
  usage: PolicyUsage,
  amountUsd: string,
  beneficiaryHandle: string,
): PolicyCheckResult {
  const handle = beneficiaryHandle.toLowerCase();
  const allowed = policy.allowedHandles.map((h) => h.toLowerCase());
  if (!allowed.includes(handle)) {
    return {
      ok: false,
      violation: "handle_not_allowed",
      message: `@${handle} is not on your allowed beneficiaries list.`,
    };
  }

  const amount = Number.parseFloat(amountUsd);
  if (amount > policy.perTransferMaxUsd) {
    return {
      ok: false,
      violation: "per_transfer_exceeded",
      message: `Amount exceeds per-transfer limit ($${policy.perTransferMaxUsd}).`,
    };
  }

  const currentKey = monthKey();
  const spent =
    usage.monthKey === currentKey ? usage.spentUsd : 0;
  if (spent + amount > policy.monthlyCapUsd) {
    return {
      ok: false,
      violation: "monthly_cap_exceeded",
      message: `Would exceed monthly cap ($${policy.monthlyCapUsd}).`,
    };
  }

  return { ok: true };
}

export function applySpend(
  usage: PolicyUsage,
  amountUsd: string,
): PolicyUsage {
  const amount = Number.parseFloat(amountUsd);
  const key = monthKey();
  if (usage.monthKey !== key) {
    return { monthKey: key, spentUsd: amount };
  }
  return { monthKey: key, spentUsd: usage.spentUsd + amount };
}
