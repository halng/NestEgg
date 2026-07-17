# Backend Architecture

## Overview

The backend is designed as a **cloud-native, event-driven microservices architecture** focused on scalability, maintainability, and domain separation.

The architecture follows several core principles:

* **Domain-Driven Design (DDD)** — each service owns a single business capability.
* **Database per Service** — no shared databases between services.
* **gRPC for synchronous communication** — all internal service-to-service communication uses Protocol Buffers over gRPC.
* **Kafka for asynchronous events** — services communicate through events whenever possible.
* **Polyglot architecture** — Java is used for transactional services, while Python is used for data engineering, quantitative analysis, and market analytics.
* **Monorepo managed by Nx** — all backend services, shared libraries, infrastructure, and Protocol Buffer definitions live in a single repository.

---

# Architecture Principles

## Internal Communication

All backend services are deployed inside a trusted network.

Therefore:

* No service authentication between internal services
* No REST communication internally
* All synchronous communication uses **gRPC**
* All service contracts are defined using Protocol Buffers

![Backend Architecture](../../docs/architecture/internal-communication.png)

---

# Repository Structure

```text
apps/
└── backend/
    ├── gateway/
    ├── user-service/
    ├── portfolio-service/
    ├── trading-service/
    ├── order-service/
    ├── market-data-service/
    ├── indicator-service/
    ├── screener-service/
    ├── analytics-service/
    ├── websocket-service/
    ├── notification-service/
    ├── scheduler-service/
    ├── search-service/
    └── audit-service/

libs/
├── java/
│   ├── common/
│   ├── grpc/
│   ├── security/
│   ├── kafka/
│   ├── database/
│   ├── observability/
│   └── testing/
│
└── python/
    ├── common/
    ├── market/
    ├── analytics/
    ├── indicators/
    ├── clients/
    └── utils/

proto/
├── user/
├── portfolio/
├── trading/
├── order/
├── market/
├── screener/
├── analytics/
├── notification/
└── common/

infra/
├── docker/
├── kubernetes/
├── terraform/
├── monitoring/
└── github-actions/

docs/
├── architecture/
├── adr/
├── diagrams/
└── api/
```

---

# Technology Stack

| Category           | Technology                              |
| ------------------ | --------------------------------------- |
| Language           | Java 21, Python 3.12                    |
| Java Framework     | Spring Boot 3                           |
| Python Framework   | FastAPI                                 |
| API Gateway        | Spring Cloud Gateway (or Kong in front) |
| RPC                | gRPC                                    |
| Event Bus          | Apache Kafka                            |
| Authentication     | Keycloak                                |
| Database           | PostgreSQL                              |
| Analytics Database | ClickHouse                              |
| Cache              | Redis                                   |
| Search             | OpenSearch                              |
| Scheduler          | Spring Scheduler / Temporal             |
| Observability      | OpenTelemetry + Prometheus + Grafana    |
| Container          | Docker                                  |
| Orchestration      | Kubernetes                              |
| Monorepo           | Nx                                      |

---

# Services

---

# Gateway

### Responsibility

Acts as the single entry point for all client requests.

### Responsibilities

* Validate JWT tokens
* Route requests
* Convert HTTP requests into gRPC calls
* Request aggregation
* Rate limiting
* API versioning
* WebSocket upgrade routing

### Communication

Incoming

* HTTP
* WebSocket

Outgoing

* gRPC

---

# User Service

### Responsibility

Owns all user-related business information.

Authentication is delegated to Keycloak.

### Responsibilities

* User profile
* User preferences
* Watchlists
* Favorite stocks
* Settings

### Database

PostgreSQL

### Communication

gRPC

Events

* UserCreated
* UserUpdated

---

# Trading Service

### Responsibility

Core trading engine responsible for validating and executing trades.

### Responsibilities

* Buy orders
* Sell orders
* Validate balances
* Validate holdings
* Execute virtual trades
* Publish trade events

### Database

PostgreSQL

### Communication

gRPC

Events

* OrderExecuted
* OrderRejected

---

# Order Service

### Responsibility

Maintains the lifecycle of all orders.

### Responsibilities

* Pending orders
* Filled orders
* Cancelled orders
* Rejected orders
* Order history

### Database

PostgreSQL

### Communication

gRPC

Events

* OrderCreated
* OrderCancelled
* OrderCompleted

---

# Portfolio Service

### Responsibility

Maintains each user's virtual portfolio.

### Responsibilities

* Holdings
* Cash balance
* Average cost
* Unrealized PnL
* Realized PnL
* Transaction history

### Database

PostgreSQL

### Communication

gRPC

Events

* PortfolioUpdated
* HoldingChanged

---

# Market Data Service (Python)

### Responsibility

The central market data ingestion service.

Responsible for collecting, normalizing, and distributing all market data.

### Responsibilities

* Download historical prices
* Subscribe to real-time prices
* Download company profiles
* Download dividends
* Download earnings
* Normalize provider-specific formats
* Publish market events
* Update Redis cache
* Persist historical data

### External Providers

* Yahoo Finance
* Finnhub
* Polygon.io
* AlphaVantage

### Database

ClickHouse

Redis

### Communication

gRPC

Kafka

---

# Indicator Service (Python)

### Responsibility

Computes all technical indicators.

Indicators are pre-computed instead of calculated during user requests.

### Responsibilities

* SMA
* EMA
* RSI
* MACD
* ATR
* VWAP
* Bollinger Bands
* Stochastic Oscillator
* ADX

### Database

ClickHouse

### Communication

Kafka

gRPC

---

# Analytics Service (Python)

### Responsibility

Performs heavy financial calculations.

### Responsibilities

* Portfolio performance
* Sharpe Ratio
* Alpha/Beta
* Volatility
* Correlation
* Portfolio optimization
* Backtesting
* Statistical analysis

### Database

ClickHouse

### Communication

gRPC

Kafka

---

# Screener Service (Python)

### Responsibility

Executes stock screening queries.

### Responsibilities

* Fundamental screening
* Technical screening
* Custom filters
* Saved screeners
* Ranking
* Sorting

### Database

ClickHouse

### Communication

gRPC

---

# WebSocket Service

### Responsibility

Single real-time communication service.

Consumes Kafka events and broadcasts updates to connected clients.

### Responsibilities

* Live prices
* Portfolio updates
* Notifications
* Leaderboards
* Market status
* News

### Communication

Kafka

WebSocket

---

# Notification Service

### Responsibility

Handles user notifications.

### Responsibilities

* In-app notifications
* Email
* Push notifications
* Price alerts
* Trade confirmations

### Communication

Kafka

gRPC

---

# Search Service

### Responsibility

Provides fast search capabilities.

### Responsibilities

* Company search
* Ticker search
* ETF search
* Autocomplete

### Database

OpenSearch

---

# Scheduler Service

### Responsibility

Runs background jobs.

### Responsibilities

* Market synchronization
* Historical imports
* Earnings updates
* Dividend updates
* Cache refresh
* Cleanup tasks

---

# Audit Service

### Responsibility

Stores immutable audit logs.

### Responsibilities

* Trade history
* Login events
* Administrative actions
* API access logs
* Error tracking

### Database

PostgreSQL

---

# Shared Libraries

## Java Libraries

```
libs/java/

common/
grpc/
security/
database/
kafka/
observability/
testing/
```

These libraries provide reusable components shared across Java services.

---

## Python Libraries

```
libs/python/

common/
market/
analytics/
indicators/
clients/
utils/
```

These libraries contain reusable code for data ingestion, market calculations, shared API clients, and quantitative utilities.

---

# Protocol Buffers

All internal APIs are defined using Protocol Buffers.

```
proto/

common/

user/

portfolio/

trading/

order/

market/

analytics/

screener/

notification/
```

Each domain owns its own `.proto` files, which are used to generate Java and Python gRPC clients and servers. This ensures a strongly typed, language-agnostic contract between services.

---

# Data Storage Strategy

| Storage    | Purpose                                                           |
| ---------- | ----------------------------------------------------------------- |
| PostgreSQL | Transactional business data (users, orders, portfolios, settings) |
| ClickHouse | Historical prices, indicators, analytics, screening datasets      |
| Redis      | Real-time prices, hot caches, sessions, frequently accessed data  |
| OpenSearch | Full-text search for companies, tickers, ETFs, and news           |

---

# Messaging Strategy

## gRPC

Used for synchronous request-response communication.

Examples:

* Gateway → User Service
* Gateway → Portfolio Service
* Trading Service → Portfolio Service
* Trading Service → Order Service
* Screener Service → Market Data Service

---

## Kafka

Used for asynchronous event-driven workflows.

Example topics:

```
market.price.updated

market.candle.closed

market.dividend.updated

market.earnings.updated

order.created

order.executed

portfolio.updated

notification.created

audit.logged
```

Services subscribe only to the topics relevant to their domain, enabling loose coupling and independent scalability.

---

# Design Goals

* Clear ownership through Domain-Driven Design (DDD)
* High cohesion and low coupling between services
* Strongly typed internal APIs using gRPC and Protocol Buffers
* Event-driven architecture with Kafka for asynchronous workflows
* Polyglot services leveraging Java for transactional domains and Python for data-intensive workloads
* Independent deployment and scaling of services
* Centralized observability and monitoring
* Modular monorepo structure managed by Nx for efficient development and CI/CD
