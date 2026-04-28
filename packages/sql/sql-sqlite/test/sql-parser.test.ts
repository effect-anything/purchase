import { describe, expect, it } from "@effect/vitest"

import { parseSql } from "../src/internal/sql-parser.ts"

describe("parseSql", () => {
  it("extracts table names from select joins", () => {
    const parsed = parseSql(`
      SELECT users.id, teams.name
      FROM users
      INNER JOIN teams ON teams.id = users.team_id
    `)

    expect(parsed).toEqual({
      tables: ["users", "teams"],
      type: "select"
    })
  })

  it("extracts update targets and from tables", () => {
    const parsed = parseSql(`
      UPDATE users
      SET name = profiles.name
      FROM profiles
      WHERE profiles.user_id = users.id
    `)

    expect(parsed).toEqual({
      tables: ["users", "profiles"],
      type: "update"
    })
  })

  it("normalizes quoted table names for create table", () => {
    const parsed = parseSql('CREATE TABLE IF NOT EXISTS "UserSession" (id TEXT PRIMARY KEY)')

    expect(parsed).toEqual({
      tables: ["UserSession"],
      type: "create"
    })
  })

  it("treats WITH queries as select and filters out cte aliases from dependencies", () => {
    const parsed = parseSql(`
      WITH active_users AS (
        SELECT users.id, users.team_id
        FROM users
      )
      SELECT active_users.id, teams.name
      FROM active_users
      INNER JOIN teams ON teams.id = active_users.team_id
    `)

    expect(parsed).toEqual({
      tables: ["users", "teams"],
      type: "select"
    })
  })

  it("keeps update targets and joined source tables when using ctes", () => {
    const parsed = parseSql(`
      WITH recent_profiles AS (
        SELECT profiles.user_id, profiles.display_name
        FROM profiles
      )
      UPDATE users
      SET name = recent_profiles.display_name
      FROM recent_profiles
      WHERE recent_profiles.user_id = users.id
    `)

    expect(parsed).toEqual({
      tables: ["users", "profiles"],
      type: "update"
    })
  })

  it("normalizes query types regardless of input casing", () => {
    const parsed = parseSql("select * from users")

    expect(parsed).toEqual({
      tables: ["users"],
      type: "select"
    })
  })

  it("reuses cached results for identical sql", () => {
    const sql = "SELECT * FROM users"

    const first = parseSql(sql)
    const second = parseSql(sql)

    expect(second).toBe(first)
  })
})
