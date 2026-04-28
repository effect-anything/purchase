import { type Console, Context, Effect, Option, Redacted, Stream } from "effect"
import { describe, expect, test } from "tstyche"

import type { ServicesReturns } from "../src/effect.ts"

// Test service definition matching the user's example
class Test1 extends Context.Tag("Test1")<
  Test1,
  {
    readonly hi: Effect.Effect<Option.Option<Redacted.Redacted<string>>, never, never>
    readonly hi2: () => Effect.Effect<Option.Option<Redacted.Redacted<string>>, never, never>
    readonly hi3: Stream.Stream<Option.Option<Redacted.Redacted<string>>, never, never>
    readonly hi4: () => Stream.Stream<Option.Option<Redacted.Redacted<string>>, never, never>
    readonly hi5: () => string
    readonly hi6: string
  }
>() {}

declare namespace Test1 {
  export type Methods = Context.Tag.Service<Test1>
  export type Returns<key extends keyof Methods, R = never> = ServicesReturns<Methods[key], R>
}

describe("Test1.Methods type extraction", () => {
  test("Methods should extract service interface correctly", () => {
    type Methods = Test1.Methods

    expect<Methods>().type.toBe<{
      readonly hi: Effect.Effect<Option.Option<Redacted.Redacted<string>>, never, never>
      readonly hi2: () => Effect.Effect<Option.Option<Redacted.Redacted<string>>, never, never>
      readonly hi3: Stream.Stream<Option.Option<Redacted.Redacted<string>>, never, never>
      readonly hi4: () => Stream.Stream<Option.Option<Redacted.Redacted<string>>, never, never>
      readonly hi5: () => string
      readonly hi6: string
    }>()
  })

  test("Methods.hi should be Effect.Effect", () => {
    type Hi = Test1.Methods["hi"]
    expect<Hi>().type.toBe<Effect.Effect<Option.Option<Redacted.Redacted<string>>, never, never>>()
  })

  test("Methods.hi2 should be function returning Effect.Effect", () => {
    type Hi2 = Test1.Methods["hi2"]
    expect<Hi2>().type.toBe<() => Effect.Effect<Option.Option<Redacted.Redacted<string>>, never, never>>()
  })

  test("Methods.hi3 should be Stream.Stream", () => {
    type Hi3 = Test1.Methods["hi3"]
    expect<Hi3>().type.toBe<Stream.Stream<Option.Option<Redacted.Redacted<string>>, never, never>>()
  })

  test("Methods.hi4 should be function returning Stream.Stream", () => {
    type Hi4 = Test1.Methods["hi4"]
    expect<Hi4>().type.toBe<() => Stream.Stream<Option.Option<Redacted.Redacted<string>>, never, never>>()
  })

  test("Methods.hi5 should be function returning string", () => {
    type Hi5 = Test1.Methods["hi5"]
    expect<Hi5>().type.toBe<() => string>()
  })

  test("Methods.hi6 should be string", () => {
    type Hi6 = Test1.Methods["hi6"]
    expect<Hi6>().type.toBe<string>()
  })
})

describe("ServicesReturns type inference", () => {
  test("hi: Effect.Effect<A, E, R> should return Effect.fn.Return<A, E, R>", () => {
    type Result = Test1.Returns<"hi">

    // Should be Effect.fn.Return
    expect<Result>().type.toBe<Effect.fn.Return<Option.Option<Redacted.Redacted<string>>, never, never>>()
  })

  test("hi2: () => Effect.Effect<A, E, R> should return Effect.fn.Return<A, E, R>", () => {
    type Result = Test1.Returns<"hi2">

    // Should be Effect.fn.Return
    expect<Result>().type.toBe<Effect.fn.Return<Option.Option<Redacted.Redacted<string>>, never, never>>()
  })

  test("hi3: Stream.Stream<A, E, R> should return Stream.Stream<A, E, R> (passthrough)", () => {
    type Result = Test1.Returns<"hi3">

    // Should be the original Stream type (not transformed)
    expect<Result>().type.toBe<Stream.Stream<Option.Option<Redacted.Redacted<string>>, never, never>>()
  })

  test("hi4: () => Stream.Stream<A, E, R> should return () => Stream.Stream<A, E, R> (passthrough)", () => {
    type Result = Test1.Returns<"hi4">

    // Should be the original function type (not transformed)
    expect<Result>().type.toBe<() => Stream.Stream<Option.Option<Redacted.Redacted<string>>, never, never>>()
  })

  test("hi5: () => string should return () => string (passthrough)", () => {
    type Result = Test1.Returns<"hi5">

    // Should be the original function type (not transformed)
    expect<Result>().type.toBe<() => string>()
  })

  test("hi6: string should return string (passthrough)", () => {
    type Result = Test1.Returns<"hi6">

    // Should be the original type (not transformed)
    expect<Result>().type.toBe<string>()
  })
})

describe("ServicesReturns with different Effect signatures", () => {
  class TestService extends Context.Tag("TestService")<
    TestService,
    {
      readonly noError: Effect.Effect<string>
      readonly withError: Effect.Effect<string, Error>
      readonly withContext: Effect.Effect<string, Error, Console.Console>
      readonly fnNoError: () => Effect.Effect<number>
      readonly fnWithError: (id: string) => Effect.Effect<number, Error>
      readonly fnWithContext: (id: string) => Effect.Effect<number, Error, Console.Console>
    }
  >() {}

  type TestServiceMethods = Context.Tag.Service<TestService>
  type TestServiceReturns<key extends keyof TestServiceMethods, R = never> = ServicesReturns<TestServiceMethods[key], R>

  test("Effect with no error should work", () => {
    type Result = TestServiceReturns<"noError">
    expect<Result>().type.toBe<Effect.fn.Return<string, never, never>>()
  })

  test("Effect with error should work", () => {
    type Result = TestServiceReturns<"withError">
    expect<Result>().type.toBe<Effect.fn.Return<string, Error, never>>()
  })

  test("Effect with context should work", () => {
    type Result = TestServiceReturns<"withContext">
    expect<Result>().type.toBe<Effect.fn.Return<string, Error, Console.Console>>()
  })

  test("Function returning Effect with no error should work", () => {
    type Result = TestServiceReturns<"fnNoError">
    expect<Result>().type.toBe<Effect.fn.Return<number, never, never>>()
  })

  test("Function returning Effect with error should work", () => {
    type Result = TestServiceReturns<"fnWithError">
    expect<Result>().type.toBe<Effect.fn.Return<number, Error, never>>()
  })

  test("Function returning Effect with context should work", () => {
    type Result = TestServiceReturns<"fnWithContext">
    expect<Result>().type.toBe<Effect.fn.Return<number, Error, Console.Console>>()
  })
})

describe("ServicesReturns usage in Effect.fn", () => {
  test("Effect property can be used with Effect.fn", () => {
    // Effect.fn returns a function, not an Effect directly
    const implementation = Effect.fn("test.hi")(function* (): Test1.Returns<"hi"> {
      return Option.some(Redacted.make("test"))
    })

    // The implementation is a function that returns Effect
    expect<typeof implementation>().type.toBe<
      () => Effect.Effect<Option.Option<Redacted.Redacted<string>>, never, never>
    >()
  })

  test("Function returning Effect can be used with Effect.fn", () => {
    const implementation = Effect.fn("test.hi2")(function* (): Test1.Returns<"hi2"> {
      return Option.some(Redacted.make("test"))
    })

    expect<typeof implementation>().type.toBeAssignableTo<Test1.Methods["hi2"]>()
  })

  test("Stream property should not be transformed", () => {
    const implementation: Test1.Methods["hi3"] = Stream.fromEffect(
      Effect.sync(() => Option.some(Redacted.make("test")))
    )

    expect<typeof implementation>().type.toBeAssignableTo<Test1.Methods["hi3"]>()
  })

  test("Function returning Stream should not be transformed", () => {
    const makeHi4Implementation = () => Stream.fromEffect(Effect.sync(() => Option.some(Redacted.make("test"))))

    const implementation: Test1.Methods["hi4"] = makeHi4Implementation

    expect<typeof implementation>().type.toBeAssignableTo<Test1.Methods["hi4"]>()
  })

  test("Function returning string should not be transformed", () => {
    //
    const implementation: Test1.Methods["hi5"] = () => "test"

    expect<typeof implementation>().type.toBeAssignableTo<Test1.Methods["hi5"]>()
  })

  test("String property should not be transformed", () => {
    const implementation: Test1.Methods["hi6"] = "test"

    expect<typeof implementation>().type.toBeAssignableTo<Test1.Methods["hi6"]>()
  })
})

describe("ServicesReturns with additional R parameter", () => {
  class Logger extends Context.Tag("Logger")<Logger, { log: (msg: string) => void }>() {}
  class Database extends Context.Tag("Database")<Database, { query: (sql: string) => Effect.Effect<any> }>() {}

  class TestService extends Context.Tag("TestService")<
    TestService,
    {
      readonly noContext: Effect.Effect<string>
      readonly withContext: Effect.Effect<string, Error, Console.Console>
      readonly fnNoContext: () => Effect.Effect<number>
      readonly fnWithContext: (id: string) => Effect.Effect<number, Error, Console.Console>
    }
  >() {}

  type TestServiceMethods = Context.Tag.Service<TestService>
  type TestServiceReturns<key extends keyof TestServiceMethods, R = never> = ServicesReturns<TestServiceMethods[key], R>

  test("Effect with no context + Logger should merge contexts", () => {
    type Result = TestServiceReturns<"noContext", Logger>
    expect<Result>().type.toBe<Effect.fn.Return<string, never, Logger>>()
  })

  test("Effect with Console + Logger should merge contexts", () => {
    type Result = TestServiceReturns<"withContext", Logger>
    expect<Result>().type.toBe<Effect.fn.Return<string, Error, Console.Console | Logger>>()
  })

  test("Effect with Console + Logger + Database should merge all contexts", () => {
    type Result = TestServiceReturns<"withContext", Logger | Database>
    expect<Result>().type.toBe<Effect.fn.Return<string, Error, Console.Console | Logger | Database>>()
  })

  test("Function returning Effect with no context + Logger should merge contexts", () => {
    type Result = TestServiceReturns<"fnNoContext", Logger>
    expect<Result>().type.toBe<Effect.fn.Return<number, never, Logger>>()
  })

  test("Function returning Effect with Console + Logger should merge contexts", () => {
    type Result = TestServiceReturns<"fnWithContext", Logger>
    expect<Result>().type.toBe<Effect.fn.Return<number, Error, Console.Console | Logger>>()
  })

  test("Non-Effect types should not be affected by R parameter", () => {
    type Result = Test1.Returns<"hi5", Logger>
    expect<Result>().type.toBe<() => string>()
  })
})
