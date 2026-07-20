# NestEgg Architecture Principles

## Overview

This skill captures the architectural principles for NestEgg as a privacy-first personal finance and asset management platform. It guides decisions across microservices in `apps/backend/`, frontend modules in `apps/frontend/`, shared libraries, contracts in `proto/`, and infrastructure in `infra/`.

## Guidelines

### Core architecture stance
- Build NestEgg as a modular, domain-oriented platform with clear bounded contexts and explicit contracts.
- Optimize for privacy, correctness, auditability, and operational resilience before feature sprawl.
- Prefer simple, explicit designs over abstract frameworks that hide domain behavior.
- Use the monorepo and Nx graph to make dependencies visible and controlled.

### Domain-driven design
- Model bounded contexts around business capabilities such as identity, trading, orders, portfolio, market data, analytics, indicators, screening, notifications, search, audit, and scheduling.
- Keep ubiquitous language consistent across code, protobuf, Kafka events, docs, and UI.
- Let each service own its data and invariants; integrate through published contracts instead of direct database sharing.
- Use aggregates to enforce local consistency and events to coordinate across contexts.

### Service boundaries
- `apps/backend/gateway` owns external API composition, auth boundary enforcement, and client-facing policies.
- `identity/user` owns user/account identity concepts and Keycloak-aligned integration concerns.
- `order`, `trading`, and `portfolio` own transactional finance workflows with strong consistency where required.
- `market`, `analytics`, `indicator`, and `screener` own data-intensive and eventually consistent read/compute flows.
- `notification`, `search`, `audit`, `scheduler`, and `websocket` provide supporting capabilities through clear contracts.
- Avoid creating chatty, tightly coupled microservices; merge boundaries if a capability cannot stand on its own.

### Communication patterns
- Use REST through the gateway for external clients.
- Use gRPC + Protocol Buffers for synchronous internal calls requiring low-latency responses and strong contracts.
- Use Kafka for asynchronous events, workflow decoupling, and data propagation.
- Do not share database tables across services as an integration mechanism.

### Data architecture
- PostgreSQL is the system of record for transactional domains.
- ClickHouse serves analytics and time-series or aggregate-heavy query patterns.
- Redis is for caching, ephemeral coordination, and performance-sensitive lookups, not primary truth.
- OpenSearch supports search and discovery experiences, not transactional correctness.
- Replicate or project data intentionally per service or read model; do not bypass service ownership.

### Monorepo and shared libraries
- Use `libs/java/*` and `libs/python/*` for stable cross-cutting concerns only.
- Keep shared libraries cohesive: security, grpc, kafka, database, observability, testing, clients, analytics utilities.
- Avoid pushing domain ownership into shared libraries; domain rules should remain in owning services.
- Use Nx dependency visibility to prevent unintended cross-module coupling.

### Event-driven design
- Model domain events as business facts with stable naming and versioning.
- Use outbox-driven publication for transactional services.
- Accept eventual consistency across service boundaries and design UX and operations around it.
- Make replay, idempotency, and backfill part of system design, not afterthoughts.

### Resilience and operability
- Expect partial failures between services and stores.
- Use timeouts, retries, circuit breaking, backpressure, and degraded-mode behavior deliberately.
- Instrument everything important with traces, metrics, and structured logs.
- Make audit trails first-class for sensitive financial and admin operations.

### Documentation and decision records
- Capture significant architectural choices as ADRs.
- Update system diagrams, contracts, and operational docs when introducing new services, topics, stores, or trust boundaries.
- Prefer written rationale over tribal knowledge for service splits, storage choices, and integration decisions.

## Checklist

- [ ] The change respects bounded contexts and keeps ownership clear
- [ ] Service communication uses REST, gRPC, or Kafka according to the architectural role
- [ ] Data ownership remains local to the owning service or read model
- [ ] Shared libraries contain cross-cutting concerns, not leaked domain ownership
- [ ] Event-driven flows account for eventual consistency, idempotency, and replay
- [ ] Operational resilience and auditability were considered in the design
- [ ] Architectural decisions that affect the platform are documented and reviewable
