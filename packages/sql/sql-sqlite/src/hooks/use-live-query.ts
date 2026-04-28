import type * as SqlClient from "@effect/sql/SqlClient"
import type { Row } from "@effect/sql/SqlConnection"
import type * as Effect from "effect/Effect"
import type { LazyArg } from "effect/Function"
import type { SqlError } from "../schema.ts"

import { createQueryHooks, type LiveEffectQueryOptions, type LiveSqlQueryOptions } from "../live.ts"

export const useLiveQuery: {
  /**
   * React hook for live SQL queries
   * @param sqlQuery The SQL query to execute
   * @param options Configuration options
   * @returns The query results
   *
   * @example
   * ```tsx
   * // Basic usage
   * const users = useLiveQuery<User[]>(() => "SELECT * FROM users")
   *
   * // With transformation
   * const userCount = useLiveQuery<number>(
   *   () => "SELECT COUNT(*) as count FROM users",
   *   { transform: rows => rows[0].count }
   * )
   *
   * // With parameters
   * const userPosts = useLiveQuery<Post[]>(
   *   () => "SELECT * FROM posts WHERE user_id = ?",
   *   { params: [userId] }
   * )
   * ```
   */
  <TRow extends Row, TResult = TRow[]>(sql: LazyArg<string>, options?: LiveSqlQueryOptions<TRow, TResult>): TResult /**
   * React hook for live Effect queries
   * @param effect The Effect Query
   * @param options Configuration options
   * @returns The query results
   *
   * @example
   * ```tsx
   * // Basic usage
   * const users = useLiveQuery<User[]>(() => sql`SELECT * FROM users`))
   */
  <TRow, TResult = TRow[]>(
    effect: Effect.Effect<ReadonlyArray<TRow>, SqlError, SqlClient.SqlClient>,
    options?: LiveEffectQueryOptions<TRow, TResult>
  ): TResult
} = createQueryHooks(null as any)
