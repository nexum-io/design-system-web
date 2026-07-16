# SigningSheet

A right-panel signing UI for wallet-connect, sign-in (SIWE), and operation
(meta-tx) confirmation flows. `SigningSheet` is presentation-only: it renders
a gradient header, a step-indicator strip derived from `intent`/`step`, a
scrollable body, and a sticky footer, and it guards its own close affordances
(`busy`, `closeConfirm`). The consumer owns all wallet/API state — connecting,
signing, submitting, polling — and drives the sheet by passing `step`, `busy`,
and `error` as that state changes. `SigningConfirmDialog` is the matching
nested confirm dialog (e.g. "abandon signing?", "reject this request?"),
usable standalone or via `SigningSheet`'s `closeConfirm` prop.

## `SigningSheetProps`

| name | type | default | description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when a non-busy close is honored (header close, Esc, overlay, or via `closeConfirm`). |
| `intent` | `SigningSheetIntent` (`'auth' \| 'connect-only' \| 'operation'`) | — | Selects the default step-indicator nodes (`DEFAULT_FLOWS`, exported) when `steps` is not given. |
| `step` | `SigningStep` (`'idle' \| 'review' \| 'connect_wallet' \| 'signing' \| 'executing' \| 'completed' \| 'failed'`) | — | Current flow step; drives indicator node statuses via `deriveNodeStatuses`. |
| `labels` | `SigningSheetLabels` | — | `{ close, steps?, busyHint? }` — close button aria-label, per-step indicator labels, busy hint copy. |
| `title` | `string` | — | Header title. |
| `subtitle` | `string` | `undefined` | Header subtitle; also becomes the dialog's accessible description. |
| `icon` | `ReactNode` | `undefined` | Leading icon slot in the header. |
| `badge` | `ReactNode` | `undefined` | Badge slot under the header title row (e.g. `StatusBadge`). |
| `itemId` | `string` | `undefined` | Identity of the signed item. Combined with `intent` as the reset key for pending `closeConfirm` state. |
| `error` | `string \| null` | `undefined` | Marks the active indicator node as failed (see "failure semantics" below). |
| `busy` | `boolean` | `false` | Blocks every close affordance: visibly disables the close button, swallows Esc/overlay dismissal and `onOpenChange`. |
| `closeConfirm` | `SigningSheetCloseConfirm \| null` | `undefined` | When set, a non-busy close attempt opens a nested `SigningConfirmDialog` instead of closing immediately. |
| `steps` | `SigningSheetStepConfig[]` | `undefined` | Overrides the default indicator nodes for `intent`. |
| `stepIcons` | `Partial<Record<SigningStep, LucideIcon>>` | `undefined` | Overrides the default per-step indicator icon. |
| `hideStepIndicator` | `boolean` | `false` | Hides the step-indicator strip entirely. |
| `failedStep` | `SigningStep` | `undefined` | Which node to mark failed when `step === 'failed'`; falls back to the second-to-last node. |
| `children` | `ReactNode` | — | Scrollable body content. |
| `footer` | `ReactNode` | `undefined` | Sticky footer; the footer region renders only when non-null. Pass `null`/`undefined` to hide it — use `cond ? <.../> : null`, not `cond && <.../>`: the guard is `footer != null`, so a `false` value renders an empty footer strip. |
| `beforeContent` | `ReactNode` | `undefined` | Non-scrolling strip rendered between the step indicator and the body. |
| `className` | `string` | `undefined` | Classes on the sheet content root. |
| `contentClassName` | `string` | `undefined` | Classes on the scrollable body wrapper. |

`SigningSheetCloseConfirm`: `{ title: string; description?: string; confirmLabel: string; cancelLabel: string; destructive?: boolean }`.

`SigningSheetStepConfig`: `{ id: Exclude<SigningStep, 'idle' | 'failed'>; label?: string; icon?: LucideIcon }`.

## `SigningConfirmDialogProps`

| name | type | default | description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called unconditionally on open attempts; only close attempts are gated by busy/pending (see `busy` below). |
| `title` | `string` | — | Dialog title. |
| `description` | `string` | `undefined` | Dialog description (visually hidden, but always present in the DOM, when omitted). |
| `confirmLabel` | `string` | — | Confirm action label. |
| `cancelLabel` | `string` | — | Cancel action label. |
| `destructive` | `boolean` | `false` | Applies danger styling to the confirm action. |
| `busy` | `boolean` | `false` | External pending state: disables both actions and blocks dismissal. |
| `error` | `string \| null` | `undefined` | External error from the parent-owned async confirm; shown above the reason field (if any). |
| `reasonField` | `SigningConfirmReasonField \| null` | `undefined` | When set, requires a non-empty (trimmed) reason; confirm stays disabled while empty. |
| `onConfirm` | `(input: SigningConfirmInput) => void \| Promise<void>` | — | Called with the (optional) trimmed reason. The dialog only guards against double-submit — closing after a successful confirm is the caller's decision via the controlled `open` prop. `onConfirm` must not reject — handle failures in the parent and surface them via `error`. |
| `resetKey` | `string` | `undefined` | Reason draft and submit latch reset while the dialog is open; changes while closed take effect on next open (typically `itemId`/`intent`). |

`SigningConfirmReasonField`: `{ label: string; placeholder?: string; requiredError?: string }`.

`SigningConfirmInput`: `{ reason?: string }` — present only when `reasonField` was configured.

## Intent matrix

Default step-indicator nodes per `intent` (overridable via `steps`):

| intent | default nodes |
|---|---|
| `auth` | `connect_wallet` → `signing` → `completed` |
| `connect-only` | `connect_wallet` → `completed` |
| `operation` | `review` → `signing` → `completed` |

`executing` is not a distinct node — it collapses onto `signing` (the
"single-signer shortcut": `COLLAPSE = { executing: 'signing' }`), so intents
that submit after signing (e.g. `operation`) don't need a fourth node.

Failure semantics: when a node failure occurs, it is marked `'error'` instead of
`'active'`/`'completed'`. The failure is triggered by either a truthy `error`
or `step === 'failed'`. (a) When a truthy `error` is set with any non-terminal
step, the currently active node (derived from `step`, collapsed through
`COLLAPSE`) is marked error; `failedStep` is ignored. (`error` is ignored when
`step` is `completed` or `idle` — both statuses early-return before failure
handling runs.) (b) When `step === 'failed'`, the target node is `failedStep`
if given (also collapsed through `COLLAPSE` when it isn't a rendered node),
otherwise the second-to-last node (pre-terminal). (c) If the resolved target
node is not found among the current custom `steps` and a failure occurred, the
**last** node is marked `'error'` as a fallback so the failure remains visible.

## Consumer mapping tables

**Auth flow (SIWE) — consumer stage → step:**

| consumer stage | step | busy | notes |
|---|---|---|---|
| wallet select | `connect_wallet` | false | wallet cards as children |
| prepare/sign | `signing` | per consumer | status panel as children |
| sign error | `signing` + `error` (or `failed`) | false | Retry in footer |
| done | `completed` | false | success panel; consumer auto-closes |

**Operation (meta-tx) — consumer phase → step:**

| phase | step | busy |
|---|---|---|
| idle (opened) | `idle` | false |
| preparing | `review` | true |
| ready | `review` | false (footer actionable) |
| transferring / signing | `signing` | true |
| submitting | `executing` | true |
| completed (local) | `completed` | false |
| any error | keep position + `error` | false |

## Import paths

```ts
import { SigningSheet, SigningConfirmDialog } from "@nexum-io/design-system";
```

or the deep import:

```ts
import { SigningSheet } from "@nexum-io/design-system/blocks/SigningSheet";
```

## Busy guard, closeConfirm, and itemId reset

`busy` is the hard guard: while true, the header close button is visibly
disabled and Esc/overlay/`onOpenChange` are all swallowed, so nothing can
dismiss the sheet mid-signature. `closeConfirm` is a softer guard that only
applies when not busy — it intercepts the next close attempt with a nested
`SigningConfirmDialog` instead of calling `onOpenChange(false)` directly, and
the consumer decides what "confirm" means (e.g. abandon vs. keep signing).
Both the pending close-confirm state and any consumer-owned local state keyed
to `[itemId, intent]` should be treated as scoped to that identity: the sheet
itself drops its own pending confirm whenever `itemId` or `intent` changes
(or the sheet closes), so a new item never inherits a stale confirm prompt.
