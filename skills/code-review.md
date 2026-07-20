# NestEgg Code Review Standards

## Overview

This skill defines how code reviews should be performed in NestEgg. Reviews must protect correctness, security, privacy, performance, operability, and architectural coherence across Java, Python, frontend, infrastructure, protobuf, and event-driven changes.

## Guidelines

### Review goals
- Verify the change solves the stated problem completely and only within the intended scope.
- Protect user trust in a privacy-first finance platform by prioritizing security, data handling, and operational safety.
- Ensure new code aligns with NestEgg architecture, shared libraries, and bounded contexts.
- Look for long-term maintainability, not only immediate functionality.

### Review preparation
- Read the problem statement, issue, or acceptance criteria first.
- Identify which areas are touched: `apps/backend/`, `apps/frontend/`, `libs/java/`, `libs/python/`, `proto/`, `infra/`, `agents/`, `skills/`.
- Check whether the PR updates contracts, schemas, topics, metrics, dashboards, docs, tests, or ADRs when required.
- Understand blast radius: auth, trading, portfolio valuation, analytics freshness, caching, search indexing, audit logging, or infra rollout.

### Core review checklist
- Correctness: does the code implement the intended behavior and handle edge cases?
- Security: does it create auth/authz gaps, secret exposure, injection risk, or privacy leaks?
- Data integrity: are transactional boundaries, idempotency, and consistency rules respected?
- Performance: are there obvious N+1 queries, fan-out bottlenecks, heavy renders, inefficient queries, or memory risks?
- Architecture: does the code belong in the touched service/module, and does it use shared libraries appropriately?
- Observability: are logs, traces, and metrics sufficient for operations and incident response?
- Testing: are the right unit, integration, and e2e tests added or updated?
- Backward compatibility: does the change preserve API, proto, event, schema, or client compatibility where expected?

### Java/Spring review focus
- Controllers stay thin and application services own transactions.
- Domain rules are not hidden in JPA entities or controllers.
- Repositories use efficient fetching and locking strategies.
- Kafka producers/consumers are reliable and idempotent.
- Security annotations and resource-level checks are both present where needed.

### Python/FastAPI review focus
- Request/response models are typed and validated.
- Analytical code is deterministic and separated from I/O glue.
- ClickHouse/OpenSearch/Redis usage is explicit and efficient.
- Async and concurrency patterns are safe and observable.

### Frontend review focus
- Components remain modular and typed.
- Auth/session handling is centralized and safe.
- Sensitive data is not overexposed in logs, local storage, or analytics.
- User flows handle error, loading, empty, and permission states correctly.

### Protobuf/Kafka review focus
- Field numbers are stable and reserved when removed.
- Topic and event names reflect business language and versioning rules.
- Consumers remain replay-safe and idempotent.
- Cross-language compatibility is considered for Java and Python consumers.

### Infrastructure and observability review focus
- Kubernetes, Docker, and Terraform changes are environment-safe and principle-of-least-privilege aligned.
- Alerts, dashboards, probes, and resource settings are updated when runtime behavior changes.
- Deployment ordering and migration paths are explicit for breaking infra or schema changes.

### Review comment style
- Be specific, actionable, and evidence-based.
- Prioritize comments that prevent bugs, outages, security issues, or design drift.
- Distinguish blocking findings from optional suggestions.
- Reference exact files, workflows, data flows, or failure scenarios.
- Avoid nitpicks unless they hide a real maintenance or correctness problem.

## Checklist

- [ ] The change fully addresses the requirement and stays within a justified scope
- [ ] Security, privacy, and authorization impacts were reviewed first
- [ ] Transactional integrity, idempotency, and compatibility concerns were checked
- [ ] Performance, observability, and operational readiness were evaluated
- [ ] Tests cover the change at the right levels
- [ ] Required docs, contracts, schemas, and runbooks were updated
- [ ] Review feedback is specific, high-signal, and tied to real risks
