# Beneficiary setup (Moove Receive)

Homeward creates **payment links** with the beneficiary’s API key. Moove always settles to the **key owner’s** default wallet—you cannot redirect to another `@handle` via the API.

## Checklist for `@mum` (recipient in Nigeria)

1. **Claim a Moove Handle** — [Moove Handle docs](https://docs.moove.xyz/brand/moove-handle).
2. **Default wallet + settlement token** (e.g. USDC on your chosen chain).
3. **Create API key** — [Dashboard → API keys](https://www.moove.xyz/dashboard/api-keys), agent **Moove Receive** (`payment_link:create`, `payment_link:read`).
4. Put the key in Homeward server env as `MOOVE_API_KEY` (never commit).
5. Set `BENEFICIARY_HANDLE=mum` to match intents like `Send $100 to @mum`.
6. Add `@mum` under **Policy → allowed handles** in Homeward.

## Sender (diaspora payer)

The payer does **not** need an API key. After confirm, they open the **checkout URL** and pay from any supported chain/token.

## Webhooks

Register `https://your-host/api/webhooks/moove` in the [Moove webhooks console](https://www.moove.xyz/business/manage/webhooks). Set `MOOVE_WEBHOOK_SECRET=whsec_…` in `.env.local`.

## Recurring (cron)

Confirming a **monthly** plan registers a schedule. Call daily (UTC):

```bash
curl -X POST "https://your-host/api/cron/due-links" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Set `CRON_SECRET` in production. On day N UTC, Homeward creates a new link for each active schedule.

## NGN bank payout

Programmatic **Moove Ramp** is not in the public API yet. Beneficiary can cash out to a Nigerian bank in the **Moove App** after USDC settles.
