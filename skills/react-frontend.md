# React Native + Next.js Frontend for NestEgg

## Overview

This skill defines frontend patterns for NestEgg mobile and web applications under `apps/frontend/`. It covers React Native for cross-platform mobile, Next.js 14+ with TypeScript and Tailwind CSS for web, shared UX conventions, state management boundaries, and secure interaction with backend services.

## Guidelines

### Frontend module boundaries
- Treat modules under `apps/frontend/` such as `auth`, `admin`, `shell`, `watchlist`, `screener`, `trading`, `portfolio`, and `dashboard` as business capabilities, not just route folders.
- Keep shared UI primitives, hooks, API clients, and feature contracts in reusable libraries when the monorepo structure supports it; do not duplicate logic between mobile and web.
- Separate container logic from presentation components:
  - screens/pages handle routing, data loading, and permission gating
  - feature components handle workflows and state transitions
  - UI primitives stay reusable and style-focused

### TypeScript conventions
- Use strict TypeScript. Avoid `any`; prefer discriminated unions, branded IDs, and explicit API model types.
- Derive types from generated clients or shared contracts where possible rather than manually duplicating shapes.
- Use domain names consistently across apps: portfolio, position, order ticket, watchlist item, screener result, indicator series.
- Keep type definitions near the capability that owns them unless they are truly shared.

### Next.js 14+ patterns
- Default to server components for read-heavy web flows when it improves performance and security, and use client components only for interactive islands.
- Place authentication, session handling, and protected layouts close to the route boundary.
- Use server actions or API route adapters only when they match deployment and security needs; do not tunnel arbitrary business logic through the frontend.
- Optimize for fast first paint on dashboard, portfolio overview, screener results, and public or semi-public informational pages.

### React Native patterns
- Favor platform-consistent navigation, gestures, and safe area handling.
- Keep local device state minimal and encrypted where needed for sensitive caches or tokens.
- Design offline tolerance intentionally for watchlists, cached market views, and queued user actions; never fake transactional success when the backend has not confirmed it.
- Handle background refresh and push-notification deep links in a traceable, testable way.

### State management
- Keep server state separate from UI state.
- Use query or cache libraries consistently for remote data and invalidation.
- Scope form state to the workflow and avoid leaking transient UI state into global stores.
- For trading or portfolio workflows, model state transitions explicitly: idle, editing, validating, submitting, succeeded, failed.
- Invalidate or refresh queries in response to Kafka-backed updates exposed through websocket or polling layers.

### Design system and Tailwind CSS
- Use Tailwind CSS tokens and shared design primitives for spacing, color, typography, and responsive behavior.
- Treat financial data density carefully: tables, cards, charts, and KPI tiles must remain scannable on small screens.
- Respect dark mode, accessibility contrast, and reduced-motion preferences.
- Use semantic color meaning carefully; never rely on color alone for gain/loss or risk state.

### API integration
- Route all external client traffic through supported gateway APIs; do not bypass auth or policy layers.
- Use typed API clients and centralize auth header, retry, and error normalization logic.
- Surface stable user-facing errors for order placement, auth/session expiry, screener failures, and market data latency.
- Use websocket or polling abstractions consistently for live prices, order status, and portfolio refreshes.

### Security and privacy
- Never store long-lived secrets in frontend code, bundles, or persistent storage.
- Use Keycloak-compatible auth flows and centralize token lifecycle handling.
- Minimize exposure of sensitive PII and holdings data in logs, analytics events, screenshots, and browser storage.
- Gate admin views, trading flows, and account settings using both UX checks and backend-enforced permissions.

### Accessibility and UX quality
- Support keyboard navigation and screen-reader labels on web.
- Ensure touch targets, loading states, empty states, and retry states are explicit on mobile.
- Use skeletons or optimistic UI only where correctness risk is acceptable.
- For financial actions, prefer confirmation steps, clear totals/fees, and obvious irreversible-action messaging.

### Testing expectations
- Unit test hooks, reducers, formatters, and validation logic.
- Add component tests for critical interactive states.
- Add end-to-end coverage for login, watchlist management, screener execution, order workflows, and portfolio drill-down.
- Validate responsive behavior, accessibility basics, and auth/session edge cases.

## Checklist

- [ ] Frontend code respects module boundaries in `apps/frontend/` and keeps shared logic reusable
- [ ] TypeScript types are strict, explicit, and aligned with backend contracts
- [ ] Next.js uses server/client component boundaries intentionally
- [ ] React Native flows handle platform behavior, offline tolerance, and navigation cleanly
- [ ] Server state, UI state, and form state are separated and predictable
- [ ] Tailwind and design-system patterns keep dense financial data accessible and consistent
- [ ] Auth, token lifecycle, and permission-sensitive views are privacy-safe and backend-aligned
- [ ] Critical user journeys are covered by unit, component, and e2e tests
