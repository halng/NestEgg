# NestEgg Testing Strategy

## Overview

This skill defines the testing approach for NestEgg across Java, Python, frontend, gRPC, Kafka, databases, and infrastructure-adjacent integration points. The goal is to maintain high confidence in a privacy-first financial platform without relying only on broad end-to-end tests.

## Guidelines

### Testing pyramid for NestEgg
- Prefer many fast unit tests, a deliberate set of integration tests, and a smaller but critical set of end-to-end flows.
- Place business-rule tests as close as possible to the code that owns the rule.
- Use contract tests for service boundaries: REST, gRPC, Kafka, and search/index mappings.
- For money, trading, portfolio, and auth flows, bias toward additional integration coverage because the blast radius is high.

### Java testing patterns
- Unit test domain logic in `apps/backend/*` and shared code in `libs/java/*` without starting Spring when possible.
- Use JUnit 5, Mockito only where appropriate, and avoid overspecifying internals.
- Use Spring slice tests for controllers, repositories, and security configuration.
- Use Testcontainers for PostgreSQL, Kafka, Redis, OpenSearch, and other real dependencies when behavior depends on protocol or storage semantics.
- Test transactional boundaries, outbox behavior, idempotency, and optimistic locking in integration tests.

### Python testing patterns
- Unit test pure analytics and indicator logic with deterministic fixtures.
- Use pytest for service and library testing in `apps/backend/*` and `libs/python/*`.
- Add FastAPI integration tests for validation, auth context, and error mapping.
- Use real dependency containers or realistic test environments for ClickHouse, Redis, Kafka, and OpenSearch integrations.
- Cover numerical stability, time windows, missing market data, and dataset freshness edge cases.

### Frontend testing patterns
- Unit test formatters, hooks, reducers, and validation utilities.
- Add component tests for stateful UI and important forms.
- Add e2e coverage for login, session renewal, watchlist actions, screener runs, portfolio views, and trading submission flows.
- Validate permission-based rendering, retry behavior, and responsive layouts.
- Treat critical financial confirmations and totals as high-priority assertions.

### Contract testing
- Verify REST response shapes and error codes for gateway-facing APIs.
- Verify protobuf compatibility whenever files in `proto/` change.
- Verify Kafka event schema, routing keys, replay behavior, and version handling.
- Verify OpenSearch index mappings and query behavior where search features depend on exact analyzers or fields.

### Test data and fixtures
- Use synthetic, privacy-safe test data only.
- Create reusable fixtures for users, portfolios, positions, orders, instruments, screener universes, and time series.
- Make time explicit in tests; freeze clocks or inject time sources for deterministic results.
- Avoid hidden coupling between tests through shared mutable data.

### Reliability and failure testing
- Test dependency timeouts, retry behavior, and fallback handling for gRPC, Kafka, Redis, OpenSearch, and market-data providers.
- Add idempotency and replay tests for event consumers.
- Test concurrency or double-submit scenarios for trading and portfolio mutations.
- Include negative tests for authorization failures, invalid inputs, expired sessions, and stale versions.

### Coverage and quality bar
- Prioritize meaningful coverage over raw percentage targets.
- Require tests for new business rules, bug fixes, serialization contracts, and risky migrations.
- If a change intentionally lacks automated coverage, document why and what manual validation compensates.
- Keep slow tests clearly separated and runnable in CI.

### CI and monorepo expectations
- Use Nx-aware test selection where supported so impacted projects run quickly.
- Ensure shared library changes trigger dependent service tests.
- Keep test commands reproducible locally and in CI.
- Fail fast on flaky tests; do not normalize instability in a finance platform.

## Checklist

- [ ] New business logic has fast unit tests near the owning module
- [ ] Risky integrations use real dependency behavior through integration tests
- [ ] REST, gRPC, Kafka, and schema changes include contract validation
- [ ] Frontend critical flows have component or e2e coverage where needed
- [ ] Test data is synthetic, deterministic, and time-aware
- [ ] Failure, retry, idempotency, and authorization paths were exercised
- [ ] CI impact and monorepo dependency coverage were considered
