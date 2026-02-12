---
title: "RFC: Agent-Inferred Changelog and Migration Prompt Generation (Lean v1)"
type: rfc
status: proposed
date: 2026-02-12
owners:
  - "@tool-ui-maintainers"
---

# RFC: Agent-Inferred Changelog and Migration Prompt Generation (Lean v1)

## Summary

Ship the simplest viable automation:

1. Keep `release-please` for release PR/version orchestration.
2. Generate changelog content directly from release commit history using a coding agent.
3. Write exactly one release section into `app/docs/changelog/content.mdx`, including at most one migration prompt block.
4. Enforce structure with one CI check (`changelog:check`).

No PR metadata schema. No release manifest. No LLM in CI gates.

## Why This Direction

We optimize for operational simplicity:

- one generation command for maintainers,
- one output file to review,
- one CI check for structural correctness.

Inference quality is trusted to the coding agent, with human review in the release PR as the control point.

## Context and Problem

Changelog updates and migration guidance are currently manual and inconsistent. The docs changelog route is now user-facing, so each release needs predictable structure without adding heavy release process overhead.

## Goals

- Minimize release process complexity for a single-package repo.
- Produce changelog entries and migration guidance quickly.
- Preserve UX constraints:
  - changelog-first content (no intro fluff),
  - exactly one migration prompt section max per release,
  - prompt snippet container capped at `max-h-[300px]`.
- Keep maintainer review as final approval before merge.

## Non-Goals

- Deterministic factual synthesis from hand-authored metadata in v1.
- Per-PR metadata rollout.
- Monorepo/multi-package release workflows.
- Autonomous publish with no maintainer review.

## v1 Proposed Design

### 1) Release orchestration

Use `release-please` for version and release PR management only.

### 2) Agent-inferred changelog generation

Add a maintainer command (example):

```bash
pnpm changelog:generate
```

Behavior:

1. Resolve release range (last release tag to `HEAD` on release PR branch).
2. Gather inputs for inference:
  - commit subjects/bodies in range,
  - touched files (optionally grouped by component),
  - existing changelog format from `app/docs/changelog/content.mdx`.
3. Ask coding agent to produce a structured payload:
  - `breakingChanges: string[]`
  - `changes: string[]`
  - `migrationPrompt: string | null`
4. Render one new top section in `app/docs/changelog/content.mdx`.
5. If inferred breaking changes exist, render `### Migration prompt` exactly once. Otherwise omit it.

### 3) Rendering contract

Generator output must satisfy:

- newest release section first,
- headings order:
  - `## <date>`
  - optional `### Breaking changes`
  - optional `### Migration prompt` (max one)
  - `### Changes`
- no prose before release items in each section,
- preserve existing prompt container markup and `max-h-[300px]`.

### 4) CI gate (single)

Add one check command (example):

```bash
pnpm changelog:check
```

It validates structure only:

1. release section order is valid,
2. at most one `### Migration prompt` per release section,
3. migration prompt block (if present) keeps required max-height style,
4. no unexpected heading format regressions.

CI does not re-infer content in v1.

## Testing Strategy (v1)

- Unit tests for changelog section parser/validator.
- Snapshot tests for render templates:
  - with breaking changes + migration prompt,
  - without breaking changes.
- Integration test for `changelog:check` failure cases (duplicate migration prompt, invalid heading order).

## Rollout Plan

1. Phase 1 (1 day)
- Implement `changelog:generate` command with agent inference.
- Implement renderer for `app/docs/changelog/content.mdx`.

2. Phase 2 (1 day)
- Implement `changelog:check` and structural tests.
- Wire check into CI.

3. Phase 3 (same day)
- Dry-run on next release PR.
- Document maintainer flow in release checklist.

## Maintainer Release Flow (v1)

1. `release-please` opens/updates release PR.
2. Run `pnpm changelog:generate`.
3. Review/edit generated section in `app/docs/changelog/content.mdx`.
4. CI runs `pnpm changelog:check`.
5. Merge release PR.

## Deferred Scope

### v2

- Optional `--from-prs` mode to enrich inference context with PR titles/bodies.
- Optional maintainers prompt presets for more consistent tone/format.
- Optional strict diff guard (`generate` + clean git check) if desired.

### v3

- Optional metadata-backed deterministic mode for larger scale.
- Optional multi-package support.
- Optional analytics/policy automation.

## Risks and Mitigations

- Risk: inferred output may misclassify breaking changes.
- Mitigation: maintainer review remains required in release PR.

- Risk: wording inconsistency across releases.
- Mitigation: render contract + examples + optional prompt presets in v2.

- Risk: structural drift over time.
- Mitigation: `changelog:check` in CI with focused failure cases.

## Success Metrics

- Release-note authoring time remains under 5 minutes per release PR.
- 0 releases with duplicate migration prompt sections.
- 100% compliance with changelog UX structure constraints.

## References

- [release-please](https://github.com/googleapis/release-please)
- [release-please-action](https://github.com/googleapis/release-please-action)
