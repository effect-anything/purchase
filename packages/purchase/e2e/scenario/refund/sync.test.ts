import { describe, it, expect } from "@effect/vitest"
import * as Effect from "effect/Effect"

describe("pass", () => {
  it.effect(
    "pass",
    Effect.fn(function* () {})
  )
})
