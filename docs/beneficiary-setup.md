# Beneficiary setup (Moove Receive)

Homeward creates **payment links** with the beneficiary’s API key. Moove always settles to the **key owner’s** default wallet—you cannot redirect to another `@handle` via the API.

## One handle vs many handles

Moove **cannot** redirect a payment link to a random `@handle`. The link **always settles to whoever owns the API key**.

| Setup | When to use |
| --- | --- |
| **Settings → Beneficiaries** | Pay **multiple** people — each `@handle` + their Receive API key |
| **`.env.local` only** | Single beneficiary: `MOOVE_API_KEY` + `BENEFICIARY_HANDLE=isaacony` |

Policy **allowed handles** = who the sender is *allowed* to pay. Each allowed handle still needs a **matching Receive key** (unless mock mode).

## Checklist per beneficiary (e.g. `@mum`, `@havertz`)

1. **Claim a Moove Handle** — [Moove Handle docs](https://docs.moove.xyz/brand/moove-handle).
2. **Default wallet + settlement token** (e.g. USDC on your chosen chain).
3. **Create API key** — [Dashboard → API keys](https://www.moove.xyz/dashboard/api-keys), agent **Moove Receive**.
4. In Homeward **Settings → Beneficiaries**, save `@handle` + their key (stored in local `.data/`, not git).
5. Ensure the handle appears under **Policy → allowed handles** (auto-added when you save a beneficiary).

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
