import type { PaymentPlan } from "@/lib/db/types";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  body: string;
  plan?: PaymentPlan;
}
