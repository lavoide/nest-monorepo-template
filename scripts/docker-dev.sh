#!/usr/bin/env bash
# Start dev docker services, skipping any whose ports are already in use.

SERVICES=""

if ss -tln | grep -q ":6379 "; then
  echo "Redis/Valkey already running on :6379, skipping redis container"
else
  SERVICES="$SERVICES redis"
fi

if ss -tln | grep -q ":5434 "; then
  echo "Postgres already running on :5434, skipping postgres container"
else
  SERVICES="$SERVICES postgres"
fi

if [ -n "$SERVICES" ]; then
  docker compose -f docker-compose.dev.yml up -d $SERVICES
else
  echo "All services already running"
fi
