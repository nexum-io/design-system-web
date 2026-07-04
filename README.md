# @c-escrow/design-system

Cryptoner's shared, re-skinnable UI design system — design tokens, shadcn/Radix primitives, and
composed components for **Tailwind v4 + React 19**. This repo is the **single source of truth**;
apps consume it as a **git submodule** mounted at `src/design-system`, so there are no copies of
the DS in each app's repo — only a pinned pointer to a commit here.

## Layout (repo root = the package)

```
index.ts                # barrel — apps import from `@/design-system`
tokens/                 # source-of-truth JSON (core, semantic, typography) — Tokens Studio
tokens.ts               # GENERATED typed runtime map (do not edit)
styles/
  tokens.css            #   GENERATED --ds-* variables (do not edit)
  theme.css             #   shadcn→--ds-* bridge + @theme inline + @custom-variant dark
  fonts.css             #   --font-sans + type scale
utils/ primitives/ components/ blocks/ layouts/ examples/
scripts/sync-design-system.mjs   # tokens JSON → tokens.css + tokens.ts
scripts/install-skills.mjs       # install the skills into a consumer (.cursor + .claude)
skills/                 # design-system-sync, design-system-usage (installed into consumers)
README.md CHEATSHEET.md QUICK_START.md
```

## Develop the DS

```bash
npm install
npm run sync:design-system   # regenerate tokens.css + tokens.ts from tokens/*.json
npm run check                # CI guard: fail if generated files drift from JSON
npm run typecheck            # tsc --noEmit over the package
```

Edit design in `tokens/*.json` (colors, spacing, type, radius, shadow, z-index, motion, breakpoints)
or in the component `.tsx`, then `npm run sync:design-system` and commit. Never hand-edit
`tokens.css` / `tokens.ts`. **All changes land via MR to `develop`** (no direct pushes).

## Use it in an app (git submodule)

```bash
# from the app repo root, on a feature branch:
git submodule add git@cryptoner.gitlab.yandexcloud.net:development/design-system.git src/design-system
```

Then wire it once:

1. **Alias** `@/design-system` → `src/design-system` (tsconfig `paths` + Vite `resolve.alias`) — already the convention in these repos.
2. **Styles** — a thin `src/styles/index.css` (app-owned) pulls the DS in:
   ```css
   @import '../design-system/styles/fonts.css';   /* Google @import must come first */
   @import 'tailwindcss';
   @import 'tw-animate-css';
   @import '../design-system/styles/tokens.css';
   @import '../design-system/styles/theme.css';
   @source './**/*.{ts,tsx}';      /* app code */
   @source '../design-system';     /* the DS submodule */
   ```
3. **Deps** — React 19, `@radix-ui/*` (checkbox, dialog, label, select, slot, switch, tooltip),
   `lucide-react`, `sonner`, `class-variance-authority`, `clsx`, `tailwind-merge`, Tailwind v4 +
   `@tailwindcss/vite`, `tw-animate-css`.
4. **Skills** — `node src/design-system/scripts/install-skills.mjs --to .` (installs `design-system-sync`
   + `design-system-usage` into `.cursor/skills` and `.claude/skills`).

Import: `import { Button, Card, StatusBadge, … } from '@/design-system'`.

### Update to a newer DS version

```bash
git submodule update --remote src/design-system   # latest develop
# or pin a tag:  cd src/design-system && git checkout v0.2.0 && cd -
git add src/design-system && # commit the new pointer via MR
```

Clone an app with `git clone --recurse-submodules`, or run `git submodule update --init` after clone
(CI must do the same).

## Re-skin

Edit `tokens/core.json` / `tokens/semantic.json`, `npm run sync:design-system`, commit (MR). Every
app picks it up on its next submodule update. (Per-app brand divergence is not supported by the
submodule model — fork the repo if an app needs a different brand.)

## Release / versioning

Tag releases on `develop` (e.g. `v0.1.0`); apps pin the submodule to a tag or track `develop`.

## Relationship to `escrow-design-sync`

Distinct: `escrow-design-sync` syncs the **Figma prototype** into view markup. This repo owns the
shared **tokens, primitives, and components**.
