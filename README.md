# `.github` — Backblaze Labs organization defaults

[![Validate schemas](https://github.com/backblaze-labs/.github/actions/workflows/validate-schema.yml/badge.svg)](https://github.com/backblaze-labs/.github/actions/workflows/validate-schema.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Organization-wide GitHub configuration and shared standards for the
[**Backblaze Labs**](https://github.com/backblaze-labs) org.

## Contents

| Path | What it is |
| --- | --- |
| [`profile/README.md`](profile/README.md) | The org profile shown at [github.com/backblaze-labs](https://github.com/backblaze-labs). |
| [`schemas/`](schemas/) | Shared, versioned data contracts used across repos. |
| [`scripts/`](scripts/) | Tooling that validates those contracts. |

## References standard

Each repo records its external references — blogs, press, docs, videos,
directory/registry listings, related projects — in a single machine-parseable
[`references.yml`](schemas/references.example.yml) at its root, validated
against [`schemas/references.schema.json`](schemas/references.schema.json).
Internal tooling (Quality Keeper, dashboards) reads that one shape across every
repo. See [`schemas/README.md`](schemas/README.md) for the full field reference
and adoption steps.

Point a repo's `references.yml` at the schema with a first-line comment:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/backblaze-labs/.github/main/schemas/references.schema.json
```

## Validate locally

```bash
npm ci
npm run validate           # validates every references*.yml in the repo
npm run validate -- path/to/references.yml   # or a specific file
```

CI ([`validate-schema.yml`](.github/workflows/validate-schema.yml)) runs the
same check on every push and pull request.
