import { KeyValueStore } from "@effect/platform"
import {
  Cause,
  Context,
  Data,
  Effect,
  Exit,
  Layer,
  Option,
  Redacted,
  Stream,
  Subscribable,
  SubscriptionRef
} from "effect"
import { Suspense } from "react"
import { afterEach, assert, describe, expect, vi } from "vitest"
import { renderHook } from "vitest-browser-react"
import { Atom, defineFeature, makeDefaultRegistry, RegistryContext, Result } from "../../src/index.ts"

const mockFn: typeof vi.fn = vi.fn
type ServicesReturns<T, R = never> =
  T extends Effect.Effect<infer A, infer E, infer R0> ? Effect.Effect<A, E, R | R0> : never

export class Test1 extends Context.Tag("Test1")<
  Test1,
  {
    readonly hi: Effect.Effect<Option.Option<Redacted.Redacted<string>>, never, never>
  }
>() {}

const Test1Live = Layer.scoped(
  Test1,
  Effect.gen(function* () {
    return {
      hi: Effect.sync(() => Option.some(Redacted.make("hi message")))
    }
  })
)

export declare namespace Test1 {
  export type Methods = Context.Tag.Service<Test1>
  export type Returns<key extends keyof Methods, R = never> = ServicesReturns<Methods[key], R>
}

class Test2 extends Context.Tag("Test2")<
  Test2,
  {
    hello: Effect.Effect<{ text: string }, never, never>
    subscriptionRef: SubscriptionRef.SubscriptionRef<number>
  }
>() {}

const Test2Live = Layer.scoped(
  Test2,
  Effect.gen(function* () {
    const subscriptionRef = yield* SubscriptionRef.make(0)

    return {
      subscriptionRef,
      hello: Effect.gen(function* () {
        return { text: "hi" }
      })
    }
  })
)

export declare namespace Test2 {
  export type Methods = Context.Tag.Service<Test1>
  export type Returns<key extends keyof Methods, R = never> = ServicesReturns<Methods[key], R>
}

class WriteableResultError extends Data.TaggedError("WriteableResultError")<{}> {}
class FnError extends Data.TaggedError("FnError")<{}> {}

const feature1 = defineFeature({
  tags: { Test1, Test2 },
  provide: Layer.mergeAll(Test1Live, Test2Live, KeyValueStore.layerMemory),
  make: (runtime) => {
    const readable = Atom.make(() => {
      return Result.initial<string, WriteableResultError>()
    })

    const readableResult = runtime.atom(
      Effect.gen(function* () {
        const service = yield* Test1
        if (new Date().toString() == "error") {
          return yield* new FnError()
        }
        return yield* service.hi
      }),
      { initialValue: Option.none() }
    )

    const writeable = Atom.make({ name: "John Doe" })

    const writeableResult = Atom.make<Result.Result<string, WriteableResultError>>(
      Result.initial<string, WriteableResultError>()
    )

    const fn = runtime.fn(
      Effect.fn(function* (name: string, _ctx: Atom.FnContext) {
        if (name == "error") {
          return yield* new FnError()
        }
        return new Date().toString()
      }),
      {
        concurrent: false
      }
    )

    const slowFn = runtime.fn(
      Effect.fn(function* (name: string) {
        return yield* Effect.promise(
          () => new Promise<string>((resolve) => setTimeout(() => resolve(`slow:${name}`), 20))
        )
      }),
      {
        concurrent: false
      }
    )

    const pull = runtime.pull(Stream.make(1, 2, 3).pipe(Stream.map((n) => Result.success(n * 10))))
    const singlePull = runtime.pull(Stream.succeed(Result.success(42)))

    const subscriptionRef = runtime.subscriptionRef(
      Effect.gen(function* () {
        const service = yield* Test2
        return service.subscriptionRef
      })
    )

    const subscribable = runtime.subscribable(
      Effect.succeed(
        Subscribable.make({
          get: Effect.succeed("subscribable value"),
          changes: Stream.make("subscribable value")
        })
      )
    )

    return {
      readable,
      readableResult,
      writeable,
      writeableResult,
      fn,
      slowFn,
      pull,
      singlePull,
      subscriptionRef,
      subscribable
    }
  }
})

const familyFeature = defineFeature({
  tags: {},
  provide: Layer.empty,
  make: (runtime) => {
    const refreshCounts = new Map<string, number>()

    const readableFamily = runtime.family({
      key: ({ id }: { id: string }) => Data.struct({ id }),
      make: ({ id }) => Atom.make(() => `value:${id}`).pipe(Atom.keepAlive)
    })

    const writeableFamily = runtime.family({
      key: ({ id }: { id: string }) => Data.struct({ id }),
      make: ({ id }) => Atom.make(`value:${id}`).pipe(Atom.keepAlive)
    })

    const readableResultFamily = runtime.family({
      key: ({ id }: { id: string }) => Data.struct({ id }),
      make: ({ id }) =>
        runtime.atom(
          Effect.sync(() => {
            const next = (refreshCounts.get(id) ?? 0) + 1
            refreshCounts.set(id, next)
            return `${id}:${next}`
          })
        )
    })

    const writeableResultFamily = runtime.family({
      key: ({ id }: { id: string }) => Data.struct({ id }),
      make: ({ id }) => Atom.make(Result.success(`${id}:0`)).pipe(Atom.keepAlive)
    })

    const fnFamily = runtime.family({
      key: ({ id }: { id: string }) => Data.struct({ id }),
      make: ({ id }) =>
        runtime.fn(
          Effect.fn(function* (suffix: string) {
            return `${id}:${suffix}`
          })
        )
    })

    const slowFnFamily = runtime.family((id: string) =>
      runtime.fn(
        Effect.fn(function* (suffix: string) {
          return yield* Effect.promise(
            () => new Promise<string>((resolve) => setTimeout(() => resolve(`${id}:${suffix}:slow`), 20))
          )
        })
      )
    )

    const pullFamily = runtime.family((id: string) =>
      runtime.pull(Stream.make(Result.success(`${id}:1`), Result.success(`${id}:2`)))
    )

    const subscriptionRefFamily = runtime.family((id: string) =>
      runtime.subscriptionRef(Effect.flatMap(SubscriptionRef.make(`${id}:0`), Effect.succeed))
    )

    return {
      readableFamily,
      writeableFamily,
      readableResultFamily,
      writeableResultFamily,
      fnFamily,
      slowFnFamily,
      pullFamily,
      subscriptionRefFamily,
      helper: () => "not-exposed"
    }
  }
})

const asyncFeature = defineFeature({
  tags: {},
  provide: Layer.empty,
  make: (runtime) => {
    const delayedFn = runtime.fn(
      Effect.fn("async.delayedFn")(function* (request: { value: string; delayMs?: number }) {
        yield* Effect.sleep(`${request.delayMs ?? 20} millis`)
        return request.value
      }),
      { concurrent: false }
    )

    const delayedReadableFamily = runtime.family((id: string) =>
      runtime.atom(
        Effect.gen(function* () {
          yield* Effect.sleep("20 millis")
          return `${id}:ready`
        })
      )
    )

    const delayedFnFamily = runtime.family((id: string) =>
      runtime.fn(
        Effect.fn("async.delayedFnFamily")(function* (suffix: string) {
          yield* Effect.sleep("20 millis")
          return `${id}:${suffix}`
        }),
        { concurrent: false }
      )
    )

    return {
      delayedFn,
      delayedReadableFamily,
      delayedFnFamily
    }
  }
})

const ForkedTest1Live = Layer.scoped(
  Test1,
  Effect.gen(function* () {
    return {
      hi: Effect.sync(() => Option.some(Redacted.make("forked message")))
    }
  })
)

const ForkedTest2Live = Layer.scoped(
  Test2,
  Effect.gen(function* () {
    const subscriptionRef = yield* SubscriptionRef.make(99)

    return {
      subscriptionRef,
      hello: Effect.succeed({ text: "forked" })
    }
  })
)

const createForkedFeature = () =>
  feature1.fork(Layer.mergeAll(ForkedTest1Live, ForkedTest2Live, KeyValueStore.layerMemory))

const timeoutFeature = defineFeature({
  tags: {},
  provide: Layer.empty,
  make: (runtime) => ({
    hangingFn: runtime.fn(
      Effect.fn("timeout.hangingFn")(function* (_label: string) {
        return yield* Effect.async<string>(() => undefined)
      }),
      { concurrent: false }
    )
  })
})

const createTestWrapper = (registry: ReturnType<typeof makeDefaultRegistry>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>
  )
}

const createSuspenseWrapper = (registry: ReturnType<typeof makeDefaultRegistry>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={null}>
      <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>
    </Suspense>
  )
}

const instrumentRegistryLifecycle = (registry: ReturnType<typeof makeDefaultRegistry>) => {
  const stats = {
    mounts: 0,
    unmounts: 0,
    subscribes: 0,
    unsubscribes: 0
  }

  const originalMount = registry.mount.bind(registry)
  const originalSubscribe = registry.subscribe.bind(registry)
  const mutableRegistry = registry as unknown as {
    mount: typeof registry.mount
    subscribe: typeof registry.subscribe
  }

  mutableRegistry.mount = ((atom) => {
    stats.mounts++
    const unmount = originalMount(atom)
    return () => {
      stats.unmounts++
      unmount()
    }
  }) as typeof registry.mount

  mutableRegistry.subscribe = ((atom, callback, options) => {
    stats.subscribes++
    const unsubscribe = originalSubscribe(atom, callback, options)
    return () => {
      stats.unsubscribes++
      unsubscribe()
    }
  }) as typeof registry.subscribe

  return stats
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("Readable", (it) => {
  it("mount", async () => {
    const registry = makeDefaultRegistry()

    await renderHook(() => feature1.useHooks().readable.useMount(), {
      wrapper: createTestWrapper(registry)
    })

    expect(registry.get(feature1.atoms.readable)).toEqual(Result.initial())
  })

  it("useValue", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks().readable.useValue(), {
      wrapper: createTestWrapper(registry)
    })

    expect(result.current).toEqual(Result.initial())
  })

  it("useSubscribe", async () => {
    const registry = makeDefaultRegistry()
    const callback = mockFn()

    const { rerender } = await renderHook(
      () => feature1.useHooks().readable.useSubscribe(callback, { immediate: true }),
      {
        wrapper: createTestWrapper(registry)
      }
    )

    await rerender()

    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith(Result.initial())
  })

  it("refresh", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    expect(() => result.current.readable.refresh(registry)).not.toThrow()
  })
})

describe("runtime.family", (it) => {
  it("filters atoms/useHooks to atoms and families only", async () => {
    const registry = makeDefaultRegistry()

    expect("helper" in familyFeature.atoms).toBe(false)

    const { result } = await renderHook(() => familyFeature.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    expect("helper" in (result.current as Record<string, unknown>)).toBe(false)
    expect("readableFamily" in result.current).toBe(true)
    expect("fnFamily" in result.current).toBe(true)
  })

  it("returns the same atom for equal normalized args", () => {
    expect(familyFeature.atoms.readableFamily({ id: "repo-a" })).toBe(
      familyFeature.atoms.readableFamily({ id: "repo-a" })
    )
    expect(familyFeature.atoms.readableResultFamily({ id: "repo-a" })).toBe(
      familyFeature.atoms.readableResultFamily({ id: "repo-a" })
    )
  })

  it("returns a stable hooks record", async () => {
    const registry = makeDefaultRegistry()

    const { result, rerender } = await renderHook(() => familyFeature.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    const first = result.current
    await rerender()

    expect(result.current).toBe(first)
    expect(result.current.readableFamily).toBe(first.readableFamily)
    expect(result.current.fnFamily).toBe(first.fnFamily)
  })

  it("useValue", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => familyFeature.useHooks().readableFamily.useValue({ id: "repo-a" }), {
      wrapper: createTestWrapper(registry)
    })

    expect(result.current).toEqual("value:repo-a")
  })

  it("useSubscribe", async () => {
    const registry = makeDefaultRegistry()
    const callback = mockFn()

    const { rerender } = await renderHook(
      () => familyFeature.useHooks().readableFamily.useSubscribe({ id: "repo-a" }, callback, { immediate: true }),
      {
        wrapper: createTestWrapper(registry)
      }
    )

    await rerender()

    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith("value:repo-a")
  })

  it("writeable family use", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => familyFeature.useHooks().writeableFamily.useAtom({ id: "repo-a" }), {
      wrapper: createTestWrapper(registry)
    })

    expect(result.current[0]).toEqual("value:repo-a")

    await act(async () => {
      result.current[1]("value:repo-a:updated")
    })

    expect(result.current[0]).toEqual("value:repo-a:updated")
    expect(registry.get(familyFeature.atoms.writeableFamily({ id: "repo-a" }))).toEqual("value:repo-a:updated")
  })

  it("readable result family useSuspenseSuccess and refresh", async () => {
    const registry = makeDefaultRegistry()

    const { result, rerender, act } = await renderHook(
      () => {
        const feature = familyFeature.useHooks()
        return {
          value: feature.readableResultFamily.useSuspenseSuccess({ id: "repo-a" }),
          readableResultFamily: feature.readableResultFamily
        }
      },
      {
        wrapper: createSuspenseWrapper(registry)
      }
    )

    expect(Result.isSuccess(result.current.value)).toBe(true)
    if (Result.isSuccess(result.current.value)) {
      expect(result.current.value.value).toEqual("repo-a:1")
    }

    await act(() => {
      result.current.readableResultFamily.refresh({ id: "repo-a" }, registry)
    })
    await rerender()

    expect(Result.isSuccess(result.current.value)).toBe(true)
    if (Result.isSuccess(result.current.value)) {
      expect(result.current.value.value).toEqual("repo-a:2")
    }
  })

  it("writeable result family use", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(
      () => familyFeature.useHooks().writeableResultFamily.useAtom({ id: "repo-a" }),
      {
        wrapper: createTestWrapper(registry)
      }
    )

    expect(Result.isSuccess(result.current[0])).toBe(true)
    if (Result.isSuccess(result.current[0])) {
      expect(result.current[0].value).toEqual("repo-a:0")
    }

    await act(async () => {
      result.current[1](Result.success("repo-a:updated"))
    })

    expect(Result.isSuccess(result.current[0])).toBe(true)
    if (Result.isSuccess(result.current[0])) {
      expect(result.current[0].value).toEqual("repo-a:updated")
    }
  })

  it("fn family promise", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => familyFeature.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const value = await result.current.fnFamily.promise({ id: "repo-a" }, "run", {
        registry,
        mode: "value"
      })
      expect(value).toEqual("repo-a:run")
    })

    expect(Result.isSuccess(registry.get(familyFeature.atoms.fnFamily({ id: "repo-a" })))).toBe(true)
  })

  it("slow fn family promise resolves and releases temporary lifecycle resources", async () => {
    const registry = makeDefaultRegistry()
    const lifecycle = instrumentRegistryLifecycle(registry)

    const { result, act } = await renderHook(() => familyFeature.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const value = await result.current.slowFnFamily.promise("repo-a", "run", {
        registry,
        mode: "value"
      })
      expect(value).toEqual("repo-a:run:slow")
    })

    await vi.waitFor(() => {
      expect(lifecycle.mounts).toBeGreaterThan(0)
      expect(lifecycle.unmounts).toBe(lifecycle.mounts)
      expect(lifecycle.unsubscribes).toBe(lifecycle.subscribes)
    })
  })

  it("pull family promise resolves streamed items through family hook api", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => familyFeature.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const value = await result.current.pullFamily.promise("repo-a", undefined, {
        registry,
        mode: "value"
      })
      expect(value.done).toBe(true)
      expect(value.items).toHaveLength(2)
      expect(Result.isSuccess(value.items[0])).toBe(true)
      expect(Result.isSuccess(value.items[1])).toBe(true)
    })
  })

  it("subscriptionRef family use writes through the family-level hook api", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => familyFeature.useHooks().subscriptionRefFamily.useAtom("repo-a"), {
      wrapper: createTestWrapper(registry)
    })

    await vi.waitFor(() => {
      expect(Result.isSuccess(result.current[0])).toBe(true)
    })

    if (Result.isSuccess(result.current[0])) {
      expect(result.current[0].value).toBe("repo-a:0")
    }

    await act(async () => {
      result.current[1]("repo-a:updated")
    })

    expect(Result.isSuccess(result.current[0])).toBe(true)
    if (Result.isSuccess(result.current[0])) {
      expect(result.current[0].value).toBe("repo-a:updated")
    }
  })
})

describe("Async hooks", (it) => {
  it("fn use promise mode waits for long-running commands", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => asyncFeature.useHooks().delayedFn.useAtom({ mode: "promise" }), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const value = await result.current[1]({ value: "ready", delayMs: 15 })
      expect(value).toBe("ready")
    })

    expect(Result.isSuccess(result.current[0])).toBe(true)
    if (Result.isSuccess(result.current[0])) {
      expect(result.current[0].value).toBe("ready")
    }
  })

  it("readable family suspense resolves without calling family(arg) first", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(
      () => asyncFeature.useHooks().delayedReadableFamily.useSuspenseSuccess("repo-a"),
      {
        wrapper: createSuspenseWrapper(registry)
      }
    )

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull()
    })

    expect(Result.isSuccess(result.current)).toBe(true)
    if (Result.isSuccess(result.current)) {
      expect(result.current.value).toBe("repo-a:ready")
    }
  })

  it("fn family use exit mode returns exits through the family-level hook api", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(
      () => asyncFeature.useHooks().delayedFnFamily.useAtom("repo-a", { mode: "exit" }),
      {
        wrapper: createTestWrapper(registry)
      }
    )

    await act(async () => {
      const exit = await result.current[1]("done")
      expect(Exit.isSuccess(exit)).toBe(true)
      if (Exit.isSuccess(exit)) {
        expect(exit.value).toBe("repo-a:done")
      }
    })

    expect(Result.isSuccess(result.current[0])).toBe(true)
    if (Result.isSuccess(result.current[0])) {
      expect(result.current[0].value).toBe("repo-a:done")
    }
  })
})

describe("ReadableResult", (it) => {
  it("mount", async () => {
    const registry = makeDefaultRegistry()

    await renderHook(() => feature1.useHooks().readableResult.useMount(), {
      wrapper: createTestWrapper(registry)
    })

    const currentValue = registry.get(feature1.atoms.readableResult)
    expect(Result.isResult(currentValue)).toBe(true)
  })

  it("useValue", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks().readableResult.useValue(), {
      wrapper: createTestWrapper(registry)
    })

    expect(Result.isResult(result.current)).toBe(true)
  })

  it("useSuspense", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks().readableResult.useSuspense(), {
      wrapper: createSuspenseWrapper(registry)
    })

    expect(Result.isResult(result.current)).toBe(true)
  })

  it("useSuspenseSuccess", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks().readableResult.useSuspenseSuccess(), {
      wrapper: createSuspenseWrapper(registry)
    })

    expect(Result.isSuccess(result.current)).toBe(true)
  })

  it("useSubscribe", async () => {
    const registry = makeDefaultRegistry()
    const callback = mockFn()

    const { rerender } = await renderHook(
      () => feature1.useHooks().readableResult.useSubscribe(callback, { immediate: true }),
      {
        wrapper: createTestWrapper(registry)
      }
    )

    await rerender()

    expect(callback).toHaveBeenCalledOnce()
    const callArg = callback.mock.calls[0][0]
    expect(Result.isSuccess(callArg)).toBeTruthy()
  })

  it("refresh", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    expect(() => result.current.readableResult.refresh(registry)).not.toThrow()
  })

  it("useMount cleanup releases the mounted atom on unmount", async () => {
    const registry = makeDefaultRegistry()
    const lifecycle = instrumentRegistryLifecycle(registry)

    const hook = await renderHook(() => feature1.useHooks().readableResult.useMount(), {
      wrapper: createTestWrapper(registry)
    })

    expect(lifecycle.mounts).toBeGreaterThan(0)

    hook.unmount()

    expect(lifecycle.unmounts).toBe(lifecycle.mounts)
  })
})

describe("Writeable", (it) => {
  it("mount", async () => {
    const registry = makeDefaultRegistry()

    await renderHook(() => feature1.useHooks().writeable.useMount(), {
      wrapper: createTestWrapper(registry)
    })

    expect(registry.get(feature1.atoms.writeable)).toEqual({ name: "John Doe" })

    registry.set(feature1.atoms.writeable, { name: "Ray" })
    expect(registry.get(feature1.atoms.writeable)).toEqual({ name: "Ray" })
  })

  it("use", async () => {
    const registry = makeDefaultRegistry()

    const { act, result } = await renderHook(() => feature1.useHooks().writeable.useAtom(), {
      wrapper: createTestWrapper(registry)
    })

    expect(registry.get(feature1.atoms.writeable)).toEqual({ name: "John Doe" })

    await act(async () => {
      const set = result.current[1]
      set({ name: "Ray" })
    })

    expect(registry.get(feature1.atoms.writeable)).toEqual({ name: "Ray" })
    expect(result.current[0]).toEqual({ name: "Ray" })
  })

  it("useValue", async () => {
    const registry = makeDefaultRegistry()

    const { result, rerender } = await renderHook(() => feature1.useHooks().writeable.useValue(), {
      wrapper: createTestWrapper(registry)
    })

    expect(registry.get(feature1.atoms.writeable)).toEqual({ name: "John Doe" })

    registry.set(feature1.atoms.writeable, { name: "Ray" })
    await rerender()

    expect(result.current).toEqual({ name: "Ray" })
  })

  it("useSubscribe", async () => {
    const registry = makeDefaultRegistry()
    const callback = mockFn()

    const { rerender } = await renderHook(
      () => feature1.useHooks().writeable.useSubscribe(callback, { immediate: true }),
      {
        wrapper: createTestWrapper(registry)
      }
    )

    expect(callback).toHaveBeenCalledTimes(1)
    expect(registry.get(feature1.atoms.writeable)).toEqual({ name: "John Doe" })

    registry.set(feature1.atoms.writeable, { name: "user_cursor_is_here" })
    await rerender()

    expect(registry.get(feature1.atoms.writeable)).toEqual({ name: "user_cursor_is_here" })
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith({ name: "user_cursor_is_here" })
  })

  it("set direct/promise/promise value mode", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(
      () => {
        const feature = feature1.useHooks()
        return {
          value: feature.writeable.useValue(),
          writeable: feature.writeable
        }
      },
      {
        wrapper: createTestWrapper(registry)
      }
    )

    await act(async () => {
      result.current.writeable({ name: "hello" }, { registry })
    })
    expect(result.current.value).toEqual({ name: "hello" })

    await act(async () => {
      const exit = await result.current.writeable.promise({ name: "updated" }, { registry })
      expect(Exit.isSuccess(exit)).toBe(true)
      if (Exit.isSuccess(exit)) {
        expect(exit.value).toEqual({ name: "updated" })
      }
    })
    expect(result.current.value).toEqual({ name: "updated" })

    await act(async () => {
      await result.current.writeable.promise({ name: "user_cursor_is_here" }, { registry, mode: "value" })
    })
    expect(result.current.value).toEqual({ name: "user_cursor_is_here" })
  })

  it("supports updater functions", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => feature1.useHooks().writeable.useAtom(), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      result.current[1]((current: { name: string }) => ({ name: `${current.name}:updated` }))
    })

    expect(result.current[0]).toEqual({ name: "John Doe:updated" })
    expect(registry.get(feature1.atoms.writeable)).toEqual({ name: "John Doe:updated" })
  })

  it("refresh", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    expect(() => result.current.writeable.refresh(registry)).not.toThrow()
  })
})

describe("WriteableResult", (it) => {
  it("mount", async () => {
    const registry = makeDefaultRegistry()

    await renderHook(() => feature1.useHooks().writeableResult.useMount(), {
      wrapper: createTestWrapper(registry)
    })

    expect(registry.get(feature1.atoms.writeableResult)).toEqual(Result.initial())

    registry.set(feature1.atoms.writeableResult, Result.success("user_cursor_is_here", { timestamp: 0 }))
    expect(registry.get(feature1.atoms.writeableResult)).toEqual(
      Result.success("user_cursor_is_here", { timestamp: 0 })
    )
  })

  it("use", async () => {
    const registry = makeDefaultRegistry()

    const { act, result } = await renderHook(() => feature1.useHooks().writeableResult.useAtom(), {
      wrapper: createTestWrapper(registry)
    })

    expect(registry.get(feature1.atoms.writeableResult)).toEqual(Result.initial())

    await act(async () => {
      const set = result.current[1]
      set(Result.success("user_cursor_is_here", { timestamp: 0 }))
    })

    expect(registry.get(feature1.atoms.writeableResult)).toEqual(
      Result.success("user_cursor_is_here", { timestamp: 0 })
    )
    expect(result.current[0]).toEqual(Result.success("user_cursor_is_here", { timestamp: 0 }))
  })

  it("useValue", async () => {
    const registry = makeDefaultRegistry()

    const { result, rerender } = await renderHook(() => feature1.useHooks().writeableResult.useValue(), {
      wrapper: createTestWrapper(registry)
    })

    expect(registry.get(feature1.atoms.writeableResult)).toEqual(Result.initial())

    registry.set(feature1.atoms.writeableResult, Result.success("Ray", { timestamp: 0 }))
    await rerender()

    expect(result.current).toEqual(Result.success("Ray", { timestamp: 0 }))
  })

  it("useSuspense", async () => {
    const registry = makeDefaultRegistry()

    const { result, rerender } = await renderHook(() => feature1.useHooks().writeableResult.useSuspense(), {
      wrapper: createSuspenseWrapper(registry)
    })

    registry.set(feature1.atoms.writeableResult, Result.success("user_cursor_is_here", { timestamp: 0 }))
    await rerender()

    expect(result.current).toEqual(Result.success("user_cursor_is_here", { timestamp: 0 }))
  })

  it("useSubscribe", async () => {
    const registry = makeDefaultRegistry()
    const callback = mockFn()

    const { rerender } = await renderHook(
      () => feature1.useHooks().writeableResult.useSubscribe(callback, { immediate: true }),
      {
        wrapper: createTestWrapper(registry)
      }
    )

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(Result.initial())
    expect(registry.get(feature1.atoms.writeableResult)).toEqual(Result.initial())

    registry.set(feature1.atoms.writeableResult, Result.success("user_cursor_is_here", { timestamp: 0 }))
    await rerender()

    expect(registry.get(feature1.atoms.writeableResult)).toEqual(
      Result.success("user_cursor_is_here", { timestamp: 0 })
    )
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(Result.success("user_cursor_is_here", { timestamp: 0 }))
  })

  it("useSuspenseSuccess", async () => {
    const registry = makeDefaultRegistry()

    const { result, rerender } = await renderHook(() => feature1.useHooks().writeableResult.useSuspenseSuccess(), {
      wrapper: createSuspenseWrapper(registry)
    })

    registry.set(feature1.atoms.writeableResult, Result.success("success value", { timestamp: 0 }))
    await rerender()

    expect(Result.isSuccess(result.current)).toBe(true)
    if (Result.isSuccess(result.current)) {
      expect(result.current.value).toEqual("success value")
    }
  })

  it("set direct/promise/promise value mode", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(
      () => {
        const feature = feature1.useHooks()
        return {
          value: feature.writeableResult.useValue(),
          writeableResult: feature.writeableResult
        }
      },
      {
        wrapper: createTestWrapper(registry)
      }
    )

    await act(async () => {
      result.current.writeableResult(Result.success("hello", { timestamp: 0 }), { registry })
    })
    expect(result.current.value).toEqual(Result.success("hello", { timestamp: 0 }))

    await act(async () => {
      const exit = await result.current.writeableResult.promise(Result.success("updated", { timestamp: 0 }), {
        registry
      })
      expect(Exit.isSuccess(exit)).toBe(true)
      if (Exit.isSuccess(exit)) {
        expect(exit.value).toEqual("updated")
      }
    })
    expect(result.current.value).toEqual(Result.success("updated", { timestamp: 0 }))

    await act(async () => {
      await result.current.writeableResult.promise(Result.success("user_cursor_is_here", { timestamp: 0 }), {
        registry,
        mode: "value"
      })
    })
    expect(result.current.value).toEqual(Result.success("user_cursor_is_here", { timestamp: 0 }))
  })

  it("useAtom exit mode preserves failure results", async () => {
    const registry = makeDefaultRegistry()
    const failure = Result.failure<string, WriteableResultError>(Cause.fail(new WriteableResultError()))

    const { result, act } = await renderHook(() => feature1.useHooks().writeableResult.useAtom({ mode: "exit" }), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const exit = await result.current[1](failure)
      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const cause = Cause.failureOption(exit.cause)
        expect(Option.isSome(cause)).toBe(true)
        if (Option.isSome(cause)) {
          expect(cause.value).toBeInstanceOf(WriteableResultError)
        }
      }
    })

    expect(Result.isFailure(result.current[0])).toBe(true)
    if (Result.isFailure(result.current[0])) {
      const cause = Cause.failureOption(result.current[0].cause)
      expect(Option.isSome(cause)).toBe(true)
      if (Option.isSome(cause)) {
        expect(cause.value).toBeInstanceOf(WriteableResultError)
      }
    }
  })

  it("refresh", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    expect(() => result.current.writeableResult.refresh(registry)).not.toThrow()
  })
})

describe("Fn", (it) => {
  it("mount", async () => {
    const registry = makeDefaultRegistry()

    await renderHook(() => feature1.useHooks().fn.useMount(), {
      wrapper: createTestWrapper(registry)
    })

    expect(registry.get(feature1.atoms.fn)).toEqual(Result.initial())
  })

  it("use", async () => {
    const registry = makeDefaultRegistry()

    const { act, result } = await renderHook(() => feature1.useHooks().fn.useAtom(), {
      wrapper: createTestWrapper(registry)
    })

    expect(result.current[0]).toEqual(Result.initial())

    await act(async () => {
      const set = result.current[1]
      set("test")
    })

    expect(Result.isResult(result.current[0])).toBe(true)
  })

  it("useValue", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks().fn.useValue(), {
      wrapper: createTestWrapper(registry)
    })

    expect(result.current).toEqual(Result.initial())
  })

  it("useSuspense", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(
      () => {
        const feature = feature1.useHooks()
        return {
          value: feature.fn.useSuspense(),
          fn: feature.fn
        }
      },
      {
        wrapper: createSuspenseWrapper(registry)
      }
    )

    await act(async () => {
      if (result.current) {
        await result.current.fn.promise("test", { registry })
      }
    })

    if (result.current) {
      expect(Result.isResult(result.current.value)).toBe(true)
    }
  })

  it("useSuspenseSuccess", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(
      () => {
        const feature = feature1.useHooks()
        return {
          value: feature.fn.useSuspenseSuccess(),
          fn: feature.fn
        }
      },
      {
        wrapper: createSuspenseWrapper(registry)
      }
    )

    await act(async () => {
      if (result.current) {
        await result.current.fn.promise("test", { registry })
      }
    })

    if (result.current) {
      expect(Result.isSuccess(result.current.value)).toBe(true)
      if (Result.isSuccess(result.current.value)) {
        expect(typeof result.current.value.value).toBe("string")
      }
    }
  })

  it("useSubscribe", async () => {
    const registry = makeDefaultRegistry()
    const callback = mockFn()

    const { rerender } = await renderHook(() => feature1.useHooks().fn.useSubscribe(callback, { immediate: true }), {
      wrapper: createTestWrapper(registry)
    })

    await rerender()

    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith(Result.initial())
  })

  it("call direct/promise/promise value mode", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(
      () => {
        const feature = feature1.useHooks()
        return {
          value: feature.fn.useValue(),
          fn: feature.fn
        }
      },
      {
        wrapper: createTestWrapper(registry)
      }
    )

    expect(registry.get(feature1.atoms.fn)).toEqual(Result.initial())

    await act(async () => {
      result.current.fn("test", { registry })
    })
    expect(Result.isResult(result.current.value)).toBe(true)

    await act(async () => {
      const exitResult = await result.current.fn.promise("test2", { registry })
      expect(Exit.isExit(exitResult)).toBe(true)
    })

    await act(async () => {
      const value = await result.current.fn.promise("test3", { registry, mode: "value" })
      expect(typeof value).toBe("string")
    })
  })

  it("slow promise waits for async completion", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const value = await result.current.slowFn.promise("delayed", { registry, mode: "value" })
      expect(value).toEqual("slow:delayed")
    })
  })

  it("promise and exit mode preserve failure channels", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => feature1.useHooks().fn.useAtom({ mode: "exit" }), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const exit = await result.current[1]("error")
      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const cause = Cause.failureOption(exit.cause)
        expect(Option.isSome(cause)).toBe(true)
        if (Option.isSome(cause)) {
          expect(cause.value).toBeInstanceOf(FnError)
        }
      }
    })

    expect(Result.isFailure(result.current[0])).toBe(true)
    if (Result.isFailure(result.current[0])) {
      const cause = Cause.failureOption(result.current[0].cause)
      expect(Option.isSome(cause)).toBe(true)
      if (Option.isSome(cause)) {
        expect(cause.value).toBeInstanceOf(FnError)
      }
    }
  })

  it("releases temporary mounts and subscriptions after commands settle", async () => {
    const registry = makeDefaultRegistry()
    const lifecycle = instrumentRegistryLifecycle(registry)

    const { result, act } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await act(() => {
      result.current.fn("direct", { registry })
    })

    await vi.waitFor(() => {
      expect(lifecycle.mounts).toBeGreaterThan(0)
      expect(lifecycle.unmounts).toBe(lifecycle.mounts)
      expect(lifecycle.unsubscribes).toBe(lifecycle.subscribes)
    })

    const directMounts = lifecycle.mounts

    await act(async () => {
      await result.current.fn.promise("promise", { registry })
    })

    await vi.waitFor(() => {
      expect(lifecycle.mounts).toBeGreaterThan(directMounts)
      expect(lifecycle.unmounts).toBe(lifecycle.mounts)
      expect(lifecycle.unsubscribes).toBe(lifecycle.subscribes)
    })
  })

  it("refresh", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    expect(() => result.current.fn.refresh(registry)).not.toThrow()
  })
})

describe("Pull", (it) => {
  it("mount", async () => {
    const registry = makeDefaultRegistry()

    await renderHook(() => feature1.useHooks().pull.useMount(), {
      wrapper: createTestWrapper(registry)
    })

    const currentValue = registry.get(feature1.atoms.pull)
    expect(Result.isResult(currentValue)).toBe(true)
  })

  it("useValue", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks().pull.useValue(), {
      wrapper: createTestWrapper(registry)
    })

    expect(Result.isResult(result.current)).toBe(true)
  })

  it("pull data", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(
      () => {
        const feature = feature1.useHooks()
        return {
          value: feature.pull.useValue(),
          pull: feature.pull
        }
      },
      {
        wrapper: createTestWrapper(registry)
      }
    )

    await act(async () => {
      result.current.pull(undefined, { registry })
    })

    expect(Result.isResult(result.current.value)).toBe(true)
  })

  it("useSuspense", async () => {
    const registry = makeDefaultRegistry()

    const featureHook = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await featureHook.act(() => {
      featureHook.result.current.pull(undefined, { registry })
    })

    const { result } = await renderHook(() => feature1.useHooks().pull.useSuspense(), {
      wrapper: createSuspenseWrapper(registry)
    })

    expect(Result.isResult(result.current)).toBe(true)
  })

  it("useSuspenseSuccess", async () => {
    const registry = makeDefaultRegistry()

    const featureHook = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await featureHook.act(() => {
      featureHook.result.current.pull(undefined, { registry })
    })

    const { result } = await renderHook(() => feature1.useHooks().pull.useSuspenseSuccess(), {
      wrapper: createSuspenseWrapper(registry)
    })

    expect(Result.isSuccess(result.current)).toBe(true)
  })

  it("refresh", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    expect(() => result.current.pull.refresh(registry)).not.toThrow()
  })

  it("promise value mode resolves and releases temporary lifecycle resources", async () => {
    const registry = makeDefaultRegistry()
    const lifecycle = instrumentRegistryLifecycle(registry)

    const { result, act } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const value = await result.current.pull.promise(undefined, { registry, mode: "value" })
      expect(value.done).toBe(true)
      expect(value.items.length).toBeGreaterThan(0)
    })

    await vi.waitFor(() => {
      expect(lifecycle.mounts).toBeGreaterThan(0)
      expect(lifecycle.unmounts).toBe(lifecycle.mounts)
      expect(lifecycle.unsubscribes).toBe(lifecycle.subscribes)
    })
  })

  it("default promise mode resolves the streamed exit payload", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const exit = await result.current.pull.promise(undefined, { registry })
      expect(Exit.isSuccess(exit)).toBe(true)
      if (Exit.isSuccess(exit)) {
        expect(exit.value.done).toBe(true)
        expect(exit.value.items).toHaveLength(3)
      }
    })
  })

  it("single pull promise resolves the emitted value", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const value = await result.current.singlePull.promise(undefined, { registry, mode: "value" })
      expect(value.done).toBe(true)
      expect(value.items).toHaveLength(1)
      expect(Result.isSuccess(value.items[0])).toBe(true)
      if (Result.isSuccess(value.items[0])) {
        expect(value.items[0].value).toBe(42)
      }
    })
  })
})

describe("SubscriptionRef", (it) => {
  it("mount", async () => {
    const registry = makeDefaultRegistry()

    await renderHook(() => feature1.useHooks().subscriptionRef.useMount(), {
      wrapper: createTestWrapper(registry)
    })

    const currentValue = registry.get(feature1.atoms.subscriptionRef)
    expect(Result.isResult(currentValue)).toBe(true)
  })

  it("useValue", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks().subscriptionRef.useValue(), {
      wrapper: createTestWrapper(registry)
    })

    expect(Result.isResult(result.current)).toBe(true)
  })

  it("set value", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(
      () => {
        const feature = feature1.useHooks()
        return {
          value: feature.subscriptionRef.useValue(),
          subscriptionRef: feature.subscriptionRef
        }
      },
      {
        wrapper: createTestWrapper(registry)
      }
    )

    await act(async () => {
      result.current.subscriptionRef(10, { registry })
    })

    assert(Result.isSuccess(result.current.value))
    expect(result.current.value.value).toEqual(10)
  })

  it("refresh", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    expect(() => result.current.subscriptionRef.refresh(registry)).not.toThrow()
  })

  it("direct writes release temporary lifecycle resources", async () => {
    const registry = makeDefaultRegistry()
    const lifecycle = instrumentRegistryLifecycle(registry)

    const { result, act } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      result.current.subscriptionRef(42, { registry })
    })

    expect(Result.isSuccess(registry.get(feature1.atoms.subscriptionRef))).toBe(true)
    await vi.waitFor(() => {
      expect(lifecycle.mounts).toBeGreaterThan(0)
      expect(lifecycle.unmounts).toBe(lifecycle.mounts)
      expect(lifecycle.unsubscribes).toBe(lifecycle.subscribes)
    })
  })

  it("promise value mode writes through the direct api", async () => {
    const registry = makeDefaultRegistry()

    const { result, act } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    await act(async () => {
      const value = await result.current.subscriptionRef.promise(84, { registry, mode: "value" })
      expect(value).toBe(84)
    })

    expect(Result.isSuccess(registry.get(feature1.atoms.subscriptionRef))).toBe(true)
  })
})

describe("Subscribable", (it) => {
  it("mount", async () => {
    const registry = makeDefaultRegistry()

    await renderHook(() => feature1.useHooks().subscribable.useMount(), {
      wrapper: createTestWrapper(registry)
    })

    const currentValue = registry.get(feature1.atoms.subscribable)
    expect(Result.isResult(currentValue)).toBe(true)
  })

  it("useValue", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks().subscribable.useValue(), {
      wrapper: createTestWrapper(registry)
    })

    expect(Result.isResult(result.current)).toBe(true)
  })

  it("useSuspense", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks().subscribable.useSuspense(), {
      wrapper: createSuspenseWrapper(registry)
    })

    expect(Result.isResult(result.current)).toBe(true)
  })

  it("useSuspenseSuccess", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks().subscribable.useSuspenseSuccess(), {
      wrapper: createSuspenseWrapper(registry)
    })

    expect(Result.isSuccess(result.current)).toBe(true)
    if (Result.isSuccess(result.current)) {
      expect(result.current.value).toBe("subscribable value")
    }
  })

  it("useSubscribe cleanup unsubscribes on unmount", async () => {
    const registry = makeDefaultRegistry()
    const lifecycle = instrumentRegistryLifecycle(registry)
    const callback = mockFn()

    const hook = await renderHook(() => feature1.useHooks().subscribable.useSubscribe(callback, { immediate: true }), {
      wrapper: createTestWrapper(registry)
    })

    expect(lifecycle.subscribes).toBeGreaterThan(0)

    hook.unmount()

    expect(lifecycle.unsubscribes).toBe(lifecycle.subscribes)
  })

  it("refresh", async () => {
    const registry = makeDefaultRegistry()

    const { result } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    expect(() => result.current.subscribable.refresh(registry)).not.toThrow()
  })
})

describe("Feature lifecycle", (it) => {
  it("returns stable hook wrappers across rerenders", async () => {
    const registry = makeDefaultRegistry()

    const { result, rerender } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    const first = result.current
    await rerender()

    expect(result.current).toBe(first)
    expect(result.current.readable).toBe(first.readable)
    expect(result.current.writeable).toBe(first.writeable)
    expect(result.current.fn).toBe(first.fn)
    expect(result.current.pull).toBe(first.pull)
    expect(result.current.subscriptionRef).toBe(first.subscriptionRef)
    expect(result.current.subscribable).toBe(first.subscribable)
  })

  it("fork creates an isolated feature without mutating the original feature", async () => {
    const registry = makeDefaultRegistry()
    const forkedRegistry = makeDefaultRegistry()
    const forkedFeature = createForkedFeature()
    const originalAtom = feature1.atoms.readableResult

    const originalHook = await renderHook(() => feature1.useHooks().readableResult.useSuspenseSuccess(), {
      wrapper: createSuspenseWrapper(registry)
    })
    const forkedHook = await renderHook(() => forkedFeature.useHooks().readableResult.useSuspenseSuccess(), {
      wrapper: createSuspenseWrapper(forkedRegistry)
    })

    expect(forkedFeature.atoms.readableResult).not.toBe(originalAtom)
    expect(feature1.atoms.readableResult).toBe(originalAtom)

    assert(Result.isSuccess(originalHook.result.current))
    assert(Result.isSuccess(forkedHook.result.current))
    assert(Option.isSome(originalHook.result.current.value))
    assert(Option.isSome(forkedHook.result.current.value))

    expect(Redacted.value(originalHook.result.current.value.value)).toBe("hi message")
    expect(Redacted.value(forkedHook.result.current.value.value)).toBe("forked message")
  })

  it("destroy invalidates cached atoms and wrappers for the next render", async () => {
    const registry = makeDefaultRegistry()
    const atomBeforeDestroy = feature1.atoms.writeable

    const { result, rerender } = await renderHook(() => feature1.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    const beforeDestroy = result.current

    feature1.destroy()
    await rerender()

    expect(feature1.atoms.writeable).not.toBe(atomBeforeDestroy)
    expect(result.current).not.toBe(beforeDestroy)
    expect(result.current.writeable).not.toBe(beforeDestroy.writeable)
    expect(result.current.fn).not.toBe(beforeDestroy.fn)
  })

  it("releases temporary mounts and subscriptions when command promises time out", async () => {
    vi.useFakeTimers()

    const registry = makeDefaultRegistry()
    const lifecycle = instrumentRegistryLifecycle(registry)
    const { result, act } = await renderHook(() => timeoutFeature.useHooks(), {
      wrapper: createTestWrapper(registry)
    })

    let pending!: Promise<string>
    await act(() => {
      pending = result.current.hangingFn.promise("stuck", { registry, mode: "value" })
    })

    await vi.advanceTimersByTimeAsync(30_000)

    await expect(pending).rejects.toThrowError("Promise timeout: atom did not resolve within 30 seconds")
    expect(lifecycle.mounts).toBeGreaterThan(0)
    expect(lifecycle.unmounts).toBe(lifecycle.mounts)
    expect(lifecycle.unsubscribes).toBe(lifecycle.subscribes)
  })
})
