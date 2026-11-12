---
"@nexum-io/design-system": minor
---

Add unified auth sheet building blocks.

- `QrCode` component and `buildQrSvgPath` util (uses `qrcode@1.5.3`; modules stay near-black on a white pad in dark theme)
- `Identicon` component
- `AuthChoiceRow`, `AuthMethodPicker` (Nexum ID recommended + WalletConnect), `WalletConnectOptions`
- `DummyAccountList` (test-wallet picker)
- `NexumIdQrPanel` (QR sign-in panel with countdown, copy code, error and wallet fallback)

All blocks are presentation only: copy comes in through `labels` props.
