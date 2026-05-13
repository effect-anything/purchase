import * as Command from "@effect/cli/Command"
import * as Span from "@effect/cli/HelpDoc/Span"

import { catalogSyncCommand } from "./cli/catalog-sync.ts"
import { prepareCommand } from "./cli/prepare.ts"

const packageVersion = "0.0.1"

const catalog = Command.make("catalog").pipe(
  Command.withSubcommands([catalogSyncCommand]),
  Command.withDescription("Catalog sync commands.")
)

const root = Command.make("pay").pipe(Command.withSubcommands([catalog, prepareCommand]))

export const cli = Command.run(root, {
  name: "Purchase SDK CLI",
  version: packageVersion,
  summary: Span.text("Synchronize Purchase SDK catalog state across providers and database backends.")
})
