# Feature specifications

This directory contains feature specifications generated from newly opened GitHub issues by the `01-spec.yml` workflow.

## File naming

Create one specification per issue using:

```text
feature-<issue-number>.md
```

For example, issue `#42` produces `feature-42.md`.

## Required sections

Every feature specification must include:

1. **Summary** — business context and user value.
2. **User Stories** — actors, triggers, and expected outcomes.
3. **Acceptance Criteria** — measurable and testable outcomes for every story.
4. **Scope** — explicit in-scope and out-of-scope behavior.
5. **Dependencies** — impacts to backend, frontend, contracts, infrastructure, and other services.
6. **Risks** — privacy, security, compliance, operational, and delivery concerns.
7. **Open Questions** — unresolved assumptions that require human input.

The specification is reviewed in its pull request. Applying `spec-approved` to that pull request advances it to the architecture-design workflow.
