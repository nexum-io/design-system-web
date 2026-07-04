# Publishing @nexum-io/design-system

## First publish (bootstrap)

1. Push this repo to `develop` / `main`.
2. GitHub → **Actions** → **Publish Package** → **Run workflow**.
3. Confirm package appears at `https://github.com/nexum-io/design-system-web/packages`.

## Ongoing releases (Changesets)

```bash
npm run changeset        # record intent
# merge Version Packages PR from Release workflow
```

## Consumer setup

See README.md — apps need `.npmrc` + `NPM_TOKEN` with `read:packages`.
