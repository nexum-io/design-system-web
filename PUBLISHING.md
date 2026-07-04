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

Public repo (no token):

```json
"@nexum-io/design-system": "git+https://github.com/nexum-io/design-system-web.git#v0.1.0"
```

GitHub Packages (semver):

```ini
@nexum-io:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

See README.md for full install instructions.
