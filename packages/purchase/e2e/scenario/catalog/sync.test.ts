import * as Effect from 'effect/Effect'
import { describe, it, expect } from "@effect/vitest"

describe("pass", () => {
  it.effect(
    "pass",
    Effect.fn(function* () {})
  )
})
