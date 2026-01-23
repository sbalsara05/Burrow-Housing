# Stripe Integration Setup

Stripe is used for payments **after both parties have signed** a contract. This doc covers the boilerplate setup.

## Environment Variables

Add to your `.env` (or Dotenv Vault):

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (e.g. `sk_test_...` or `sk_live_...`). **Required** for creating PaymentIntents. |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (e.g. `whsec_...`). **Required** for verifying webhook events. |
| `STRIPE_PUBLISHABLE_KEY` | Publishable key (e.g. `pk_test_...`). Optional for backend; use in frontend with Stripe.js. |

## Backend Endpoints

- **`POST /api/stripe/create-payment-intent`** (authenticated)  
  - Body: `{ "contractId": "<contract _id>" }`  
  - Use only for **COMPLETED** contracts (both sides signed).  
  - Returns `{ clientSecret, paymentIntentId, amountCents }`.  
  - Amount is derived from contract variables `Rent_Amount` and `Security_Deposit` (sum, min 50¢).

- **`POST /api/stripe/webhook`** (no auth, raw body)  
  - Configure this URL in Stripe Dashboard → Developers → Webhooks.  
  - Handles `payment_intent.succeeded` and `payment_intent.payment_failed`; updates `stripePaymentStatus` on the contract.

## Contract Model Additions

- `stripePaymentIntentId`: set when a PaymentIntent is created for the contract.  
- `stripePaymentStatus`: `""` | `"pending"` | `"succeeded"` | `"failed"`.

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

1. Load Stripe.js and create a Stripe instance with `STRIPE_PUBLISHABLE_KEY`.  
2. After both parties sign, call `POST /api/stripe/create-payment-intent` with the `contractId`.  
3. Use `stripe.confirmCardPayment(clientSecret, { payment_method: { card: element } })` (or Elements) to collect payment.  
4. Poll or refetch the contract to check `stripePaymentStatus === "succeeded"` or handle success in your UI.

## Install

```bash
cd backend && npm install
```

The `stripe` package is already in `package.json`.
