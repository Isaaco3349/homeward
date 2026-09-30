# Homeward — progress (Moove Developer Program)

## Milestones (grant-aligned)

| Stage | Goal | Status |
| --- | --- | --- |
| **M1** | Repo scaffold: chat shell, intent → plan, confirm → payment link (mock or live), webhook handler | Done |
| **M2** | Policy caps + beneficiary onboarding docs; list/reconcile links | Todo |
| **M3** | 5–10 real paid links; idempotent webhooks persisted | Todo |
| **M4** | Recurring schedule (cron) + payer notifications | Todo |

## Architecture notes

- Payment links are created with the **beneficiary's** `MOOVE_API_KEY` (Moove settles to key owner only).
- Sender pays via hosted checkout URL; agent orchestrates policy + link lifecycle.
- Noma (Monad) lives in a separate repo — no Moove code there.

## Decisions

| Date | Decision |
| --- | --- |
| M1 | Product name **Homeward**; tokens orange `#F97316` + slate `#0F1419` |
| M1 | File store under `.data/` for local plans (swap for DB before serverless prod) |
