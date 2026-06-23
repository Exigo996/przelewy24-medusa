# Changelog

## 0.1.3

### Added
- `POST /store/payments/card/tokenization-intent` — side-effect-free endpoint returning `merchant_id`, `session_id`, `card_tokenization_sign`, `amount_grosze`, `currency_code` so the storefront can render the card iframe before any payment session/collection exists (used by order-change settlement to avoid confirming an order change on method select)

### Changed
- Card tokenization session now persists `p24_session_id`, guaranteeing `POST /store/payments/card/charge` registers against the exact P24 session the widget tokenized against

## 0.1.2

### Changed
- Visa Mobile (`pp_p24-visa-mobile_przelewy24`) now uses P24 redirect with pre-selected method `198` instead of white-label charge

### Removed
- `POST /store/payments/visa-mobile/charge` endpoint and `chargeVisaMobile` API client (breaking change)

## 0.1.0

### Added
- White-label card payments via P24 hosted card iframe + `POST /store/payments/card/charge`
- Hardened BLIK route at `POST /store/payments/blik/charge` (legacy `/payments/blik` deprecated)
- Transaction status endpoint `POST /store/payments/transaction/status`
- Scheduled reconciliation job `reconcile-p24-payments`
- Configurable provider options for card channel and Visa Mobile method id
- PSU (`additional.PSU`) support for white-label registration

### Changed
- `p24-cards` is now white-label (channel `4096` by default) instead of redirect-only
- Webhook handling is verify/capture-only and never returns `AUTHORIZED`
- `updatePayment` re-registers a fresh P24 transaction when amount changes
- Replaced `console.*` logging with redacted structured logging
- Standardized persisted payment session data keys (`session_id`, `order_id`)

### Security
- P24 webhook source IP allowlist
- Card additional-notification signature verifiers (success/failure field sets)

### Documentation
- Production runbook: `Medusa/docs/P24_PAYMENTS.md`, ADR `Medusa/docs/adr/0009-p24-white-label-payments.md`
- Storefront integration: `web/docs/P24_CHECKOUT.md`
- Clarified completion model: poll `complete` for order creation; capture via webhook or `reconcile-p24-payments`
