# Agent guide

Domain language: `CONTEXT.md`. Decisions: `docs/adr/`.

## Available tooling

Before writing new HTTP/API glue, check whether one of these already covers it:

- **Todoist** — `scripts/lib/todoist-api.mts` (`createTodoistApi`, `getTodoistToken`, `addTriageQueueEntry`). Smoke: `npm run todoist:smoke`. ⚠️ Currently targets the deprecated v2 REST API; live calls return `410`. New endpoints live under `https://api.todoist.com/api/v1/`.
- **X (Twitter)** — `scripts/lib/x-api.mts` (tweet/mention types + fetchers), `scripts/lib/oauth.mts` (auth), `scripts/lib/x-likes-cache.mts`.
- **Mention pipeline** — `scripts/lib/mention-store.mts` (open/closed state), `scripts/lib/thread-builder.mts` (tree shape), `scripts/lib/mention-renderer.mts` (display).
- **Storage helpers** — `scripts/lib/storage.mts`.

## Agent skills

### Issue tracker

Issues live as GitHub issues at `mattpocock/mise-en-place`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical defaults: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
