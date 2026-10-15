import type { HomewardStore } from "@/lib/db/types";
import { normalizeMooveHandle } from "@/lib/handles/normalize";

/**
 * Moove payment links always settle to the API key owner.
 * Each beneficiary @handle needs its own Receive key (or legacy env pair).
 */
export function resolveApiKeyForHandle(
  store: HomewardStore,
  beneficiaryHandle: string,
): string | null {
  const handle = normalizeMooveHandle(beneficiaryHandle);

  const row = store.beneficiaries.find(
    (b) => normalizeMooveHandle(b.handle) === handle,
  );
  if (row?.mooveApiKey.trim()) return row.mooveApiKey.trim();

  const envHandle = process.env.BENEFICIARY_HANDLE
    ? normalizeMooveHandle(process.env.BENEFICIARY_HANDLE)
    : "";
  const envKey = process.env.MOOVE_API_KEY?.trim();
  if (envKey && envHandle === handle) return envKey;

  return null;
}

export function collectDistinctApiKeys(store: HomewardStore): string[] {
  const keys = new Set<string>();
  for (const b of store.beneficiaries) {
    const k = b.mooveApiKey.trim();
    if (k) keys.add(k);
  }
  const envKey = process.env.MOOVE_API_KEY?.trim();
  if (envKey) keys.add(envKey);
  return [...keys];
}

export function missingBeneficiaryKeyMessage(handle: string): string {
  return `No Moove Receive API key for @${normalizeMooveHandle(handle)}. Add @${normalizeMooveHandle(handle)} under Settings → Beneficiaries (each handle needs its own key — Moove always pays the key owner).`;
}
