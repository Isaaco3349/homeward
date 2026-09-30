export interface MooveCreatePaymentLinkRequest {
  toAmount: string;
  description?: string;
  maxUsage?: number;
  expirationDate?: string;
}

export interface MooveCreatePaymentLinkResponse {
  id: string;
  url: string;
}

export interface MoovePaymentLinkToken {
  symbol: string;
  decimals: number;
  chain?: { id: string; name: string };
}

export interface MoovePaymentLinkRow {
  id: string;
  toAmount: string;
  url: string;
  status: "active" | "inactive" | "completed";
  description?: string | null;
  receivedAmount?: string | null;
  token?: MoovePaymentLinkToken;
  transactionUrl?: string | null;
}

export interface MoovePaymentLinkListResponse {
  data: MoovePaymentLinkRow[];
  limit: number;
  offset: number;
  nextOffset: number | null;
}

export type MooveWebhookEventType =
  | "payment_link.transaction.succeeded"
  | "payment_link.completed";

export interface MooveWebhookPayload {
  id: string;
  type: MooveWebhookEventType | string;
  createdAt: string;
  data: {
    paymentLinkId: string;
    status: string;
    amount: string;
    receivedAmount: string;
    description?: string | null;
    transaction?: {
      sourceTransaction?: string;
      status?: string;
    };
  };
}
