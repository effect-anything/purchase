# db-cli Testing Matrix

`db-cli` tests are organized by `runtime + provider`, then by command behavior. The default suite must avoid real remote services and should only use temporary workspaces.

## Runtime Model

| Runtime   | Provider     | Status    | Purpose                                                                                                                 |
| --------- | ------------ | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| `browser` | `sqlite`     | supported | Generate SQL migrations and schema files for browser-side SQLite runtimes.                                              |
| `d1`      | `sqlite`     | supported | Manage Cloudflare D1. Local mode uses Miniflare persisted SQLite files; remote mode uses `wrangler` against Cloudflare. |
| `server`  | `sqlite`     | supported | Manage regular server-side SQLite through a file URL or absolute file path.                                             |
| `server`  | `postgresql` | planned   | Regular server database via URL. Schema generation is valid, command execution needs provider-specific implementation.  |
| `server`  | `mysql`      | planned   | Regular server database via URL. Schema generation is valid, command execution needs provider-specific implementation.  |

`server` means an external or Node-accessible database runtime. If that name becomes too broad, `node` or `external` are better candidates, but the current CLI keeps `server` for compatibility.

## Default Test Coverage

These tests should run in normal CI with no Cloudflare account and no persistent database:

| Area                     | Coverage                                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI composition          | `--help`, `--version`, shared `cwd/project/database` flags, command-specific flags.                                                                  |
| Workspace model          | `cwd + project` resolve to `projectPath` and `projectName`.                                                                                          |
| Config parsing           | JSONC parsing, environment override merge, D1 database selection.                                                                                    |
| Matrix detection         | `detectDatabase` accepts every supported runtime/provider config and creates `db/migrations`.                                                        |
| Dump command             | `dump` runs through the CLI command layer for `browser/sqlite`, `server/sqlite`, and local `d1/sqlite`, then asserts deterministic schema output.    |
| Push command             | `push --skip-dump` runs through the CLI command layer for `browser/sqlite`, `server/sqlite`, and local `d1/sqlite`, then asserts real SQLite tables. |
| Migration file discovery | Flat SQL migrations and Prisma directory migrations are sorted and read consistently.                                                                |
| SQL generation           | Prisma schema generation and migration diff output filtering for SQLite-compatible providers.                                                        |

## Local Integration Coverage

These tests can run locally or in an opt-in CI job with required binaries installed:

| Runtime    | Provider | Commands                                                                                |
| ---------- | -------- | --------------------------------------------------------------------------------------- |
| `browser`  | `sqlite` | `dev`, `dump`; `deploy` is a no-op; `seed` is skipped.                                  |
| `server`   | `sqlite` | `push`, `dump`, `execute`, `dev`, `reset`, `deploy`, `resolve`.                         |
| `d1` local | `sqlite` | `push`, `dump`, `execute`, `dev`, `reset`, `deploy` against Miniflare persisted SQLite. |

Required binaries: `prisma`, `sqlite3`, and `wrangler` for D1 local tests.

## Remote D1 Coverage

Remote D1 tests must be opt-in and must never run in the default test command.

| Runtime     | Provider | Commands                                                                    |
| ----------- | -------- | --------------------------------------------------------------------------- |
| `d1` remote | `sqlite` | `execute`, `deploy`, production schema `dump` through `wrangler d1 export`. |

Required environment:

```text
DB_CLI_REMOTE_D1=1
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_EMAIL=...
CLOUDFLARE_API_TOKEN=...
```

Remote tests should create disposable D1 databases or target preview databases only. Production database mutation must stay manual.

## Gaps To Close

| Gap                                                     | Reason                                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Provider-specific server execution for PostgreSQL/MySQL | Current command implementation only has native SQLite execution paths.                    |
| Real seed execution                                     | `seed` is intentionally stubbed during the Effect v4 migration.                           |
| D1 remote safety harness                                | Needs disposable database provisioning or a strict preview-only policy before automation. |
