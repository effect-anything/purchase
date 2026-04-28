import type * as Rpc from "@effect/rpc/Rpc"
import type * as RpcGroup from "@effect/rpc/RpcGroup"
import type * as Effect from "effect/Effect"

type Unwrap<A extends Effect.Effect<any, any, any> | Rpc.Wrapper<any>> = A extends Rpc.Wrapper<infer _> ? _ : A

type HandlersFrom<Rpc extends Rpc.Any, R = never> = {
  readonly [Current in Rpc as Current["_tag"]]: Rpc.ToHandlerFn<Current, R>
}

export type RpcGroupMethods<A extends RpcGroup.Any> = HandlersFrom<RpcGroup.Rpcs<A>, never>

/**
 * Derives the return type for an RPC handler function, with explicit control
 * over handler-level dependencies.
 *
 * @typeParam T - The handler function type (from `RpcGroupMethods[key]`)
 * @typeParam R - Handler-level dependencies. Defaults to `never` (no dependencies).
 *
 *   This is distinct from layer-level (service) dependencies. Services like
 *   `FileSystem` that are resolved once during layer initialization do NOT
 *   appear here — they are already captured in the closure.
 *
 *   `R` is only for dependencies that each handler invocation requires at the
 *   call site. For example, if a handler uses `Effect.addFinalizer`, it needs
 *   `Scope.Scope` — and that must be declared explicitly via `R`, otherwise
 *   the dependency leaks silently (the type system won't catch it).
 *
 * @typeParam C - (internal) Unwrapped effect type, inferred automatically.
 *
 * @example
 * ```ts
 * // No handler-level deps — R defaults to never
 * const list: Methods['repos.list'] = Effect.fn('repos.list')(
 *   function* (): RepoRpcGroup.Returns<'repos.list'> { ... }
 * )
 *
 * // Handler needs Scope (e.g. uses addFinalizer) — declare it explicitly
 * const list: Methods['repos.list'] = Effect.fn('repos.list')(
 *   function* (): RepoRpcGroup.Returns<'repos.list', Scope.Scope> {
 *     yield* Effect.addFinalizer(() => ...)
 *     ...
 *   },
 *   Effect.scoped
 * )
 * ```
 */
export type RpcGroupHandlesReturns<
  T extends (...args: any) => Effect.Effect<any, any, any> | Rpc.Wrapper<any>,
  R = never,
  C extends Unwrap<ReturnType<T>> = Unwrap<ReturnType<T>>
> = Effect.fn.Return<Effect.Effect.Success<C>, Effect.Effect.Error<C>, R>
