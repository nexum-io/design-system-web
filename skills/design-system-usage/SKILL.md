---
name: design-system-usage
description: How to build UI with the shared design system (@nexum-io/design-system) in this project. Use when creating or editing any UI — choosing a component, color, spacing, radius or typography token, styling with Tailwind, or adding a new screen. Enforces: import from @/design-system, semantic --ds-* tokens only (no raw hex or gray-500), dark mode via the .dark class, reuse components over hand-rolled markup.
---

# Using the Design System

Build all UI with the shared DS. Import from the `@/design-system` barrel; never hardcode colors or sizes.

## Import

```tsx
import {
  Button, Input, Select, Dialog, Tooltip, Checkbox, Switch, Textarea, Label, Alert, Badge, Toaster, // primitives
  Card, CardHeader, CardTitle, CardContent, CardFooter, IconBox, StatusBadge, KpiCard, CopyChip,     // components
  PageHeader, EmptyState, HeroSection, SectionBlock, FeatureCard,                                     // blocks
  PageLayout, PageContent,                                                                            // layouts
  tokens, getToken,                                                                                   // tokens (runtime)
} from '@/design-system';
```

## Tokens — semantic, theme-aware (never raw hex)

| Use | Classes |
|-----|---------|
| Surfaces | `bg-background`, `bg-card`, `bg-bg-subtle`, `bg-bg-muted`, `bg-bg-elevated` |
| Text | `text-foreground`, `text-muted-foreground`, `text-fg-muted`, `text-fg-subtle` |
| Borders | `border-border`, `border-border-muted`, `border-border-strong` |
| Brand | `bg-primary` / `text-primary` / `bg-brand-subtle` |
| Status | `bg-success`/`text-success-fg`/`bg-success-subtle`; same for `warning` / `danger` / `info` |
| Type scale | `text-2xs … text-5xl`, `text-display-sm/-display/-display-lg`; composites `.ds-text-heading-lg`, `.ds-text-body-sm`, … |

**Never** use raw `#hex`, `gray-500`, `bg-white`, or arbitrary `text-[14px]` — always a semantic token.

## Dark mode

Add/remove `dark` on `<html>`: `document.documentElement.classList.toggle('dark')`. Every `--ds-*` (and the shadcn bridge) flips automatically — no per-component work.

## Rules

- **Reuse first**: prefer an existing primitive/component/block over new markup. If a needed pattern is missing, add it to the **canonical DS** (then `design-system-sync`), don't hardcode it locally.
- **a11y**: keep Radix behavior and visible `focus-visible` rings; wrap decorative icons in `IconBox`.
- Mount `<Toaster />` once in the root layout for `toast()` (sonner).

## Reference
- `src/design-system/CHEATSHEET.md` — full token + component reference. `src/design-system/README.md` — overview.
- Live catalog: the `/design-system` showcase route, or the canonical repo's `npm run dev` / offline `npm run export`.
- To update the DS to the latest shared version, use the **design-system-sync** skill.
