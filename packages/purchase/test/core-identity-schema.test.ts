import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { CustomerEmail, CustomerId } from "../src/core/identity-schema.ts"

describe("core identity schema", () => {
  it("accepts branded customer ids", () => {
    expect(Schema.is(CustomerId)("customer_123")).toBe(true)
  })

  it.effect("accepts already-lowercased customer emails", () =>
    Effect.gen(function* () {
      const email = yield* Schema.decode(CustomerEmail)("user@example.com")
      expect(email).toBe("user@example.com")
    })
  )

  it("rejects invalid identity values", () => {
    expect(Schema.is(CustomerId)("")).toBe(false)
    expect(Schema.is(CustomerEmail)("USER@EXAMPLE.COM")).toBe(false)
  })
})
