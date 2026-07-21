# Apache Kafka Event Patterns for NestEgg

## Overview

This skill defines how NestEgg uses Apache Kafka for asynchronous workflows across backend services. It covers topic naming, event design, producer and consumer behavior, retries, dead-letter handling, and event-driven coordination between services in `apps/backend/`.

## Guidelines

### When to use Kafka
- Use Kafka for domain event propagation, async workflows, data ingestion, cache invalidation, analytics triggers, notification fan-out, and audit-adjacent event streams.
- Do not use Kafka as a substitute for synchronous validation or immediate read-after-write requirements; use gRPC for those cases.
- Prefer events for cross-service integration when bounded contexts should remain loosely coupled.

### Topic naming conventions
- Use stable, domain-oriented topic names such as:
  - `nestegg.identity.user-events.v1`
  - `nestegg.portfolio.events.v1`
  - `nestegg.order.lifecycle.v1`
  - `nestegg.market.ticks.v1`
  - `nestegg.analytics.recompute-requests.v1`
  - `nestegg.audit.activity.v1`
- Include version suffixes in the topic name when schema evolution requires independent migration.
- Separate command-like topics from fact/event topics when both exist.
- Keep environment-specific routing out of code when possible; configure physical topic mapping per environment.

### Event design
- Use events to describe business facts, not implementation details.
- Prefer names like `order.placed`, `order.rejected`, `portfolio.snapshot-refreshed`, `watchlist.item-added`, `indicator.recomputed`.
- Include a unique event ID, event type, event version, occurred-at timestamp, producer service, aggregate or entity ID, trace or correlation ID, and subject or actor context when appropriate.
- Keep payloads self-describing enough for downstream consumers, but avoid embedding full aggregates unless justified.
- Use schema versioning and explicit compatibility rules; keep the serializer choice consistent within the platform.

### Producer patterns
- Publish only after the source transaction is durable; use an outbox pattern for PostgreSQL-backed services.
- Use deterministic partition keys based on aggregate identity when event order matters, such as `portfolio_id`, `order_id`, or `user_id`.
- Emit one event per meaningful state transition rather than overloaded catch-all updates.
- Avoid dual writes from application code directly to database and Kafka without coordination.

### Consumer patterns
- Each consumer group should own a specific business responsibility.
- Keep consumers idempotent using event IDs, aggregate version checks, or deduplication tables.
- Commit offsets only after the effect of processing is durable.
- Make handler behavior explicit for duplicates, out-of-order events, missing dependencies, and tombstones if used.
- Do not let a single slow downstream call block a high-volume partition indefinitely; use buffering, retries, or side queues where needed.

### Retries, DLQs, and failure handling
- Distinguish transient failures from permanent validation or schema failures.
- Use bounded retries with exponential backoff for transient downstream issues.
- Route poison messages to dead-letter topics that preserve original metadata and failure details.
- Create clear operational ownership for DLQ review and replay.
- Avoid infinite retry loops that hide systemic issues.

### Event-driven workflow examples for NestEgg
- Identity emits user or account lifecycle events consumed by notification, audit, and search.
- Order lifecycle events feed portfolio position updates, notifications, analytics, and audit.
- Market data ingestion triggers indicator recomputation and screener refresh workflows.
- Portfolio changes invalidate Redis caches and refresh search or dashboard projections.
- Scheduler emits recurring job triggers rather than embedding all job timing in service-local cron logic.

### Security and privacy
- Treat Kafka topics as internal but sensitive infrastructure.
- Do not include secrets, access tokens, full PII, or unnecessary account details in event payloads.
- Minimize personally identifiable content; prefer internal IDs and fetch details synchronously when required.
- Audit who can publish and consume regulated or privacy-sensitive topics.

### Observability and operations
- Instrument producers and consumers with OpenTelemetry spans linked to the originating request or upstream event.
- Expose Prometheus metrics for publish failures, consumer lag, processing latency, retry counts, DLQ counts, and throughput.
- Log topic, partition, offset, key, event type, version, correlation ID, and outcome.
- Provide dashboards and alerts for lag spikes, consumer failures, DLQ growth, and schema mismatch incidents.

### Testing expectations
- Unit test serialization, deserialization, routing, and idempotency logic.
- Use integration tests with Kafka containers for producer/consumer flows and offset behavior.
- Add contract tests for schema evolution and backward compatibility.
- Exercise replay scenarios and duplicate delivery explicitly in tests.

## Checklist

- [ ] Kafka is used only for asynchronous, decoupled workflows that do not require immediate synchronous responses
- [ ] Topic names are versioned, domain-oriented, and environment-independent in code
- [ ] Events capture business facts with IDs, timestamps, versions, and correlation metadata
- [ ] Producers use outbox or equivalent reliability guarantees when state changes are persisted
- [ ] Consumers are idempotent, durable before offset commit, and operationally observable
- [ ] Retry and DLQ behavior is explicit and supports safe replay
- [ ] Event payloads avoid secrets and unnecessary private financial data
