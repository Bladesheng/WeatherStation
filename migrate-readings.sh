#!/usr/bin/env bash
# copy readings from db.sqlite3 into Postgres "Readings".
# Safe to re-run: existing ids are skipped.
#
# Usage: ./migrate-readings.sh [postgres-url]
#   default: postgresql://dev:dev@localhost:5432/weatherstation
set -euo pipefail

SQLITE_DB="$(dirname "$0")/db.sqlite3"
PG_URL="${1:-postgresql://dev:dev@localhost:5432/weatherstation}"
CSV="$(mktemp)"
trap 'rm -f "$CSV"' EXIT

sqlite3 -csv "$SQLITE_DB" \
  "SELECT id, created_at, temperature_bmp, temperature_dht, pressure_bmp, humidity_dht FROM readings;" > "$CSV"

echo "Exported $(wc -l < "$CSV") rows from sqlite"

psql "$PG_URL" -v ON_ERROR_STOP=1 <<SQL
BEGIN;

CREATE TEMP TABLE readings_import (
    id integer,
    created_at_ms bigint, -- sqlite stores created_at as unix epoch in milliseconds
    temperature_bmp double precision,
    temperature_dht double precision,
    pressure_bmp double precision,
    humidity_dht double precision
) ON COMMIT DROP;

\copy readings_import FROM '$CSV' WITH (FORMAT csv)

INSERT INTO "Readings" ("Id", "CreatedAt", "TemperatureBmp", "TemperatureDht", "PressureBmp", "HumidityDht")
SELECT id, to_timestamp(created_at_ms / 1000.0), temperature_bmp, temperature_dht, pressure_bmp, humidity_dht
FROM readings_import
ON CONFLICT ("Id") DO NOTHING;

-- move identity past the imported ids so new inserts don't collide
SELECT setval(pg_get_serial_sequence('"Readings"', 'Id'), (SELECT MAX("Id") FROM "Readings"));

COMMIT;
SQL

echo "Done."
