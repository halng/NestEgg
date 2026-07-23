# NestEgg API Gateway

The gateway is the public reactive edge for NestEgg. It resolves routes from `gateway.routes`, uses Spring Cloud LoadBalancer for configured/discovered instances, enforces Redis-backed token-bucket limits, validates Keycloak JWTs, and exports structured logs, Prometheus metrics, and OTLP traces.

The feature contract and complete capability matrix are maintained in [`docs/spec/api-gateway.md`](../../../docs/spec/api-gateway.md).

## Run locally

1. Start Redis, Keycloak, and the LGTM services with `infra/docker/compose.yml`.
2. Use the default `dev` profile locally. Set `GATEWAY_SECURITY_ENABLED=true` and `KEYCLOAK_ISSUER_URI` to exercise protected routes.
3. Configure service instances under `spring.cloud.discovery.client.simple.instances` or provide a DiscoveryClient implementation.
4. Run `./gradlew bootRun` and inspect `/actuator/health`, `/actuator/prometheus`, and `/actuator/gateway/routes`.

The `dev`, `test`, `stg`, and `prod` configuration files isolate environment behavior. Staging and production require dependency endpoints through environment variables and always enable gateway security; production also forces distributed rate limiting on.

Authentication is deny-by-default for configured non-public routes. Role requirements use Keycloak `realm_access.roles`; scopes use the OAuth `scope` claim. The external `Authorization` and identity headers are removed before forwarding. Production deployments must use TLS and authenticated service identity on internal hops.

## Configuration

Routes can constrain path, method, host, and exact header values. Each route names a logical service (`lb://<service>`), so instances can change without changing routing code. A route can be public or require authentication, realm roles, or scopes. Rate-limit policy resolution uses a per-route override followed by the default policy; key strategies are `ip`, `authenticated-user`, or an explicitly named `header`.

Redis is required when rate limiting is enabled. Gateway replicas share its counters. Connection and response timeouts, graceful shutdown, readiness/liveness probes, circuit breakers, and sanitized standardized downstream errors are enabled.

## JSON and Protobuf

`ProtobufJsonMapper` uses the canonical protobuf JSON implementation and supports nested messages, enums, repeated fields, optional fields, and deterministic schema errors. A domain HTTP adapter supplies the generated message builder, validates domain-required fields, invokes a deadline-aware gRPC stub, and uses the mapper for the response. Never log source JSON or protobuf payloads. gRPC adapters must propagate W3C trace context and only validated identity metadata.

## Operations

Logs are JSON on stdout for Promtail/Loki. Micrometer exposes Prometheus metrics for Mimir/Prometheus scraping, and OpenTelemetry exports OTLP spans to Tempo. Alerts should cover sustained 5xx responses, downstream circuit state, p95/p99 latency, authentication failures, and rate-limit violations. Do not use user IDs as metric labels.

Run unit and integration tests with `./gradlew test`. The dependency-free Java performance suite under `src/perf` supports baseline, peak, stress, spike, and soak profiles, for example `./gradlew performanceTest -Pprofile=baseline`. Set performance thresholds from production SLOs before release; the checked-in defaults are a CI regression guard, not a production promise.

Native binaries and container images are produced through the existing GraalVM build plugin (`./gradlew nativeCompile` or `BP_NATIVE_IMAGE=true ./gradlew bootBuildImage`); this module intentionally does not maintain a separate Dockerfile.
