---
"@nexum-io/design-system": minor
---

Add SigningSheet block: a presentation-only right-side sheet for wallet signing
flows (auth, connect-only, operation intents) with a built-in step indicator
(idle/review/connect_wallet/signing/executing/completed/failed), busy close
guard, close-confirm interception, and identity-based state reset. Add
SigningConfirmDialog building block (confirm and confirm-with-reason with
required-reason validation and double-submit prevention). SheetContent gains an
optional hideCloseButton prop.
