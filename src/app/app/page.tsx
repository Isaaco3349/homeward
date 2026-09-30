import { AppHeader } from "@/components/layout/AppHeader";
import { ChatShell } from "@/components/chat/ChatShell";

export default function AgentPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col">
        <ChatShell />
      </main>
    </div>
  );
}
