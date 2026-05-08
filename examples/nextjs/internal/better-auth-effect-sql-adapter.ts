import type { AdapterFactoryCustomizeAdapterCreator, CleanedWhere, CustomAdapter } from "@better-auth/core/db/adapter"
import type { SqlClient } from "@effect/sql"
import type { Effect } from "effect"

import { createAdapterFactory } from "@better-auth/core/db/adapter"

type SqlParams = ReadonlyArray<unknown>
type SqlClause = {
  readonly params: SqlParams
  readonly sql: string
}
type SqlRow = Record<string, unknown>

const assertIdentifier = (value: string) => {
  const parts = value.split(".")
  if (parts.length === 0 || parts.some((part) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(part))) {
    throw new Error(`Unsafe SQL identifier: ${value}`)
  }
}

const quoteIdentifier = (value: string) => {
  assertIdentifier(value)
  return value
    .split(".")
    .map((part) => `"${part}"`)
    .join(".")
}

const encodeValue = (value: unknown): unknown => {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value)
  }

  return value
}

const buildSelectClause = (
  select: ReadonlyArray<string> | undefined,
  getFieldName: (input: { readonly model: string; readonly field: string }) => string,
  model: string
) =>
  select && select.length > 0 ? select.map((field) => quoteIdentifier(getFieldName({ model, field }))).join(", ") : "*"

const buildWhereClause = (where: ReadonlyArray<CleanedWhere> | undefined): SqlClause => {
  if (!where || where.length === 0) {
    return { params: [] as SqlParams, sql: "" }
  }

  const groups = {
    AND: [] as Array<SqlClause>,
    OR: [] as Array<SqlClause>
  }

  for (const condition of where) {
    const value = condition.value
    const isInsensitive =
      condition.mode === "insensitive" &&
      (typeof value === "string" || (Array.isArray(value) && value.every((item) => typeof item === "string")))
    const column = isInsensitive ? `LOWER(${quoteIdentifier(condition.field)})` : quoteIdentifier(condition.field)
    const encodeConditionValue = (input: unknown) =>
      isInsensitive && typeof input === "string" ? input.toLowerCase() : encodeValue(input)

    const clause: SqlClause = (() => {
      switch (condition.operator) {
        case "eq":
          return value === null
            ? { params: [], sql: `${column} IS NULL` }
            : { params: [encodeConditionValue(value)], sql: `${column} = ?` }
        case "ne":
          return value === null
            ? { params: [], sql: `${column} IS NOT NULL` }
            : { params: [encodeConditionValue(value)], sql: `${column} <> ?` }
        case "gt":
          return { params: [encodeValue(value)], sql: `${column} > ?` }
        case "gte":
          return { params: [encodeValue(value)], sql: `${column} >= ?` }
        case "lt":
          return { params: [encodeValue(value)], sql: `${column} < ?` }
        case "lte":
          return { params: [encodeValue(value)], sql: `${column} <= ?` }
        case "contains":
          return { params: [`%${encodeConditionValue(value)}%`], sql: `${column} LIKE ?` }
        case "starts_with":
          return { params: [`${encodeConditionValue(value)}%`], sql: `${column} LIKE ?` }
        case "ends_with":
          return { params: [`%${encodeConditionValue(value)}`], sql: `${column} LIKE ?` }
        case "in": {
          const values = Array.isArray(value) ? value : [value]
          if (values.length === 0) {
            return { params: [], sql: "1 = 0" }
          }

          return {
            params: values.map(encodeConditionValue),
            sql: `${column} IN (${values.map(() => "?").join(", ")})`
          }
        }
        case "not_in": {
          const values = Array.isArray(value) ? value : [value]
          if (values.length === 0) {
            return { params: [], sql: "1 = 1" }
          }

          return {
            params: values.map(encodeConditionValue),
            sql: `${column} NOT IN (${values.map(() => "?").join(", ")})`
          }
        }
        default:
          throw new Error(`Unsupported SQL where operator: ${condition.operator}`)
      }
    })()

    const connector = condition.connector === "OR" ? "OR" : "AND"
    groups[connector].push(clause)
  }

  const parts = [
    groups.AND.length > 0 ? `(${groups.AND.map((clause) => clause.sql).join(" AND ")})` : "",
    groups.OR.length > 0 ? `(${groups.OR.map((clause) => clause.sql).join(" OR ")})` : ""
  ].filter((part) => part.length > 0)
  const params = [...groups.AND, ...groups.OR].flatMap((clause) => clause.params)

  return { params, sql: ` WHERE ${parts.join(" AND ")}` }
}

const buildLimitOffsetClause = (limit: number | undefined, offset: number | undefined): SqlClause => {
  const clauses: Array<string> = []
  const params: Array<unknown> = []

  if (limit !== undefined) {
    if (!Number.isSafeInteger(limit) || limit < 0) {
      throw new Error(`Unsafe SQL limit: ${limit}`)
    }
    clauses.push(" LIMIT ?")
    params.push(limit)
  }

  if (offset !== undefined) {
    if (!Number.isSafeInteger(offset) || offset < 0) {
      throw new Error(`Unsafe SQL offset: ${offset}`)
    }
    clauses.push(" OFFSET ?")
    params.push(offset)
  }

  return { params, sql: clauses.join("") }
}

const buildOrderClause = (
  sortBy: { readonly field: string; readonly direction: "asc" | "desc" } | undefined,
  getFieldName: (input: { readonly model: string; readonly field: string }) => string,
  model: string
) => {
  if (!sortBy) {
    return ""
  }

  const direction = sortBy.direction === "asc" ? "ASC" : "DESC"
  return ` ORDER BY ${quoteIdentifier(getFieldName({ model, field: sortBy.field }))} ${direction}`
}

const buildSetClause = (values: Record<string, unknown>) => {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined)

  return {
    params: entries.map(([, value]) => encodeValue(value)),
    sql: entries.map(([field]) => `${quoteIdentifier(field)} = ?`).join(", ")
  }
}

const buildInsertClause = (values: Record<string, unknown>) => {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined)

  return {
    columns: entries.map(([field]) => quoteIdentifier(field)).join(", "),
    isEmpty: entries.length === 0,
    params: entries.map(([, value]) => encodeValue(value)),
    placeholders: entries.map(() => "?").join(", ")
  }
}

const makeAdapter = (
  runPromise: <A, E>(
    effect: Effect.Effect<A, E, SqlClient.SqlClient>,
    options?:
      | {
          readonly signal?: AbortSignal
        }
      | undefined
  ) => Promise<A>,
  sql: SqlClient.SqlClient
): AdapterFactoryCustomizeAdapterCreator => {
  const runAll = <A>(statement: string, params: SqlParams) =>
    runPromise(sql.unsafe(statement, [...params]).withoutTransform).then((rows) => rows as ReadonlyArray<A>)

  return ({ getFieldName }) => {
    const create: CustomAdapter["create"] = async ({ data, model, select }) => {
      const insert = buildInsertClause(data)
      const returning = buildSelectClause(select, getFieldName, model)
      const rows = await runAll<SqlRow>(
        sql,
        insert.isEmpty
          ? `INSERT INTO ${quoteIdentifier(model)} DEFAULT VALUES RETURNING ${returning}`
          : `INSERT INTO ${quoteIdentifier(model)} (${insert.columns}) VALUES (${insert.placeholders}) RETURNING ${returning}`,
        insert.params
      )

      return (rows[0] ?? data) as never
    }

    const findOne: CustomAdapter["findOne"] = async ({ model, where, select }) => {
      const whereClause = buildWhereClause(where)
      const columns = buildSelectClause(select, getFieldName, model)
      const rows = await runAll<SqlRow>(
        `SELECT ${columns} FROM ${quoteIdentifier(model)}${whereClause.sql} LIMIT 1`,
        whereClause.params
      )

      return (rows[0] ?? null) as never
    }

    const findMany: CustomAdapter["findMany"] = async ({ model, where, limit, select, sortBy, offset }) => {
      const whereClause = buildWhereClause(where)
      const columns = buildSelectClause(select, getFieldName, model)
      const orderBy = buildOrderClause(sortBy, getFieldName, model)
      const limitOffset = buildLimitOffsetClause(limit, offset)

      const rows = await runAll<SqlRow>(
        `SELECT ${columns} FROM ${quoteIdentifier(model)}${whereClause.sql}${orderBy}${limitOffset.sql}`,
        [...whereClause.params, ...limitOffset.params]
      )

      return rows as never
    }

    const update: CustomAdapter["update"] = async ({ model, where, update }) => {
      const set = buildSetClause(update as Record<string, unknown>)
      if (set.sql.length === 0) {
        return null
      }

      const whereClause = buildWhereClause(where)
      const rows = await runAll<SqlRow>(
        `UPDATE ${quoteIdentifier(model)} SET ${set.sql}${whereClause.sql} RETURNING *`,
        [...set.params, ...whereClause.params]
      )

      return (rows[0] ?? null) as never
    }

    const adapter: CustomAdapter = {
      create,
      findMany,
      findOne,
      update,
      async updateMany({ model, where, update }) {
        const set = buildSetClause(update)
        if (set.sql.length === 0) {
          return 0
        }

        const whereClause = buildWhereClause(where)
        const rows = await runAll<SqlRow>(
          `UPDATE ${quoteIdentifier(model)} SET ${set.sql}${whereClause.sql} RETURNING id`,
          [...set.params, ...whereClause.params]
        )

        return rows.length
      },
      async delete({ model, where }) {
        const whereClause = buildWhereClause(where)
        await runAll(sql, `DELETE FROM ${quoteIdentifier(model)}${whereClause.sql}`, whereClause.params)
      },
      async deleteMany({ model, where }) {
        const whereClause = buildWhereClause(where)
        const rows = await runAll<SqlRow>(
          `DELETE FROM ${quoteIdentifier(model)}${whereClause.sql} RETURNING id`,
          whereClause.params
        )

        return rows.length
      },
      async count({ model, where }) {
        const whereClause = buildWhereClause(where)
        const rows = await runAll<{ readonly count: number | string | bigint }>(
          `SELECT COUNT(id) AS count FROM ${quoteIdentifier(model)}${whereClause.sql}`,
          whereClause.params
        )
        const count = rows[0]?.count ?? 0

        return typeof count === "bigint" ? Number(count) : Number(count)
      }
    }

    return adapter
  }
}

export const effectSqlAuthAdapter = (
  runPromise: <A, E>(
    effect: Effect.Effect<A, E, SqlClient.SqlClient>,
    options?:
      | {
          readonly signal?: AbortSignal
        }
      | undefined
  ) => Promise<A>,
  sql: SqlClient.SqlClient
) =>
  createAdapterFactory({
    adapter: makeAdapter(runPromise, sql),
    config: {
      adapterId: "effect-sql",
      adapterName: "Effect SQL Adapter",
      supportsArrays: false,
      supportsBooleans: false,
      supportsDates: false,
      supportsJSON: false,
      supportsNumericIds: false,
      supportsUUIDs: false,
      transaction: false
    }
  })

export const _AuthSqlAdapterTestHooks = {
  buildLimitOffsetClause,
  buildWhereClause,
  quoteIdentifier
}
