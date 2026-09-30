"use client";

import type { PaymentPlan } from "@/lib/db/types";

interface PlanConfirmCardProps {
  plan: PaymentPlan;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PlanConfirmCard({
  plan,
  busy,
  onConfirm,
  onCancel,
}: PlanConfirmCardProps) {
  const scheduleLabel =
    plan.schedule === "monthly" && plan.dayOfMonth
      ? `Monthly on day ${plan.dayOfMonth}`
      : "One-time";

  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-accent-secondary">
        Payment plan
      </p>
      <p className="mt-2 text-lg font-semibold text-text">
        ${plan.amountUsd}{" "}
        <span className="text-text-muted">→</span> @{plan.beneficiaryHandle}
      </p>
      <p className="mt-1 text-sm text-text-muted">{scheduleLabel}</p>

      {plan.status === "awaiting_payment" && plan.mooveCheckoutUrl ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-semantic-success">
            Link created — payer completes checkout on Moove.
          </p>
          <a
            href={plan.mooveCheckoutUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-sm font-medium text-accent-secondary underline-offset-2 hover:underline"
          >
            Open Moove checkout
          </a>
        </div>
      ) : null}

      {plan.status === "settled" ? (
        <p className="mt-4 text-sm text-semantic-success">
          Settled
          {plan.sourceTransaction
            ? ` · tx ${plan.sourceTransaction.slice(0, 10)}…`
            : ""}
        </p>
      ) : null}

      {plan.status === "policy_blocked" && plan.policyMessage ? (
        <p className="mt-4 text-sm text-semantic-error">{plan.policyMessage}</p>
      ) : null}

      {plan.status === "draft" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-hover disabled:opacity-50"
          >
            Confirm & create link
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : null}

      {plan.status === "cancelled" ? (
        <p className="mt-4 text-sm text-text-muted">Cancelled.</p>
      ) : null}
    </div>
  );
}
