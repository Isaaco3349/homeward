import { createHmac, timingSafeEqual } from "node:crypto";

const TOLERANCE_SECONDS = 300;

export function verifyMooveWebhook(
  rawBody: Buffer,
  signature: string | null,
  timestamp: string | null,
  secret: string | undefined,
): boolean {
  if (!signature || !timestamp || !secret?.trim()) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false;

  const message = Buffer.concat([Buffer.from(`${timestamp}.`), rawBody]);
  const expected = `v1=${createHmac("sha256", secret).update(message).digest("hex")}`;

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
