import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_POLICY } from "@/lib/policy/defaultPolicy";
import { getCurrentMonthKey } from "@/lib/policy/checkPolicy";
import type { HomewardStore, PaymentPlan } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "homeward.json");

async function ensureStore(): Promise<HomewardStore> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as HomewardStore;
  } catch {
    const initial: HomewardStore = {
      policy: DEFAULT_POLICY,
      usage: { monthKey: getCurrentMonthKey(), spentUsd: 0 },
      plans: [],
      processedWebhookEventIds: [],
    };
    await persist(initial);
    return initial;
  }
}

async function persist(store: HomewardStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function getStore(): Promise<HomewardStore> {
  return ensureStore();
}

export async function saveStore(store: HomewardStore): Promise<void> {
  await persist(store);
}

export async function addPlan(plan: PaymentPlan): Promise<void> {
  const store = await ensureStore();
  store.plans.unshift(plan);
  await persist(store);
}

export async function updatePlan(
  id: string,
  patch: Partial<PaymentPlan>,
): Promise<PaymentPlan | null> {
  const store = await ensureStore();
  const idx = store.plans.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const next = {
    ...store.plans[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.plans[idx] = next;
  await persist(store);
  return next;
}

export async function getPlan(id: string): Promise<PaymentPlan | null> {
  const store = await ensureStore();
  return store.plans.find((p) => p.id === id) ?? null;
}

export async function recordWebhookEventId(eventId: string): Promise<boolean> {
  const store = await ensureStore();
  if (store.processedWebhookEventIds.includes(eventId)) return false;
  store.processedWebhookEventIds.push(eventId);
  if (store.processedWebhookEventIds.length > 5000) {
    store.processedWebhookEventIds =
      store.processedWebhookEventIds.slice(-2500);
  }
  await persist(store);
  return true;
}
