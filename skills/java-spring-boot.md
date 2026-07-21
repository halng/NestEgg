# Java 21 + Spring Boot 3 for NestEgg Backend

## Overview

This skill defines how NestEgg Java services should be designed and implemented in `apps/backend/` using Java 21 and Spring Boot 3. It covers transactional business services, DDD boundaries, REST and gRPC edge patterns, persistence, Kafka integration, and operational conventions shared through `libs/java/`.

## Guidelines

### Service boundaries and package structure
- Treat each backend app under `apps/backend/<service>/` as an autonomous bounded context with its own API, domain, application, and infrastructure layers.
- Prefer a consistent package layout such as:
  - `api/` for REST controllers, request/response DTOs, and validation
  - `application/` for use cases, orchestration, and transactional services
  - `domain/` for aggregates, value objects, policies, and repository interfaces
  - `infrastructure/` for JPA entities, repository adapters, Kafka producers, gRPC clients, and external integrations
  - `config/` for Spring configuration and wiring
- Put shared cross-cutting code in `libs/java/common`, `libs/java/security`, `libs/java/database`, `libs/java/kafka`, `libs/java/grpc`, `libs/java/observability`, and `libs/java/testing` instead of duplicating it per service.
- Keep controllers thin. Controllers translate transport concerns into application commands; business rules belong in domain/application services.

### Java 21 language features
- Use records for immutable request/response DTOs, event payloads, and value types that do not need JPA proxying.
- Use sealed interfaces or sealed hierarchies for constrained domain concepts such as order states, portfolio events, and validation outcomes.
- Use `switch` expressions and pattern matching when they improve clarity for state transitions or event dispatch.
- Prefer immutable collections and defensive copying for domain objects exposed outside aggregate boundaries.
- Use virtual threads only for clearly I/O-bound paths and only after validating framework compatibility and observability behavior.

### Spring Boot application design
- Use constructor injection only.
- Keep `@Service` classes focused on a single use case or cohesive set of use cases.
- Annotate transactional application services with `@Transactional`; default to `readOnly = true` for query flows.
- Avoid placing `@Transactional` on controllers or repository adapters unless there is a strong reason.
- Centralize configuration properties in typed `@ConfigurationProperties` classes and validate them eagerly.
- Externalize service-to-service settings, topic names, index names, and cache TTLs instead of hard-coding them.

### Domain-driven design conventions
- Model business language explicitly: account, portfolio, position, order, trade, watchlist, screener, alert, audit record.
- Keep aggregates small and consistency-focused; use Kafka events for cross-service propagation instead of distributed transactions.
- Prefer domain methods like `portfolio.rebalance(...)` or `order.markFilled(...)` over anemic setter-based models.
- Represent identifiers and money carefully. Use typed IDs/value objects where practical, and use `BigDecimal` with explicit scale and rounding rules for monetary values.
- Separate write models from read models when query shape diverges materially from transactional consistency needs.

### Persistence and PostgreSQL access
- Keep JPA entities in infrastructure, not as the domain model for complex aggregates.
- Use Spring Data repositories as adapters behind domain repository interfaces when business logic needs isolation from persistence concerns.
- Prefer explicit fetch strategies and projections to avoid N+1 issues.
- Use optimistic locking for high-contention entities such as portfolios, orders, and balances.
- Model audit columns consistently (`created_at`, `updated_at`, optional `created_by`, `updated_by`) and use UTC everywhere.
- Store idempotency keys, outbox records, and external correlation IDs for transactional workflows.

### REST, gateway, and internal communication
- Public and mobile/web-facing APIs should be designed for `apps/backend/gateway/`; internal synchronous calls should favor gRPC defined in `proto/`.
- Validate all inbound REST payloads with Bean Validation and map failures to stable error responses.
- Never leak internal entities over HTTP or gRPC. Use explicit DTOs/messages.
- Use pagination, filtering, and stable sort order for list endpoints that back dashboard, portfolio, screener, or watchlist screens.
- For internal APIs, prefer deadline-aware gRPC clients and propagate trace context and correlation IDs.

### Kafka and asynchronous workflows
- Publish domain events only after the transaction commits, preferably with an outbox pattern for reliability.
- Name events in business terms, not CRUD terms, for example `portfolio.rebalanced.v1` rather than `portfolio.updated`.
- Make consumers idempotent by keying on event ID, aggregate ID plus version, or a deduplication table.
- Keep retry, DLQ, and poison-message handling explicit per consumer group.
- Emit events for audit-relevant actions such as login, order placement, order cancellation, portfolio import, and admin changes.

### Validation and error handling
- Distinguish domain rule violations, technical failures, and downstream dependency failures.
- Map domain errors to stable machine-readable codes that frontend and audit systems can reason about.
- Do not swallow exceptions. Wrap with context when crossing boundaries.
- Log failures with request IDs, user IDs/subject IDs, aggregate IDs, and external dependency names, but never log secrets or raw tokens.

### Security and Keycloak integration
- Use `libs/java/security` for shared security filters, token parsing, RBAC helpers, and method security configuration.
- Treat Keycloak subject, realm, client, and roles as authoritative identity inputs; map them into NestEgg-specific permissions in the application layer.
- Enforce least privilege for admin, support, and trading actions.
- Validate tenant/workspace/account ownership on every state-changing command.
- Never trust role claims alone when the action also requires resource ownership checks.

### Observability and operations
- Instrument inbound requests, Kafka listeners, database calls, and gRPC client calls with OpenTelemetry spans.
- Expose Prometheus metrics for latency, throughput, errors, retries, queue lag where applicable, and domain counters such as orders submitted or portfolios synced.
- Use structured JSON logs with stable fields: `trace_id`, `span_id`, `service`, `environment`, `user_id` or `subject`, `portfolio_id`, `order_id`, `event_type`.
- Add readiness/liveness probes and fail fast on broken dependencies that are required for startup.

### Testing expectations
- Write fast unit tests for domain rules.
- Use slice tests for controllers, JPA adapters, Kafka serializers, and security configuration.
- Use integration tests with Testcontainers for PostgreSQL, Kafka, Redis, and OpenSearch when the behavior depends on the real protocol or storage engine.
- Add contract tests for gRPC messages and backward-compatible schema evolution.

## Checklist

- [ ] Service code is placed under the correct bounded context in `apps/backend/<service>/`
- [ ] Controllers are thin and application services own transactions and orchestration
- [ ] Domain rules are expressed in domain/application code, not hidden in controllers or entities
- [ ] PostgreSQL access avoids N+1 queries and uses explicit locking/versioning where needed
- [ ] gRPC and Kafka integrations use DTO/message boundaries and propagate trace/correlation context
- [ ] Errors, logs, and metrics are structured, stable, and privacy-safe
- [ ] Keycloak claims are combined with resource-level authorization checks
- [ ] Unit and integration tests cover domain rules and critical service flows
