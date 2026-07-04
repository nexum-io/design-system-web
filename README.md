# @nexum-io/design-system

Private npm package for Nexum apps — design tokens, shadcn/Radix primitives, and composed components for **Tailwind v4 + React 19**.

Published to **GitHub Packages** (`npm.pkg.github.com`). Consumed as a normal semver dependency — no git submodules or SSH git URLs.

## Install

### 1. Registry auth

In the consuming app, add `.npmrc`:

```ini
@nexum-io:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

- **Local:** export a GitHub PAT with `read:packages` (and `repo` if the package repo is private).
- **Vercel:** add `NPM_TOKEN` in Project → Environment Variables (Preview + Production).

### 2. Add dependency

```bash
npm install @nexum-io/design-system
```

```json
{
  "dependencies": {
    "@nexum-io/design-system": "^0.1.0"
  }
}
```

### 3. Wire styles (Tailwind v4)

In the app `src/styles/index.css`:

```css
@import '@nexum-io/design-system/styles/fonts.css';
@import 'tailwindcss';
@import 'tw-animate-css';
@import '@nexum-io/design-system/styles/tokens.css';
@import '@nexum-io/design-system/styles/theme.css';
@source '../**/*.{ts,tsx}';
@source '../../node_modules/@nexum-io/design-system/dist';
```

### 4. TypeScript / Vite aliases (optional)

Map `@/design-system` to the package for ergonomic imports:

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "paths": {
      "@/design-system/*": ["./node_modules/@nexum-io/design-system/dist/*"],
      "@/design-system": ["./node_modules/@nexum-io/design-system/dist/index.d.ts"]
    }
  }
}
```

```ts
// vite.config.ts
resolve: {
  alias: {
    '@/design-system': path.resolve(__dirname, 'node_modules/@nexum-io/design-system/dist'),
  },
}
```

### 5. Import components

```tsx
import { Button, Card, StatusBadge } from '@nexum-io/design-system';
// or subpaths:
import { Button } from '@nexum-io/design-system/primitives/button';
```

## Package layout

```
dist/
  index.js / index.d.ts       # barrel export
  primitives/ components/ blocks/ layouts/
  styles/                     # fonts.css, tokens.css, theme.css
tokens/                       # source JSON (not published)
scripts/sync-design-system.mjs
```

## Develop

```bash
npm install
npm run sync:design-system   # regenerate tokens.css + tokens.ts from tokens/*.json
npm run build                # dist/ via tsup + copy styles
npm run check                # CI guard: generated files in sync
npm run typecheck
```

Edit `tokens/*.json` or component `.tsx`, then `npm run sync:design-system` and commit via MR to `develop`.

## Versioning & releases (Changesets)

```bash
npm run changeset          # describe your change (patch/minor/major)
# merge Version Packages PR → tag + publish to GitHub Packages
```

Publishing is automated by `.github/workflows/release.yml` using `changesets/action`.

## Peer dependencies

The consuming app must provide:

- `react` / `react-dom` ^19
- `tailwindcss` ^4 (+ `@tailwindcss/vite`, `tw-animate-css` in the app)

## Migration from git submodule / git dependency

See `MIGRATION.md` in the consuming app repo for the landing migration notes.
