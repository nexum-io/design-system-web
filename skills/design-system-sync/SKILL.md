---
name: design-system-sync
description: Updates @nexum-io/design-system in consuming apps. Use when asked to update/refresh the design system, bump the DS version, or adopt the package in a new project. Bumps the git ref or semver in package.json — never touches app logic.
---

# Design System Sync (@nexum-io/design-system)

The shared DS is published from `nexum-io/design-system-web` and consumed as an npm dependency.

## Update to a new version

From the consuming app root, on a feature branch:

```bash
# Pin a git tag (current landing setup):
npm install @nexum-io/design-system@git+https://github.com/nexum-io/design-system-web.git#v0.1.1

# Or, when published to GitHub Packages:
npm install @nexum-io/design-system@^0.1.1
```

Commit `package.json` + `package-lock.json` and open a PR.

## Verify

```bash
npm run ci:check
# or:
npx tsc -b && npx eslint . && npx vite build
```

Run the app in light and dark.

## First-time adoption (new project)

```bash
npm install @nexum-io/design-system@git+https://github.com/nexum-io/design-system-web.git#v0.1.0
node node_modules/@nexum-io/design-system/scripts/install-skills.mjs --to .
```

Then wire (see the package `README.md`):

- Vite/tsconfig alias → `node_modules/@nexum-io/design-system/dist`
- `src/styles/index.css` imports DS css (`fonts.css`, `tokens.css`, `theme.css`)
- Tailwind `@source` scans `node_modules/@nexum-io/design-system/dist`

## Rules

- Change DS design ONLY in `design-system-web` — not in consuming apps.
- Never touch app logic (`src/app`, `src/data`, `src/api`, providers, adapters, routes).
- After `npm install`, ensure `package-lock.json` resolves git deps as `git+https://` (not `git+ssh://`) for CI/Vercel.

## Reference

- Canonical repo: `nexum-io/design-system-web` → `README.md`, `CHEATSHEET.md`.
- Build UI with the DS → the **design-system-usage** skill.
