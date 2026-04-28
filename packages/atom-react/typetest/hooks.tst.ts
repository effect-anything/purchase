import type * as SqlError from "@effect/sql/SqlError"
import { Context, Effect, type Exit, Layer, Stream, Subscribable, SubscriptionRef } from "effect"
import { describe, expect, test } from "tstyche"
import {
  Atom,
  type AtomFamily,
  type AtomFeature,
  type AtomRuntimeWithFamily,
  defineFeature,
  type FeatureHookRecord,
  type FeatureHookType,
  type FilterAtoms,
  Result
} from "../src/index.ts"

class QueryService extends Context.Tag("QueryService")<
  QueryService,
  {
    readonly query: (sql: string) => Effect.Effect<ReadonlyArray<{ name: string }>, SqlError.SqlError>
  }
>() {}

const QueryServiceLive = Layer.succeed(QueryService, {
  query: (_sql: string) =>
    Effect.succeed([{ name: "users" }] as const) as Effect.Effect<ReadonlyArray<{ name: string }>, SqlError.SqlError>
})

const queryFeature = defineFeature({
  tags: { QueryService },
  provide: QueryServiceLive,
  make: (runtime) => {
    const query = runtime.fn(
      Effect.fn("type-test.query")(function* (sql: string) {
        const queryService = yield* QueryService
        return yield* queryService.query(sql)
      })
    )

    return { query }
  }
})

type WritableState = { readonly count: number; readonly label: string }
type WritableCommand = string
type WritableResultCommand = { readonly value: string; readonly fail?: true }
type FnCommand = { readonly value: string }

class SmokeError extends Error {}

const assertRuntime = (runtime: AtomRuntimeWithFamily<never>) => runtime

const sharedFeature = defineFeature({
  tags: {},
  provide: Layer.empty,
  make: (runtime) => {
    const checkedRuntime = assertRuntime(runtime)

    const writableStateAtom = Atom.make<WritableState>({ count: 0, label: "draft" })
    const writableResultStateAtom = Atom.make<Result.Result<string, SmokeError>>(Result.initial<string, SmokeError>())

    const writable = Atom.writable(
      (get) => get(writableStateAtom),
      (ctx, next: WritableCommand) => {
        ctx.set(writableStateAtom, { count: next.length, label: next })
      }
    )

    const writableResult = Atom.writable<Result.Result<string, SmokeError>, WritableResultCommand>(
      (get) => get(writableResultStateAtom),
      (ctx, next) => {
        ctx.set(writableResultStateAtom, next.fail ? Result.fail(new SmokeError("failed")) : Result.success(next.value))
      }
    )

    const fn = checkedRuntime.fn(
      Effect.fn("type-test.fn")(function* (input: FnCommand) {
        return input.value.length
      })
    )

    const pull = checkedRuntime.pull(Stream.make("first", "second"))

    const subscriptionRef = checkedRuntime.subscriptionRef(Effect.flatMap(SubscriptionRef.make(0), Effect.succeed))

    const subscribable = checkedRuntime.subscribable(
      Effect.succeed(
        Subscribable.make({
          get: Effect.succeed("subscribable value"),
          changes: Stream.make("subscribable value")
        })
      )
    )

    const readableFamily = checkedRuntime.family((id: string) => Atom.make(() => `value:${id}`).pipe(Atom.keepAlive))

    const writableFamily = checkedRuntime.family((id: string) =>
      Atom.writable(
        () => `${id}:ready`,
        (_ctx, next: number) => {
          void next
        }
      ).pipe(Atom.keepAlive)
    )

    const writableResultFamily = checkedRuntime.family((id: string) =>
      Atom.writable<Result.Result<string, SmokeError>, WritableResultCommand>(
        () => Result.success(`${id}:ready`),
        (_ctx, next) => {
          void next
        }
      ).pipe(Atom.keepAlive)
    )

    const fnFamily = checkedRuntime.family((id: string) =>
      checkedRuntime.fn(
        Effect.fn(`type-test.fnFamily.${id}`)(function* (suffix: string) {
          return `${id}:${suffix}`
        })
      )
    )

    const pullFamily = checkedRuntime.family((id: string) => checkedRuntime.pull(Stream.make(`${id}:1`, `${id}:2`)))

    const subscriptionRefFamily = checkedRuntime.family((id: string) =>
      checkedRuntime.subscriptionRef(Effect.flatMap(SubscriptionRef.make(`${id}:0`), Effect.succeed))
    )

    return {
      readable: Atom.make(() => "ready"),
      writable,
      writableResult,
      fn,
      pull,
      subscriptionRef,
      subscribable,
      readableFamily,
      writableFamily,
      writableResultFamily,
      fnFamily,
      pullFamily,
      subscriptionRefFamily,
      metadata: { section: "smoke" as const },
      helper: (value: string) => value.toUpperCase()
    }
  }
})

type QueryRows = ReadonlyArray<{ name: string }>
type SharedAtoms = typeof sharedFeature.atoms
type SharedHooks = ReturnType<typeof sharedFeature.useHooks>
type SharedWritableHook = SharedHooks["writable"]
type SharedFnHook = SharedHooks["fn"]
type SharedWritableTuple = readonly [
  WritableState,
  (value: WritableCommand | ((value: WritableState) => WritableCommand)) => void
]
type SharedWritableResultExitTuple = readonly [
  Result.Result<string, SmokeError>,
  (value: WritableResultCommand) => Promise<Exit.Exit<string, SmokeError>>
]
type SharedFnPromiseTuple = readonly [Result.Result<number, never>, (value: FnCommand) => Promise<number>]
type SharedPullExitTuple = readonly [
  Atom.Type<SharedAtoms["pull"]>,
  (value: void) => Promise<Exit.Exit<Atom.Success<SharedAtoms["pull"]>, Atom.Failure<SharedAtoms["pull"]>>>
]
type SharedSubscriptionRefExitTuple = readonly [
  Atom.Type<SharedAtoms["subscriptionRef"]>,
  (
    value: number
  ) => Promise<Exit.Exit<Atom.Success<SharedAtoms["subscriptionRef"]>, Atom.Failure<SharedAtoms["subscriptionRef"]>>>
]
type SharedWritableFamilyTuple = readonly [string, (value: number | ((value: string) => number)) => void]
type SharedWritableResultFamilyExitTuple = readonly [
  Result.Result<string, SmokeError>,
  (value: WritableResultCommand) => Promise<Exit.Exit<string, SmokeError>>
]
type SharedFilterFixture = FilterAtoms<{
  readonly readable: SharedAtoms["readable"]
  readonly readableFamily: SharedAtoms["readableFamily"]
  readonly metadata: { readonly section: "smoke" }
  readonly helper: (value: string) => string
}>
type SharedMixedRecord = FeatureHookRecord<{
  readonly readable: SharedAtoms["readable"]
  readonly writable: SharedAtoms["writable"]
  readonly fnFamily: SharedAtoms["fnFamily"]
  readonly metadata: { readonly section: "smoke" }
  readonly helper: (value: string) => string
}>

describe("@effect-x/atom-react fn typing", () => {
  test("promise() keeps the Exit success and error channel", () => {
    const promiseResult = queryFeature.useHooks().query.promise("SELECT name FROM sqlite_master")

    expect<typeof promiseResult>().type.toBe<Promise<Exit.Exit<QueryRows, SqlError.SqlError>>>()
  })

  test("promise({ mode: 'value' }) unwraps the success value only", () => {
    const promiseValue = queryFeature.useHooks().query.promise("SELECT name FROM sqlite_master", { mode: "value" })

    expect<typeof promiseValue>().type.toBe<Promise<QueryRows>>()
  })

  test("useAtom({ mode: 'exit' }) exposes an Exit-returning setter", () => {
    const atomTuple = queryFeature.useHooks().query.useAtom({ mode: "exit" })

    expect<typeof atomTuple>().type.toBe<
      readonly [
        Result.Result<QueryRows, SqlError.SqlError>,
        (value: string) => Promise<Exit.Exit<QueryRows, SqlError.SqlError>>
      ]
    >()
  })

  test("public fn hooks do not expose Reset or Interrupt inputs", () => {
    const fnHook = queryFeature.useHooks().query

    expect(fnHook).type.toBeCallableWith("SELECT name FROM sqlite_master")
    expect(fnHook).type.not.toBeCallableWith(Atom.Reset)
    expect(fnHook.promise).type.not.toBeCallableWith(Atom.Interrupt)
  })
})

describe("exported type surface", () => {
  test("keeps exported helper types aligned with the filtered feature shape", () => {
    expect<SharedAtoms["readableFamily"]>().type.toBe<AtomFamily<string, Atom.Atom<string>>>()
    expect<FeatureHookType<SharedAtoms["writable"]>>().type.toBe<SharedWritableHook>()
    expect<FeatureHookType<SharedAtoms["fn"]>>().type.toBe<SharedFnHook>()
    expect<FeatureHookType<SharedAtoms["fnFamily"]>>().type.toBe<SharedHooks["fnFamily"]>()
    expect<SharedHooks>().type.toBe<FeatureHookRecord<SharedAtoms>>()
    expect<SharedMixedRecord["metadata"]>().type.toBe<{ readonly section: "smoke" }>()
    expect<SharedMixedRecord["helper"]>().type.toBe<(value: string) => string>()
    expect<SharedFilterFixture>().type.toBe<{
      readonly readable: SharedAtoms["readable"]
      readonly readableFamily: SharedAtoms["readableFamily"]
    }>()
    expect<typeof sharedFeature>().type.toBeAssignableTo<AtomFeature<SharedAtoms>>()
  })
})

describe("direct atom hooks", () => {
  test("covers readable and writable atoms without widening their public inputs", () => {
    const hooks = sharedFeature.useHooks()
    const readableValue = hooks.readable.useValue()
    const writableTuple = hooks.writable.useAtom()
    const writablePromiseValue = hooks.writable.promise("next", { mode: "value" })

    expect<typeof readableValue>().type.toBe<string>()
    expect<typeof writableTuple>().type.toBe<SharedWritableTuple>()
    expect<typeof writablePromiseValue>().type.toBe<Promise<WritableState>>()
    expect(hooks.readable.useSubscribe).type.toBeCallableWith((_value: string) => undefined)
    expect(hooks.writable).type.toBeCallableWith("draft")
    expect(hooks.writable.promise).type.toBeCallableWith("draft", { mode: "value" })
  })

  test("covers result-backed writable atoms and runtime.fn mode inference", () => {
    const hooks = sharedFeature.useHooks()
    const writableResultTuple = hooks.writableResult.useAtom({ mode: "exit" })
    const writableResultValue = hooks.writableResult.promise({ value: "next" }, { mode: "value" })
    const fnTuple = hooks.fn.useAtom({ mode: "promise" })
    const fnValue = hooks.fn.promise({ value: "next" }, { mode: "value" })

    expect<typeof writableResultTuple>().type.toBe<SharedWritableResultExitTuple>()
    expect<typeof writableResultValue>().type.toBe<Promise<string>>()
    expect<typeof fnTuple>().type.toBe<SharedFnPromiseTuple>()
    expect<typeof fnValue>().type.toBe<Promise<number>>()
    expect(hooks.writableResult.promise).type.toBeCallableWith({ value: "next" })
    expect(hooks.fn.promise).type.toBeCallableWith({ value: "next" }, { mode: "value" })
  })

  test("covers pull, subscriptionRef, and subscribable wrapper inference", () => {
    const hooks = sharedFeature.useHooks()
    const pullTuple = hooks.pull.useAtom({ mode: "exit" })
    const pullValue = hooks.pull.promise(undefined, { mode: "value" })
    const subscriptionRefTuple = hooks.subscriptionRef.useAtom({ mode: "exit" })
    const subscriptionRefValue = hooks.subscriptionRef.promise(1, { mode: "value" })
    const subscribableValue = hooks.subscribable.useSuspenseSuccess()

    expect<typeof pullTuple>().type.toBe<SharedPullExitTuple>()
    expect<typeof pullValue>().type.toBe<Promise<Atom.Success<SharedAtoms["pull"]>>>()
    expect<typeof subscriptionRefTuple>().type.toBe<SharedSubscriptionRefExitTuple>()
    expect<typeof subscriptionRefValue>().type.toBe<Promise<number>>()
    expect<typeof subscribableValue>().type.toBe<
      Result.Success<Atom.Success<SharedAtoms["subscribable"]>, Atom.Failure<SharedAtoms["subscribable"]>>
    >()
    expect(hooks.pull.promise).type.toBeCallableWith(undefined, { mode: "value" })
    expect(hooks.subscriptionRef).type.toBeCallableWith(1)
  })
})

describe("family hooks", () => {
  test("preserves readable and writable family argument and input types", () => {
    const hooks = sharedFeature.useHooks()
    const readableFamilyValue = hooks.readableFamily.useValue("repo-a")
    const writableFamilyTuple = hooks.writableFamily.useAtom("repo-a")
    const writableFamilyValue = hooks.writableFamily.promise("repo-a", 1, { mode: "value" })

    expect<typeof readableFamilyValue>().type.toBe<string>()
    expect<typeof writableFamilyTuple>().type.toBe<SharedWritableFamilyTuple>()
    expect<typeof writableFamilyValue>().type.toBe<Promise<string>>()
    expect(hooks.readableFamily.useSubscribe).type.toBeCallableWith("repo-a", (_value: string) => undefined)
    expect(hooks.writableFamily.promise).type.toBeCallableWith("repo-a", 1, { mode: "value" })
  })

  test("preserves result, fn, pull, and subscriptionRef family wrappers", () => {
    const hooks = sharedFeature.useHooks()
    const writableResultFamilyTuple = hooks.writableResultFamily.useAtom("repo-a", {
      mode: "exit"
    })
    const fnFamilyValue = hooks.fnFamily.promise("repo-a", "done", { mode: "value" })
    const pullFamilyValue = hooks.pullFamily.promise("repo-a", undefined, { mode: "value" })
    const subscriptionRefFamilyValue = hooks.subscriptionRefFamily.promise("repo-a", "done", {
      mode: "value"
    })

    expect<typeof writableResultFamilyTuple>().type.toBe<SharedWritableResultFamilyExitTuple>()
    expect<typeof fnFamilyValue>().type.toBe<Promise<string>>()
    expect<typeof pullFamilyValue>().type.toBe<Promise<Atom.Success<ReturnType<SharedHooks["pullFamily"]["atom"]>>>>()
    expect<typeof subscriptionRefFamilyValue>().type.toBe<Promise<string>>()
    expect(hooks.fnFamily.promise).type.toBeCallableWith("repo-a", "done", { mode: "value" })
    expect(hooks.pullFamily.promise).type.toBeCallableWith("repo-a", undefined, { mode: "value" })
  })
})

describe("negative public API assertions", () => {
  test("rejects invalid callable shapes, modes, and filtered members", () => {
    const hooks = sharedFeature.useHooks()

    expect<SharedHooks["readable"]>().type.not.toBeAssignableTo<(...args: Array<any>) => unknown>()
    expect(hooks.writable.useAtom).type.not.toBeCallableWith({ mode: "promise" })
    expect(hooks.writable.useAtom).type.not.toBeCallableWith({ mode: "exit" })
    expect(hooks.writable).type.not.toBeCallableWith(123)
    expect(hooks.writable.promise).type.not.toBeCallableWith(123, { mode: "value" })
    expect(hooks.writableResult.useAtom).type.not.toBeCallableWith({ mode: "invalid" })
    expect(hooks.fn.promise).type.not.toBeCallableWith(Atom.Reset)
    expect(hooks.pull.promise).type.not.toBeCallableWith("next", { mode: "value" })
    expect(hooks.subscribable).type.not.toHaveProperty("useAtom")
    expect(hooks.readableFamily.useValue).type.not.toBeCallableWith({ id: "repo-a" })
    expect(hooks.writableFamily.promise).type.not.toBeCallableWith("repo-a", "done", {
      mode: "value"
    })
    expect(hooks.fnFamily.promise).type.not.toBeCallableWith("repo-a", Atom.Interrupt)
    expect(sharedFeature.atoms).type.not.toHaveProperty("helper")
    expect(sharedFeature.useHooks()).type.not.toHaveProperty("helper")
  })
})
