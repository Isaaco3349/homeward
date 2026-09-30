import { ChatEmptyHints } from "./ChatEmptyHints";
import { MessageBubble } from "./MessageBubble";
import { PlanConfirmCard } from "./PlanConfirmCard";
import type { ChatMessage } from "./types";

interface MessageListProps {
  messages: ChatMessage[];
  busyPlanId?: string | null;
  onConfirmPlan: (planId: string) => void;
  onCancelPlan: (planId: string) => void;
}

export function MessageList({
  messages,
  busyPlanId,
  onConfirmPlan,
  onCancelPlan,
}: MessageListProps) {
  if (messages.length === 0) {
    return <ChatEmptyHints />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      {messages.map((m) => (
        <div key={m.id} className="space-y-3">
          <MessageBubble message={m} />
          {m.plan ? (
            <PlanConfirmCard
              plan={m.plan}
              busy={busyPlanId === m.plan.id}
              onConfirm={() => onConfirmPlan(m.plan!.id)}
              onCancel={() => onCancelPlan(m.plan!.id)}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
