# Quick Start

## Use it in this app

```tsx
import { Button, Card, StatusBadge, IconBox, PageHeader, KpiCard } from '@/design-system';
import { Wallet } from 'lucide-react';

export function Example() {
  return (
    <Card>
      <PageHeader title="Deals" action={<Button>New deal</Button>} />
      <div className="flex items-center gap-3">
        <IconBox variant="brand"><Wallet /></IconBox>
        <StatusBadge variant="success">Active</StatusBadge>
      </div>
      <KpiCard label="In escrow" value="$1.2M" delta="+3.4%" deltaTone="success" icon={<Wallet />} />
    </Card>
  );
}
```

Browse every token and component (all states, light + dark) at the **`/design-system`** route.

## Theme

```ts
document.documentElement.classList.toggle('dark'); // flips every --ds-* token
```

## Change a token (re-skin)

1. Edit `tokens/core.json` (palette/scales) or `tokens/semantic.json` (role → color mapping).
2. `npm run sync:design-system`
3. `styles/tokens.css` + `tokens.ts` regenerate; the whole UI updates. Don't touch components.

Example — make the brand blue instead of purple: in `tokens/semantic.json`, point
`semantic.light.primary.default` / `.hover` / `.subtle` at `{color.blue.600}` / `{color.blue.700}` /
`{color.blue.50}` (and the dark set similarly), then regenerate.

## Drop it into a new frontend

1. Copy `src/design-system/` + `scripts/sync-design-system.mjs`.
2. Copy `src/styles/{fonts,tailwind,tokens-import,theme,index}.css` wiring (or merge `theme.css`'s
   `@theme` bridge and `@custom-variant dark (&:is(.dark *))` into your Tailwind v4 entry), and
   `@import` the chain once in your app entry.
3. Install deps: `tailwindcss`@4 + `@tailwindcss/vite`, `clsx`, `tailwind-merge`,
   `class-variance-authority`, `lucide-react`, `sonner`, and the `@radix-ui/*` packages used in
   `primitives/`.
4. Alias `@/*` → `src/*` (tsconfig + Vite).
5. `npm run sync:design-system`, then `import { … } from '@/design-system'`.

See [`examples/react-integration.tsx`](./examples/react-integration.tsx) and [`README.md`](./README.md).
