# NestEgg Security Guidelines

## Overview

This skill defines security expectations for NestEgg across application code, infrastructure, authentication, authorization, secret handling, and privacy-sensitive financial data. It is designed for a privacy-first platform using Keycloak, Kafka, gRPC, PostgreSQL, ClickHouse, Redis, OpenSearch, Kubernetes, and Terraform.

## Guidelines

### Security principles
- Default to least privilege, explicit trust boundaries, and defense in depth.
- Treat holdings, orders, watchlists, profile details, identifiers, and derived behavioral analytics as sensitive data.
- Prefer minimizing data collection and retention over compensating controls later.
- Make security and privacy review part of normal development, not a release-only activity.

### Authentication with Keycloak
- Use Keycloak as the identity provider for user and admin authentication flows.
- Validate issuer, audience, token expiry, and signature on every trusted entry point.
- Centralize token parsing and claim mapping in `libs/java/security` and corresponding frontend auth layers.
- Use short-lived access tokens and controlled refresh-token handling.
- Never log raw tokens, authorization headers, or session secrets.

### Authorization
- Separate authentication from authorization.
- Enforce RBAC for platform roles and resource-level checks for account, portfolio, watchlist, order, and admin actions.
- Treat gateway checks as necessary but not sufficient; downstream services must validate ownership or delegated access again.
- Deny by default when claims or resource relationships are ambiguous.
- Make admin/support impersonation or elevated-access workflows explicit, auditable, and strongly constrained.

### OWASP-focused application security
- Validate and sanitize untrusted input at every boundary: REST, FastAPI, gRPC, Kafka, file import, and search queries.
- Use parameterized database access and safe query builders; never concatenate SQL, OpenSearch queries, or shell commands from untrusted input.
- Protect against broken object-level authorization by always checking resource ownership.
- Avoid insecure direct object references in APIs and frontend routes.
- Rate limit sensitive endpoints such as login, password reset, order placement, and export operations.

### Secrets management
- Store secrets in secure runtime configuration, not in source control, container images, logs, or test fixtures.
- Use Kubernetes secrets, external secret managers, or equivalent secure injection patterns.
- Rotate credentials for databases, Kafka, Keycloak clients, and third-party data providers.
- Keep local development secrets isolated and excluded from commits.
- Scan changed files for accidental secret exposure before shipping changes.

### Service-to-service security
- Prefer authenticated internal communication with mTLS or trusted service identity controls where available.
- Propagate only necessary identity metadata across gRPC and Kafka.
- Avoid passing end-user tokens unnecessarily across internal hops.
- Validate incoming service calls against the expected audience and source trust boundary.

### Data protection and privacy
- Classify data by sensitivity and minimize payload size in APIs, events, logs, traces, caches, and search indices.
- Encrypt data in transit and ensure encryption at rest is enabled for persistent stores where supported.
- Do not place unnecessary PII or holdings detail in Kafka payloads, Redis values, or OpenSearch documents.
- Define retention and deletion behavior for audit records, analytics snapshots, and cached user data.

### Dependency and supply-chain security
- Prefer maintained libraries and pinned versions.
- Review new dependencies for license fit, security advisories, and operational risk.
- Keep Docker base images minimal and current.
- Review Terraform and Kubernetes changes for exposed services, overly broad IAM, or insecure defaults.

### Logging, monitoring, and incident response
- Log security-relevant events such as login attempts, token validation failures, permission denials, admin actions, and suspicious automation patterns.
- Ensure logs remain privacy-safe and do not leak secrets or full financial payloads.
- Expose metrics and alerts for auth failures, rate limits, permission denials, and unusual event volume spikes.
- Preserve traceability through correlation IDs for incident investigation.

### Testing expectations
- Add negative tests for unauthorized and forbidden access.
- Test token expiry, role changes, missing claims, tenant mismatch, and stale ownership data.
- Validate secure defaults in configuration and deployment manifests.
- Include dependency and secret scanning in the change process.

## Checklist

- [ ] Keycloak token validation is centralized and complete at trusted entry points
- [ ] Resource-level authorization is enforced in every sensitive backend path
- [ ] Inputs are validated and unsafe query construction is avoided everywhere
- [ ] Secrets are never committed, logged, or persisted in insecure stores
- [ ] Kafka, gRPC, Redis, and OpenSearch usage minimize sensitive data exposure
- [ ] Infra and dependency changes were reviewed for supply-chain and privilege risks
- [ ] Security logging, metrics, and alerts support investigation without leaking private data
