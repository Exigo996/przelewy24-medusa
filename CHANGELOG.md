# Changelog

## 0.1.0

### Added
- White-label card payments via P24 hosted card iframe + `POST /store/payments/card/charge`
- White-label Visa Mobile payments via `POST /store/payments/visa-mobile/charge`
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
