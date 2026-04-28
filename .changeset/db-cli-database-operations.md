---
"@effect-x/db-cli": patch
---

Split database CLI operations by runtime so D1 and SQLite logic live in dedicated modules while command handlers compose them at the subcommand layer.
