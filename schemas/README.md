# Backblaze Labs schemas

Org-wide, versioned data contracts shared across Backblaze Labs repositories.
Because this repo is **public**, other repos reference these schemas by raw URL.

## `references.schema.json` — the references standard

A single machine-parseable file, **`references.yml`** at a repo's root, records
all *external references* about that project — blog posts, press, docs, videos,
directory/registry listings, and related projects — so internal tooling
(Quality Keeper validation, dashboards) can ingest a stable shape across every
repo.

- **Source of truth is the YAML file.** A human-rendered Markdown page is
  optional and is *not* part of the contract; the dashboard is the human view.
- **One flat `references` list.** Filter by `type` / `official` / `status`
  rather than nesting under headings — that is what keeps it parseable.

### Adopt it in a repo

Add `references.yml` to the repo root and point editors + CI at the schema with
the first-line comment:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/backblaze-labs/.github/main/schemas/references.schema.json
schema_version: 1
project: Backblaze B2 MCP Server
slug: b2-mcp
updated: "2026-09-08"          # quote dates so YAML keeps them as strings

canonical:
  repo: https://github.com/backblaze-labs/b2-mcp
  package: "@backblaze-labs/b2-mcp"
  display_name: Backblaze B2 MCP Server

references:
  - id: launch-blog
    title: Introducing the Backblaze B2 MCP Server
    url: https://www.backblaze.com/blog/introducing-the-backblaze-b2-mcp-server/
    type: blog
    source: Backblaze Blog
    official: true
    published: "2026-09-10"
    added: "2026-09-08"
    status: live
    summary: Company launch announcement for the B2 MCP server.

  - id: npm
    title: "@backblaze-labs/b2-mcp on npm"
    url: https://www.npmjs.com/package/@backblaze-labs/b2-mcp
    type: registry
    source: npm
    canonical_for: npm
    added: "2026-09-08"
    status: live

  - id: glama
    title: b2-mcp on Glama
    url: https://glama.ai/mcp/servers/@backblaze-labs/b2-mcp
    type: registry
    source: Glama
    added: "2026-09-08"
    status: live
    metrics: { grade: A }
```

A complete, valid sample lives in [`references.example.yml`](references.example.yml).

### Field reference

Top level (all required except `canonical`):

| Field | Type | Notes |
| --- | --- | --- |
| `schema_version` | `1` | Contract version; v1 is never mutated. |
| `project` | string | Human display name. |
| `slug` | string | Repo name (`^[a-z0-9][a-z0-9-]*$`). |
| `updated` | date | ISO-8601 (`YYYY-MM-DD`), last edit of this file. |
| `canonical` | object | Optional "use everywhere" identity for backlinks. |
| `references` | array | The entries (below). |

Each `references[]` entry (`id`, `title`, `url`, `type`, `added` required):

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique slug within the file. |
| `title` | string | |
| `url` | uri | |
| `type` | enum | `blog · press · docs · video · webinar · podcast · talk · tutorial · case_study · social · award · changelog · registry · listing · repo · board · issue · dashboard · tool · org · sample` |
| `source` | string | Publisher/platform. |
| `official` | boolean | `true` = first-party (Backblaze). |
| `published` | date | Publication date of the item, when known. |
| `added` | date | When this entry was recorded. |
| `language` | string | BCP-47 tag (default `en`). |
| `status` | enum | `live · dead · paused · archived` (default `live`). |
| `canonical_for` | string | Marks THE entry for a channel (e.g. `npm`); at most one per channel. |
| `tags` | string[] | |
| `summary` | string | One-liner. |
| `metrics` | object | Freeform (e.g. `{ grade: A }`, `{ score: 89 }`). |

Unknown fields are rejected (`additionalProperties: false`) so typos surface in
review; use `metrics` for additive, tool-specific data.

### Validation

The file is a strict JSON Schema (draft-07). Any JSON Schema validator works
(`ajv`, `check-jsonschema`, …); Quality Keeper enforces it across repos and can
additionally check link health and per-channel `canonical_for` uniqueness.

### Versioning

Breaking changes ship as a **new** file (`references.v2.schema.json`) with a
bumped `schema_version`; `v1` stays frozen so existing `references.yml` files
never break.
