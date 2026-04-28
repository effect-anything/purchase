import { Context, Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"

import { fakerArb, getFaker, setFaker } from "../src/faker"
import { mock, withLayer, withOverrideLayer } from "../src/test"

type TestService = {
  readonly config: {
    readonly left?: number
    readonly right?: number
  }
  readonly greet: (name: string) => string
  readonly missing: () => Effect.Effect<any>
}

const TestService = Context.GenericTag<TestService>("@tests/test-service")
const Reader = Context.GenericTag<{ readonly value: string }>("@tests/reader")

describe("testing helpers", () => {
  it("withLayer deep merges services and prefers the first override", () => {
    const program = Effect.gen(function* () {
      const service = yield* TestService

      return {
        config: service.config,
        greeting: service.greet("Ada")
      }
    })

    const effect = withLayer(TestService, {
      config: { right: 2 },
      greet: (name) => `primary:${name}`
    })({
      config: { left: 1 },
      greet: (name) => `secondary:${name}`
    })(program)

    expect(Effect.runSync(effect)).toEqual({
      config: { left: 1, right: 2 },
      greeting: "primary:Ada"
    })
  })

  it("mock decorates an existing layer with overrides", () => {
    const layer = mock(TestService, {
      greet: (name) => `mocked:${name}`
    })()(
      Layer.effect(
        Reader,
        Effect.map(TestService, (service) => ({
          value: service.greet("Bea")
        }))
      )
    )

    const program = Effect.map(Reader, (reader) => reader.value).pipe(Effect.provide(layer))

    expect(Effect.runSync(program)).toBe("mocked:Bea")
  })

  it("withOverrideLayer replaces only selected members of a live service", () => {
    const program = Effect.gen(function* () {
      const service = yield* TestService
      return {
        config: service.config,
        greeting: service.greet("Cy")
      }
    }).pipe(
      withOverrideLayer(TestService, {
        greet: (name) => `override:${name}`
      }),
      Effect.provide(
        Layer.succeed(TestService, {
          config: { left: 1 },
          greet: (name: string) => `base:${name}`,
          missing: () => Effect.void
        })
      )
    )

    expect(Effect.runSync(program)).toEqual({
      config: { left: 1 },
      greeting: "override:Cy"
    })
  })
})

describe("faker helpers", () => {
  it("throws until a faker instance is registered", () => {
    expect(() => getFaker()).toThrowError("You forgot to load faker library")
  })

  it("builds arbitraries from the registered faker instance", async () => {
    const seedCalls: Array<number> = []
    setFaker({
      seed: (value: number) => {
        seedCalls.push(value)
        return value
      },
      person: {
        firstName: () => "Ada"
      }
    } as never)

    const fc = await import("effect/FastCheck")
    const arb = fakerArb((faker) => () => faker.person.firstName())(fc)
    const samples = fc.sample(arb, 2)

    expect(samples).toEqual(["Ada", "Ada"])
    expect(seedCalls.length).toBeGreaterThan(0)
  })
})
