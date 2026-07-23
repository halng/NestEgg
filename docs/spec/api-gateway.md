# API Gateway Feature Specification

## Purpose

The NestEgg API Gateway is the single public HTTP entry point for browser, mobile, and external API clients. It hides downstream topology while applying routing, traffic protection, authentication, authorization, protocol transformation, resilience, and telemetry policies consistently.

## Capabilities delivered

| Capability | Behavior | Configuration / implementation |
| --- | --- | --- |
| Dynamic routing | Matches path plus optional HTTP method, host, and exact headers, then resolves a logical downstream service. Unknown paths return HTTP 404. | `gateway.routes`; `RoutingConfiguration` |
| Load balancing | Uses Spring Cloud LoadBalancer with static discovery in local profiles and replaceable `DiscoveryClient` providers for dynamic environments. | `spring.cloud.discovery.client.simple.instances`; `lb://` route URIs |
| Resilience | Applies downstream connection/response timeouts, reactive circuit breakers, and graceful shutdown. | `gateway.timeouts`, Spring Cloud Gateway HTTP client settings |
| Distributed rate limiting | Uses Redis-backed token buckets with a default policy and route overrides. Keys can be authenticated subject, IP, client, or an explicitly allowed header. Rejections use HTTP 429. | `gateway.rate-limit` |
| Authentication | Validates Keycloak JWT signature, expiry, issuer, and audience. Protected routes reject missing or invalid access tokens. | `gateway.security`, OAuth2 resource server |
| Authorization | Supports public routes, authenticated-only routes, Keycloak realm roles, and OAuth scopes. Policies deny access before proxying. | Per-route `public-route`, `roles`, and `scopes` |
| Header security | Removes externally supplied authorization and identity headers before downstream forwarding and adds the resolved gateway route identifier. | Gateway filters |
| JSON / Protobuf | Maps canonical protobuf JSON to generated message builders and responses back to JSON, including nested, enum, repeated, and optional fields. Mapping errors never echo source payloads. | `ProtobufJsonMapper` |
| Standard errors | Produces stable status, code, message, timestamp, trace ID, and request ID fields for gateway-owned downstream and internal failures. | `GatewayErrorWebExceptionHandler` |
| Observability | Emits structured JSON logs, Prometheus metrics, and OpenTelemetry traces suitable for Loki, Mimir, Tempo, and Grafana correlation. | Logback, Actuator, Micrometer, OTLP settings |
| Operational health | Exposes liveness/readiness-compatible health endpoints and Prometheus scraping. Production does not expose the gateway route actuator endpoint. | Management profile configuration |
| Performance validation | Supplies a Java 21 virtual-thread load runner for baseline, peak, stress, spike, and soak profiles with machine-readable results and CI thresholds. | `src/perf`; Gradle `performanceTest` task |

## Environment profiles

The default profile is `dev`. Deployments must select one profile explicitly with `SPRING_PROFILES_ACTIVE`:

* `dev` supplies localhost dependency defaults and permits disabling Keycloak for local development.
* `test` uses isolated test ports, disables remote token validation and Redis rate limiting, and is selected by integration tests.
* `stg` requires dependency URLs and secrets from the runtime environment, enables security, and samples more traces for pre-production diagnosis.
* `prod` requires all dependency URLs and secrets from the runtime environment, forces security and rate limiting on, reduces trace sampling, and restricts actuator exposure.

No credentials or client secrets belong in these files. Kubernetes Secrets or the approved secret manager must supply runtime secrets. Production communication must use TLS, and receiving services remain responsible for resource-level authorization.

## External API behavior

1. Spring Security validates authentication and route authorization.
2. The configured route matcher resolves the logical service.
3. The shared Redis limiter consumes quota for the configured key.
4. The gateway sanitizes inbound trust-boundary headers and selects a healthy service instance.
5. HTTP routes proxy directly. Domain adapters that bridge gRPC validate JSON, construct the generated protobuf request, propagate trace and trusted identity metadata, enforce a deadline, and map the protobuf response.
6. Metrics, structured logs, and spans record the outcome without request bodies, tokens, or sensitive financial data.

## Verification

Unit tests live under `src/test/java/.../unit` and cover configuration policy/default behavior plus successful and invalid protobuf mapping. Integration tests live under `src/test/java/.../integration` and verify profile binding, application startup, public health access, and unknown-route behavior. The Java performance runner is intentionally separate from functional tests and writes one JSON summary suitable for a CI artifact.

## Known extension points

* Replace simple discovery with Kubernetes, Consul, or another Spring `DiscoveryClient` without changing route definitions.
* Add weighted, canary, or zone-aware service-instance suppliers.
* Add generated domain-specific HTTP/gRPC adapters as protobuf service contracts are introduced.
* Add mTLS and signed internal identity context between the gateway and downstream services.
* Provision Grafana dashboards and alert rules from infrastructure-as-code using the exported gateway metrics.
