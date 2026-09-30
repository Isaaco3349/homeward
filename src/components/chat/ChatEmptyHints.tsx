export function ChatEmptyHints() {
  return (
    <div className="mx-auto max-w-md space-y-3 px-4 py-8 text-center text-text-muted">
      <p className="text-sm">
        Try a remittance plan in plain English. Homeward always asks you to
        confirm before creating a Moove payment link.
      </p>
      <ul className="space-y-2 text-left text-sm">
        <li className="rounded-lg border border-border bg-surface px-3 py-2">
          Send $100 to @mum
        </li>
        <li className="rounded-lg border border-border bg-surface px-3 py-2">
          Send $50 to @mum every 2nd
        </li>
      </ul>
    </div>
  );
}
