# Changesets

Use changesets to record intent for the next release:

```bash
npm run changeset
```

When changes are merged to `develop`, the Release workflow opens a Version Packages PR.
After merging that PR, the package is published to GitHub Packages automatically.
