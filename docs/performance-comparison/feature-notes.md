# Performance Comparison (NXT-77201) — Feature Notes for Claude Code

These notes apply only while working on Insights Performance Comparison. They add to the project CLAUDE.md; they don't replace it. If anything here conflicts with the project CLAUDE.md, stop and ask.

Before working on anything related to Performance Comparison, read:
1. `docs/performance-comparison/spec.md` — the source of truth (rules, decisions, scope).
2. `docs/performance-comparison/discovery.md` — what already exists in this repo and where.

## Ground rules
- **This is a prototype for developers to re-implement in production.** Write clear, well-named, spec-traceable code. Comment non-obvious rules with their story/section, e.g. `// NXT-77217 §5.8 Needs Attention`.
- **The rules engine is pure TypeScript** with no React and no mock-data imports. It is the single source of comparison facts. Components never calculate classifications, deltas, target status, or Needs Attention themselves.
- **UI never imports mock data directly.** Go through `comparisonDataService`.
- **Never show "A"/"B", "left side"/"right side", or "baseline" to the user.** Use generated labels.
- **No Data is `null`, never `0`.** A missing benchmark is `null`, never a missed target.
- **Out of scope:** security/permissions/site or KPI trimming, making the Insights Dashboard data-driven, real AI calls, Supabase for comparison data. Do not add code for these.
- **Don't change existing dashboard behavior or mock data** beyond what the spec calls for (the Compare button, controlled-selector props that stay backward compatible, and promoting `DEMO_SITES`).
- Reuse existing components and patterns listed in the discovery report before building new ones.
- Run lint, typecheck, and tests (Vitest, added in Phase 1) before reporting a phase complete.

## Working style for this feature
- Work one phase at a time (`docs/performance-comparison/phase-prompts.md`). Don't start the next phase until asked.
- If the spec is ambiguous or conflicts with the code, stop and ask rather than guessing.
- At the end of a phase, summarize what changed (files), what was tested, and any open questions or deviations from the spec.
