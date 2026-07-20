# NestEgg Observability Patterns

## Overview

This skill defines how NestEgg should instrument services and infrastructure using OpenTelemetry, Prometheus, Grafana, Loki, Tempo, and Promtail. The goal is to make transactional and analytical workflows diagnosable without exposing private financial data.

## Guidelines

### Observability principles
- Instrument first-class user and system workflows end to end: login, portfolio sync, order placement, market ingestion, screener execution, notification delivery, and admin actions.
- Optimize for fast diagnosis of correctness, latency, dependency, and data-freshness issues.
- Keep telemetry privacy-safe by default.
- Use common field names and correlation identifiers across Java, Python, frontend, and infrastructure logs.

### Distributed tracing with OpenTelemetry
- Create spans for inbound HTTP, gRPC, Kafka, scheduled jobs, database queries, cache operations, and outbound client calls.
- Propagate trace context through REST headers, gRPC metadata, and Kafka message headers.
- Use semantic span names such as `POST /orders`, `PortfolioService/GetSnapshot`, `kafka consume nestegg.order.lifecycle.v1`.
- Attach useful attributes: service, operation, user subject when allowed, portfolio ID, order ID, topic, partition, dependency name, retry count, cache hit/miss.
- Record errors with meaningful status and exception details while redacting sensitive payloads.

### Metrics with Prometheus
- Expose RED metrics for APIs and gRPC: rate, errors, duration.
- Expose consumer lag, publish failures, retry counts, DLQ counts, cache hit rate, and freshness metrics for data pipelines.
- Include domain metrics where they help operations: orders placed, orders failed validation, portfolios refreshed, screener jobs completed, notification send failures.
- Prefer low-cardinality labels; avoid unbounded user- or portfolio-level labels in Prometheus.

### Logging with structured JSON and Loki
- Emit structured logs from Java and Python services with fields such as `timestamp`, `level`, `service`, `env`, `trace_id`, `span_id`, `request_id`, `subject`, `portfolio_id`, `order_id`, `event_type`, `outcome`.
- Keep logs machine-parsable and avoid multi-line stack traces when the platform can capture them structurally.
- Never log tokens, passwords, secrets, or full sensitive payloads.
- Log state transitions and boundary failures, not every internal implementation detail.

### Dashboards and alerts
- Create Grafana dashboards per service and per end-to-end capability.
- Add dashboards for API latency, error rates, Kafka lag, ClickHouse query latency, Redis saturation, OpenSearch query failures, and websocket connection health.
- Alert on user-visible degradation, security anomalies, repeated auth failures, data freshness drift, and sustained consumer lag.
- Use severity levels and runbook links in alert descriptions.

### Tempo and trace analysis
- Ensure traces can be correlated from logs and metrics using stable IDs.
- Sample strategically: keep enough traces for diagnosis while respecting volume and privacy constraints.
- Preserve traces for incidents affecting trading, auth, portfolio correctness, or compliance-sensitive flows.

### Promtail and log shipping
- Standardize log labels and parsing conventions across containers and clusters.
- Exclude noisy or redundant log sources when they do not aid diagnosis.
- Ensure Kubernetes metadata and service identity labels are attached consistently.

### Frontend observability
- Track client-side navigation, API error surfaces, auth/session failures, and critical UX actions with privacy-aware telemetry.
- Do not send sensitive form fields, holdings detail, or raw financial payloads in client analytics.
- Correlate frontend errors to backend traces when feasible through request IDs or trace headers.

### Operational readiness
- Every new service or feature should ship with at least basic logs, spans, metrics, dashboards, and alert considerations.
- New Kafka topics, gRPC methods, and scheduled jobs must have telemetry at creation time.
- Keep observability configuration in version control under `infra/` where appropriate.

## Checklist

- [ ] Traces cover HTTP, gRPC, Kafka, database, cache, and scheduled workflows end to end
- [ ] Metrics expose user-visible latency, error, throughput, lag, and freshness signals
- [ ] Logs are structured, correlated, and privacy-safe
- [ ] Dashboards and alerts exist for critical financial and operational paths
- [ ] Frontend and backend telemetry can be correlated without leaking sensitive data
- [ ] New services and features include observability from the start
