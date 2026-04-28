import { describe, expect, it } from "vitest"

import { formatCommandOutput, formatMeaningfulCommandOutput } from "../src/utils/shell.ts"

describe("shell output formatting", () => {
  it("strips ansi, empty lines, common third-party noise, and duplicates", () => {
    const formatted = formatMeaningfulCommandOutput(
      formatCommandOutput(
        [
          "\u001b[32mLoaded Prisma config from prisma.config.ts.\u001b[0m",
          "Prisma schema loaded from schema.prisma.",
          'Datasource "db": SQLite database "dev.db" at "file:./dev.db"',
          "Applying migration `20260101000000_init`",
          "Applying migration `20260101000000_init`",
          "All migrations have been successfully applied.",
          ""
        ].join("\n")
      )
    )

    expect(formatted).toEqual([
      "Applying migration `20260101000000_init`",
      "All migrations have been successfully applied."
    ])
  })
})
