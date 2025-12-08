#!/usr/bin/env bash
set -euo pipefail

HOST_PORT=${1:-8080}
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Building extractor image..."
docker build -f extractor/Dockerfile -t destination-extractor:local .

if ss -ltn "sport = :$HOST_PORT" >/dev/null 2>&1; then
  echo "Port $HOST_PORT seems in use. Run with a different host port, e.g. ./scripts/run-extractor-local.sh 8081"
  exit 1
fi

echo "Running container (host $HOST_PORT -> container 8080)..."
docker run --rm -p ${HOST_PORT}:8080 destination-extractor:local
