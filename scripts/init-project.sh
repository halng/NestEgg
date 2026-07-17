#!/usr/bin/env bash

set -euo pipefail

echo "🚀 Creating Trading Platform Monorepo..."

#########################################
# Helper
#########################################

create_dir() {
  mkdir -p "$1"
}

touch_readme() {
  if [ ! -f "$1/README.md" ]; then
    touch "$1/README.md"
  fi
}

#########################################
# Root
#########################################

ROOT_DIRS=(
  apps
  libs
  proto
  infra
  docs
  scripts
  tools
)

for dir in "${ROOT_DIRS[@]}"; do
  create_dir "$dir"
done

#########################################
# Backend
#########################################

BACKEND_SERVICES=(
  "apps/backend/gateway/gateway-service"

  "apps/backend/identity/user-service"
  "apps/backend/identity/notification-service"

  "apps/backend/trading/trading-service"
  "apps/backend/trading/order-service"
  "apps/backend/trading/portfolio-service"

  "apps/backend/market/ingestion-service"
  "apps/backend/market/market-data-service"
  "apps/backend/market/indicator-service"
  "apps/backend/market/analytics-service"
  "apps/backend/market/screener-service"
  "apps/backend/market/search-service"

  "apps/backend/platform/websocket-service"
  "apps/backend/platform/scheduler-service"
  "apps/backend/platform/audit-service"
)

for dir in "${BACKEND_SERVICES[@]}"; do
  create_dir "$dir"
done

#########################################
# Frontend
#########################################

FRONTENDS=(
  shell
  auth
  dashboard
  trading
  portfolio
  screener
  watchlist
  admin
)

for app in "${FRONTENDS[@]}"; do
  create_dir "apps/frontend/$app"
done

#########################################
# Java Libraries
#########################################

JAVA_LIBS=(
  core/exception
  core/response
  core/validation
  core/util
  core/constants

  grpc/client
  grpc/server
  grpc/interceptor
  grpc/proto-support

  kafka/producer
  kafka/consumer
  kafka/event-model
  kafka/serialization

  security/keycloak
  security/jwt
  security/authorization

  persistence/postgres
  persistence/redis
  persistence/clickhouse

  observability/logging
  observability/tracing
  observability/metrics
  observability/health

  testing/fixtures
  testing/testcontainers
  testing/mock
)

for lib in "${JAVA_LIBS[@]}"; do
  create_dir "libs/java/$lib"
done

#########################################
# Python Libraries
#########################################

PYTHON_LIBS=(
  market/adapters
  market/collectors
  market/normalizers
  market/models

  analytics/backtest
  analytics/portfolio
  analytics/statistics
  analytics/optimization

  indicators/momentum
  indicators/trend
  indicators/volatility
  indicators/volume

  clients/yahoo
  clients/finnhub
  clients/polygon
  clients/alpha-vantage

  common/config
  common/logger
  common/utils
  common/models
)

for lib in "${PYTHON_LIBS[@]}"; do
  create_dir "libs/python/$lib"
done

#########################################
# Typescript Libraries
#########################################

TS_LIBS=(
  api-client
  grpc-client
  shared-types
  ui
  theme
  hooks
  utils
)

for lib in "${TS_LIBS[@]}"; do
  create_dir "libs/typescript/$lib"
done

#########################################
# Proto
#########################################

PROTO_DIRS=(
  common
  identity
  trading
  portfolio
  market
  analytics
  screener
  notification
)

for dir in "${PROTO_DIRS[@]}"; do
  create_dir "proto/$dir"
done

#########################################
# Infrastructure
#########################################

INFRA_DIRS=(
  docker

  docker/postgres/init
  docker/redis
  docker/clickhouse
  docker/kafka
  docker/keycloak/realm

  docker/prometheus
  docker/loki
  docker/promtail
  docker/tempo
  docker/otel

  docker/grafana
  docker/grafana/dashboards
  docker/grafana/provisioning
  docker/grafana/provisioning/datasources
  docker/grafana/provisioning/dashboards

  kubernetes/base
  kubernetes/local
  kubernetes/dev
  kubernetes/staging
  kubernetes/production

  terraform/modules
  terraform/environments/dev
  terraform/environments/staging
  terraform/environments/production

  monitoring
)

for dir in "${INFRA_DIRS[@]}"; do
  create_dir "infra/$dir"
done

#########################################
# Documentation
#########################################

DOC_DIRS=(
  architecture
  adr
  api
  diagrams
  runbooks
)

for dir in "${DOC_DIRS[@]}"; do
  create_dir "docs/$dir"
done

#########################################
# Scripts
#########################################

SCRIPT_DIRS=(
  database
  kafka
  clickhouse
  dev
  deploy
)

for dir in "${SCRIPT_DIRS[@]}"; do
  create_dir "scripts/$dir"
done

#########################################
# Tools
#########################################

TOOL_DIRS=(
  codegen
  grpc
  proto
)

for dir in "${TOOL_DIRS[@]}"; do
  create_dir "tools/$dir"
done

#########################################
# Root Files
#########################################

touch README.md
touch .gitignore
touch .editorconfig
touch .env.example

#########################################
# README for Empty Directories
#########################################

find . \
  -type d \
  ! -path "./.git*" \
  ! -path "./node_modules*" \
  ! -path "./.nx*" \
  | while read -r dir; do

    if [ -z "$(find "$dir" -mindepth 1 -print -quit)" ]; then
      touch_readme "$dir"
    fi
done

echo "✅ Monorepo structure created successfully."