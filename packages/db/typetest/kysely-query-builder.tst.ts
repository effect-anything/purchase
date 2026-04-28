import type { SqlError } from "@effect/sql/SqlError"
import type * as SqlResolver from "@effect/sql/SqlResolver"
import type * as Cause from "effect/Cause"
import type * as Mailbox from "effect/Mailbox"
import type * as Option from "effect/Option"
import type { ParseError } from "effect/ParseResult"
import type * as Scope from "effect/Scope"
import type * as Stream from "effect/Stream"

import * as Kysely from "@effect-x/sql-kysely/sqlite"
import * as Model from "@effect/sql/Model"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { describe, expect, test } from "tstyche"

import * as Db from "../src/kysely.ts"
import type * as Database from "../src/schema.ts"

const GroupId = Schema.Uint8ArrayFromSelf.pipe(Schema.brand("GroupId"))
const MemberId = Schema.Uint8ArrayFromSelf.pipe(Schema.brand("MemberId"))
const groupId = Schema.decodeSync(GroupId)(new Uint8Array())
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
  static repo = Db.repo(Group)
  static table = "group" as const
}

class Member extends Model.Class<Member>("Member")({
  id: Model.UuidV4Insert(MemberId),
  groupId: GroupId,
  email: Schema.NonEmptyTrimmedString,
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate
}) {
  static repo = Db.repo(Member)
  static table = "member" as const
}

const tables_ = [Group, Member] satisfies Database.Tables
type Tables = Database.TablesRecord<typeof tables_>
type TablesEncoded = Database.TablesEncoded<Tables>
type GroupRow = Schema.Schema.Type<typeof Group>
type MemberRow = Schema.Schema.Type<typeof Member>
type GroupEncodedRow = TablesEncoded["group"]
type GroupNameAndUpdatedAt = Pick<GroupRow, "name" | "updatedAt">
type GroupLookupRow = Pick<GroupRow, "id" | "name" | "description">
type MemberEmailRow = Pick<MemberRow, "email">
type JoinedRow = {
  groupName: string
  memberEmail: string
}
type JoinedNullableRow = {
  groupName: string
  memberEmail: string | null
}
type GroupMemberCountRow = {
  id: GroupRow["id"]
  name: string
  memberCount: number
}

const db = Kysely.make<TablesEncoded>()
declare const repo: Db.ModelRepo<typeof Group>
declare const memberRepo: Db.ModelRepo<typeof Member>

describe("@effect-x/db kysely query builder types", () => {
  test("query builder narrows tables and columns", () => {
    expect(db.selectFrom).type.toBeCallableWith("group")
    expect(db.selectFrom).type.not.toBeCallableWith("missing")

    const select = db.selectFrom("group").select(["id", "name", "updatedAt"])

    expect(select.where).type.toBeCallableWith("name", "=", "alpha")
    expect(select.where).type.not.toBeCallableWith("missing", "=", "alpha")
    expect(select.select).type.not.toBeCallableWith(["missing"])
  })

  test("insert builder values use encoded table types", () => {
    const insertInto = db.insertInto("group")
    const insertMemberInto = db.insertInto("member")

    expect(insertInto.values).type.toBeCallableWith({
      id: new Uint8Array(),
      name: "alpha",
      description: "",
      createdAt: "2026-04-02T00:00:00.000Z",
      updatedAt: "2026-04-02T00:00:00.000Z"
    })

    expect(insertInto.values).type.not.toBeCallableWith({
      id: "alpha",
      name: "alpha",
      description: "",
      createdAt: "2026-04-02T00:00:00.000Z",
      updatedAt: "2026-04-02T00:00:00.000Z"
    })

    expect(insertMemberInto.values).type.toBeCallableWith({
      id: new Uint8Array(),
      groupId: new Uint8Array(),
      email: "owner@example.com",
      createdAt: "2026-04-02T00:00:00.000Z",
      updatedAt: "2026-04-02T00:00:00.000Z"
    })
  })

  test("repo helpers stay aligned with query builder input and output types", () => {
    const insert = repo.insert((input) => db.insertInto("group").values(input).returningAll())
    const insertDecoded = repo.insert.decode(Group.select.pick("id"), (input) =>
      db.insertInto("group").values(input).returning("id")
    )
    const updateDecoded = repo.update.decode(Group.select.pick("name", "updatedAt"), (input) =>
      db.updateTable("group").set(input).where("id", "=", input.id).returning(["name", "updatedAt"])
    )

    expect(insert).type.toBeCallableWith(Group.insert.make({ name: "alpha" }))
    expect(insertDecoded).type.toBeCallableWith(Group.insert.make({ name: "alpha" }))
    expect(updateDecoded).type.toBeCallableWith(
      Group.update.make({
        id: groupId,
        name: "beta",
        description: "next"
      })
    )
    expect(updateDecoded).type.not.toBeCallableWith({ name: "beta" })

    const decodedEffect = updateDecoded(
      Group.update.make({
        id: groupId,
        name: "beta",
        description: "next"
      })
    )

    expect<typeof decodedEffect>().type.toBeAssignableTo<Effect.Effect<GroupNameAndUpdatedAt | undefined, any, any>>()
    expect<typeof decodedEffect>().type.not.toBeAssignableTo<
      Effect.Effect<ReadonlyArray<GroupNameAndUpdatedAt>, any, any>
    >()
    expect(decodedEffect.required).type.toBeAssignableTo<Effect.Effect<GroupNameAndUpdatedAt, any, any>>()
    expect(decodedEffect.orFail).type.toBeCallableWith("group missing")
  })

  test("joined queries keep aliased column names and joined table columns typed", () => {
    const select = db
      .selectFrom("group")
      .innerJoin("member", "member.groupId", "group.id")
      .select(["group.name as groupName", "member.email as memberEmail"])
      .where("member.email", "like", "%@example.com")

    expect(select.where).type.not.toBeCallableWith("member.unknown", "=", "value")
    expect<typeof select>().type.toBeAssignableTo<Effect.Effect<ReadonlyArray<JoinedRow>, SqlError, never>>()

    const joined = repo.select.decode(
      Schema.Struct({
        groupName: Schema.String,
        memberEmail: Schema.String
      }),
      db
        .selectFrom("group")
        .innerJoin("member", "member.groupId", "group.id")
        .select(["group.name as groupName", "member.email as memberEmail"])
        .where("group.id", "=", groupId)
    )

    expect<typeof joined>().type.toBeAssignableTo<Effect.Effect<ReadonlyArray<JoinedRow>, any, any>>()
  })

  test("table aliases and left joins preserve nullable result columns", () => {
    const aliased = db
      .selectFrom("group as g")
      .leftJoin("member as m", "m.groupId", "g.id")
      .select(["g.name as groupName", "m.email as memberEmail"])
      .where("g.name", "=", "alpha")

    expect(aliased.where).type.toBeCallableWith("m.email", "is", null)
    expect(aliased.where).type.not.toBeCallableWith("group.name", "=", "alpha")
    expect<typeof aliased>().type.toBeAssignableTo<Effect.Effect<ReadonlyArray<JoinedNullableRow>, SqlError, never>>()

    const decoded = repo.select.decode(
      Schema.Struct({
        groupName: Schema.String,
        memberEmail: Schema.NullOr(Schema.String)
      }),
      db
        .selectFrom("group as g")
        .leftJoin("member as m", "m.groupId", "g.id")
        .select(["g.name as groupName", "m.email as memberEmail"])
    )

    expect<typeof decoded>().type.toBeAssignableTo<Effect.Effect<ReadonlyArray<JoinedNullableRow>, any, any>>()
  })

  test("effectful db extensions preserve effect types", () => {
    const memberInsert = memberRepo.insert((input) => db.insertInto("member").values(input).returningAll())

    expect(memberInsert).type.toBeCallableWith(
      Member.insert.make({
        groupId,
        email: "owner@example.com"
      })
    )

    const transactional = db.withTransaction(
      repo.insert((input) => db.insertInto("group").values(input).returningAll())(Group.insert.make({ name: "alpha" }))
    )
    const reactive = db.reactive(["group", groupId], db.selectFrom("group").selectAll())
    const mailbox = db.reactiveMailbox(["group", groupId], db.selectFrom("group").selectAll())

    expect<typeof transactional>().type.toBeAssignableTo<
      Effect.Effect<GroupRow | undefined, SqlError | ParseError, never>
    >()
    expect<typeof reactive>().type.toBeAssignableTo<Stream.Stream<ReadonlyArray<GroupEncodedRow>, SqlError, never>>()
    expect<typeof mailbox>().type.toBeAssignableTo<
      Effect.Effect<Mailbox.ReadonlyMailbox<ReadonlyArray<GroupEncodedRow>, SqlError>, never, Scope.Scope>
    >()
  })

  test("safe row helpers expose intuitive error-aware contracts", () => {
    const selected = repo.select(db.selectFrom("group").selectAll())
    const inserted = repo.insert((input) => db.insertInto("group").values(input).returningAll())(
      Group.insert.make({ name: "alpha" })
    )

    expect(selected.first).type.toBeAssignableTo<Effect.Effect<Option.Option<GroupRow>, SqlError | ParseError, never>>()
    expect(selected.firstOrFail).type.toBeCallableWith("group missing")
    expect(selected.exactlyOne).type.toBeCallableWith("expected single group")
    expect(inserted.exactlyOne).type.toBeCallableWith("expected exactly one inserted group")

    const firstOrFail = selected.firstOrFail("group missing")
    const exactlyOne = selected.exactlyOne("expected single group")
    const insertedExactlyOne = inserted.exactlyOne("expected exactly one inserted group")
    const updated = repo.update((input) =>
      db.updateTable("group").set(input).where("id", "=", input.id).returningAll()
    )(
      Group.update.make({
        id: groupId,
        name: "beta",
        description: "next"
      })
    )

    expect<typeof firstOrFail>().type.toBeAssignableTo<
      Effect.Effect<GroupRow, SqlError | ParseError | Cause.NoSuchElementException, never>
    >()
    expect<typeof exactlyOne>().type.toBeAssignableTo<
      Effect.Effect<GroupRow, SqlError | ParseError | Cause.NoSuchElementException, never>
    >()
    expect(updated.required).type.toBeAssignableTo<
      Effect.Effect<GroupRow, SqlError | ParseError | Cause.NoSuchElementException, never>
    >()
    expect(updated.orFail).type.toBeCallableWith("group missing on update")
    expect(updated.exactlyOne).type.toBeCallableWith("group missing on exact update")
    expect<typeof insertedExactlyOne>().type.toBeAssignableTo<
      Effect.Effect<GroupRow, SqlError | ParseError | Cause.NoSuchElementException, never>
    >()
    expect(updated.exactlyOne("group missing on exact update")).type.toBeAssignableTo<
      Effect.Effect<GroupRow, SqlError | ParseError | Cause.NoSuchElementException, never>
    >()
  })

  test("recommended production patterns keep Kysely expressive and repo boundaries explicit", () => {
    const lookup = repo.select.decode(
      Group.select.pick("id", "name", "description"),
      db.selectFrom("group").select(["id", "name", "description"]).where("id", "=", groupId)
    )
    const list = memberRepo.select.decode(
      Member.select.pick("email"),
      db.selectFrom("member").select("email").where("groupId", "=", groupId).orderBy("email asc").limit(20)
    )
    const aggregate = repo.select.decode(
      Schema.Struct({
        id: GroupId,
        name: Schema.String,
        memberCount: Schema.Number
      }),
      db
        .selectFrom("group")
        .leftJoin("member", "member.groupId", "group.id")
        .select(({ fn }) => ["group.id as id", "group.name as name", fn.count<number>("member.id").as("memberCount")])
        .groupBy(["group.id", "group.name"])
    )
    const lookupExactlyOne = lookup.exactlyOne("group must exist")

    expect<typeof lookup>().type.toBeAssignableTo<Effect.Effect<ReadonlyArray<GroupLookupRow>, any, any>>()
    expect<typeof lookupExactlyOne>().type.toBeAssignableTo<
      Effect.Effect<GroupLookupRow, SqlError | ParseError | Cause.NoSuchElementException, never>
    >()
    expect<typeof list>().type.toBeAssignableTo<Effect.Effect<ReadonlyArray<MemberEmailRow>, any, any>>()
    expect<typeof aggregate>().type.toBeAssignableTo<Effect.Effect<ReadonlyArray<GroupMemberCountRow>, any, any>>()
  })

  test("stable resolver interfaces stay request-shaped and batch-friendly", () => {
    const findGroupByName = Db.resolver.findById("Group.findByName", {
      Id: Schema.String,
      Result: Group.select.pick("id", "name"),
      ResultId: (group) => group.name,
      execute: (names) => db.selectFrom("group").select(["id", "name"]).where("name", "in", names)
    })
    const listMembersByGroup = Db.resolver.grouped("Member.listByGroup", {
      Request: GroupId,
      RequestGroupKey: (requestId) => toIdKey(requestId),
      Result: Member.select.pick("groupId", "email"),
      ResultGroupKey: (row) => toIdKey(row.groupId),
      execute: (groupIds) => db.selectFrom("member").select(["groupId", "email"]).where("groupId", "in", groupIds)
    })

    expect<typeof findGroupByName>().type.toBeAssignableTo<
      Effect.Effect<
        SqlResolver.SqlResolver<
          "Group.findByName",
          string,
          Option.Option<Pick<GroupRow, "id" | "name">>,
          SqlError,
          never
        >
      >
    >()
    expect<typeof listMembersByGroup>().type.toBeAssignableTo<
      Effect.Effect<
        SqlResolver.SqlResolver<
          "Member.listByGroup",
          GroupRow["id"],
          Array<Pick<MemberRow, "groupId" | "email">>,
          SqlError,
          never
        >
      >
    >()
  })

  test("rows helper adds cardinality contracts to raw row-returning effects", () => {
    const deletedMembers = Db.rows.decode(
      Schema.Struct({ email: Schema.String }),
      db.deleteFrom("member").where("groupId", "=", groupId).returning("email")
    )
    const deletedMember = deletedMembers.exactlyOne("expected one deleted member")
    const deletedRaw = Db.rows(db.deleteFrom("group").where("id", "=", groupId).returning(["id", "name"]))

    expect<typeof deletedMembers>().type.toBeAssignableTo<
      Effect.Effect<ReadonlyArray<{ email: string }>, SqlError | ParseError, never>
    >()
    expect<typeof deletedMember>().type.toBeAssignableTo<
      Effect.Effect<{ email: string }, SqlError | ParseError | Cause.NoSuchElementException, never>
    >()
    expect(deletedRaw.firstOrFail).type.toBeCallableWith("group missing")
  })

  test("SqlSchema void and advanced resolver helpers keep command and ordered use cases typed", () => {
    const refreshByPrefix = Db.void({
      Request: Schema.Struct({
        prefix: Schema.String,
        description: Schema.String
      }),
      execute: ({ prefix, description }) =>
        db.updateTable("group").set({ description }).where("name", "like", `${prefix}%`).returning("name")
    })
    const orderedGroups = Db.resolver.ordered("Group.orderedByRequest", {
      Request: Schema.String,
      Result: Schema.Struct({ name: Schema.String }),
      execute: (names) =>
        db
          .selectFrom("group")
          .select("name")
          .where("name", "in", names)
          .pipe(Effect.map((rows) => names.map((name) => rows.find((row) => row.name === name)!)))
    })
    const markSeen = Db.resolver.void("Group.markSeen", {
      Request: Schema.String,
      execute: (names) =>
        db.updateTable("group").set({ description: "seen" }).where("name", "in", names).returning("name")
    })

    expect(refreshByPrefix).type.toBeCallableWith({
      prefix: "Void",
      description: "ready"
    })

    const refreshEffect_ = refreshByPrefix({
      prefix: "Void",
      description: "ready"
    })

    expect<typeof refreshEffect_>().type.toBeAssignableTo<Effect.Effect<void, SqlError | ParseError, never>>()
    expect<typeof orderedGroups>().type.toBeAssignableTo<
      Effect.Effect<SqlResolver.SqlResolver<"Group.orderedByRequest", string, { name: string }, any, never>>
    >()
    expect<typeof markSeen>().type.toBeAssignableTo<
      Effect.Effect<SqlResolver.SqlResolver<"Group.markSeen", string, void, SqlError, never>>
    >()
  })

  test("secondary helper APIs stay typed for operation-shaped requests", () => {
    const QueryByDescription = Schema.Struct({
      description: Schema.String
    })
    const QueryByLimit = Schema.Struct({
      limit: Schema.NumberFromString
    })
    const NameOnly = Schema.Struct({
      name: Schema.String
    })
    const RenameGroup = Schema.Struct({
      currentName: Schema.String,
      nextName: Schema.String
    })

    const selectEncoded = repo.select.encode(QueryByDescription, (input) =>
      db.selectFrom("group").selectAll().where("description", "=", input.description)
    )
    const selectCodec = repo.select.codec(QueryByDescription, NameOnly, (input) =>
      db.selectFrom("group").select("name").where("description", "=", input.description)
    )
    const selectCodecWithTransform = repo.select.codec(QueryByLimit, NameOnly, ({ limit }) =>
      db.selectFrom("group").select("name").limit(Number(limit))
    )
    const updateEncoded = repo.update.encode(RenameGroup, ({ currentName, nextName }) =>
      db.updateTable("group").set({ name: nextName }).where("name", "=", currentName).returningAll()
    )
    const updateEncodedVoid = repo.update.encode.void(RenameGroup, ({ currentName, nextName }) =>
      db.updateTable("group").set({ name: nextName }).where("name", "=", currentName)
    )
    const encodedEffect = Db.encode(QueryByDescription, ({ description }) =>
      db.selectFrom("group").select("name").where("description", "=", description)
    )
    const decodedEffect = Db.decode(NameOnly, Effect.succeed({ name: "alpha" }))
    const decodedRowsEffect = Db.decode(Schema.Array(NameOnly), Effect.succeed([{ name: "alpha" }]))
    const codecEffect = Db.codec(QueryByDescription, Schema.Array(NameOnly), ({ description }) =>
      db.selectFrom("group").select("name").where("description", "=", description)
    )
    const findAllByDescription = Db.findAll({
      Request: QueryByDescription,
      Result: NameOnly,
      execute: ({ description }) => db.selectFrom("group").select("name").where("description", "=", description)
    })
    const findOneByName = Db.findOne({
      Request: Schema.Struct({ name: Schema.String }),
      Result: NameOnly,
      execute: ({ name }) => db.selectFrom("group").select("name").where("name", "=", name)
    })
    const singleByName = Db.single({
      Request: Schema.Struct({ name: Schema.String }),
      Result: NameOnly,
      execute: ({ name }) => db.selectFrom("group").select("name").where("name", "=", name)
    })

    expect(selectEncoded).type.toBeCallableWith({ description: "draft" })
    expect(selectCodec).type.toBeCallableWith({ description: "draft" })
    expect(selectCodecWithTransform).type.toBeCallableWith({ limit: 1 })
    expect(selectCodecWithTransform).type.not.toBeCallableWith({ limit: "1" })
    expect(updateEncoded).type.toBeCallableWith({ currentName: "alpha", nextName: "beta" })
    expect(updateEncodedVoid).type.toBeCallableWith({ currentName: "alpha", nextName: "beta" })
    expect(encodedEffect).type.toBeCallableWith({ description: "draft" })
    expect(codecEffect).type.toBeCallableWith({ description: "draft" })
    expect(findAllByDescription).type.toBeCallableWith({ description: "draft" })
    expect(findOneByName).type.toBeCallableWith({ name: "alpha" })
    expect(singleByName).type.toBeCallableWith({ name: "alpha" })

    const selectEncodedEffect_ = selectEncoded({ description: "draft" })
    const selectCodecEffect_ = selectCodec({ description: "draft" })
    const updateEncodedEffect_ = updateEncoded({ currentName: "alpha", nextName: "beta" })
    const updateEncodedExactlyOne_ = updateEncodedEffect_.exactlyOne("rename failed")
    const updateEncodedVoidEffect_ = updateEncodedVoid({ currentName: "alpha", nextName: "beta" })
    const encodedEffect_ = encodedEffect({ description: "draft" })
    const codecEffect_ = codecEffect({ description: "draft" })
    const findAllEffect_ = findAllByDescription({ description: "draft" })
    const findOneEffect_ = findOneByName({ name: "alpha" })
    const singleEffect_ = singleByName({ name: "alpha" })

    expect<typeof selectEncodedEffect_>().type.toBeAssignableTo<
      Effect.Effect<ReadonlyArray<GroupRow>, SqlError | ParseError, never>
    >()
    expect<typeof selectCodecEffect_>().type.toBeAssignableTo<
      Effect.Effect<ReadonlyArray<{ name: string }>, SqlError | ParseError, never>
    >()
    expect<typeof updateEncodedExactlyOne_>().type.toBeAssignableTo<
      Effect.Effect<GroupRow, SqlError | ParseError | Cause.NoSuchElementException, never>
    >()
    expect<typeof updateEncodedVoidEffect_>().type.toBeAssignableTo<Effect.Effect<void, SqlError | ParseError, never>>()
    expect<typeof encodedEffect_>().type.toBeAssignableTo<
      Effect.Effect<ReadonlyArray<{ name: string }>, SqlError | ParseError, never>
    >()
    expect<typeof decodedEffect>().type.toBeAssignableTo<Effect.Effect<{ name: string }, ParseError, never>>()
    expect<typeof decodedRowsEffect>().type.toBeAssignableTo<
      Effect.Effect<ReadonlyArray<{ name: string }>, ParseError, never>
    >()
    expect<typeof codecEffect_>().type.toBeAssignableTo<
      Effect.Effect<ReadonlyArray<{ name: string }>, SqlError | ParseError, never>
    >()
    expect<typeof findAllEffect_>().type.toBeAssignableTo<
      Effect.Effect<ReadonlyArray<{ name: string }>, ParseError | SqlError, never>
    >()
    expect<typeof findOneEffect_>().type.toBeAssignableTo<
      Effect.Effect<Option.Option<{ name: string }>, ParseError | SqlError, never>
    >()
    expect<typeof singleEffect_>().type.toBeAssignableTo<Effect.Effect<{ name: string }, any, never>>()
  })
})
