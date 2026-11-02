#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || fail "Docker is required. Install Docker Desktop (Windows/macOS) or Docker Engine (Linux), then try again."
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required. Update Docker Desktop or install the Docker Compose plugin."
docker info >/dev/null 2>&1 || fail "The Docker engine is not running. Start Docker Desktop or the Docker service, then try again."

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$ROOT_DIR/.env.example" "$ENV_FILE"
  printf 'Created .env from .env.example. Review it before using this setup outside local development.\n'
fi

cd "$ROOT_DIR"
printf 'Building the frontend and backend images...\n'
docker compose --env-file "$ENV_FILE" build
printf 'Starting the database, backend, and frontend...\n'
docker compose --env-file "$ENV_FILE" up -d

docker compose --env-file "$ENV_FILE" ps
printf '\nWater Network Analysis is running:\n'
printf '  Frontend:   http://localhost:%s\n' "$(grep -E '^FRONTEND_PORT=' "$ENV_FILE" | tail -n 1 | cut -d= -f2- || printf '3000')"
printf '  Backend:    http://localhost:%s/swagger-ui.html\n' "$(grep -E '^BACKEND_PORT=' "$ENV_FILE" | tail -n 1 | cut -d= -f2- || printf '8080')"
printf '\nStop the services with: docker compose down\n'
printf 'Database data is preserved in the postgres_data volume.\n'
