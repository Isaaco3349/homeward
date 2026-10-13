"use client";

import { useCallback, useState } from "react";
import type { PaymentPlan } from "@/lib/db/types";
import { speakText } from "@/lib/voice/browserSpeech";
import { ChatInput, type SendOptions } from "./ChatInput";
import { MessageList } from "./MessageList";
import type { ChatMessage } from "./types";

function patchPlanInMessages(
  messages: ChatMessage[],
  planId: string,
  plan: PaymentPlan,
): ChatMessage[] {
  return messages.map((m) => (m.plan?.id === planId ? { ...m, plan } : m));
}

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);

  const handleSend = useCallback(async (text: string, options?: SendOptions) => {
    const body = text.trim();
    if (!body) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      body,
      viaVoice: options?.viaVoice,
    };
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);

    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body, viaVoice: options?.viaVoice }),
      });
      const data = (await res.json()) as {
        plan?: PaymentPlan;
        error?: string;
      };

      if (!res.ok || !data.plan) {
        const err =
          data.error ?? "Could not parse that request.";
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", body: err },
        ]);
        if (options?.viaVoice) speakText(err);
        return;
      }

      const assistantBody =
        "Here is your plan. Confirm to create a Moove payment link for the payer.";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          body: assistantBody,
          plan: data.plan,
        },
      ]);

      if (options?.viaVoice && data.plan) {
        speakText(
          `Plan ready. Send ${data.plan.amountUsd} dollars to ${data.plan.beneficiaryHandle}. Confirm when ready.`,
        );
      }
    } catch {
      const err = "Network error. Try again.";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", body: err },
      ]);
    } finally {
      setBusy(false);
    }
  }, []);

  const handleConfirmPlan = useCallback(async (planId: string) => {
    setBusyPlanId(planId);
    try {
      const res = await fetch(`/api/plans/${planId}/confirm`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        plan?: PaymentPlan;
        error?: string;
        mock?: boolean;
      };

      if (!res.ok || !data.plan) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            body: data.error ?? "Could not create payment link.",
          },
        ]);
        return;
      }

      setMessages((prev) => patchPlanInMessages(prev, planId, data.plan!));

      const body = data.mock
        ? "Mock link created (set MOOVE_API_KEY for live Moove checkout)."
        : "Payment link is live. Open checkout to pay; webhook will mark settled when Moove confirms.";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", body },
      ]);
      speakText("Payment link is ready. Open checkout to pay.");
    } finally {
      setBusyPlanId(null);
    }
  }, []);

  const handleCancelPlan = useCallback(async (planId: string) => {
    setBusyPlanId(planId);
    try {
      const res = await fetch(`/api/plans/${planId}/cancel`, {
        method: "POST",
      });
      const data = (await res.json()) as { plan?: PaymentPlan };
      if (data.plan) {
        setMessages((prev) => patchPlanInMessages(prev, planId, data.plan!));
      }
    } finally {
      setBusyPlanId(null);
    }
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageList
        messages={messages}
        busyPlanId={busyPlanId}
        onConfirmPlan={handleConfirmPlan}
        onCancelPlan={handleCancelPlan}
      />
      <ChatInput disabled={busy} onSend={handleSend} />
    </div>
  );
}
