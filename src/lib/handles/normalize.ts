/** Moove handles in env and intents — no leading @ */
export function normalizeMooveHandle(raw: string): string {
  return raw.replace(/^@+/, "").trim().toLowerCase();
}
