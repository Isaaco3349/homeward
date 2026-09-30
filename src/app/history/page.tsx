"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import type { PaymentPlan, RecurringSchedule } from "@/lib/db/types";

function statusClass(status: PaymentPlan["status"]) {
  switch (status) {
    case "settled":
      return "text-semantic-success";
    case "awaiting_payment":
      return "text-semantic-warning";
    case "policy_blocked":
      return "text-semantic-error";
    default:
      return "text-text-muted";
  }
}

export default function HistoryPage() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [reconciling, setReconciling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/plans");
    const data = (await res.json()) as {
      plans: PaymentPlan[];
      schedules: RecurringSchedule[];
    };
    setPlans(data.plans ?? []);
    setSchedules(data.schedules ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function reconcile() {
    setReconciling(true);
    setMessage(null);
    try {
      const res = await fetch("/api/reconcile", { method: "POST" });
      const data = (await res.json()) as {
        plansUpdated?: number;
        mooveLinksFetched?: number;
        mock?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setMessage(data.error ?? "Reconcile failed");
        return;
      }
      await load();
      setMessage(
        data.mock
          ? "Mock mode — connect MOOVE_API_KEY to reconcile with Moove."
          : `Reconciled ${data.plansUpdated ?? 0} plan(s) from ${data.mooveLinksFetched ?? 0} Moove link(s).`,
      );
    } finally {
      setReconciling(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-text">Plans & links</h1>
          <button
            type="button"
            disabled={reconciling}
            onClick={() => void reconcile()}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text disabled:opacity-50"
          >
            {reconciling ? "Reconciling…" : "Reconcile with Moove"}
          </button>
        </div>
        {message ? (
          <p className="mt-2 text-sm text-accent-secondary">{message}</p>
        ) : null}

        {schedules.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-text-muted">
              Recurring (UTC)
            </h2>
            <ul className="mt-2 space-y-2">
              {schedules.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  ${s.amountUsd} → @{s.beneficiaryHandle} on day{" "}
                  {s.dayOfMonth}
                  {s.lastGeneratedOn
                    ? ` · last link ${s.lastGeneratedOn}`
                    : ""}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <ul className="mt-8 space-y-3">
          {plans.length === 0 ? (
            <li className="text-sm text-text-muted">No plans yet.</li>
          ) : (
            plans.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-border bg-surface p-4 text-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-text">
                    ${p.amountUsd} → @{p.beneficiaryHandle}
                  </span>
                  <span className={statusClass(p.status)}>{p.status}</span>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {p.schedule === "monthly" && p.dayOfMonth
                    ? `Monthly day ${p.dayOfMonth} · `
                    : ""}
                  {new Date(p.createdAt).toLocaleString()}
                </p>
                {p.mooveCheckoutUrl ? (
                  <a
                    href={p.mooveCheckoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-accent-secondary hover:underline"
                  >
                    Checkout link
                  </a>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}
