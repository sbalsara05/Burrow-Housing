# Stripe Integration Setup

Stripe is used for payments **after both parties have signed** a contract. This doc covers the boilerplate setup.

## Disabling Payments (No Charge Mode)

To run without charging users—property becomes "rented" when **both parties sign** (no payment step):

- **Backend:** Set `DISABLE_STRIPE_PAYMENTS=true` in `backend/.env`
- **Frontend:** Set `VITE_DISABLE_STRIPE_PAYMENTS=true` in `homy/.env.development` (or omit `VITE_STRIPE_PUBLISHABLE_KEY`)

The Stripe implementation stays in place for future use. To re-enable, remove or set these to `false`.

## Environment Variables

Add to your `.env` (or Dotenv Vault):

| Variable | Description |
|----------|-------------|
| `DISABLE_STRIPE_PAYMENTS` | Set to `true` or `1` to skip charging; property = rented when both sign. |
| `STRIPE_SECRET_KEY` | Stripe secret key (e.g. `sk_test_...` or `sk_live_...`). **Required** for creating PaymentIntents when payments enabled. |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (e.g. `whsec_...`). **Required** for verifying webhook events. |
| `STRIPE_PUBLISHABLE_KEY` | Publishable key (e.g. `pk_test_...`). Optional for backend; use in frontend with Stripe.js. |

## Backend Endpoints

- **`POST /api/stripe/create-payment-intent`** (authenticated)  
  - Body: `{ "contractId": "<contract _id>", "paymentMethod": "card" | "ach" }`  
  - Use only for **COMPLETED** contracts (both sides signed).  
  - Callable by **tenant** (sublessee) or **lister** (sublessor). Each pays their own fee.
  - Returns `{ clientSecret, paymentIntentId, amountCents, paymentStatus, paymentSnapshot, payer }`.  
  - Amount charged is **only the platform service fee** (rent is paid through other portals):
    - **Tenant:** 2.5% of rent + optional 1.0% card surcharge (card only)
    - **Lister:** 2.5% of rent + optional 1.0% card surcharge (card only)
  - Supports **card** and **ACH bank transfer**; bank transfer avoids the 1% card fee.

- **`POST /api/stripe/webhook`** (no auth, raw body)  
  - Configure this URL in Stripe Dashboard → Developers → Webhooks.  
  - Handles `payment_intent.succeeded`, `payment_intent.processing`, `payment_intent.canceled`, `payment_intent.payment_failed`; updates `stripePaymentStatus` and `paymentStatus` on the contract.

## Contract Model Additions

- `stripePaymentIntentId`: set when a PaymentIntent is created for the contract.  
- `stripePaymentStatus`: `""` | `"pending"` | `"processing"` | `"succeeded"` | `"failed"` | `"canceled"`.
- `paymentStatus`: `NOT_STARTED` | `PENDING` | `PROCESSING` | `SUCCEEDED` | `FAILED` | `CANCELED` | `EXPIRED`.
- `paymentExpiresAt`: set when contract becomes `COMPLETED` (default 48h; configurable via `PAYMENT_WINDOW_HOURS`).

## Webhook Setup (Stripe Dashboard)

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks).  
2. **Add endpoint**: URL = `https://your-api-host/api/stripe/webhook`.  
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`.  
4. Copy the **Signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

For local testing, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:

```bash
stripe listen --forward-to localhost:5001/api/stripe/webhook
```

Use the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET` locally.

## Frontend (Stripe.js)

1. In the **homy** app, set `VITE_STRIPE_PUBLISHABLE_KEY` (e.g. in `homy/.env`): same value as backend `STRIPE_PUBLISHABLE_KEY` (e.g. `pk_test_...`).  
2. After both parties sign, each party sees a **Pay now** section on the agreement review page (`/dashboard/agreements/:id/sign`).  
3. Each party chooses **Pay by card** (2.5% + 1% fee) or **Pay by bank transfer** (2.5% only).  
4. Clicking an option calls `POST /api/stripe/create-payment-intent` with `contractId` and `paymentMethod: "card" | "ach"`, then shows the Stripe form and confirms payment.  
5. On success, the contract is refetched and the UI shows **Payment complete**.  

**Note:** Enable **ACH Direct Debit** in [Stripe Dashboard → Settings → Payment methods](https://dashboard.stripe.com/settings/payment_methods) for bank transfer to work.

## Install

**Backend:**
```bash
cd backend && npm install
```

**Frontend (homy):**
```bash
cd homy && npm install
```

The frontend uses `@stripe/stripe-js` and `@stripe/react-stripe-js` for the payment form.
