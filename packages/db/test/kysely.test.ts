import * as Database from "../src/index.ts"
import * as Kysely from "@effect-x/sql-kysely/sqlite"
import * as SQLite from "@effect/sql-sqlite-node"
import * as Model from "@effect/sql/Model"
import * as SqlClient from "@effect/sql/SqlClient"
import { SqlError } from "@effect/sql/SqlError"
import { assert, describe, expect, layer } from "@effect/vitest"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as String from "effect/String"
import * as TestClock from "effect/TestClock"
import { CamelCasePlugin } from "kysely"

import * as V from "../src/kysely.ts"

const GroupId = Schema.Uint8ArrayFromSelf.pipe(Schema.brand("GroupId"))
const MemberId = Schema.Uint8ArrayFromSelf.pipe(Schema.brand("MemberId"))
const makeGroupId = () => Schema.decodeSync(GroupId)(new Uint8Array([1]))
const toIdKey = (id: Uint8Array) => Array.from(id).join(":")

class Group extends Model.Class<Group>("Group")({
  id: Model.UuidV4Insert(GroupId),
  name: Schema.NonEmptyTrimmedString,
  description: Schema.String.pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => "")
  ),
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate
}) {
  static repo = V.repo(Group)
  static table = "group" as const
  static readonly Array = Schema.Array(Group)
}

class Member extends Model.Class<Member>("Member")({
  id: Model.UuidV4Insert(MemberId),
  groupId: GroupId,
  email: Schema.NonEmptyTrimmedString,
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate
}) {
  static repo = V.repo(Member)
  static table = "member" as const
  static readonly Array = Schema.Array(Member)
}

// Database Configuration
const tables_ = [Group, Member] satisfies Database.Tables
type Tables = Database.TablesRecord<typeof tables_>
type TablesEncoded = Database.TablesEncoded<Tables>
Database.tables(tables_)

// SQLite Configuration
const SqliteLive = SQLite.SqliteClient.layer({
  filename: ":memory:",
  disableWAL: true,
  transformQueryNames: String.camelToSnake,
  transformResultNames: String.snakeToCamel
})

// Helper function to setup database
const setupDatabase = Effect.gen(function* () {
  yield* TestClock.setTime(new Date(2023, 1, 1).getTime())
  const sql = yield* SqlClient.SqlClient

  yield* sql`
    CREATE TABLE IF NOT EXISTS 'group' (
      id BLOB NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    )
  `
  yield* sql`
    CREATE TABLE IF NOT EXISTS 'member' (
      id BLOB NOT NULL PRIMARY KEY,
      group_id BLOB NOT NULL,
      email TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    )
  `

  // clear data
  yield* sql`DELETE FROM 'member'`
  yield* sql`DELETE FROM 'group'`

  const db = Kysely.make<TablesEncoded>({
    plugins: [new CamelCasePlugin()]
  })
  const repo = yield* Group.repo

  return { db, repo }
})

describe("Insert Operations", () => {
  layer(SqliteLive)("insert operations", (it) => {
    it.effect("insert operations", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        // Insert single record with returning all fields
        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const insertResult = yield* insert(Group.insert.make({ name: "A0" })).exactlyOne()
        expect(insertResult.name).toBe("A0")
        expect(insertResult.description).toBe("")

        // Insert multiple records
        const insertResult2 = yield* insert([Group.insert.make({ name: "A1" }), Group.insert.make({ name: "A2" })])
        expect(insertResult2.map((group: Group) => group.name)).toEqual(["A1", "A2"])

        const result = yield* insert(Group.insert.make({ name: "A3" })).result
        expect(result.rowsAffected).toBe(1)
        expect(result.results?.name).toBe("A3")

        const batchResult = yield* insert([Group.insert.make({ name: "A4" }), Group.insert.make({ name: "A5" })]).result
        expect(batchResult.rowsAffected).toBe(2)
        expect(batchResult.results.map((group: Group) => group.name)).toEqual(["A4", "A5"])
      })
    )

    it.effect("insert operations with decode", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insert = repo.insert.decode(Group.select.pick("id"), (input) =>
          db.insertInto("group").values(input).returning("id")
        )

        // Insert single record with decode
        const result1 = yield* insert(
          Group.insert.make({
            name: "React",
            description: "react en group"
          })
        ).orFail("expected inserted row")
        expect(result1.id).toBeInstanceOf(Uint8Array)

        // Insert multiple records with decode
        const result2 = yield* insert([Group.insert.make({ name: "Group1" }), Group.insert.make({ name: "Group2" })])
        expect(result2).toHaveLength(2)
        expect(result2[0]?.id).toBeInstanceOf(Uint8Array)
      })
    )

    it.effect("insert exactlyOne enforces single-row semantics", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())

        const created = yield* insert(Group.insert.make({ name: "Single Insert" })).exactlyOne()
        expect(created.name).toBe("Single Insert")

        const batchError = yield* Effect.flip(
          insert([Group.insert.make({ name: "Batch A" }), Group.insert.make({ name: "Batch B" })]).exactlyOne(
            "expected single insert"
          )
        )

        expect(batchError).toBeInstanceOf(SqlError)
      })
    )

    it.effect("insert operation with void", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insertVoid = repo.insert.void((input) => db.insertInto("group").values(input))
        yield* insertVoid(Group.insert.make({ name: "A4" }))

        const rows = yield* db.selectFrom("group").select("name")
        expect(rows).toEqual([{ name: "A4" }])
      })
    )

    it.effect("should handle insert errors gracefully", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        // Test duplicate key error
        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const group = Group.insert.make({ name: "Duplicate" })

        yield* insert(group)

        const duplicateEffect = insert(group)
        const exit = yield* Effect.exit(duplicateEffect)

        assert(Exit.isFailure(exit))
      })
    )
  })
})

describe("Select Operations", () => {
  layer(SqliteLive)("basic select", (it) => {
    it.effect("basic select", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        // Insert test data
        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        yield* insert(Group.insert.make({ name: "Test Group" }))

        // Test basic select
        const select = repo.select(db.selectFrom("group").selectAll())
        const results = yield* select
        const single = yield* select.single

        expect(results).toHaveLength(1)
        expect(results[0]?.name).toBe("Test Group")
        expect(single.pipe(Option.getOrUndefined)?.name).toBe("Test Group")
        expect((yield* select.first).pipe(Option.getOrUndefined)?.name).toBe("Test Group")
        expect((yield* select.firstOrFail()).name).toBe("Test Group")
        expect((yield* select.exactlyOne()).name).toBe("Test Group")
      })
    )

    it.effect("provides explicit failure modes for missing or duplicate rows", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        yield* insert([Group.insert.make({ name: "Duplicate" }), Group.insert.make({ name: "Duplicate" })])

        const missing = repo.select(db.selectFrom("group").selectAll().where("name", "=", "Missing"))
        const duplicate = repo.select(db.selectFrom("group").selectAll().where("name", "=", "Duplicate"))

        const missingError = yield* Effect.flip(missing.firstOrFail("group not found"))
        const duplicateError = yield* Effect.flip(duplicate.exactlyOne("expected one duplicate"))

        expect(missingError).toBeInstanceOf(Cause.NoSuchElementException)
        expect(duplicateError).toBeInstanceOf(SqlError)
      })
    )

    it.effect("supports joined queries with aliases", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase
        const memberRepo = yield* Member.repo

        const insertGroup = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const group = yield* insertGroup(Group.insert.make({ name: "Core Team" })).exactlyOne()

        const insertMember = memberRepo.insert((input) => db.insertInto("member").values(input).returningAll())
        yield* insertMember(
          Member.insert.make({
            groupId: group.id,
            email: "owner@example.com"
          })
        )

        const JoinedRow = Schema.Struct({
          groupName: Schema.String,
          memberEmail: Schema.String
        })

        const rows = yield* repo.select.decode(
          JoinedRow,
          db
            .selectFrom("group")
            .innerJoin("member", "member.groupId", "group.id")
            .select(["group.name as groupName", "member.email as memberEmail"])
            .where("group.id", "=", group.id)
        )

        expect(rows).toEqual([{ groupName: "Core Team", memberEmail: "owner@example.com" }])
      })
    )

    it.effect("supports left joins with nullable projected columns and table aliases", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insertGroup = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        yield* insertGroup([Group.insert.make({ name: "With Member" }), Group.insert.make({ name: "Without Member" })])

        const groups = yield* repo.select(db.selectFrom("group").selectAll().orderBy("name asc"))
        const memberRepo = yield* Member.repo
        const insertMember = memberRepo.insert((input) => db.insertInto("member").values(input).returningAll())

        yield* insertMember(
          Member.insert.make({
            groupId: groups[0]!.id,
            email: "joined@example.com"
          })
        )

        const JoinedNullableRow = Schema.Struct({
          groupName: Schema.String,
          memberEmail: Schema.NullOr(Schema.String)
        })

        const rows = yield* repo.select.decode(
          JoinedNullableRow,
          db
            .selectFrom("group as g")
            .leftJoin("member as m", "m.groupId", "g.id")
            .select(["g.name as groupName", "m.email as memberEmail"])
            .orderBy("g.name asc")
        )

        expect(rows).toEqual([
          { groupName: "With Member", memberEmail: "joined@example.com" },
          { groupName: "Without Member", memberEmail: null }
        ])
      })
    )

    it.effect("select operations with decode", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        // Insert test data
        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        yield* insert(Group.insert.make({ name: "Test Group", description: "Test Description" }))

        const select = repo.select.decode(
          Group.select.pick("name", "description"),
          db.selectFrom("group").select(["name", "description"]).limit(5)
        )

        const results = yield* select
        const single = yield* select.single

        expect(results).toEqual([{ name: "Test Group", description: "Test Description" }])
        expect(single).toEqual(Option.some({ name: "Test Group", description: "Test Description" }))
      })
    )

    it.effect("select operations with codec", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        // Insert test data
        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        yield* insert(Group.insert.make({ name: "Test Group", description: "Test Description" }))

        const select = repo.select.codec(
          Group.select.pick("name"),
          Group.select.pick("id", "name", "updatedAt"),
          (input) =>
            db
              .selectFrom("group")
              .where("name", "like", input.name)
              .select(["id", "name", "updatedAt"])
              .limit(3)
              .orderBy("createdAt desc")
        )({ name: "Test%" })

        const rows = yield* select
        expect(rows).toHaveLength(1)
        expect(rows[0]?.name).toBe("Test Group")
        expect((yield* select.single).pipe(Option.getOrUndefined)?.name).toBe("Test Group")
      })
    )

    it.effect("should support pagination and sorting", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        // Insert test data
        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        yield* insert([
          Group.insert.make({ name: "A" }),
          Group.insert.make({ name: "B" }),
          Group.insert.make({ name: "C" })
        ])

        // Test pagination
        const select = repo.select.decode(
          Group.select.pick("name"),
          db.selectFrom("group").select(["name"]).orderBy("name asc").limit(2).offset(1)
        )

        const results = yield* select
        expect(results).toEqual([{ name: "B" }, { name: "C" }])
      })
    )

    it.effect("should support complex conditions", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        // Insert test data
        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        yield* insert([
          Group.insert.make({ name: "Test1", description: "desc1" }),
          Group.insert.make({ name: "Test2", description: "desc2" })
        ])

        // Test complex where conditions
        const select = repo.select.decode(
          Group.select.pick("name", "description"),
          db
            .selectFrom("group")
            .select(["name", "description"])
            .where("name", "like", "Test%")
            .where("description", "!=", "")
        )

        const results = yield* select
        expect(results).toEqual([
          { name: "Test1", description: "desc1" },
          { name: "Test2", description: "desc2" }
        ])
      })
    )
  })
})

describe("Update Operations", () => {
  layer(SqliteLive)("basic update operations", (it) => {
    it.effect("basic update operations", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        // Insert initial data
        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const group = yield* insert(
          Group.insert.make({
            name: "Initial",
            description: "Initial description"
          })
        ).exactlyOne()

        // Test basic update
        const update = repo.update((input) =>
          db.updateTable("group").set(input).where("id", "=", input.id).returningAll()
        )

        const updated = yield* update(
          Group.update.make({
            id: group.id,
            name: "Updated",
            description: "Updated description"
          })
        ).orFail("expected updated row")

        expect(updated.id).toEqual(group.id)
        expect(updated.name).toBe("Updated")
        expect(updated.description).toBe("Updated description")
        expect(
          (yield* update(Group.update.make({ id: group.id, name: "Updated Again", description: "Updated description" }))
            .required).name
        ).toBe("Updated Again")
      })
    )

    it.effect("should perform update operations with decode", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        // Insert initial data
        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const group = yield* insert(
          Group.insert.make({
            name: "Initial",
            description: "Initial description"
          })
        ).exactlyOne()

        const update = repo.update.decode(Group.update.pick("name", "description", "updatedAt"), (input) =>
          db.updateTable("group").set(input).where("id", "=", input.id).returning(["name", "description", "updatedAt"])
        )

        const result = yield* update(
          Group.update.make({
            id: group.id,
            name: "Updated",
            description: "Updated description"
          })
        ).orFail("expected decoded update row")

        expect(Array.isArray(result)).toBe(false)
        expect(result).toEqual({
          name: "Updated",
          description: "Updated description",
          updatedAt: group.updatedAt
        })
      })
    )

    it.effect("update.void discards returned rows and keeps command-style semantics honest", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const group = yield* insert(
          Group.insert.make({
            name: "Void Update",
            description: "Before"
          })
        ).exactlyOne()

        const updateVoid = repo.update.void((input) =>
          db.updateTable("group").set(input).where("id", "=", input.id).returningAll()
        )

        const result = yield* updateVoid(
          Group.update.make({
            id: group.id,
            name: "Void Update",
            description: "After"
          })
        )

        const rows = yield* db.selectFrom("group").selectAll().where("id", "=", group.id)

        expect(result).toBeUndefined()
        expect(rows[0]?.description).toBe("After")
      })
    )

    it.effect("should support batch updates and report affected rows", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        // Insert test data
        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const groups = yield* insert([Group.insert.make({ name: "Batch1" }), Group.insert.make({ name: "Batch2" })])

        // Test batch update
        const update = repo.update((_input) =>
          db.updateTable("group").set({ description: "Updated" }).where("name", "like", "Batch%").returningAll()
        )

        const result = yield* update(
          Group.update.make({
            id: groups[0].id,
            description: "Updated",
            name: "Updated Name"
          })
        ).result

        expect(result.rowsAffected).toBe(2)
        expect(result.results?.description).toBe("Updated")
      })
    )

    it.effect("should report zero affected rows for no-op updates", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const update = repo.update((input) =>
          db.updateTable("group").set(input).where("id", "=", input.id).returningAll()
        )

        const result = yield* update(
          Group.update.make({
            id: makeGroupId(),
            name: "Missing",
            description: "Missing"
          })
        ).result

        expect(result.rowsAffected).toBe(0)
        expect(result.results).toBeUndefined()

        const requiredError = yield* Effect.flip(
          update(
            Group.update.make({
              id: makeGroupId(),
              name: "Missing",
              description: "Missing"
            })
          ).orFail("group missing on update")
        )

        expect(requiredError).toBeInstanceOf(Cause.NoSuchElementException)
      })
    )

    it.effect("update exactlyOne enforces single-row semantics", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const groups = yield* insert([Group.insert.make({ name: "Bulk A" }), Group.insert.make({ name: "Bulk B" })])

        const updateById = repo.update((input) =>
          db.updateTable("group").set(input).where("id", "=", input.id).returningAll()
        )
        const updateMany = repo.update((_input) =>
          db.updateTable("group").set({ description: "Bulk Updated" }).where("name", "like", "Bulk%").returningAll()
        )

        const updated = yield* updateById(
          Group.update.make({
            id: groups[0]!.id,
            name: "Bulk A Updated",
            description: "Updated once"
          })
        ).exactlyOne()

        expect(updated.name).toBe("Bulk A Updated")

        const missingError = yield* Effect.flip(
          updateById(
            Group.update.make({
              id: makeGroupId(),
              name: "Missing",
              description: "Missing"
            })
          ).exactlyOne("group missing")
        )

        const multiRowError = yield* Effect.flip(
          updateMany(
            Group.update.make({
              id: groups[0]!.id,
              name: "Ignored",
              description: "Bulk Updated"
            })
          ).exactlyOne("expected single update")
        )

        expect(missingError).toBeInstanceOf(Cause.NoSuchElementException)
        expect(multiRowError).toBeInstanceOf(SqlError)
      })
    )
  })
})

describe("Production Patterns", () => {
  layer(SqliteLive)("recommended query patterns", (it) => {
    it.effect("lookup by id keeps query building in Kysely and cardinality at the repo boundary", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const created = yield* insert(
          Group.insert.make({
            name: "Lookup Group",
            description: "Queried by id"
          })
        ).exactlyOne()

        const lookup = repo.select.decode(
          Group.select.pick("id", "name", "description"),
          db.selectFrom("group").select(["id", "name", "description"]).where("id", "=", created.id)
        )

        const row = yield* lookup.exactlyOne("group must exist")
        expect(row).toEqual({
          id: created.id,
          name: "Lookup Group",
          description: "Queried by id"
        })
      })
    )

    it.effect("list queries keep many-row semantics and decode explicit projections", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase
        const memberRepo = yield* Member.repo

        const insertGroup = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const group = yield* insertGroup(Group.insert.make({ name: "List Group" })).exactlyOne()

        const insertMember = memberRepo.insert((input) => db.insertInto("member").values(input).returningAll())
        yield* insertMember([
          Member.insert.make({ groupId: group.id, email: "c@example.com" }),
          Member.insert.make({ groupId: group.id, email: "a@example.com" }),
          Member.insert.make({ groupId: group.id, email: "b@example.com" })
        ])

        const list = memberRepo.select.decode(
          Member.select.pick("email"),
          db.selectFrom("member").select("email").where("groupId", "=", group.id).orderBy("email asc").limit(2)
        )

        expect(yield* list).toEqual([{ email: "a@example.com" }, { email: "b@example.com" }])
      })
    )

    it.effect("aggregate projections stay in Kysely and decode at the result boundary", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase
        const memberRepo = yield* Member.repo

        const insertGroup = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const [alpha, beta] = yield* insertGroup([
          Group.insert.make({ name: "Alpha" }),
          Group.insert.make({ name: "Beta" })
        ])

        const insertMember = memberRepo.insert((input) => db.insertInto("member").values(input).returningAll())
        yield* insertMember([
          Member.insert.make({ groupId: alpha.id, email: "alpha-1@example.com" }),
          Member.insert.make({ groupId: alpha.id, email: "alpha-2@example.com" }),
          Member.insert.make({ groupId: beta.id, email: "beta-1@example.com" })
        ])

        const GroupMemberCount = Schema.Struct({
          id: GroupId,
          name: Schema.String,
          memberCount: Schema.Number
        })

        const summary = yield* repo.select.decode(
          GroupMemberCount,
          db
            .selectFrom("group")
            .leftJoin("member", "member.groupId", "group.id")
            .select(({ fn }) => [
              "group.id as id",
              "group.name as name",
              fn.count<number>("member.id").as("memberCount")
            ])
            .groupBy(["group.id", "group.name"])
            .orderBy("group.name asc")
        )

        expect(summary).toEqual([
          { id: alpha.id, name: "Alpha", memberCount: 2 },
          { id: beta.id, name: "Beta", memberCount: 1 }
        ])
      })
    )

    it.effect("mutation expectations split between exactlyOne and result.rowsAffected", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const groups = yield* insert([
          Group.insert.make({ name: "Mutation A" }),
          Group.insert.make({ name: "Mutation B" })
        ])

        const updateById = repo.update((input) =>
          db.updateTable("group").set(input).where("id", "=", input.id).returningAll()
        )
        const bulkArchive = repo.update((_input) =>
          db.updateTable("group").set({ description: "Archived" }).where("name", "like", "Mutation%").returningAll()
        )

        const updated = yield* updateById(
          Group.update.make({
            id: groups[0]!.id,
            name: "Mutation A Updated",
            description: "Updated once"
          })
        ).exactlyOne("group must be updated")

        const archived = yield* bulkArchive(
          Group.update.make({
            id: groups[0]!.id,
            name: "Ignored",
            description: "Archived"
          })
        ).result

        expect(updated.name).toBe("Mutation A Updated")
        expect(archived.rowsAffected).toBe(2)
        expect(archived.results?.description).toBe("Archived")
      })
    )

    it.effect("SqlResolver.findById and grouped fit stable batched read paths", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase
        const memberRepo = yield* Member.repo

        const insertGroup = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const [alpha, beta] = yield* insertGroup([
          Group.insert.make({ name: "Resolver Alpha" }),
          Group.insert.make({ name: "Resolver Beta" })
        ])

        const insertMember = memberRepo.insert((input) => db.insertInto("member").values(input).returningAll())
        yield* insertMember([
          Member.insert.make({ groupId: alpha.id, email: "alpha-1@example.com" }),
          Member.insert.make({ groupId: alpha.id, email: "alpha-2@example.com" }),
          Member.insert.make({ groupId: beta.id, email: "beta-1@example.com" })
        ])

        const findByIdCalls: Array<number> = []
        const groupedCalls: Array<number> = []

        const findGroupByName = yield* Database.resolver.findById("Group.findByName", {
          Id: Schema.String,
          Result: Group.select.pick("id", "name"),
          ResultId: (group) => group.name,
          execute: (names) => {
            findByIdCalls.push(names.length)
            return db.selectFrom("group").select(["id", "name"]).where("name", "in", names)
          }
        })

        const listMembersByGroup = yield* Database.resolver.grouped("Member.listByGroup", {
          Request: GroupId,
          RequestGroupKey: (requestId) => toIdKey(requestId),
          Result: Member.select.pick("groupId", "email"),
          ResultGroupKey: (row) => toIdKey(row.groupId),
          execute: (groupIds) => {
            groupedCalls.push(groupIds.length)
            return db.selectFrom("member").select(["groupId", "email"]).where("groupId", "in", groupIds)
          }
        })

        const lookedUp = yield* Effect.withRequestCaching(true)(
          Effect.all([findGroupByName.execute(alpha.name), findGroupByName.execute(beta.name)], {
            concurrency: "unbounded",
            batching: true
          })
        )
        const members = yield* Effect.withRequestCaching(true)(
          Effect.all([listMembersByGroup.execute(alpha.id), listMembersByGroup.execute(beta.id)], {
            concurrency: "unbounded",
            batching: true
          })
        )

        expect(findByIdCalls).toEqual([2])
        expect(groupedCalls).toEqual([2])
        expect(lookedUp.map((group) => group.pipe(Option.getOrUndefined)?.name)).toEqual([
          "Resolver Alpha",
          "Resolver Beta"
        ])
        expect(members).toEqual([
          [
            { groupId: alpha.id, email: "alpha-1@example.com" },
            { groupId: alpha.id, email: "alpha-2@example.com" }
          ],
          [{ groupId: beta.id, email: "beta-1@example.com" }]
        ])
      })
    )

    it.effect("SqlSchema.void and advanced resolvers support command-style and ordered interfaces", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        yield* insert([
          Group.insert.make({ name: "Void Alpha", description: "stale" }),
          Group.insert.make({ name: "Void Beta", description: "stale" })
        ])

        const refreshByPrefix = Database.void({
          Request: Schema.Struct({
            prefix: Schema.String,
            description: Schema.String
          }),
          execute: ({ prefix, description }) =>
            db.updateTable("group").set({ description }).where("name", "like", `${prefix}%`).returning("name")
        })

        yield* refreshByPrefix({
          prefix: "Void",
          description: "ready"
        })

        const orderedCalls: Array<number> = []
        const voidCalls: Array<number> = []

        const orderedGroups = yield* Database.resolver.ordered("Group.orderedByRequest", {
          Request: Schema.String,
          Result: Schema.Struct({ name: Schema.String }),
          execute: (names) =>
            db
              .selectFrom("group")
              .select("name")
              .where("name", "in", names)
              .pipe(
                Effect.tap(() => Effect.sync(() => orderedCalls.push(names.length))),
                Effect.map((rows) => names.map((name) => rows.find((row) => row.name === name)!))
              )
        })

        const markSeen = yield* Database.resolver.void("Group.markSeen", {
          Request: Schema.String,
          execute: (names) =>
            db
              .updateTable("group")
              .set({ description: "seen" })
              .where("name", "in", names)
              .returning("name")
              .pipe(Effect.tap(() => Effect.sync(() => voidCalls.push(names.length))))
        })

        const ordered = yield* Effect.withRequestCaching(true)(
          Effect.all([orderedGroups.execute("Void Beta"), orderedGroups.execute("Void Alpha")], {
            concurrency: "unbounded",
            batching: true
          })
        )

        yield* Effect.withRequestCaching(true)(
          Effect.all([markSeen.execute("Void Alpha"), markSeen.execute("Void Beta")], {
            concurrency: "unbounded",
            batching: true
          })
        )

        const rows = yield* db
          .selectFrom("group")
          .select(["name", "description"])
          .where("name", "like", "Void%")
          .orderBy("name asc")

        expect(orderedCalls).toEqual([2])
        expect(voidCalls).toEqual([2])
        expect(ordered).toEqual([{ name: "Void Beta" }, { name: "Void Alpha" }])
        expect(rows).toEqual([
          { name: "Void Alpha", description: "seen" },
          { name: "Void Beta", description: "seen" }
        ])
      })
    )

    it.effect("transactional services compose repo helpers and roll back on failure", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase
        const memberRepo = yield* Member.repo

        const createGroup = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const createMember = memberRepo.insert((input) => db.insertInto("member").values(input).returningAll())

        const exit = yield* Effect.exit(
          db.withTransaction(
            Effect.gen(function* () {
              const group = yield* createGroup(Group.insert.make({ name: "Transactional Group" })).exactlyOne()

              yield* createMember(
                Member.insert.make({
                  groupId: group.id,
                  email: "tx@example.com"
                })
              ).exactlyOne()

              return yield* new SqlError({ message: "force rollback", cause: new Error("force rollback") })
            })
          )
        )

        assert(Exit.isFailure(exit))
        expect(yield* db.selectFrom("group").select("name")).toEqual([])
        expect(yield* db.selectFrom("member").select("email")).toEqual([])
      })
    )

    it.effect("raw row helpers make direct deletes safe without introducing a delete DSL", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase
        const memberRepo = yield* Member.repo

        const insertGroup = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        const group = yield* insertGroup(Group.insert.make({ name: "Delete Group" })).exactlyOne()

        const insertMember = memberRepo.insert((input) => db.insertInto("member").values(input).returningAll())
        yield* insertMember([
          Member.insert.make({ groupId: group.id, email: "delete-a@example.com" }),
          Member.insert.make({ groupId: group.id, email: "delete-b@example.com" })
        ])

        const beforeDelete = yield* repo.select
          .decode(
            Schema.Struct({ count: Schema.Number }),
            db
              .selectFrom("member")
              .select(({ fn }) => [fn.count<number>("id").as("count")])
              .where("groupId", "=", group.id)
          )
          .exactlyOne()

        const bulkDeleteError = yield* Effect.flip(
          V.rows
            .decode(
              Schema.Struct({ email: Schema.String }),
              db.deleteFrom("member").where("groupId", "=", group.id).returning("email")
            )
            .exactlyOne("expected one deleted member")
        )

        const afterDelete = yield* repo.select
          .decode(
            Schema.Struct({ count: Schema.Number }),
            db
              .selectFrom("member")
              .select(({ fn }) => [fn.count<number>("id").as("count")])
              .where("groupId", "=", group.id)
          )
          .exactlyOne()

        const missingDeleteError = yield* Effect.flip(
          V.rows(db.deleteFrom("member").where("groupId", "=", group.id).returning("id")).exactlyOne(
            "member already deleted"
          )
        )

        expect(beforeDelete.count).toBe(2)
        expect(afterDelete.count).toBe(0)
        expect(bulkDeleteError).toBeInstanceOf(SqlError)
        expect(missingDeleteError).toBeInstanceOf(Cause.NoSuchElementException)
      })
    )
  })
})

describe("Utility Operations", () => {
  layer(SqliteLive)("utility operations", (it) => {
    it.effect("supports select.encode, select.codec, update.encode, and update.void in real flows", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        yield* insert([
          Group.insert.make({ name: "Alpha", description: "draft" }),
          Group.insert.make({ name: "Beta", description: "draft" }),
          Group.insert.make({ name: "Gamma", description: "done" })
        ])

        const QueryByDescription = Schema.Struct({
          description: Schema.String
        })
        const NameOnly = Schema.Struct({
          name: Schema.String
        })
        const RenameGroup = Schema.Struct({
          currentName: Schema.String,
          nextName: Schema.String
        })
        const MarkByName = Schema.Struct({
          name: Schema.String,
          description: Schema.String
        })

        const selectByDescription = repo.select.encode(QueryByDescription, (input) =>
          db.selectFrom("group").selectAll().where("description", "=", input.description).orderBy("name asc")
        )
        const listNamesByDescription = repo.select.codec(QueryByDescription, NameOnly, (input) =>
          db.selectFrom("group").select("name").where("description", "=", input.description).orderBy("name asc")
        )
        const renameByName = repo.update.encode(RenameGroup, ({ currentName, nextName }) =>
          db.updateTable("group").set({ name: nextName }).where("name", "=", currentName).returningAll()
        )
        const markByNameVoid = repo.update.encode.void(MarkByName, ({ name, description }) =>
          db.updateTable("group").set({ description }).where("name", "=", name)
        )

        const draftGroups = yield* selectByDescription({ description: "draft" })
        const draftNames = yield* listNamesByDescription({ description: "draft" })
        const renamed = yield* renameByName({ currentName: "Alpha", nextName: "Alpha Renamed" }).exactlyOne()
        yield* markByNameVoid({ name: "Beta", description: "ready" })

        expect(draftGroups.map((group) => group.name)).toEqual(["Alpha", "Beta"])
        expect(draftNames).toEqual([{ name: "Alpha" }, { name: "Beta" }])
        expect(renamed.name).toBe("Alpha Renamed")

        const updatedBeta = yield* repo
          .select(db.selectFrom("group").selectAll().where("name", "=", "Beta"))
          .exactlyOne("beta should exist")
        expect(updatedBeta.description).toBe("ready")
      })
    )

    it.effect("supports generic encode, decode, codec, and SqlSchema query helpers", () =>
      Effect.gen(function* () {
        const { db, repo } = yield* setupDatabase

        const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
        yield* insert([
          Group.insert.make({ name: "Util A", description: "util" }),
          Group.insert.make({ name: "Util B", description: "util" })
        ])

        const QueryByDescription = Schema.Struct({
          description: Schema.String
        })
        const NameOnly = Schema.Struct({
          name: Schema.String
        })

        const encodedRows = yield* V.encode(QueryByDescription, ({ description }) =>
          db.selectFrom("group").select("name").where("description", "=", description).orderBy("name asc")
        )({
          description: "util"
        })

        const decodedRow = yield* V.decode(NameOnly)(Effect.succeed({ name: "Decoded Name" }))

        const codecRows = yield* V.codec(QueryByDescription, Schema.Array(NameOnly), ({ description }) =>
          db.selectFrom("group").select("name").where("description", "=", description).orderBy("name asc")
        )({
          description: "util"
        })

        const findAllByDescription = V.findAll({
          Request: QueryByDescription,
          Result: NameOnly,
          execute: ({ description }) =>
            db.selectFrom("group").select("name").where("description", "=", description).orderBy("name asc")
        })
        const findOneByName = V.findOne({
          Request: Schema.Struct({ name: Schema.String }),
          Result: NameOnly,
          execute: ({ name }) => db.selectFrom("group").select("name").where("name", "=", name)
        })
        const singleByName = V.single({
          Request: Schema.Struct({ name: Schema.String }),
          Result: NameOnly,
          execute: ({ name }) => db.selectFrom("group").select("name").where("name", "=", name)
        })

        expect(encodedRows).toEqual([{ name: "Util A" }, { name: "Util B" }])
        expect(decodedRow).toEqual({ name: "Decoded Name" })
        expect(codecRows).toEqual([{ name: "Util A" }, { name: "Util B" }])
        expect(yield* findAllByDescription({ description: "util" })).toEqual([{ name: "Util A" }, { name: "Util B" }])
        expect(yield* findOneByName({ name: "Util A" })).toEqual(Option.some({ name: "Util A" }))
        expect(yield* singleByName({ name: "Util B" })).toEqual({ name: "Util B" })
      })
    )
  })
})
