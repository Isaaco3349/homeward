# Homeward ↔ Moove Developer Program

Reference: [Everything You Need To Know About Moove Developer Program](https://www.moove.xyz/blog/everything-you-need-to-know-about-moove-developer-program)

## What we integrate (proper use)

| Moove capability | Homeward usage |
| --- | --- |
| **Moove Receive / Payment Links API** | `POST /v1/payment-link` on confirm |
| **Webhooks** | `POST /api/webhooks/moove` — settlement → plan `settled` |
| **List / reconcile** | `GET /v1/payment-link` via `/api/reconcile` |
| **Handles** | Beneficiary `@handle`; payer pays hosted checkout |

## Agentic layer (our product)

- **Voice + text intent** → structured plan (browser STT + rule parser; LLM optional later).
- **Spend policy** — caps, allowlist, reservation for unpaid links.
- **Confirm-first** — remittance-safe; not fully autonomous checkout (Moove **Send API** not public yet).
- **Recurring** — schedules + `POST /api/cron/due-links`.

## Grant milestones (suggested)

1. Live integration + public repo  
2. Policy, history, webhooks, voice agent UX  
3. 5–10 verified settlements ([grant-evidence.md](./grant-evidence.md))  
4. Recurring demo + deployed demo URL  

## Differentiation

Diaspora → emerging market beneficiary, policy-governed agent, full link → webhook loop — not a generic checkout embed.
