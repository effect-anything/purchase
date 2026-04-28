import * as Atom from "@effect-atom/atom/Atom"
import * as Registry from "@effect-atom/atom/Registry"
import * as Result from "@effect-atom/atom/Result"
import type * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import type * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import { hasProperty } from "effect/Predicate"
import { defaultRegistry, useAtom, useAtomMount, useAtomSubscribe, useAtomSuspense, useAtomValue } from "./react.ts"

import { ensureAtomMounted, flattenExit, setWritableValue } from "./atom-internals.ts"

const fnTypeId = "@x/atom/fn"

const atomTypeId = "@x/atom/atom"

const pullTypeId = "@x/atom/pull"

const subscriptionRefTypeId = "@x/atom/subscriptionRef"

const subscribableTypeId = "@x/atom/subscribable"

const familyTypeId = "@x/atom/family"

const xTypeId = "@x/atom/xTypeId"

const methodTypeIds = {
  fn: fnTypeId,
  atom: atomTypeId,
  pull: pullTypeId,
  subscriptionRef: subscriptionRefTypeId,
  subscribable: subscribableTypeId
}

const isAtomPull = <A, E>(val: any): val is Atom.Writable<Atom.PullResult<A, E>, void> =>
  hasProperty(val, xTypeId) && val[xTypeId] === pullTypeId

const isAtomSubscriptionRef = <A, E>(val: any): val is Atom.Writable<Result.Result<A, E>, A> =>
  hasProperty(val, xTypeId) && val[xTypeId] === subscriptionRefTypeId

const isAtomFamily = <Arg, T extends Atom.Atom<any>>(value: any): value is AtomFamily<Arg, T> =>
  hasProperty(value, xTypeId) && value[xTypeId] === familyTypeId

const isAtomWritable = <A, E>(atom: Atom.Atom<A>): atom is Atom.Writable<A, E> =>
  Atom.isWritable(atom) || isAtomPull(atom) || isAtomSubscriptionRef(atom)

type AnyAtom = Atom.Atom<any>
type AnyWritableAtom = Atom.Writable<any, any>
type PublicWritable<T extends AnyWritableAtom> = [T] extends [Atom.AtomResultFn<infer Arg, infer A, infer E>]
  ? Atom.Writable<Result.Result<A, E>, Arg>
  : T
type ExtractWritable<T extends AnyWritableAtom> =
  PublicWritable<T> extends Atom.Writable<infer R, infer W> ? [R, W] : never
type ResultWritableAtom = Atom.Writable<Result.Result<any, any>, any>
type FlattenAtomSuccess<T extends AnyAtom> = Atom.Type<T> extends Result.Result<infer A, infer _E> ? A : Atom.Type<T>
type FlattenAtomFailure<T extends AnyAtom> = Atom.Type<T> extends Result.Result<infer _A, infer E> ? E : never
type ResultAtom = Atom.Atom<Result.Result<any, any>>
type WritableInput<T extends AnyWritableAtom> = ExtractWritable<T>[1] | ((_: Atom.Type<T>) => ExtractWritable<T>[1])
type WritablePromiseMode = "value"
type WritablePromiseResult<T extends AnyWritableAtom, Mode extends WritablePromiseMode = never> = Promise<
  "value" extends Mode ? FlattenAtomSuccess<T> : Exit.Exit<FlattenAtomSuccess<T>, FlattenAtomFailure<T>>
>
type WritableUseMode<T extends AnyWritableAtom> = [Atom.Type<T>] extends [Result.Result<any, any>]
  ? "value" | "promise" | "exit"
  : "value"
type UseAtomMode<Mode extends WritableUseMode<AnyWritableAtom>> = Mode extends "exit" ? "promiseExit" : Mode
type WritableUseSetter<T extends AnyWritableAtom, Mode extends WritableUseMode<T>> = Mode extends "promise"
  ? (_: ExtractWritable<T>[1]) => Promise<FlattenAtomSuccess<T>>
  : Mode extends "exit"
    ? (_: ExtractWritable<T>[1]) => Promise<Exit.Exit<FlattenAtomSuccess<T>, FlattenAtomFailure<T>>>
    : (_: WritableInput<T>) => void
type WritableUseResult<T extends AnyWritableAtom, Mode extends WritableUseMode<T>> = readonly [
  value: Atom.Type<T>,
  setOrUpdate: WritableUseSetter<T, Mode>
]

const promiseTimeoutMs = 30_000

interface AtomReadable<T extends Atom.Atom<any>> {
  readonly atom: T
  readonly useMount: () => void
  readonly useValue: () => Atom.Type<T>
  readonly useSubscribe: (
    callback: (_: Atom.Type<T>) => void,
    options?: { readonly immediate?: boolean | undefined } | undefined
  ) => void
  readonly refresh: (registry?: Registry.Registry | undefined) => void
}
const AtomReadableProto = {
  useMount() {
    return useAtomMount(this.atom)
  },
  useValue() {
    return useAtomValue(this.atom)
  },
  useSubscribe(callback: (v: any) => void, options?: { readonly immediate?: boolean | undefined } | undefined) {
    return useAtomSubscribe(this.atom, callback, { immediate: options?.immediate ?? false })
  }
} as AtomReadable<Atom.Atom<any>>

interface AtomReadableResult<T extends Atom.Atom<Result.Result<any, any>>> extends AtomReadable<T> {
  readonly useSuspense: (
    options?: { readonly suspendOnWaiting?: boolean | undefined } | undefined
  ) => Result.Result<Atom.Success<T>, Atom.Failure<T>>
  readonly useSuspenseSuccess: (
    options?:
      | {
          readonly suspendOnWaiting?: boolean | undefined
        }
      | undefined
  ) => Result.Success<Atom.Success<T>, Atom.Failure<T>>
}
const AtomReadableResultProto = {
  useSuspense(options?: { suspendOnWaiting?: boolean | undefined } | undefined) {
    return useAtomSuspense(this.atom, { ...options, includeFailure: true })
  },
  useSuspenseSuccess(options?: { suspendOnWaiting?: boolean | undefined } | undefined) {
    return useAtomSuspense(this.atom, options)
  }
} as AtomReadableResult<Atom.Atom<Result.Result<any, any>>>

interface AtomWritable<T extends AnyWritableAtom> extends AtomReadable<T> {
  (
    _: WritableInput<T>,
    options?:
      | {
          registry?: Registry.Registry | undefined
        }
      | undefined
  ): void
  readonly promise: <Mode extends WritablePromiseMode = never>(
    _: ExtractWritable<T>[1],
    options?:
      | {
          registry?: Registry.Registry | undefined
          mode?: Mode | undefined
        }
      | undefined
  ) => WritablePromiseResult<T, Mode>
  readonly useAtom: <const Mode extends WritableUseMode<T> = "value">(
    options?:
      | {
          readonly mode?: Mode | undefined
        }
      | undefined
  ) => WritableUseResult<T, Mode>
}

interface AtomWritableResult<T extends ResultWritableAtom> extends AtomReadableResult<T>, AtomWritable<T> {}

const toAtomExit = (value: unknown): Exit.Exit<unknown, unknown> =>
  Result.isResult(value) ? Result.toExit(value) : Result.toExit(Result.success(value))

const hasSubscriptionRefResultAdvanced = (
  current: Result.Result<unknown, unknown>,
  previous: Result.Result<unknown, unknown> | undefined
) => {
  if (current._tag === "Initial") {
    return false
  }

  if (!previous) {
    return true
  }

  if (current._tag !== previous._tag) {
    return true
  }

  if (Result.isSuccess(current) && Result.isSuccess(previous)) {
    return (
      current.timestamp !== previous.timestamp ||
      current.value !== previous.value ||
      current.waiting !== previous.waiting
    )
  }

  if (Result.isFailure(current) && Result.isFailure(previous)) {
    return current.cause !== previous.cause || current.waiting !== previous.waiting
  }

  return current !== previous
}

const waitForWritableExit = <T extends AnyWritableAtom>(
  registry: Registry.Registry,
  atom: T,
  previous?: Atom.Type<T>
): Promise<Exit.Exit<FlattenAtomSuccess<T>, FlattenAtomFailure<T>>> => {
  const current = registry.get(atom)
  const shouldSuspendOnWaiting = !isAtomSubscriptionRef(atom)

  if (!Result.isResult(current)) {
    return Promise.resolve(toAtomExit(current) as Exit.Exit<FlattenAtomSuccess<T>, FlattenAtomFailure<T>>)
  }

  if (
    isAtomSubscriptionRef(atom)
      ? hasSubscriptionRefResultAdvanced(current, previous as Result.Result<unknown, unknown> | undefined)
      : current._tag !== "Initial" && !current.waiting
  ) {
    return Promise.resolve(toAtomExit(current) as Exit.Exit<FlattenAtomSuccess<T>, FlattenAtomFailure<T>>)
  }

  const effect = isAtomSubscriptionRef(atom)
    ? Effect.async<FlattenAtomSuccess<T>, FlattenAtomFailure<T>>((resume) => {
        const next = registry.get(atom as Atom.Atom<Result.Result<any, any>>)
        if (
          Result.isResult(next) &&
          hasSubscriptionRefResultAdvanced(next, previous as Result.Result<unknown, unknown> | undefined)
        ) {
          resume(toAtomExit(next) as Exit.Exit<FlattenAtomSuccess<T>, FlattenAtomFailure<T>>)
          return
        }

        const cancel = registry.subscribe(atom as Atom.Atom<Result.Result<any, any>>, (value) => {
          if (hasSubscriptionRefResultAdvanced(value, previous as Result.Result<unknown, unknown> | undefined)) {
            resume(toAtomExit(value) as Exit.Exit<FlattenAtomSuccess<T>, FlattenAtomFailure<T>>)
            cancel()
          }
        })

        return Effect.sync(cancel)
      })
    : Registry.getResult(registry, atom as Atom.Atom<Result.Result<any, any>>, {
        suspendOnWaiting: shouldSuspendOnWaiting
      })

  return Effect.runPromiseExit(
    effect.pipe(
      Effect.timeoutFail({
        duration: promiseTimeoutMs,
        onTimeout: () => new Error("Promise timeout: atom did not resolve within 30 seconds")
      })
    )
  ) as Promise<Exit.Exit<FlattenAtomSuccess<T>, FlattenAtomFailure<T>>>
}

const executeWritable = async <T extends AnyWritableAtom>(
  registry: Registry.Registry,
  atom: T,
  value: WritableInput<T>
): Promise<Exit.Exit<FlattenAtomSuccess<T>, FlattenAtomFailure<T>>> => {
  const cleanup = ensureAtomMounted(registry, atom)
  const previous = registry.get(atom)

  try {
    setWritableValue(registry, atom as Atom.Writable<Atom.Type<T>, ExtractWritable<T>[1]>, value)
    return await waitForWritableExit(registry, atom, previous)
  } finally {
    cleanup()
  }
}

interface WritableHookContext<T extends AnyWritableAtom> {
  readonly atom: T
}

const AtomWritableProto = function <T extends AnyWritableAtom>(
  this: WritableHookContext<T>,
  value: WritableInput<T>,
  { registry = defaultRegistry }: { registry?: Registry.Registry | undefined } = {
    registry: defaultRegistry
  }
) {
  void executeWritable(registry, this.atom, value).catch(() => undefined)
} as AtomWritable<AnyWritableAtom>
Object.assign(AtomWritableProto, {
  useAtom<T extends AnyWritableAtom, const Mode extends WritableUseMode<T> = "value">(
    this: WritableHookContext<T>,
    options?:
      | {
          readonly mode?: Mode | undefined
        }
      | undefined
  ) {
    return useWritableAtom(this.atom, options)
  },
  promise<T extends AnyWritableAtom, Mode extends WritablePromiseMode = never>(
    this: WritableHookContext<T>,
    value: ExtractWritable<T>[1],
    { registry = defaultRegistry, mode }: { registry?: Registry.Registry | undefined; mode?: Mode | undefined } = {
      registry: defaultRegistry
    }
  ) {
    return executeWritable(registry, this.atom, value).then((exit) =>
      mode && mode === "value" ? flattenExit(exit) : exit
    )
  },
  refresh<T extends AnyWritableAtom>(this: WritableHookContext<T>, registry = defaultRegistry) {
    registry.refresh(this.atom)
  }
})

const normalizeWritableUseMode = <Mode extends WritableUseMode<AnyWritableAtom>>(
  mode?: Mode | undefined
): UseAtomMode<Mode> | undefined => (mode === "exit" ? "promiseExit" : mode) as UseAtomMode<Mode>

function useWritableAtom<T extends ResultWritableAtom, const Mode extends WritableUseMode<T> = "value">(
  atom: T,
  options?:
    | {
        readonly mode?: Mode | undefined
      }
    | undefined
): WritableUseResult<T, Mode>
function useWritableAtom<T extends AnyWritableAtom>(
  atom: T,
  options?:
    | {
        readonly mode?: "value" | undefined
      }
    | undefined
): WritableUseResult<T, "value">
function useWritableAtom(
  atom: AnyWritableAtom,
  options?:
    | {
        readonly mode?: WritableUseMode<AnyWritableAtom> | undefined
      }
    | undefined
) {
  return useAtom(atom as never, {
    mode: normalizeWritableUseMode(options?.mode)
  }) as WritableUseResult<AnyWritableAtom, WritableUseMode<AnyWritableAtom>>
}

interface ReadableHook<A> extends AtomReadable<Atom.Atom<A>> {}

interface ReadableResultHook<A, E = never> extends AtomReadableResult<Atom.Atom<Result.Result<A, E>>> {}

interface WriteableHook<T extends AnyWritableAtom> extends AtomWritable<T> {}

interface WriteableResultHook<T extends ResultWritableAtom> extends AtomWritableResult<T> {}

export interface AtomFamily<Arg, T extends Atom.Atom<any>> {
  (arg: Arg): T
  readonly atom: (arg: Arg) => T
  readonly refresh: (arg: Arg, registry?: Registry.Registry | undefined) => void
}

interface AtomFamilyFactory<_R, _ER = never> {
  <Arg, T extends Atom.Atom<any>>(make: (arg: Arg) => T): AtomFamily<Arg, T>
  <Arg, Key, T extends Atom.Atom<any>>(options: { key: (arg: Arg) => Key; make: (arg: Key) => T }): AtomFamily<Arg, T>
}

export interface AtomRuntimeWithFamily<R, ER = never> extends Atom.AtomRuntime<R, ER> {
  readonly family: AtomFamilyFactory<R, ER>
}

interface ReadableFamilyHook<Arg, T extends Atom.Atom<any>> {
  (arg: Arg): T
  readonly atom: (arg: Arg) => T
  readonly useMount: (arg: Arg) => void
  readonly useValue: (arg: Arg) => Atom.Type<T>
  readonly useSubscribe: (
    arg: Arg,
    callback: (_: Atom.Type<T>) => void,
    options?: { readonly immediate?: boolean | undefined } | undefined
  ) => void
  readonly refresh: (arg: Arg, registry?: Registry.Registry | undefined) => void
}

interface ReadableResultFamilyHook<Arg, T extends Atom.Atom<Result.Result<any, any>>> extends ReadableFamilyHook<
  Arg,
  T
> {
  readonly useSuspense: (
    arg: Arg,
    options?: { readonly suspendOnWaiting?: boolean | undefined } | undefined
  ) => Result.Result<Atom.Success<T>, Atom.Failure<T>>
  readonly useSuspenseSuccess: (
    arg: Arg,
    options?:
      | {
          readonly suspendOnWaiting?: boolean | undefined
        }
      | undefined
  ) => Result.Success<Atom.Success<T>, Atom.Failure<T>>
}

interface WritableFamilyHook<Arg, T extends Atom.Writable<any, any>> extends ReadableFamilyHook<Arg, T> {
  readonly useAtom: <const Mode extends WritableUseMode<T> = "value">(
    arg: Arg,
    options?:
      | {
          readonly mode?: Mode | undefined
        }
      | undefined
  ) => WritableUseResult<T, Mode>
  readonly promise: <Mode extends WritablePromiseMode = never>(
    arg: Arg,
    value: ExtractWritable<T>[1],
    options?:
      | {
          registry?: Registry.Registry | undefined
          mode?: Mode | undefined
        }
      | undefined
  ) => WritablePromiseResult<T, Mode>
}

interface WritableResultFamilyHook<Arg, T extends Atom.Writable<Result.Result<any, any>, any>>
  extends WritableFamilyHook<Arg, T>, ReadableResultFamilyHook<Arg, T> {}

type FamilyHook<Arg, T extends Atom.Atom<any>> =
  T extends Atom.Writable<any, any>
    ? Atom.Type<T> extends Result.Result<any, any>
      ? WritableResultFamilyHook<Arg, T>
      : WritableFamilyHook<Arg, T>
    : Atom.Type<T> extends Result.Result<any, any>
      ? ReadableResultFamilyHook<Arg, T>
      : ReadableFamilyHook<Arg, T>

type AtomHook<T extends AnyAtom> = [T] extends [AnyWritableAtom]
  ? [Atom.Type<T>] extends [Result.Result<any, any>]
    ? WriteableResultHook<T>
    : WriteableHook<T>
  : [T] extends [Atom.Atom<infer R>]
    ? [R] extends [Result.Result<infer A, infer E>]
      ? ReadableResultHook<A, E>
      : ReadableHook<R>
    : never

export type FeatureHookType<T> = [T] extends [AtomFamily<infer Arg, infer A>]
  ? FamilyHook<Arg, A>
  : [T] extends [AnyAtom]
    ? AtomHook<T>
    : T

export type FeatureHookRecord<T extends Record<string, any>> = {
  [K in keyof T]: FeatureHookType<T[K]>
}

type AnyFamily = AtomFamily<any, AnyAtom>
type FeatureAtomValue = AnyAtom | AnyFamily
type AnyAtomHook = AtomHook<AnyAtom>
const isFeatureAtomValue = (value: unknown): value is FeatureAtomValue => Atom.isAtom(value) || isAtomFamily(value)

const createAtomFamily = <Arg, Key, T extends Atom.Atom<any>>({
  key,
  make
}: {
  key: (arg: Arg) => Key
  make: (arg: Key) => T
}): AtomFamily<Arg, T> => {
  const family = Atom.family((arg: Key) => make(arg))
  const getAtom = (arg: Arg) => family(key(arg))

  return Object.assign(getAtom, {
    atom: getAtom,
    refresh: (arg: Arg, registry: Registry.Registry = defaultRegistry) => registry.refresh(getAtom(arg)),
    [xTypeId]: familyTypeId
  }) as AtomFamily<Arg, T>
}

const atomWrapperCache = new WeakMap<AnyAtom, unknown>()
const familyWrapperCache = new WeakMap<AnyFamily, unknown>()
const hooksRecordCache = new WeakMap<Record<string, any>, FeatureHookRecord<Record<string, any>>>()

const createAtomWrapper = <T extends Atom.Atom<any>>(atom: T): AtomHook<T> => {
  const cached = atomWrapperCache.get(atom)
  if (cached) {
    return cached as AtomHook<T>
  }

  const self = { atom }

  let proto: AnyAtomHook

  if (isAtomWritable(atom)) {
    const p = Object.assign(AtomWritableProto.bind(self), {
      ...AtomReadableProto,
      ...AtomReadableResultProto,
      atom,
      useAtom: AtomWritableProto.useAtom.bind(self),
      promise: AtomWritableProto.promise.bind(self),
      refresh: AtomWritableProto.refresh.bind(self)
    }) as unknown as AtomHook<T>

    atomWrapperCache.set(atom, p)
    return p
  }

  proto = {
    ...AtomReadableProto,
    ...AtomReadableResultProto,
    atom,
    refresh: AtomWritableProto.refresh.bind(self)
  }

  atomWrapperCache.set(atom, proto)
  return proto as unknown as AtomHook<T>
}

const createFamilyWrapper = <Arg, T extends Atom.Atom<any>>(family: AtomFamily<Arg, T>): FamilyHook<Arg, T> => {
  const cached = familyWrapperCache.get(family)
  if (cached) {
    return cached as FamilyHook<Arg, T>
  }

  const getAtom = (arg: Arg) => family.atom(arg)
  const getResultAtom = (arg: Arg) => getAtom(arg) as Extract<T, ResultAtom>
  const getWritableAtom = (arg: Arg) => getAtom(arg) as Extract<T, AnyWritableAtom>
  const wrap = ((arg: Arg) => getAtom(arg)) as FamilyHook<Arg, T>

  const wrappedFamily: FamilyHook<Arg, T> = Object.assign(wrap, {
    atom: family.atom,
    useMount: (arg: Arg) => useAtomMount(getAtom(arg)),
    useValue: (arg: Arg) => useAtomValue(getAtom(arg)),
    useSubscribe: (
      arg: Arg,
      callback: (_: Atom.Type<T>) => void,
      options?: { readonly immediate?: boolean | undefined } | undefined
    ) => useAtomSubscribe(getAtom(arg), callback, { immediate: options?.immediate ?? false }),
    useSuspense: (arg: Arg, options?: { readonly suspendOnWaiting?: boolean | undefined } | undefined) =>
      useAtomSuspense(getResultAtom(arg), { ...options, includeFailure: true }),
    useSuspenseSuccess: (arg: Arg, options?: { readonly suspendOnWaiting?: boolean | undefined } | undefined) =>
      useAtomSuspense(getResultAtom(arg), options),
    useAtom<const Mode extends WritableUseMode<Extract<T, AnyWritableAtom>> = "value">(
      arg: Arg,
      options?:
        | {
            readonly mode?: Mode | undefined
          }
        | undefined
    ) {
      return useWritableAtom(getWritableAtom(arg), options)
    },
    promise<Mode extends WritablePromiseMode = never>(
      arg: Arg,
      value: ExtractWritable<Extract<T, AnyWritableAtom>>[1],
      options?:
        | {
            registry?: Registry.Registry | undefined
            mode?: Mode | undefined
          }
        | undefined
    ) {
      return executeWritable(options?.registry ?? defaultRegistry, getWritableAtom(arg), value).then((exit) =>
        options?.mode === "value" ? flattenExit(exit) : exit
      ) as WritablePromiseResult<Extract<T, AnyWritableAtom>, Mode>
    },
    refresh: family.refresh
  })

  familyWrapperCache.set(family, wrappedFamily)
  return wrappedFamily
}

const createAtomHooks = <S extends Record<string, any>>(s: S): FeatureHookRecord<S> => {
  const cached = hooksRecordCache.get(s)
  if (cached) {
    return cached as FeatureHookRecord<S>
  }

  const record = Object.fromEntries(
    Object.entries(s).map(([key, value]) => {
      if (Atom.isAtom(value)) {
        return [key, createAtomWrapper(value)]
      }

      if (isAtomFamily(value)) {
        return [key, createFamilyWrapper(value)]
      }

      return [key, value]
    })
  ) as FeatureHookRecord<S>

  hooksRecordCache.set(s, record)
  return record
}

export type FilterAtoms<T> = {
  [K in keyof T as T[K] extends FeatureAtomValue ? K : never]: T[K]
}

export interface AtomFeature<T extends Record<string, any>> {
  readonly useHooks: () => FeatureHookRecord<T>
  readonly atoms: T
  readonly fork: (layer: Layer.Layer<any>) => AtomFeature<T>
  readonly destroy: () => void
}

export const defineFeature = <
  T extends Record<string, Context.Tag<any, any>>,
  A extends Record<string, any>,
  R = never
>({
  provide,
  tags,
  make
}: {
  tags: T
  provide: Layer.Layer<Context.Tag.Identifier<T[keyof T]> | R, never, never>
  make: (runtime: AtomRuntimeWithFamily<Context.Tag.Identifier<T[keyof T]> | R, never>) => A
}): AtomFeature<FilterAtoms<A>> => {
  let cached: {
    atoms: FilterAtoms<A>
  } | null = null

  const ensure = () => {
    if (cached) return cached

    const merged = pipe(provide, Layer.tapErrorCause(Effect.logError), Layer.orDie)
    const originalRuntime = Atom.runtime(merged)

    const runtime = new Proxy(originalRuntime as AtomRuntimeWithFamily<Context.Tag.Identifier<T[keyof T]> | R, never>, {
      get(target, prop, receiver) {
        if (prop === "family") {
          return ((arg0: any) => {
            if (typeof arg0 === "function") {
              return createAtomFamily({
                key: (arg: any) => arg,
                make: arg0
              })
            }

            return createAtomFamily({
              key: arg0.key,
              make: arg0.make
            })
          }) satisfies AtomFamilyFactory<Context.Tag.Identifier<T[keyof T]> | R, never>
        }

        const original = Reflect.get(target, prop, receiver)
        if (typeof original !== "function") return original

        const method = prop.toString()

        return function (this: typeof target, ...args: Array<any>) {
          const result = original.apply(this, args)
          const typeId = methodTypeIds[method as keyof typeof methodTypeIds]
          if (typeId) {
            Object.defineProperty(result, xTypeId, {
              value: typeId,
              enumerable: true,
              configurable: false
            })
          }
          return result
        }
      }
    })

    const result = make(runtime)
    const atoms = Object.fromEntries(
      Object.entries(result).filter(([_, value]) => isFeatureAtomValue(value))
    ) as FilterAtoms<A>

    cached = { atoms }

    return cached
  }

  const useHooks = () => {
    const { atoms } = ensure()
    return createAtomHooks(atoms)
  }

  const fork = (provide_: Layer.Layer<Context.Tag.Identifier<T[keyof T]> | R, never, never>) =>
    defineFeature({ tags: tags, provide: provide_, make })

  const destroy = () => {
    cached = null
  }

  return {
    useHooks,
    get atoms() {
      return ensure().atoms
    },
    fork,
    destroy
  }
}
