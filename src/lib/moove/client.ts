import type {
  MooveCreatePaymentLinkRequest,
  MooveCreatePaymentLinkResponse,
  MoovePaymentLinkListResponse,
} from "./types";

const DEFAULT_BASE = "https://api.moove.xyz";

function baseUrl(): string {
  return process.env.MOOVE_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_BASE;
}

function apiKey(): string | undefined {
  const key = process.env.MOOVE_API_KEY?.trim();
  return key || undefined;
}

export function mooveMockEnabled(): boolean {
  if (process.env.MOOVE_MOCK === "true") return true;
  return !apiKey();
}

export class MooveApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "MooveApiError";
  }
}

async function parseMooveError(res: Response): Promise<MooveApiError> {
  let code: string | undefined;
  let message = res.statusText || `HTTP ${res.status}`;
  try {
    const body = (await res.json()) as {
      errors?: { message?: string; code?: string }[];
    };
    const first = body.errors?.[0];
    if (first?.message) message = first.message;
    if (first?.code) code = first.code;
  } catch {
    /* ignore */
  }
  return new MooveApiError(message, res.status, code);
}

export async function createPaymentLink(
  input: MooveCreatePaymentLinkRequest,
): Promise<MooveCreatePaymentLinkResponse> {
  if (mooveMockEnabled()) {
    const id = crypto.randomUUID();
    const handle = process.env.BENEFICIARY_HANDLE?.trim() || "beneficiary";
    return {
      id,
      url: `https://moove.xyz/@${handle}/pay/${id}`,
    };
  }

  const res = await fetch(`${baseUrl()}/v1/payment-link`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey()!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw await parseMooveError(res);
  return (await res.json()) as MooveCreatePaymentLinkResponse;
}

export async function listPaymentLinks(params?: {
  status?: "active" | "inactive" | "completed";
  offset?: number;
}): Promise<MoovePaymentLinkListResponse> {
  if (mooveMockEnabled()) {
    return { data: [], limit: 10, offset: 0, nextOffset: null };
  }

  const url = new URL(`${baseUrl()}/v1/payment-link`);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.offset != null) url.searchParams.set("offset", String(params.offset));

  const res = await fetch(url, {
    headers: { "X-API-Key": apiKey()! },
  });

  if (!res.ok) throw await parseMooveError(res);
  return (await res.json()) as MoovePaymentLinkListResponse;
}
