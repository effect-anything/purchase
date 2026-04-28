import type * as Model from "@effect/sql/Model"
import type { ParseError } from "effect/ParseResult"

import * as SqlClient from "@effect/sql/SqlClient"
import { SqlError } from "@effect/sql/SqlError"
import * as SqlResolver from "@effect/sql/SqlResolver"
import * as SqlSchema from "@effect/sql/SqlSchema"
import * as Arr from "effect/Array"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import { flow, pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"

type CastArray<T> = [T] extends [never]
  ? Array<never>
  : [unknown] extends [T]
    ? Array<unknown>
    :
        | (T extends any ? (T extends ReadonlyArray<infer U> ? Array<U> : never) : never)
        | (Exclude<T, ReadonlyArray<any>> extends never ? never : Array<Exclude<T, ReadonlyArray<any>>>)

/**
 * Schema-bound safety layer around Kysely queries.
 *
 * - Keep query construction in Kysely.
 * - Bind input / output schemas at the repository boundary.
 * - Treat the effect value itself as the "many rows" contract.
 * - Use helper accessors only to narrow cardinality expectations.
 *
 * Many APIs in this module intentionally accept a callback like
 * `(input) => db.insertInto(...).values(input)...` instead of a pre-built query.
 *
 * That shape is required because:
 * - repo helpers must encode domain input before Kysely sees it
 * - Kysely should still infer against the encoded row shape used by `.values`,
 *   `.set`, `.where`, etc.
 * - some operations need the same encoded input in multiple query positions
 *
 * If callers passed an already-built statement, this layer would lose the chance
 * to encode branded ids, datetimes, json payloads, and other schema-driven values
 * before binding them into the SQL builder.
 */

// ----- Selectable ----

interface SelectableEffect<A, E = never, R = never> extends Effect.Effect<Readonly<CastArray<A>>, E, R> {
  /**
   * Compatibility alias for `first`.
   *
   * @deprecated Use `first` for "first row as Option" semantics.
   */
  single: Effect.Effect<Option.Option<CastArray<A>[number]>, E, R>
  /**
   * Take the first row as `Option`, without asserting uniqueness.
   */
  first: Effect.Effect<Option.Option<CastArray<A>[number]>, E, R>
  /**
   * Take the first row or fail when no rows exist.
   */
  firstOrFail: (message?: string) => Effect.Effect<CastArray<A>[number], E | Cause.NoSuchElementException, R>
  /**
   * Require exactly one row, fail on zero or many rows.
   */
  exactlyOne: (message?: string) => Effect.Effect<CastArray<A>[number], E | Cause.NoSuchElementException | SqlError, R>
}

type MutationResult<A> = {
  /**
   * Number of rows returned by the mutation statement.
   */
  rowsAffected: number
  /**
   * Decoded mutation payload.
   *
   * The payload preserves the input shape:
   * - single-input mutations yield a single value or `undefined`
   * - array-input mutations yield an array
   *
   * For batch expectations, treat `rowsAffected` as the primary contract.
   */
  results: A
}

type Selectable<A, I> = {
  <E, R = never>(
    statement: Effect.Effect<ReadonlyArray<I>, E>
  ): SelectableEffect<ReadonlyArray<A>, E | ParseError | SqlError, R>

  decode<DA, DI, E, R = never>(
    schema: Schema.Schema<DA, DI>,
    statement: Effect.Effect<ReadonlyArray<DI>, E>
  ): SelectableEffect<ReadonlyArray<DA>, E | ParseError | SqlError, R>

  encode: {
    <NA, NI, E, R = never>(
      encodeSchema: Schema.Schema<NA, NI>,
      statement: (data: NI) => Effect.Effect<ReadonlyArray<I>, E, R>,
      input: NA
    ): SelectableEffect<ReadonlyArray<A>, E | ParseError | SqlError, R>

    <NA, NI, E, R = never>(
      encodeSchema: Schema.Schema<NA, NI>,
      statement: (data: NI) => Effect.Effect<ReadonlyArray<I>, E, R>
    ): (input: NA) => SelectableEffect<ReadonlyArray<A>, E | ParseError | SqlError, R>
  }

  codec: {
    <NA, NI, DA, DI, E, R = never>(
      encodeSchema: Schema.Schema<NA, NI>,
      decodeSchema: Schema.Schema<DA, DI>,
      statement: (data: NI) => Effect.Effect<ReadonlyArray<DI>, E, R>,
      input: NA
    ): SelectableEffect<ReadonlyArray<DA>, E | ParseError | SqlError, R>

    <NA, NI, DA, DI, E, R = never>(
      encodeSchema: Schema.Schema<NA, NI>,
      decodeSchema: Schema.Schema<DA, DI>,
      statement: (data: NI) => Effect.Effect<ReadonlyArray<DI>, E, R>
    ): (input: NA) => SelectableEffect<ReadonlyArray<DA>, E | ParseError | SqlError, R>
  }
}

type Rows = {
  <A, E, R = never>(statement: Effect.Effect<ReadonlyArray<A>, E, R>): SelectableEffect<ReadonlyArray<A>, E, R>

  decode<DA, DI, E, R = never>(
    schema: Schema.Schema<DA, DI>,
    statement: Effect.Effect<ReadonlyArray<DI>, E, R>
  ): SelectableEffect<ReadonlyArray<DA>, E | ParseError, R>
}

// ----- Insertable ----

interface InsertableEffect<A, E = never, R = never> extends Effect.Effect<A, E, R> {
  void: Effect.Effect<void, E, R>
  /**
   * Require the mutation to return a value, but do not assert a single affected row.
   */
  required: Effect.Effect<NonNullable<A>, E | Cause.NoSuchElementException, R>
  /**
   * Same as `required`, with a custom not-found message.
   */
  orFail: (message?: string) => Effect.Effect<NonNullable<A>, E | Cause.NoSuchElementException, R>
  /**
   * Require the mutation to affect exactly one returned row.
   */
  exactlyOne: (message?: string) => Effect.Effect<NonNullable<A>, E | Cause.NoSuchElementException | SqlError, R>

  /**
   * Use this for batch expectations and row-count aware mutation contracts.
   */
  result: Effect.Effect<MutationResult<A>, E, R>
}

type InsertData<T> = T | Array<T>
type SingleMutation<A> = A | undefined

type Insertable<A, I, IA, II> = {
  <const X extends InsertData<IA>, E, R = never>(
    statement: (data: Array<II>) => Effect.Effect<ReadonlyArray<I>, E, R>,
    input: X
  ): InsertableEffect<X extends Array<any> ? ReadonlyArray<A> : SingleMutation<A>, E | ParseError | SqlError, R>

  <E, R = never>(
    statement: (data: Array<II>) => Effect.Effect<ReadonlyArray<I>, E, R>
  ): <const X extends InsertData<IA>>(
    input: X
  ) => InsertableEffect<X extends Array<any> ? ReadonlyArray<A> : SingleMutation<A>, E | ParseError | SqlError, R>

  void: {
    <const X extends InsertData<IA>, E, X1 = any, R = never>(
      statement: (data: Array<II>) => Effect.Effect<X1, E, R>,
      input: X
    ): Effect.Effect<void, E | ParseError | SqlError, R>

    <E, X1 = any, R = never>(
      statement: (data: Array<II>) => Effect.Effect<X1, E, R>
    ): <const X extends InsertData<IA>>(input: X) => Effect.Effect<void, E | ParseError | SqlError, R>
  }

  decode: {
    <const X extends InsertData<IA>, DA, DI, E, R = never>(
      decode: Schema.Schema<DA, DI>,
      statement: (data: Array<II>) => Effect.Effect<ReadonlyArray<DI>, E, R>,
      input: X
    ): InsertableEffect<X extends Array<any> ? ReadonlyArray<DA> : SingleMutation<DA>, E | ParseError | SqlError, R>

    <DA, DI, E, R = never>(
      decode: Schema.Schema<DA, DI>,
      statement: (data: Array<II>) => Effect.Effect<ReadonlyArray<DI>, E, R>
    ): <const X extends InsertData<IA>>(
      input: X
    ) => InsertableEffect<X extends Array<any> ? ReadonlyArray<DA> : SingleMutation<DA>, E | ParseError | SqlError, R>
  }
}

// ----- Updateable ----

interface UpdateableEffect<A, E, R = never> extends Effect.Effect<A, E, R> {
  void: Effect.Effect<void, E, R>
  /**
   * Require the mutation to return a value, but do not assert a single affected row.
   */
  required: Effect.Effect<NonNullable<A>, E | Cause.NoSuchElementException, R>
  /**
   * Same as `required`, with a custom not-found message.
   */
  orFail: (message?: string) => Effect.Effect<NonNullable<A>, E | Cause.NoSuchElementException, R>
  /**
   * Require the mutation to affect exactly one returned row.
   */
  exactlyOne: (message?: string) => Effect.Effect<NonNullable<A>, E | Cause.NoSuchElementException | SqlError, R>
  /**
   * Use this for batch expectations and row-count aware mutation contracts.
   */
  result: Effect.Effect<MutationResult<A>, E, R>
}

type Updateable<A, I, UA, UI> = {
  <E, R = never>(
    statement: (data: UI) => Effect.Effect<ReadonlyArray<I>, E, R>,
    input: UA
  ): UpdateableEffect<SingleMutation<A>, E | ParseError | SqlError, R>

  <E, R = never>(
    statement: (data: UI) => Effect.Effect<ReadonlyArray<I>, E, R>
  ): (input: UA) => UpdateableEffect<SingleMutation<A>, E | ParseError | SqlError, R>

  void: {
    <E, X1 = any, R = never>(
      statement: (data: UI) => Effect.Effect<X1, E, R>,
      input: UA
    ): Effect.Effect<void, E | ParseError | SqlError, R>

    <E, X1 = any, R = never>(
      statement: (input: UI) => Effect.Effect<X1, E, R>
    ): (input: UA) => Effect.Effect<void, E | ParseError | SqlError, R>
  }

  encode: {
    <NA, NI, E, R = never>(
      encodeSchema: Schema.Schema<NA, NI>,
      statement: (data: NI) => Effect.Effect<ReadonlyArray<I>, E, R>,
      input: NA
    ): UpdateableEffect<A, E | ParseError | SqlError, R>

    <NA, NI, E, R = never>(
      encodeSchema: Schema.Schema<NA, NI>,
      statement: (data: NI) => Effect.Effect<ReadonlyArray<I>, E, R>
    ): (input: NA) => UpdateableEffect<A, E | ParseError | SqlError, R>

    void: {
      <NA, NI, E, X1 = any, R = never>(
        encodeSchema: Schema.Schema<NA, NI>,
        statement: (data: NI) => Effect.Effect<X1, E, R>,
        input: NA
      ): Effect.Effect<void, E | ParseError | SqlError, R>

      <NA, NI, E, X1 = any, R = never>(
        encodeSchema: Schema.Schema<NA, NI>,
        statement: (data: NI) => Effect.Effect<X1, E, R>
      ): (input: NA) => Effect.Effect<void, E | ParseError | SqlError, R>
    }
  }

  decode: {
    <DA, DI, E, R = never>(
      decode: Schema.Schema<DA, DI>,
      statement: (data: UI) => Effect.Effect<ReadonlyArray<DI>, E, R>,
      input: UA
    ): UpdateableEffect<SingleMutation<DA>, E | ParseError | SqlError, R>

    <DA, DI, E, R = never>(
      decode: Schema.Schema<DA, DI>,
      statement: (data: UI) => Effect.Effect<ReadonlyArray<DI>, E, R>
    ): (input: UA) => UpdateableEffect<SingleMutation<DA>, E | ParseError | SqlError, R>
  }
}

export interface ModelRepo<T extends Model.AnyNoContext> {
  readonly select: Selectable<Schema.Schema.Type<T>, Schema.Schema.Encoded<T>>
  readonly insert: Insertable<
    Schema.Schema.Type<T>,
    Schema.Schema.Encoded<T>,
    Schema.Schema.Type<T["insert"]>,
    Schema.Schema.Encoded<T["insert"]>
  >
  readonly update: Updateable<
    Schema.Schema.Type<T>,
    Schema.Schema.Encoded<T>,
    Schema.Schema.Type<T["update"]>,
    Schema.Schema.Encoded<T["update"]>
  >
}

const takeFirst = <A>(rows: ReadonlyArray<A>) => rows.at(0) as A
const takeMutationResult = <A>(data: InsertData<unknown>, rows: ReadonlyArray<A>) =>
  (Array.isArray(data) ? rows : takeFirst(rows)) as any
const mutationResult = <A>(data: InsertData<unknown>, rows: ReadonlyArray<A>) => ({
  rowsAffected: rows.length,
  results: takeMutationResult(data, rows)
})
const toError = (cause: unknown) =>
  cause instanceof Error ? cause : new Error(typeof cause === "string" ? cause : String(cause))
const notFound = (message = "Record not found") => new Cause.NoSuchElementException(message)
const queryError = (message: string, cause?: unknown) =>
  new SqlError({
    message,
    cause: toError(cause ?? message)
  })
const getFirstOrFail = <A, E, R>(
  effect: Effect.Effect<ReadonlyArray<A>, E, R>,
  message?: string
): Effect.Effect<A, E | Cause.NoSuchElementException, R> =>
  effect.pipe(
    Effect.flatMap((rows) =>
      Option.match(Option.fromNullable(rows.at(0)), {
        onNone: () => Effect.fail(notFound(message)),
        onSome: (row) => Effect.succeed(row)
      })
    )
  )
const getExactlyOne = <A, E, R>(
  effect: Effect.Effect<ReadonlyArray<A>, E, R>,
  message?: string
): Effect.Effect<A, E | Cause.NoSuchElementException | SqlError, R> =>
  effect.pipe(
    Effect.flatMap((rows): Effect.Effect<A, Cause.NoSuchElementException | SqlError> => {
      if (rows.length === 0) {
        return Effect.fail(notFound(message))
      }

      if (rows.length > 1) {
        return Effect.fail(
          queryError(message ?? `Expected exactly one row, received ${rows.length}`, new Error(`rows=${rows.length}`))
        )
      }

      return Effect.succeed(rows[0]!)
    })
  )
const requireValue = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  message?: string
): Effect.Effect<NonNullable<A>, E | Cause.NoSuchElementException, R> =>
  effect.pipe(
    Effect.flatMap((value) =>
      value == null ? Effect.fail(notFound(message)) : Effect.succeed(value as NonNullable<A>)
    )
  )
const requireExactlyOneMutation = <A, E, R>(
  effect: Effect.Effect<{ rowsAffected: number; results: A }, E, R>,
  message?: string
): Effect.Effect<NonNullable<A>, E | Cause.NoSuchElementException | SqlError, R> =>
  effect.pipe(
    Effect.flatMap(
      ({ rowsAffected, results }): Effect.Effect<NonNullable<A>, Cause.NoSuchElementException | SqlError> => {
        if (rowsAffected === 0 || results == null) {
          return Effect.fail(notFound(message))
        }

        if (rowsAffected !== 1) {
          return Effect.fail(
            queryError(
              message ?? `Expected exactly one affected row, received ${rowsAffected}`,
              new Error(`rowsAffected=${rowsAffected}`)
            )
          )
        }

        return Effect.succeed(results as NonNullable<A>)
      }
    )
  )
const selectableRows = <A, E, R>(
  effect: Effect.Effect<ReadonlyArray<A>, E, R>
): SelectableEffect<ReadonlyArray<A>, E, R> => {
  const selectable = effect as unknown as SelectableEffect<ReadonlyArray<A>, E, R>
  const first = selectable.pipe(Effect.map((result) => Option.fromNullable(result.at(0))))

  return enhanceEffect(selectable, {
    single: first,
    first,
    firstOrFail: (message?: string) => getFirstOrFail(selectable, message),
    exactlyOne: (message?: string) => getExactlyOne(selectable, message)
  })
}

const table = <T extends Model.AnyNoContext>(model: T) => {
  type SEncoded = Schema.Schema.Encoded<T>

  const decodeSelect = Schema.decodeUnknown(Schema.Array(model))

  // ----- Selectable ----
  const select = ((statement: Effect.Effect<Array<SEncoded>>) => {
    return selectableRows(statement.pipe(Effect.flatMap((_) => decodeSelect(_))))
  }) as unknown as ModelRepo<T>["select"]

  enhanceEffect(select, {
    decode: ((schema, statement) => {
      const decodeRows = Schema.decodeUnknown(Schema.Array(schema))
      return selectableRows(statement.pipe(Effect.flatMap((_) => decodeRows(_))))
    }) as ModelRepo<T>["select"]["decode"],
    encode: ((schema, statement, input) => {
      const encode = Schema.encodeUnknown(schema)

      const handle = (data: unknown) => {
        return selectableRows(
          pipe(
            encode(data),
            Effect.flatMap((_) => statement(_)),
            Effect.flatMap((_) => decodeSelect(_))
          )
        )
      }

      if (typeof input !== "undefined") {
        return handle(input) as any
      }

      return handle
    }) as ModelRepo<T>["select"]["encode"],
    codec: ((encodeSchema, decodeSchema, statement, input) => {
      const encode = Schema.encodeUnknown(encodeSchema)
      const decode = Schema.decodeUnknown(Schema.Array(decodeSchema))

      const handle = (data: unknown) => {
        return selectableRows(
          pipe(
            encode(data),
            Effect.flatMap((_) => statement(_)),
            Effect.flatMap((_) => decode(_))
          )
        )
      }

      if (typeof input !== "undefined") {
        return handle(input) as any
      }

      return handle
    }) as ModelRepo<T>["select"]["codec"]
  })

  // ----- Insertable ----

  const encodeInsertMany = Schema.encodeUnknown(Schema.Array(model.insert))

  const insert = ((statement, input) => {
    const handle = (data: InsertData<unknown>) => {
      const effect = pipe(
        encodeInsertMany(Arr.ensure(data)),
        Effect.flatMap((_) => statement(_ as any))
      )

      return enhanceEffect(
        pipe(
          effect,
          Effect.flatMap((_) => decodeSelect(_)),
          Effect.map((_) => takeMutationResult(data, _))
        ),
        {
          void: Effect.asVoid(effect),
          required: requireValue(
            pipe(
              effect,
              Effect.flatMap((_) => decodeSelect(_)),
              Effect.map((_) => takeMutationResult(data, _))
            )
          ),
          orFail: (message?: string) =>
            requireValue(
              pipe(
                effect,
                Effect.flatMap((_) => decodeSelect(_)),
                Effect.map((_) => takeMutationResult(data, _))
              ),
              message
            ),
          exactlyOne: (message?: string) =>
            requireExactlyOneMutation(
              pipe(
                effect,
                Effect.flatMap((_) => decodeSelect(_)),
                Effect.map((_) => mutationResult(data, _))
              ),
              message
            ),
          result: pipe(
            effect,
            Effect.flatMap((_) => decodeSelect(_)),
            Effect.map((_) => mutationResult(data, _))
          )
        }
      ) as unknown as InsertableEffect<any>
    }

    if (typeof input !== "undefined") {
      return handle(input) as any
    }

    return handle
  }) as ModelRepo<T>["insert"]

  enhanceEffect(insert, {
    void: ((statement, input) => {
      const handle = flow(
        Arr.ensure,
        encodeInsertMany,
        Effect.flatMap((_) => statement(_ as any))
      )

      return typeof input !== "undefined" ? Effect.asVoid(handle(input)) : handle
    }) as ModelRepo<T>["insert"]["void"],
    decode: ((schema, statement, input) => {
      const decode = Schema.decodeUnknown(Schema.Array(schema))
      const handle = (data: InsertData<unknown>) => {
        const effect = pipe(
          encodeInsertMany(Arr.ensure(data)),
          Effect.flatMap((_) => statement(_ as any))
        ) as unknown as SelectableEffect<unknown, never>

        return enhanceEffect(
          pipe(
            effect,
            Effect.flatMap((_) => decode(_)),
            Effect.map((_) => takeMutationResult(data, _))
          ),
          {
            void: Effect.asVoid(effect),
            required: requireValue(
              pipe(
                effect,
                Effect.flatMap((_) => decode(_)),
                Effect.map((_) => takeMutationResult(data, _))
              )
            ),
            orFail: (message?: string) =>
              requireValue(
                pipe(
                  effect,
                  Effect.flatMap((_) => decode(_)),
                  Effect.map((_) => takeMutationResult(data, _))
                ),
                message
              ),
            exactlyOne: (message?: string) =>
              requireExactlyOneMutation(
                pipe(
                  effect,
                  Effect.flatMap((_) => decode(_)),
                  Effect.map((_) => mutationResult(data, _))
                ),
                message
              ),
            result: pipe(
              effect,
              Effect.flatMap((_) => decode(_)),
              Effect.map((_) => mutationResult(data, _))
            )
          }
        )
      }

      if (typeof input !== "undefined") {
        return handle(input) as any
      }

      return handle
    }) as ModelRepo<T>["insert"]["decode"]
  })

  // ----- Updateable ----

  const update = ((statement, input) => {
    const encode = Schema.encodeUnknown(model.update)

    const handle = (data: unknown) => {
      const effect = pipe(
        encode(data),
        Effect.flatMap((_) => statement(_))
      )

      return enhanceEffect(
        pipe(
          effect,
          Effect.flatMap((_) => decodeSelect(_)),
          Effect.map((_) => takeFirst(_))
        ),
        {
          void: Effect.asVoid(effect),
          required: requireValue(
            pipe(
              effect,
              Effect.flatMap((_) => decodeSelect(_)),
              Effect.map((_) => takeFirst(_))
            )
          ),
          orFail: (message?: string) =>
            requireValue(
              pipe(
                effect,
                Effect.flatMap((_) => decodeSelect(_)),
                Effect.map((_) => takeFirst(_))
              ),
              message
            ),
          exactlyOne: (message?: string) =>
            requireExactlyOneMutation(
              pipe(
                effect,
                Effect.flatMap((_) => decodeSelect(_)),
                Effect.map((_) => ({
                  rowsAffected: _.length,
                  results: takeFirst(_)
                }))
              ),
              message
            ),
          result: pipe(
            effect,
            Effect.flatMap((_) => decodeSelect(_)),
            Effect.map((_) => ({
              rowsAffected: _.length,
              results: takeFirst(_)
            }))
          )
        }
      )
    }

    if (typeof input !== "undefined") {
      return handle(input) as any
    }

    return handle
  }) as ModelRepo<T>["update"]

  enhanceEffect(update, {
    void: ((statement, input) => {
      const encode = Schema.encodeUnknown(model.update)

      const handle = (data: unknown) =>
        pipe(
          encode(data),
          Effect.flatMap((_) => statement(_)),
          Effect.asVoid
        )

      return typeof input !== "undefined" ? handle(input) : handle
    }) as ModelRepo<T>["update"]["void"],
    encode: enhanceEffect(
      ((schema, statement, input) => {
        const encodeUnknown = Schema.encodeUnknown(schema)

        const handle = (data: unknown) => {
          const effect = pipe(
            encodeUnknown(data),
            Effect.flatMap((_) => statement(_))
          )

          return enhanceEffect(
            pipe(
              effect,
              Effect.flatMap((_) => decodeSelect(_)),
              Effect.map((_) => takeFirst(_))
            ),
            {
              void: Effect.asVoid(effect),
              required: requireValue(
                pipe(
                  effect,
                  Effect.flatMap((_) => decodeSelect(_)),
                  Effect.map((_) => takeFirst(_))
                )
              ),
              orFail: (message?: string) =>
                requireValue(
                  pipe(
                    effect,
                    Effect.flatMap((_) => decodeSelect(_)),
                    Effect.map((_) => takeFirst(_))
                  ),
                  message
                ),
              exactlyOne: (message?: string) =>
                requireExactlyOneMutation(
                  pipe(
                    effect,
                    Effect.flatMap((_) => decodeSelect(_)),
                    Effect.map((_) => ({
                      rowsAffected: _.length,
                      results: takeFirst(_)
                    }))
                  ),
                  message
                ),
              result: pipe(
                effect,
                Effect.flatMap((_) => decodeSelect(_)),
                Effect.map((_) => ({
                  rowsAffected: _.length,
                  results: takeFirst(_)
                }))
              )
            }
          )
        }

        if (typeof input !== "undefined") {
          return handle(input) as any
        }

        return handle
      }) as ModelRepo<T>["update"]["encode"],
      {
        void: ((schema, statement, input) => {
          const encodeUnknown = Schema.encodeUnknown(schema)

          const handle = flow(
            encodeUnknown,
            Effect.flatMap((_) => statement(_)),
            Effect.asVoid
          )

          if (typeof input !== "undefined") {
            return handle(input) as any
          }

          return handle
        }) as ModelRepo<T>["update"]["encode"]["void"]
      }
    ),
    decode: ((schema, statement, input) => {
      const encode = Schema.encodeUnknown(model.update)
      const decode = Schema.decodeUnknown(Schema.Array(schema))

      const handle = (data: unknown) => {
        const effect = pipe(
          encode(data),
          Effect.flatMap((_) => statement(_))
        ) as unknown as SelectableEffect<unknown, never>

        return enhanceEffect(
          pipe(
            effect,
            Effect.flatMap((_) => decode(_)),
            Effect.map((_) => takeFirst(_))
          ),
          {
            void: Effect.asVoid(effect),
            required: requireValue(
              pipe(
                effect,
                Effect.flatMap((_) => decode(_)),
                Effect.map((_) => takeFirst(_))
              )
            ),
            orFail: (message?: string) =>
              requireValue(
                pipe(
                  effect,
                  Effect.flatMap((_) => decode(_)),
                  Effect.map((_) => takeFirst(_))
                ),
                message
              ),
            exactlyOne: (message?: string) =>
              requireExactlyOneMutation(
                pipe(
                  effect,
                  Effect.flatMap((_) => decode(_)),
                  Effect.map((_) => ({
                    rowsAffected: _.length,
                    results: takeFirst(_)
                  }))
                ),
                message
              ),
            result: pipe(
              effect,
              Effect.flatMap((_) => decode(_)),
              Effect.map((_) => ({
                rowsAffected: _.length,
                results: takeFirst(_)
              }))
            )
          }
        )
      }

      if (typeof input !== "undefined") {
        return handle(input) as any
      }

      return handle
    }) as ModelRepo<T>["update"]["decode"]
  })

  return {
    select: select,
    insert: insert,
    update: update
  } as ModelRepo<T>
}

export const rows: Rows = Object.assign(
  (<A, E, R = never>(statement: Effect.Effect<ReadonlyArray<A>, E, R>) => selectableRows(statement)) as Rows,
  {
    decode: (<DA, DI, E, R = never>(schema: Schema.Schema<DA, DI>, statement: Effect.Effect<ReadonlyArray<DI>, E, R>) =>
      selectableRows(statement.pipe(Effect.flatMap(Schema.decodeUnknown(Schema.Array(schema)))))) as Rows["decode"]
  }
)

export const encode: {
  <A, I, X, E, R = never>(
    schema: Schema.Schema<A, I>,
    statement: (input: I) => Effect.Effect<X, E, R>,
    input: A
  ): Effect.Effect<X, E | ParseError, R>
  <A, I, X, E, R = never>(
    schema: Schema.Schema<A, I>,
    statement: (input: I) => Effect.Effect<X, E, R>
  ): (input: A) => Effect.Effect<X, E | ParseError, R>
} = (<A, I, X, E, R = never>(
  schema: Schema.Schema<A, I>,
  statement: (input: I) => Effect.Effect<X, E, R>,
  input: A
) => {
  const encodeUnknown = Schema.encodeUnknown(schema)

  const handle = flow(
    encodeUnknown,
    Effect.flatMap((_) => statement(_))
  )

  return typeof input !== "undefined" ? handle(input) : handle
}) as any

export const decode: {
  <A, I, E, R = never>(schema: Schema.Schema<A, I>, statement: Effect.Effect<I, E>): Effect.Effect<A, E | ParseError, R>
  <A, I>(
    schema: Schema.Schema<A, I>
  ): <E, R = never>(statement: Effect.Effect<I, E>) => Effect.Effect<A, E | ParseError, R>
} = (<A, I, E = never, R = never>(schema: Schema.Schema<A, I>, statement: Effect.Effect<I, E>) => {
  const decodeUnknown = Schema.decodeUnknown(schema)
  return (
    typeof statement !== "undefined"
      ? statement.pipe(Effect.flatMap(decodeUnknown))
      : (s: Effect.Effect<I, E>) => pipe(s, Effect.flatMap(decodeUnknown))
  ) as Effect.Effect<A, E | ParseError, R>
}) as any

export const codec: {
  <A, I, DA, DI, E, R = never>(
    encode: Schema.Schema<A, I, never>,
    decode: Schema.Schema<DA, DI, never>,
    statement: (input: I) => Effect.Effect<DI, E, R>,
    input: A
  ): Effect.Effect<DA, E | ParseError, R>
  <A, I, DA, DI, E, R = never>(
    encode: Schema.Schema<A, I, never>,
    decode: Schema.Schema<DA, DI, never>,
    statement: (input: I) => Effect.Effect<DI, E, R>
  ): (input: A) => Effect.Effect<DA, E | ParseError, R>
} = (<A, I, DA, DI, E, R = never>(
  inputSchema: Schema.Schema<A, I, never>,
  outputSchema: Schema.Schema<DA, DI, never>,
  statement: (input: I) => Effect.Effect<DI, E, R>,
  input: A
) => {
  const encodeUnknown = Schema.encodeUnknown(inputSchema)
  const decodeUnknown = Schema.decodeUnknown(outputSchema)

  const handle = flow(
    encodeUnknown,
    Effect.flatMap((_) => statement(_)),
    Effect.flatMap(decodeUnknown)
  )

  return typeof input !== "undefined" ? handle(input) : handle
}) as any

export const repo = <T extends Model.AnyNoContext>(
  model: T
): Effect.Effect<ModelRepo<T> & { sql: SqlClient.SqlClient }, never, SqlClient.SqlClient> =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    return {
      ...table(model),
      sql
    }
  })

export const findAll = SqlSchema.findAll

export const findOne = SqlSchema.findOne

export const single = SqlSchema.single

const void_ = SqlSchema.void

export { void_ as void }

export const resolver = SqlResolver

const enhanceEffect = (object: any, properties: Record<string, any>) => {
  Object.entries(properties).forEach(([key, value]) => {
    Object.defineProperty(object, key, {
      // writable: false,
      enumerable: true,
      configurable: false,
      get() {
        return value
      }
    })
  })

  return object
}

export * from "@effect/sql/Model"
