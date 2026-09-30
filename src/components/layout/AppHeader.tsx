import Link from "next/link";
import { HomewardLogo } from "@/components/brand/HomewardLogo";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-header-bg text-header-fg">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <HomewardLogo className="h-8 w-8" />
          <span className="font-semibold tracking-tight">Homeward</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-header-muted">
          <Link href="/app" className="hover:text-header-fg">
            Agent
          </Link>
          <Link href="/history" className="hover:text-header-fg">
            History
          </Link>
          <Link href="/settings" className="hover:text-header-fg">
            Policy
          </Link>
        </nav>
      </div>
    </header>
  );
}
