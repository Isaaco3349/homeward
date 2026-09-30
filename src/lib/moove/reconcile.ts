import { listPaymentLinks } from "@/lib/moove/client";
import { getStore, saveStore } from "@/lib/db/store";
import type { PaymentPlan } from "@/lib/db/types";

export interface ReconcileSummary {
  mooveLinksFetched: number;
  plansUpdated: number;
  plans: PaymentPlan[];
}

export async function reconcilePlansWithMoove(): Promise<ReconcileSummary> {
  const store = await getStore();
  let mooveLinksFetched = 0;
  let plansUpdated = 0;

  let offset = 0;
  const linkById = new Map<
    string,
    { status: string; transactionUrl?: string | null }
  >();

  for (;;) {
    const page = await listPaymentLinks({ offset });
    mooveLinksFetched += page.data.length;
    for (const row of page.data) {
      linkById.set(row.id, {
        status: row.status,
        transactionUrl: row.transactionUrl,
      });
    }
    if (page.nextOffset == null) break;
    offset = page.nextOffset;
  }

  for (const plan of store.plans) {
    if (!plan.moovePaymentLinkId || plan.status === "cancelled") continue;
    const remote = linkById.get(plan.moovePaymentLinkId);
    if (!remote) continue;

    if (remote.status === "completed" && plan.status !== "settled") {
      plan.status = "settled";
      plan.updatedAt = new Date().toISOString();
      plansUpdated += 1;
    }
    if (remote.status === "inactive" && plan.status === "awaiting_payment") {
      plan.status = "cancelled";
      plan.updatedAt = new Date().toISOString();
      plansUpdated += 1;
    }
  }

  if (plansUpdated > 0) await saveStore(store);

  return {
    mooveLinksFetched,
    plansUpdated,
    plans: store.plans,
  };
}
