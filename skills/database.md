# NestEgg Database Design Patterns

## Overview

This skill defines how NestEgg should use PostgreSQL, ClickHouse, Redis, and OpenSearch. It covers ownership, schema design, naming, performance, privacy, and operational patterns across transactional and analytical workloads.

## Guidelines

### Data ownership and store selection
- Let each service own its persistence model and lifecycle.
- Use PostgreSQL for transactional state and invariants.
- Use ClickHouse for analytical, time-series, and large aggregate queries.
- Use Redis for cache, short-lived coordination, rate-limiting state, and ephemeral lookups.
- Use OpenSearch for user-facing search, discovery, and filtering experiences.
- Never use Redis or OpenSearch as the source of truth for financial state.

### PostgreSQL schema patterns
- Keep schemas service-owned; avoid cross-service table access.
- Use clear snake_case naming for tables and columns.
- Standardize audit columns such as `created_at`, `updated_at`, and when appropriate `created_by`, `updated_by`.
- Use UTC timestamps and explicit time zone semantics.
- Model money, quantities, and rates with precise numeric types and documented scale.
- Add unique constraints for natural idempotency keys and business invariants where appropriate.
- Use optimistic locking or explicit concurrency controls for high-contention workflows.

### PostgreSQL operational guidance
- Add indexes intentionally based on real query paths from gateway, portfolio, trading, and admin features.
- Prefer explicit migrations and reversible rollout plans.
- Avoid long-running blocking migrations in production windows.
- Use outbox tables for durable event publication.
- Partition only when real data volume or retention patterns justify it.

### ClickHouse table patterns
- Design tables for query patterns first: sort keys, partition keys, TTLs, and aggregation strategy matter.
- Store event or metric timestamps explicitly and consistently.
- Prefer append-oriented models and derived materialized views for high-volume analytics.
- Version derived datasets when business meaning changes.
- Keep user or portfolio scope accessible without creating extreme cardinality pitfalls.
- Document freshness expectations and backfill processes for each analytical dataset.

### Redis key design
- Use namespaced keys such as `nestegg:portfolio:{portfolioId}:summary`, `nestegg:market:{instrumentId}:quote`, `nestegg:auth:session:{subject}`.
- Set TTLs explicitly and document invalidation strategy.
- Avoid storing large blobs when only a few fields are needed.
- Treat Redis as disposable; consumers must recover from eviction or restart.
- Use distributed locking sparingly and with timeout safeguards.

### OpenSearch index design
- Use explicit index names and aliases, versioned when mappings change.
- Model documents for search use cases such as instruments, watchlist suggestions, help content, or user-facing lookup datasets.
- Keep mappings explicit; do not rely on uncontrolled dynamic fields for critical indices.
- Reindex intentionally during schema changes and document cutover strategy.
- Avoid indexing sensitive data unless the search use case truly requires it and access controls are enforced.

### Privacy and retention
- Minimize duplicated PII across stores.
- Keep sensitive holdings or order details out of caches and search indices unless justified and protected.
- Define retention rules for analytical snapshots, logs, search documents, and cached entries.
- Support deletion and data lifecycle requirements without corrupting audit or regulatory obligations.

### Testing and validation
- Use migration tests and representative query benchmarks for PostgreSQL changes.
- Validate ClickHouse queries for partition pruning and performance.
- Test Redis invalidation and fallback behavior.
- Test OpenSearch mappings, analyzers, and ranking behavior for key search experiences.

## Checklist

- [ ] Each dataset lives in the store that matches its transactional or analytical role
- [ ] Service ownership is clear and there is no cross-service database coupling
- [ ] PostgreSQL schemas use precise types, constraints, and migration discipline
- [ ] ClickHouse tables are designed for partitioning, sorting, and freshness requirements
- [ ] Redis keys are namespaced, TTL-backed, and safe to lose
- [ ] OpenSearch indices are explicit, versioned, and free of unnecessary sensitive data
- [ ] Retention, deletion, and privacy impacts were considered for every new dataset
