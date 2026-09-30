import Link from "next/link";
import { HomewardLogo } from "@/components/brand/HomewardLogo";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-6 py-16">
        <div className="flex items-center gap-3">
          <HomewardLogo className="h-12 w-12" />
          <h1 className="text-3xl font-semibold tracking-tight text-text">
            Homeward
          </h1>
        </div>
        <p className="mt-4 text-text-muted leading-relaxed">
          Policy-governed agent for diaspora remittance on{" "}
          <span className="text-accent-secondary">Moove</span>: turn natural
          language into payment links, confirm first, reconcile with webhooks.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg hover:bg-accent-hover"
          >
            Open agent
          </Link>
          <Link
            href="/settings"
            className="rounded-lg border border-border px-5 py-2.5 text-sm text-text-muted hover:text-text"
          >
            Spend policy
          </Link>
        </div>
        <p className="mt-10 text-xs text-text-muted">
          Moove Developer Program · beneficiary-scoped Receive API keys · not a
          money transmitter
        </p>
      </div>
    </main>
  );
}
