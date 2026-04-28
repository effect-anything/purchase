import type { Row } from "@effect/sql/SqlConnection"
import type { DurationInput } from "effect/Duration"
import type { SqlError } from "./schema.ts"

import { Atom, RegistryContext } from "@effect-x/atom-react"
import * as GlobalLayer from "@effect-x/atom-react/global"
import * as Reactivity from "@effect/experimental/Reactivity"
import * as SqlClient from "@effect/sql/SqlClient"
import * as Effect from "effect/Effect"
import { identity, type LazyArg, pipe } from "effect/Function"
import { isFunction } from "effect/Predicate"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import * as Tracer from "effect/Tracer"
import { use, useEffect, useMemo, useState } from "react"
import { parseSql } from "./internal/sql-parser.ts"

/**
 * Configuration options for live queries
 */
export interface LiveQueryBaseOptions<TRow = any, TResult = TRow[]> {
  /** Transform the raw database rows into the desired type */
  transform?: ((rows: Array<TRow>) => TResult) | undefined
  /** Default value to use when query fails or is loading */
  fallback?: TResult | undefined
  /** Custom error handler */
  onError?: ((error: unknown) => void) | undefined
  /** Debounce time in milliseconds for updates */
  debounce?: DurationInput | undefined
  /** Whether to log query execution and table dependencies */
  debug?: boolean | undefined
  onStart?: (() => void) | undefined
  onEnd?: (() => void) | undefined
  onDone?: (() => void) | undefined
}

/**
 * Options for live SQL queries
 */
export interface LiveSqlQueryOptions<TRow = Row, TResult = TRow[]> extends LiveQueryBaseOptions<TRow, TResult> {
  /** Parameters for the SQL query */
  params?: ReadonlyArray<unknown> | undefined
}

/**
 * Options for live Effect queries
 */
export interface LiveEffectQueryOptions<TRow = Row, TResult = TRow[]> extends LiveQueryBaseOptions<TRow, TResult> {}

/**
 * Options for creating live queries
 */
export type CreateQueryOptions<TRow = Row, TResult = TRow[]> =
  | { execute: LazyArg<string>; options?: LiveSqlQueryOptions<TRow, TResult> | undefined }
  | {
      execute: Effect.Effect<ReadonlyArray<TRow>, SqlError, SqlClient.SqlClient>
      options?: LiveEffectQueryOptions<TRow, TResult> | undefined
    }

const QueryLayer = GlobalLayer.use("SqliteAtom", Tracer.Tracer, SqlClient.SqlClient, Reactivity.Reactivity)

export const queryRuntime = Atom.runtime(QueryLayer)

const ReactivityKeysSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Array(Schema.String)
})

const encodeReactivityKeys = Schema.encodeSync(ReactivityKeysSchema)

export const effectQuery = <TRow = Row, TResult = TRow[]>(createOptions: CreateQueryOptions<TRow, TResult>) =>
  Effect.gen(function* () {
    const client = yield* SqlClient.SqlClient
    const reactivity = yield* Reactivity.Reactivity
    const reactivityKeys: Record<string, Array<string>> = {}
    const baseOptions = (createOptions.options ?? {}) as LiveQueryBaseOptions<TRow, TResult>
    const runOnStart = baseOptions.onStart ? Effect.ignore(Effect.try(() => baseOptions.onStart?.())) : Effect.void

    let sqlString = "<effect query>"
    let effect: Effect.Effect<ReadonlyArray<TRow>, SqlError, never>

    if (isFunction(createOptions.execute)) {
      const options = (createOptions.options ?? {}) as LiveSqlQueryOptions<TRow, TResult>
      const query = createOptions.execute()
      sqlString = query
      const sqlParseResult = parseSql(query)
      sqlParseResult.tables.forEach((i) => {
        reactivityKeys[i] = []
      })
      effect = client.unsafe(query, options.params).withoutTransform as unknown as Effect.Effect<
        ReadonlyArray<TRow>,
        SqlError,
        never
      >
    } else {
      const query = createOptions.execute as Effect.Effect<ReadonlyArray<TRow>, SqlError, SqlClient.SqlClient>
      effect = Effect.provideService(query, SqlClient.SqlClient, client)
    }

    const transformResults = (rows: ReadonlyArray<TRow>): TResult =>
      baseOptions.transform ? baseOptions.transform(Array.from(rows)) : (Array.from(rows) as TResult)

    const stream = pipe(
      reactivity.stream(
        reactivityKeys,
        Effect.withSpan(effect, "liveQueryAtom", {
          attributes: {
            "query.reactivityKeys": encodeReactivityKeys(reactivityKeys),
            "query.debounce": baseOptions.debounce ?? "none"
          }
        })
      ),
      Stream.map(transformResults),
      baseOptions.debounce ? Stream.debounce(baseOptions.debounce) : identity,
      baseOptions.onError
        ? Stream.onError((error) => Effect.ignore(Effect.try(() => baseOptions.onError?.(error))))
        : identity,
      baseOptions.onEnd ? Stream.ensuring(Effect.ignore(Effect.try(() => baseOptions.onEnd?.()))) : identity,
      baseOptions.onDone ? Stream.onDone(() => Effect.ignore(Effect.try(() => baseOptions.onDone?.()))) : identity,
      baseOptions.debug
        ? Stream.tap((_) =>
            Effect.logInfo(`Query: ${sqlString}`).pipe(
              Effect.annotateLogs({
                ...baseOptions
              })
            )
          )
        : identity,
      Stream.tapErrorCause(Effect.logError)
    )

    yield* runOnStart

    return stream
  }).pipe(Effect.tapErrorCause(Effect.logError), Stream.unwrap)

export const effectQueryAtom = Atom.family((_: unknown) => queryRuntime.fn(effectQuery as any))

export const createQueryHooks =
  <A extends Atom.Atom<any>>(inputAtom: A) =>
  <TRow = Row, TResult = TRow[]>(sql: any, options: LiveQueryBaseOptions<TRow, TResult> = {}) => {
    const registry = use(RegistryContext)
    const [results, setResults] = useState<TResult>(() => (options.fallback ?? []) as TResult)

    const atom = useMemo(() => inputAtom || queryRuntime.fn(effectQuery as any), [inputAtom])

    useEffect(() => {
      setResults((options.fallback ?? []) as TResult)

      if (!inputAtom && Atom.isWritable(atom)) {
        registry.set(atom, { execute: sql, options })
      }

      const unsubscribe = registry.subscribe(
        atom,
        (result) => {
          if (result.waiting) {
            // ignore waiting
          }

          if (result._tag === "Initial") {
            // ignore initial value
          }

          if (result._tag === "Success") {
            setResults(result.value)
          }
        },
        { immediate: true }
      )

      return () => unsubscribe()
    }, [atom, inputAtom, options, registry, sql])

    return results
  }

/**
 * React hook for live Effect queries
 */
export const effectQueryHooks: <A>(
  effect: Effect.Effect<ReadonlyArray<A>, SqlError, SqlClient.SqlClient>
) => <TResult = A[]>(options?: LiveEffectQueryOptions<A, TResult> | undefined) => TResult =
  (queryBuilder: any) => (options: any) =>
    createQueryHooks(null as any)(queryBuilder, options) as any
