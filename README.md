# Homeward

Policy-governed **diaspora remittance agent** for the [Moove Developer Program](https://www.moove.xyz/blog/everything-you-need-to-know-about-moove-developer-program): natural-language plans, mandatory confirm, [Moove Payment Links](https://docs.moove.xyz/api-reference/moove-receive/moove-payment-links) + [webhooks](https://docs.moove.xyz/api-reference/moove-receive/webhooks).

Separate from [Noma](https://github.com/) (Monad Metropolis). Homeward is Moove-only.

## How it works

1. Sender describes intent: *Send $100 to @mum every 2nd*.
2. Homeward parses a **draft plan** and shows a confirm card.
3. On confirm, the server calls `POST /v1/payment-link` using the **beneficiary’s** Moove Receive API key (links always settle to the key owner’s wallet).
4. Payer opens the hosted checkout URL (any chain/token → beneficiary settlement token).
5. Moove webhooks mark the plan **settled** (idempotent on `Moove-Event-Id`).

## Prerequisites

- [Moove Handle](https://docs.moove.xyz/brand/moove-handle) + default wallet on the **beneficiary** account.
- [API key](https://docs.moove.xyz/manage/moove-api-keys) — **Moove Receive Agent** (`payment_link:create`, `payment_link:read`).
- For live webhooks: public HTTPS URL (e.g. ngrok) registered at [Moove webhooks console](https://www.moove.xyz/business/manage/webhooks).

## Setup

```bash
cd homeward
cp .env.example .env.local
# Edit .env.local — see below
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Open agent**.

### Environment

| Variable | Purpose |
| --- | --- |
| `MOOVE_API_KEY` | Beneficiary Receive key (server only). Omit or `MOOVE_MOCK=true` for mock URLs. |
| `BENEFICIARY_HANDLE` | Must match intent handle (e.g. `mum`). |
| `MOOVE_WEBHOOK_SECRET` | `whsec_…` from webhook setup. Optional locally if you skip signature verify when unset. |

**Security:** never commit `.env.local` or API keys.

## Test flow (M1)

1. **Mock:** leave `MOOVE_API_KEY` empty → confirm creates a fake `moove.xyz/@handle/pay/…` URL.
2. **Live:** set key + handle → confirm returns a real checkout URL from `https://api.moove.xyz`.
3. **Health:** `GET /api/health`.
4. **Policy:** `/settings` — monthly cap, per-transfer max, allowed `@handles`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run moove:types` | Regenerate OpenAPI types (optional) |

## Milestones

See [PROGRESS.md](./PROGRESS.md).

## License

MIT (add `LICENSE` when you publish — optional for grant).
