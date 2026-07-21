# Python 3.12 + FastAPI for NestEgg Data Services

## Overview

This skill covers implementation patterns for NestEgg Python services in `apps/backend/analytics`, `apps/backend/indicator`, `apps/backend/screener`, and other data-heavy components built with Python 3.12 and FastAPI. It focuses on high-throughput APIs, analytics pipelines, strong typing, and predictable interoperability with Kafka, gRPC, ClickHouse, Redis, and OpenSearch.

## Guidelines

### Service role and scope
- Use Python services for workloads that benefit from the ecosystem: analytics, screening, indicator calculation, model scoring, ingestion transforms, and search/query enrichment.
- Keep transactional ownership in Java services unless the domain is explicitly analytics-oriented and eventually consistent.
- Align each Python service structure with the monorepo layout:
  - `apps/backend/<service>/app/api` for routers and HTTP contracts
  - `app/application` for orchestration and use cases
  - `app/domain` for core calculations, rules, and typed models
  - `app/infrastructure` for ClickHouse, Redis, Kafka, gRPC, OpenSearch, and market data clients
  - shared utilities in `libs/python/*`

### Python 3.12 conventions
- Use modern typing everywhere: `Annotated`, `TypedDict`, `Protocol`, `Self`, `Literal`, and generic collections where useful.
- Prefer `dataclass(frozen=True)` or Pydantic models for immutable domain inputs/outputs.
- Use `match` statements for finite rule routing when clearer than chained conditionals.
- Avoid untyped dictionaries crossing service boundaries.
- Keep pure calculation logic separate from framework code so it can be benchmarked and unit tested easily.

### FastAPI application design
- Define explicit request and response models for every endpoint.
- Group routers by bounded capability such as `screeners`, `indicators`, `analytics-jobs`, or `market-snapshots`.
- Keep endpoint functions thin. They should validate, authorize, call application services, and map errors.
- Use dependency injection for auth context, request-scoped tracing, settings, and adapters.
- Prefer async endpoints for I/O-bound work and synchronous pure functions for CPU-bound calculations unless offloaded to workers.

### Data and analytics patterns
- Separate real-time request paths from batch/stream pipelines.
- For heavy analytics, precompute where possible and store query-friendly summaries in ClickHouse rather than recomputing on every request.
- Model time ranges, frequency, exchange, currency, and asset identifiers explicitly.
- Use UTC timestamps and document time bucket semantics for hourly/daily/weekly aggregations.
- Make indicator calculations deterministic and versioned when they influence user-visible decisions.

### Validation and contracts
- Use Pydantic v2 models with strict validation for API, Kafka, and gRPC payloads.
- Reject ambiguous field names; prefer explicit names such as `as_of`, `window_size`, `quote_currency`, `instrument_id`.
- Include pagination tokens or cursor semantics for large analytical result sets.
- Version response schemas when backward compatibility cannot be preserved.

### ClickHouse, Redis, and OpenSearch access
- Keep ClickHouse queries explicit and reviewed for partition pruning, sorting key usage, and cardinality impact.
- Avoid `SELECT *` in analytical endpoints; project only required fields.
- Cache expensive derived results in Redis with clear keys and TTLs.
- Use OpenSearch for search and discovery, not as a source of truth.
- Encapsulate storage access in `libs/python/clients` or service-local repository modules rather than embedding queries in routers.

### Kafka and background processing
- Use Kafka for market ingestion, indicator recompute triggers, cache invalidation, analytics job progress, and audit-adjacent notifications.
- Keep event consumers idempotent and replay-safe.
- Distinguish commands from facts; topics carrying derived analytics should communicate version and as-of time.
- For long-running jobs, emit progress and completion events rather than holding HTTP requests open.

### Internal communication with gRPC
- Use `proto/` as the single source of truth for internal contracts.
- Generate Python stubs into a consistent location and wrap them in typed client adapters.
- Set deadlines on outbound gRPC calls and convert transport errors into domain-meaningful failure modes.
- Never mix ad hoc JSON over HTTP for internal calls when an established gRPC contract exists.

### Performance and concurrency
- Benchmark critical indicator and screener paths with representative market universes.
- Prefer vectorized/dataframe-free pure Python or numerically efficient libraries only when justified and approved for the stack.
- Control concurrency explicitly for fan-out queries to avoid overwhelming ClickHouse or downstream services.
- Use streaming responses only when consumers benefit and observability remains intact.

### Security and privacy
- Propagate authenticated subject context from gateway or trusted internal callers; never infer identity from client-supplied free-form fields.
- Redact access tokens, secrets, and PII from logs, traces, and exception payloads.
- Validate tenant, portfolio, and account scope before returning any analytical data.
- Treat watchlists, holdings, order history, and derived behavioral analytics as sensitive user data.

### Observability and resilience
- Emit OpenTelemetry spans for HTTP handlers, background tasks, ClickHouse queries, Redis calls, Kafka handlers, and gRPC calls.
- Publish Prometheus metrics for query latency, job duration, cache hit rate, consumer lag, and dataset freshness.
- Use structured logging with request IDs, subject IDs, job IDs, screener IDs, and dataset versions.
- Implement retries only for transient failures; make retry budgets and backoff explicit.

### Testing expectations
- Unit test pure analytics logic extensively with deterministic fixtures.
- Add integration tests for FastAPI routes, Pydantic validation, ClickHouse queries, Redis caching, and Kafka consumers.
- Add regression tests for numerical edge cases, time zone boundaries, empty datasets, and partial market data.
- Validate schema compatibility for gRPC and Kafka payload changes.

## Checklist

- [ ] Service boundaries keep Python focused on data, analytics, and computational workloads
- [ ] Routers are thin and all request/response payloads are typed and validated
- [ ] ClickHouse, Redis, and OpenSearch access is encapsulated and query-efficient
- [ ] Kafka and gRPC integrations are versioned, typed, and deadline-aware
- [ ] Logging, metrics, and traces include enough context without leaking private data
- [ ] Analytical calculations are deterministic, benchmarked, and regression-tested
- [ ] Authorization checks enforce user, tenant, and portfolio scope on every data read
