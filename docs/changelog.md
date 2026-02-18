# Changelog System

Automated changelog for `app/docs/changelog/content.mdx`. This is a copy/paste component library (shadcn model), not an npm package — there is no semver contract.

## Commands

```bash
pnpm changelog:generate   # Generate entries from git history via agent inference
pnpm changelog:check      # Validate structure (runs in CI via verify:ci)
```

## Entry Structure

The changelog is a single MDX file. Each release is a `## YYYY-MM-DD` section with subsections in this order:

1. `### Breaking changes` (optional) — bullet list
2. `### Migration prompt` (optional) — must contain a markdown code fence
3. `### Changes` (required) — bullet list

No prose between the `##` heading and first `###` subsection. MDX comments are allowed (see Marker below).

### Marker comment

The top of the file may include an MDX comment tracking the last generated commit ref:

```mdx
{/* changelog-generated-to: <short-sha> */}
```

Use MDX comment syntax `{/* */}`, not HTML `<!-- -->`.

## Breaking Changes vs Component Updates

- **Breaking change** = a cross-cutting change affecting ALL components at once (e.g., enforcing `/schema` entrypoints repo-wide, migrating the action model across all components)
- **Component update** = individual component evolution — existing copies still work, users upgrade via `npx shadcn@latest add`. NOT a breaking change.

## Migration Prompt

A prompt users copy-paste into their **coding agent** (e.g., Claude Code). Can exist with or without breaking changes.

### Voice and structure

- Write in imperative, agent-directed voice
- Structure: opening directive → numbered Goals → bulleted Steps → verification
- Reference the `2026-02-12` entry for detailed style, `2026-02-17` for upgrade-only style

### Required content

- Include `npx shadcn@latest add @tool-ui/{name}` commands
- End steps with: lint, typecheck, tests; fix breakages
- End with: validate UI rendering

### Formatting

- Wrap the entire prompt in a `` ```text `` code fence
- The validator (`lib/changelog/changelog.ts`) rejects migration prompts without a code fence

## Writing Style

- New components: `New component: [Name](/docs/name) — short description.`
- Component names in inline code when mentioned in prose: `` `Code Block` ``
- Use markdown links to doc routes when introducing a component: `[Code Block](/docs/code-block)`
- Group related changes; lead with the most significant
- Use "shared theme tokens" (never "pierre theme tokens")
- Only user-facing changes — no internal fixes (terminal wrapping, docs preview clipping, gallery exports, registry closure fixes)

## Validation Rules

`lib/changelog/changelog.ts` exports `validateChangelogStructure`. Rules enforced:

- Each `##` section must have a valid `YYYY-MM-DD` heading
- `### Changes` is required in every release
- `### Breaking changes` and `### Migration prompt` must appear before `### Changes`
- No duplicate `### Migration prompt` headings
- Migration prompt body must contain a markdown code fence
- No unsupported `###` subsection headings
- No prose between `##` heading and first `###` subsection (MDX comments OK)

## Architecture

The `lib/changelog/` directory contains three modules:

- **`changelog.ts`** — Validation (`validateChangelogStructure`) and rendering (inserts new sections into the MDX file)
- **`git.ts`** — Commit range resolution (last release tag to HEAD)
- **`inference.ts`** — LLM inference (gathers commit evidence, asks a coding agent for structured release notes)

### Maintainer flow

1. `release-please` opens/updates release PR
2. Run `pnpm changelog:generate`
3. Review/edit generated section in `app/docs/changelog/content.mdx`
4. CI runs `pnpm changelog:check`
5. Merge release PR
