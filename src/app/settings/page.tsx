"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import type { SpendPolicy } from "@/lib/policy/types";
import type { PolicyUsage } from "@/lib/policy/types";

type BeneficiaryRow = { handle: string; configured: boolean };

export default function SettingsPage() {
  const [policy, setPolicy] = useState<SpendPolicy | null>(null);
  const [usage, setUsage] = useState<PolicyUsage | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRow[]>([]);
  const [newHandle, setNewHandle] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingBeneficiary, setSavingBeneficiary] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function loadAll() {
    void fetch("/api/policy")
      .then((r) => r.json())
      .then((data: { policy: SpendPolicy; usage: PolicyUsage }) => {
        setPolicy(data.policy);
        setUsage(data.usage);
      });
    void fetch("/api/beneficiaries")
      .then((r) => r.json())
      .then((data: { beneficiaries: BeneficiaryRow[] }) => {
        setBeneficiaries(data.beneficiaries ?? []);
      });
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function save() {
    if (!policy) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Save failed");
        return;
      }
      setPolicy(data.policy);
      setUsage(data.usage);
      setMessage("Saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <h1 className="text-xl font-semibold text-text">Spend policy</h1>
        <p className="mt-2 text-sm text-text-muted">
          Caps apply before Homeward creates a Moove payment link. Unpaid links
          reserve headroom; monthly totals increment when Moove webhooks report
          settlement.
        </p>

        <section className="mt-8 rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-text">Beneficiaries</h2>
          <p className="mt-1 text-xs text-text-muted">
            Moove links always pay the <strong>API key owner</strong>. Add each
            @handle you send to with that person&apos;s Moove Receive API key
            (or use legacy <code className="text-accent-secondary">.env.local</code>{" "}
            for one handle only).
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {beneficiaries.length === 0 ? (
              <li className="text-text-muted">None saved yet.</li>
            ) : (
              beneficiaries.map((b) => (
                <li key={b.handle}>
                  @{b.handle}{" "}
                  <span className="text-semantic-success">· key saved</span>
                </li>
              ))
            )}
          </ul>
          <form
            className="mt-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              void (async () => {
                setSavingBeneficiary(true);
                setMessage(null);
                try {
                  const res = await fetch("/api/beneficiaries", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      handle: newHandle,
                      mooveApiKey: newApiKey,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setMessage(data.error ?? "Could not save beneficiary");
                    return;
                  }
                  setBeneficiaries(data.beneficiaries);
                  if (data.policy) setPolicy(data.policy);
                  setNewHandle("");
                  setNewApiKey("");
                  setMessage(`Saved @${data.beneficiaries.at(-1)?.handle ?? "beneficiary"}.`);
                } finally {
                  setSavingBeneficiary(false);
                }
              })();
            }}
          >
            <input
              type="text"
              placeholder="@havertz"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
            />
            <input
              type="password"
              placeholder="Their Moove Receive API key"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={savingBeneficiary}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-elevated disabled:opacity-50"
            >
              {savingBeneficiary ? "Saving…" : "Add / update beneficiary key"}
            </button>
          </form>
        </section>

        {!policy ? (
          <p className="mt-6 text-sm text-text-muted">Loading…</p>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <label className="block text-sm">
              <span className="text-text-muted">Monthly cap (USD)</span>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2"
                value={policy.monthlyCapUsd}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    monthlyCapUsd: Number(e.target.value),
                  })
                }
              />
            </label>
            <label className="block text-sm">
              <span className="text-text-muted">Per transfer max (USD)</span>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2"
                value={policy.perTransferMaxUsd}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    perTransferMaxUsd: Number(e.target.value),
                  })
                }
              />
            </label>
            <label className="block text-sm">
              <span className="text-text-muted">
                Allowed handles (comma-separated)
              </span>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2"
                value={policy.allowedHandles.map((h) => `@${h}`).join(", ")}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    allowedHandles: e.target.value
                      .split(",")
                      .map((s) => s.replace(/^@/, "").trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>

            {usage ? (
              <p className="text-xs text-text-muted">
                This month ({usage.monthKey}): ${usage.spentUsd.toFixed(2)}{" "}
                settled (via webhooks).
              </p>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save policy"}
            </button>
            {message ? (
              <p className="text-sm text-accent-secondary">{message}</p>
            ) : null}
          </form>
        )}
      </main>
    </div>
  );
}
