# Issue-to-production automation with Codex CLI

![Issue-to-production design](../../docs/architecture/issue-to-prod.png)

The numbered `0x-*.yml` workflows implement the repository's gated delivery flow. Each AI stage now runs **OpenAI Codex CLI directly on the GitHub Actions runner** rather than posting a Copilot mention and waiting for a separate agent.

## Prerequisites

1. Add an Actions secret named `OPENAI_API_KEY` containing an OpenAI API key that can run Codex.
2. Keep the standard `GITHUB_TOKEN` permissions enabled. The workflows use it to create branches and pull requests, push Codex changes, manage labels, and merge approved work.
3. Keep Node.js available on the runner. The shared action installs Codex using npm exactly as follows:

   ```bash
   npm install -g @openai/codex
   ```

The reusable local action at `.github/actions/run-codex/action.yml` validates the requested role and skills, assembles their Markdown into the task context, and runs:

```bash
codex exec --full-auto -
```

`OPENAI_API_KEY` is passed only through the action environment and is never added to the generated prompt or repository.

## Repository roles and skills

Every Codex invocation must declare:

- a `role`, resolved as `agents/<role>.md`; and
- zero or more space-separated `skills`, each resolved as `skills/<skill>.md`.

The shared action fails immediately if a role or skill does not exist. It places the selected role first, appends the relevant skills, and then appends the stage-specific task. This makes Codex navigate and apply the role definitions in `agents/` and the technical playbooks in `skills/` instead of relying on a role name in a comment.

Example:

```yaml
- name: Generate architecture with Codex CLI
  uses: ./.github/actions/run-codex
  with:
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    role: egg-techinical-architect
    skills: architecture database grpc-protobuf kafka-events security
    prompt: |
      Read the approved specification and create the design artifacts.
```

The role file names currently retain the repository's existing spelling (for example, `egg-techinical-architect` and `egg-backend-enginner`).

## Delivery stages

| Workflow                | Trigger / gate                                       | Codex role                                                                                 | Result                                                                                                                                    |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `01-spec.yml`           | Issue opened or reopened                             | Business Analyst with architecture and security skills                                     | Creates `docs/specs/feature-<issue>.md`, pushes `codex/spec-<issue>`, and opens a linked PR.                                              |
| `02-design.yml`         | `spec-approved` label on the spec PR                 | Technical Architect with architecture, data, messaging, observability, and security skills | Commits the design and ADR to the PR branch and applies `design-pending`.                                                                 |
| `03-tasks.yml`          | `design-approved` label                              | Task Planner with architecture, testing, security, and observability skills                | Commits the executable task plan and applies `task-pending`.                                                                              |
| `04-implementation.yml` | `task-approved` label                                | Planner → QA → Engineer → Reviewer → Validator                                             | Runs the roles sequentially in one workspace, commits their implementation, then uses CI quality gates and Codex review/correction roles. |
| `05-fix-on-mention.yml` | `approved` label or a PR comment containing `@codex` | Security Analyzer, Backend Engineer, or Technical Validator                                | Routes requested fixes, runs final checks/review, merges an approved PR, and executes post-merge actions.                                 |

## Human approval gates

The automation deliberately retains human-controlled labels between generative stages:

1. Review the specification and add `spec-approved`.
2. Review the design and add `design-approved`.
3. Review the task plan and add `task-approved`.
4. Review the implementation after `ready-for-human-review`; add `approved` only when it is safe to merge.

Pending labels (`spec-pending`, `design-pending`, and `task-pending`) communicate which artifact needs review. Automated validators and the quality gates still fail malformed or unsafe output before the next stage.

## PR commands

Mention `@codex` in a pull-request comment to route work to Codex. The command text is treated as task input:

- `@codex fix security issue ...` selects the Security Analyzer.
- `@codex fix test ...`, `fix build ...`, or `fix lint ...` selects the Backend Engineer.
- `@codex /re-run` or `@codex regenerate tests` runs the final CI path instead of the fix path.

Codex does not commit from inside the agent session. Each workflow owns the subsequent Git commit and push so authorship and branch mutations remain explicit in the Actions log. Automated pushes require a branch in the same repository; pull requests from forks remain human-managed because the repository token cannot safely write to a fork and secrets are not exposed to fork workflows.
