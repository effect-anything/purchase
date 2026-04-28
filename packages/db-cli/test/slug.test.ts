import * as Effect from "effect/Effect"
import * as Random from "effect/Random"
import { describe, expect, it } from "vitest"

import { formatMigrationName, randomReadableSlug } from "../src/utils/slug.ts"

describe("migration slug utilities", () => {
  it("formats migration names as snake case", () => {
    expect(formatMigrationName("Create User Table")).toBe("create_user_table")
  })

  it("generates readable snake case defaults", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const slug = yield* randomReadableSlug()

        expect(slug).toMatch(/^[a-z]+_[a-z]+$/)
      }).pipe(Random.withSeed("migration-name"))
    ))
})
