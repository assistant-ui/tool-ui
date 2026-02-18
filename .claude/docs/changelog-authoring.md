# Changelog Authoring

Guide for writing changelog entries in `app/docs/changelog/content.mdx`.

For deeper background on the changelog system design, see the RFC at `docs/rfcs/2026-02-12-automated-changelog-and-migration-prompts.md`. Note: the RFC's original constraint that migration prompts require breaking changes is outdated — the validator now allows migration prompts independently.

## File Structure

The changelog is a single MDX file. Each release is a `## YYYY-MM-DD` section with subsections in this order:

1. `### Breaking changes` (optional) — bullet list
2. `### Migration prompt` (optional) — must contain a markdown code fence
3. `### Changes` (required) — bullet list

No prose between the `##` heading and first `###` subsection. MDX comments are allowed (see Marker below).

## Marker Comment

The top of the file may include an MDX comment tracking the last generated commit ref:

```mdx
{/* changelog-generated-to: <short-sha> */}
```

Use MDX comment syntax `{/* */}`, not HTML `<!-- -->`.

## What Counts as a Breaking Change

- **Breaking change** = a cross-cutting change affecting ALL components at once (e.g., enforcing `/schema` entrypoints repo-wide, migrating the action model across all components)
- **Component update** = individual components evolved — existing copies still work, users upgrade via `npx shadcn@latest add`. NOT a breaking change.
- This is a copy/paste library (shadcn model), not an npm package. No semver contract.

## Migration Prompt

A prompt users copy-paste into their **coding agent** (e.g., Claude Code). Can exist with or without breaking changes.

### Voice & structure

- Write in imperative, agent-directed voice
- Structure: opening directive → numbered Goals → bulleted Steps → verification
- Reference the `2026-02-12` entry for detailed style, `2026-02-17` for upgrade-only style

### Required content

- Include `npx shadcn@latest add` commands with full registry URLs (`https://tool-ui.dev/r/{name}.json`)
- End steps with: lint, typecheck, tests; fix breakages
- End with: validate UI rendering

### Formatting

- Wrap the entire prompt in a `` ```text `` code fence
- The validator (`lib/changelog/changelog.ts`) rejects migration prompts without a code fence

## Changes Bullet Style

- New components: `New component: [Name](/docs/name) — short description.`
- Component names in inline code when mentioned in prose: `` `Code Block` ``
- Use markdown links to doc routes when introducing a component: `[Code Block](/docs/code-block)`
- Group related changes; lead with the most significant

## Naming Conventions

- Use "shared theme tokens" (never "pierre theme tokens")

## What NOT to Include

- Internal fixes: terminal wrapping, docs preview clipping, gallery exports, registry closure fixes
- Only user-facing changes belong in the changelog

## Validation

`lib/changelog/changelog.ts` exports `validateChangelogStructure`. Rules enforced:

- Each `##` section must have a valid `YYYY-MM-DD` heading
- `### Changes` is required in every release
- `### Breaking changes` and `### Migration prompt` must appear before `### Changes`
- No duplicate `### Migration prompt` headings
- Migration prompt body must contain a markdown code fence
- No unsupported `###` subsection headings
- No prose between `##` heading and first `###` subsection (MDX comments OK)
