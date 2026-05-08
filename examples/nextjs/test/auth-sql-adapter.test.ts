import type { CleanedWhere } from "@better-auth/core/db/adapter"

import { describe, expect, it } from "vitest"

import { _AuthSqlAdapterTestHooks } from "../internal/better-auth-effect-sql-adapter.ts"

describe("auth sql adapter", () => {
  it("rejects unsafe SQL identifiers", () => {
    expect(() => _AuthSqlAdapterTestHooks.quoteIdentifier("user")).not.toThrow()
    expect(() => _AuthSqlAdapterTestHooks.quoteIdentifier("user.email")).not.toThrow()
    expect(() => _AuthSqlAdapterTestHooks.quoteIdentifier("user; DROP TABLE user")).toThrow(/Unsafe SQL identifier/)
    expect(() => _AuthSqlAdapterTestHooks.quoteIdentifier("user.email --")).toThrow(/Unsafe SQL identifier/)
  })

  it("keeps where values parameterized", () => {
    const where: Array<CleanedWhere> = [
      {
        connector: "AND",
        field: "email",
        mode: "sensitive",
        operator: "eq",
        value: "a@example.com' OR 1=1 --"
      }
    ]

    const clause = _AuthSqlAdapterTestHooks.buildWhereClause(where)

    expect(clause.sql).toBe(' WHERE ("email" = ?)')
    expect(clause.params).toEqual(["a@example.com' OR 1=1 --"])
  })

  it("parameterizes limit and offset", () => {
    const clause = _AuthSqlAdapterTestHooks.buildLimitOffsetClause(10, 20)

    expect(clause.sql).toBe(" LIMIT ? OFFSET ?")
    expect(clause.params).toEqual([10, 20])
    expect(() => _AuthSqlAdapterTestHooks.buildLimitOffsetClause(-1, undefined)).toThrow(/Unsafe SQL limit/)
    expect(() => _AuthSqlAdapterTestHooks.buildLimitOffsetClause(undefined, Number.NaN)).toThrow(/Unsafe SQL offset/)
  })
})
