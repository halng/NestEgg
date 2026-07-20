# gRPC + Protocol Buffers for NestEgg

## Overview

This skill defines how NestEgg uses Protocol Buffers in `proto/` and gRPC for synchronous internal communication across Java and Python services. It focuses on contract-first design, backward-compatible schema evolution, and consistent client/server behavior across `apps/backend/` and shared libraries in `libs/java/grpc` and `libs/python/clients`.

## Guidelines

### Contract-first workflow
- Define all internal synchronous service contracts in `proto/`; do not create ad hoc internal REST APIs when a stable service contract is needed.
- Organize protobuf packages by domain capability, for example `nestegg.portfolio.v1`, `nestegg.market.v1`, `nestegg.identity.v1`, `nestegg.analytics.v1`.
- Keep one domain concern per proto file or small related file set so ownership is obvious.
- Regenerate stubs as part of normal development whenever proto contracts change.

### Package and naming conventions
- Use versioned packages and file paths, e.g. `proto/nestegg/portfolio/v1/portfolio_service.proto`.
- Use PascalCase for messages and services, snake_case for field names, and clear domain nouns/verbs.
- Service RPC names should describe use cases, e.g. `GetPortfolioSnapshot`, `PlaceOrderReservation`, `ResolveInstrument`, `RunScreenerPreview`.
- Avoid generic message names like `Request`, `Response`, or `Data`; qualify them with the use case.

### Message design
- Design explicit request and response messages even when a method seems simple.
- Represent money, quantities, and percentages carefully; document scale and units.
- Prefer dedicated messages for identifiers and nested concepts when they are reused widely.
- Use `repeated` only when the list size is expected and manageable; use pagination for potentially large result sets.
- Include `as_of`, `source`, `version`, and correlation metadata when it matters to interpretation.

### Compatibility rules
- Never reuse or renumber field tags.
- Reserve removed field numbers and names.
- Prefer additive changes: new optional fields, new messages, new RPCs, or new enum values.
- Treat enum evolution carefully. Callers must handle unknown values safely.
- Avoid `required` semantics; design for partial forward/backward compatibility.
- Validate compatibility across Java and Python consumers before merging.

### Service behavior
- Set and honor deadlines on every gRPC call.
- Make failure contracts explicit: distinguish validation errors, not-found, permission denied, conflict, rate limit, and dependency failures.
- Keep request/response payloads scoped to a single business question; do not create oversized omnibus RPCs.
- For streaming, justify why unary is insufficient and define backpressure, cancellation, and client behavior clearly.

### Cross-language implementation
- Put shared Java interceptors, tracing helpers, auth propagation, and client factories in `libs/java/grpc`.
- Put Python gRPC adapters and generated-stub wrappers in `libs/python/clients` or service-local infrastructure modules.
- Normalize metadata propagation across languages: trace context, request ID, subject ID, tenant/account scope, and idempotency key when applicable.
- Keep transport mapping out of business logic; application services should depend on clean abstractions.

### Security and authorization
- Use mTLS and authenticated service identities where infrastructure supports it.
- Propagate only trusted identity context from gateway or upstream services.
- Do not pass raw access tokens through multiple internal hops unless explicitly required and secured.
- Validate resource-level authorization in the receiving service; upstream authorization is not sufficient on its own.

### Observability and reliability
- Instrument server handlers and client calls with OpenTelemetry spans and attributes such as `rpc.system`, `rpc.service`, `rpc.method`, peer service, deadline, and outcome.
- Emit metrics for request count, latency, error rate, and saturation or concurrent request load.
- Log request metadata at the boundary but avoid logging whole protobuf payloads containing sensitive financial data.
- Make retries explicit and safe; never retry non-idempotent methods without an idempotency strategy.

### Relationship to REST and Kafka
- Use gRPC for low-latency internal queries/commands that need synchronous responses.
- Use Kafka for event propagation, async orchestration, and integration decoupling.
- Use gateway REST/HTTP only for external clients, not as the default internal transport.
- If the same business concept crosses REST, gRPC, and Kafka, keep the naming and semantics aligned but do not force identical message shapes.

### Testing expectations
- Add contract tests around serialization, default values, and error mapping.
- Validate generated clients in both Java and Python for any shared contract update.
- Add compatibility checks before deleting fields or changing enums.
- Test deadline handling, auth metadata propagation, and partial failure scenarios.

## Checklist

- [ ] All internal synchronous service contracts are defined under `proto/` with versioned packages
- [ ] Message and RPC names use explicit domain language
- [ ] Field numbers are stable, reserved when removed, and evolved additively
- [ ] Java and Python implementations share the same auth, tracing, and deadline conventions
- [ ] gRPC methods expose clear failure modes and avoid oversized payloads
- [ ] Sensitive payloads are protected in transit and redacted from logs
- [ ] Contract and compatibility tests cover both producer and consumer sides
