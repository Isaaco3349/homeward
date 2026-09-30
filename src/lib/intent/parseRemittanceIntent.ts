export type ScheduleKind = "once" | "monthly";

export interface ParsedRemittanceIntent {
  amountUsd: string;
  beneficiaryHandle: string;
  schedule: ScheduleKind;
  dayOfMonth?: number;
  rawText: string;
}

function normalizeAmount(raw: string): string {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("Could not parse amount.");
  }
  return n.toFixed(2);
}

function normalizeHandle(raw: string): string {
  const handle = raw.replace(/^@/, "").trim().toLowerCase();
  if (!/^[a-z0-9_]{2,32}$/.test(handle)) {
    throw new Error("Invalid Moove handle.");
  }
  return handle;
}

/**
 * Lightweight rule parser for demo / M1. Replace with LLM later if needed.
 * Examples:
 * - Send $100 to @mum
 * - Send 50 dollars to mum every 2nd
 */
export function parseRemittanceIntent(text: string): ParsedRemittanceIntent {
  const rawText = text.trim();
  if (!rawText) throw new Error("Empty message.");

  const amountMatch =
    rawText.match(/\$\s*([\d]+(?:\.\d{1,2})?)/i) ??
    rawText.match(/([\d]+(?:\.\d{1,2})?)\s*dollars?/i) ??
    rawText.match(/send\s+([\d]+(?:\.\d{1,2})?)/i);

  if (!amountMatch?.[1]) {
    throw new Error('Include an amount, e.g. "Send $100 to @mum".');
  }

  const handleMatch =
    rawText.match(/@([a-zA-Z0-9_]+)/) ??
    rawText.match(/\bto\s+([a-zA-Z0-9_]+)/i);

  if (!handleMatch?.[1]) {
    throw new Error('Include a beneficiary handle, e.g. "Send $100 to @mum".');
  }

  let schedule: ScheduleKind = "once";
  let dayOfMonth: number | undefined;

  const monthlyMatch = rawText.match(/every\s+(\d{1,2})(?:st|nd|rd|th)?/i);
  if (monthlyMatch?.[1]) {
    schedule = "monthly";
    const day = Number.parseInt(monthlyMatch[1], 10);
    if (day < 1 || day > 28) {
      throw new Error("Use a day between 1 and 28 for monthly sends.");
    }
    dayOfMonth = day;
  }

  return {
    amountUsd: normalizeAmount(amountMatch[1]),
    beneficiaryHandle: normalizeHandle(handleMatch[1]),
    schedule,
    dayOfMonth,
    rawText,
  };
}
