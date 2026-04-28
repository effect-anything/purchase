import * as SqliteClient from "@effect-x/sql-sqlite/client"
import * as SqliteWorkerPool from "@effect-x/sql-sqlite/pool"
import * as FxWorkerPool from "@effect-x/fx/worker/pool"
import * as Reactivity from "@effect/experimental/Reactivity"
import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, it } from "@effect/vitest"
import { Context, Effect, Exit, Fiber, Layer, Logger, LogLevel, pipe, Schedule, Scope, Stream } from "effect"

const describeBrowser = typeof window === "undefined" ? describe.skip : describe

const realDelay = (ms: number) => Effect.promise(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

const makeRows = (start: number, count: number, source: string) =>
  Array.from({ length: count }, (_, index) => ({
    id: start + index,
    source
  }))

const insertRows = (
  sql: SqlClient.SqlClient,
  table: string,
  rows: ReadonlyArray<{
    readonly id: number
    readonly source: string
  }>
) =>
  sql.withTransaction(
    Effect.forEach(
      rows,
      ({ id, source }) => sql.unsafe(`INSERT INTO ${table} (id, source) VALUES (?, ?)`, [id, source]).withoutTransform,
      { discard: true }
    )
  )

const readRows = (sql: SqlClient.SqlClient, table: string) =>
  sql.unsafe(`SELECT id, source FROM ${table} ORDER BY id ASC`).withoutTransform

const makeBrowserSqliteLayerWithOptions = (
  dbName: string,
  options: {
    fkEnabled?: boolean
  }
) =>
  pipe(
    SqliteClient.layer(),
    Layer.provide(
      Layer.scoped(
        SqliteWorkerPool.WorkerPool,
        FxWorkerPool.make({
          size: 1,
          concurrency: 99,
          workerFactory: () => {
            const url = new URL("./fixtures/sqlite-browser-worker.ts", import.meta.url)
            url.searchParams.set("dbName", dbName)
            if (options.fkEnabled === true) {
              url.searchParams.set("fkEnabled", "1")
            }
            return new Worker(url, { type: "module" })
          }
        }) as Effect.Effect<SqliteWorkerPool.WorkerPoolEvent>
      )
    ),
    Layer.provide([Reactivity.layer, Logger.minimumLogLevel(LogLevel.All)]),
    Layer.orDie,
    Layer.tapErrorCause(Effect.logError)
  )

const makeScopedClient = Effect.fn(function* (
  parentScope: Scope.Scope,
  dbName: string,
  options: {
    fkEnabled?: boolean
  } = {}
) {
  const childScope = yield* Scope.fork(parentScope, parentScope.strategy)

  const context = yield* Layer.buildWithScope(makeBrowserSqliteLayerWithOptions(dbName, options), childScope)

  return {
    scope: childScope,
    sql: Context.get(context, SqlClient.SqlClient)
  }
})

const makeClientPair = Effect.fn(function* (dbName: string) {
  const scope = yield* Effect.scope
  const mainClient = yield* makeScopedClient(scope, dbName)
  const peerClient = yield* makeScopedClient(scope, dbName)

  return {
    mainScope: mainClient.scope,
    mainSql: mainClient.sql,
    peerScope: peerClient.scope,
    peerSql: peerClient.sql
  }
})

describeBrowser("sqlite client browser two-tab lock behavior", () => {
  describe("layer", () => {
    it.scoped(
      "keeps two worker-backed clients on the same db in sync while both tabs are open",
      () =>
        Effect.gen(function* () {
          const { mainSql, peerSql } = yield* makeClientPair(`sbl-${crypto.randomUUID().slice(0, 8)}`)

          const mainRows = makeRows(1, 32, "main")
          const peerRows = makeRows(mainRows.length + 1, 24, "peer")

          yield* mainSql.unsafe("CREATE TABLE IF NOT EXISTS tabs (id INTEGER PRIMARY KEY, source TEXT NOT NULL)")
            .withoutTransform
          yield* insertRows(mainSql, "tabs", mainRows)
          const peerSeesMain = yield* readRows(peerSql, "tabs")
          yield* insertRows(peerSql, "tabs", peerRows)
          const mainSeesPeer = yield* readRows(mainSql, "tabs")
          expect(peerSeesMain).toEqual(mainRows)
          expect(mainSeesPeer).toEqual([...mainRows, ...peerRows])
          expect(mainSeesPeer[0]).toEqual(mainRows[0])
          expect(mainSeesPeer[31]).toEqual(mainRows[31])
          expect(mainSeesPeer[32]).toEqual(peerRows[0])
          expect(mainSeesPeer[55]).toEqual(peerRows[23])
        }),
      { timeout: 15_000 }
    )

    it.scoped("continues serving the second tab after the first tab scope closes and the lock hands off", () =>
      Effect.gen(function* () {
        const { mainScope, mainSql, peerSql } = yield* makeClientPair(`sbh-${crypto.randomUUID().slice(0, 8)}`)
        const beforeCloseRows = makeRows(1, 24, "before-close")
        const afterCloseRows = makeRows(beforeCloseRows.length + 1, 24, "after-close")

        yield* mainSql.unsafe("CREATE TABLE IF NOT EXISTS handoff_tabs (id INTEGER PRIMARY KEY, source TEXT NOT NULL)")
          .withoutTransform
        yield* insertRows(mainSql, "handoff_tabs", beforeCloseRows)

        const peerBeforeClose = yield* readRows(peerSql, "handoff_tabs")

        const closeFiber = yield* Effect.forkScoped(Scope.close(mainScope, Exit.void))
        yield* realDelay(200)

        yield* peerSql.withTransaction(
          Effect.forEach(
            afterCloseRows,
            ({ id, source }) =>
              peerSql
                .unsafe("INSERT INTO handoff_tabs (id, source) VALUES (?, ?)", [id, source])
                .withoutTransform.pipe(Effect.retry(Schedule.recurs(20))),
            { discard: true }
          )
        )

        const peerAfterClose = yield* readRows(peerSql, "handoff_tabs")

        yield* Fiber.await(closeFiber)

        expect(peerBeforeClose).toEqual(beforeCloseRows)
        expect(peerAfterClose).toEqual([...beforeCloseRows, ...afterCloseRows])
        expect(peerAfterClose[0]).toEqual(beforeCloseRows[0])
        expect(peerAfterClose[23]).toEqual(beforeCloseRows[23])
        expect(peerAfterClose[24]).toEqual(afterCloseRows[0])
        expect(peerAfterClose[47]).toEqual(afterCloseRows[23])
      })
    )

    it.scoped("serves streamed queries through the relay client before handoff and after promotion", () =>
      Effect.gen(function* () {
        const { mainScope, mainSql, peerSql } = yield* makeClientPair(`sbs-${crypto.randomUUID().slice(0, 8)}`)
        const initialRows = makeRows(1, 128, "main")
        const promotedRows = makeRows(initialRows.length + 1, 64, "peer")

        yield* mainSql.unsafe("CREATE TABLE IF NOT EXISTS stream_tabs (id INTEGER PRIMARY KEY, source TEXT NOT NULL)")
          .withoutTransform

        yield* insertRows(mainSql, "stream_tabs", initialRows)

        const peerBeforeClose = yield* Stream.runCollect(
          peerSql.unsafe("SELECT id, source FROM stream_tabs ORDER BY id ASC").stream
        )

        const closeFiber = yield* Effect.forkScoped(Scope.close(mainScope, Exit.void))
        yield* realDelay(200)

        yield* peerSql.withTransaction(
          Effect.forEach(
            promotedRows,
            ({ id, source }) =>
              peerSql
                .unsafe("INSERT INTO stream_tabs (id, source) VALUES (?, ?)", [id, source])
                .withoutTransform.pipe(Effect.retry(Schedule.recurs(20))),
            { discard: true }
          )
        )

        const peerAfterClose = yield* Stream.runCollect(
          peerSql.unsafe("SELECT id, source FROM stream_tabs ORDER BY id ASC").stream
        )

        yield* Fiber.await(closeFiber)

        const beforeRows = Array.from(peerBeforeClose)
        const afterRows = Array.from(peerAfterClose)

        expect(beforeRows).toEqual(initialRows)
        expect(afterRows).toEqual([...initialRows, ...promotedRows])
        expect(afterRows[0]).toEqual(initialRows[0])
        expect(afterRows[127]).toEqual(initialRows[127])
        expect(afterRows[128]).toEqual(promotedRows[0])
        expect(afterRows[191]).toEqual(promotedRows[63])
      })
    )

    it.scoped("does not let follower startup rewrite main connection pragmas", () =>
      Effect.gen(function* () {
        const scope = yield* Effect.scope
        const dbName = `sbfk-${crypto.randomUUID().slice(0, 8)}`
        const mainClient = yield* makeScopedClient(scope, dbName, { fkEnabled: false })

        const beforeFollower = yield* mainClient.sql.unsafe("PRAGMA foreign_keys;").values
        expect(beforeFollower).toEqual([[0]])

        const peerClient = yield* makeScopedClient(scope, dbName, { fkEnabled: true })
        yield* peerClient.sql.unsafe("SELECT 1").withoutTransform
        yield* realDelay(200)

        const afterFollower = yield* mainClient.sql.unsafe("PRAGMA foreign_keys;").values

        expect(afterFollower).toEqual([[0]])
      })
    )
  })

  // it.scoped('survives repeated promotion cycles with fresh follower tabs and full stream verification', () =>
  //   Effect.gen(function* () {
  //     const scope = yield* Effect.scope
  //     const dbName = `sbm-${crypto.randomUUID().slice(0, 8)}`
  //     const initialRows = makeRows(1, 64, 'main')
  //     const promotedRows = makeRows(initialRows.length + 1, 48, 'peer')
  //     const restartRows = makeRows(initialRows.length + promotedRows.length + 1, 40, 'restart')

  //     const mainClient = yield* makeScopedClient(scope, dbName)
  //     const promotedClient = yield* makeScopedClient(scope, dbName)

  //     yield* mainClient.sql.unsafe(
  //       'CREATE TABLE IF NOT EXISTS multi_handoff_tabs (id INTEGER PRIMARY KEY, source TEXT NOT NULL)',
  //     ).withoutTransform
  //     yield* insertRows(mainClient.sql, 'multi_handoff_tabs', initialRows)

  //     const followerBeforePromotion = Array.from(
  //       yield* Stream.runCollect(
  //         promotedClient.sql.unsafe('SELECT id, source FROM multi_handoff_tabs ORDER BY id ASC').stream,
  //       ),
  //     )
  //     expect(followerBeforePromotion).toEqual(initialRows)

  //     const closeMainFiber = yield* Effect.forkScoped(Scope.close(mainClient.scope, Exit.void))
  //     yield* realDelay(200)

  //     yield* promotedClient.sql.withTransaction(
  //       Effect.forEach(
  //         promotedRows,
  //         ({ id, source }) =>
  //           promotedClient.sql
  //             .unsafe('INSERT INTO multi_handoff_tabs (id, source) VALUES (?, ?)', [id, source])
  //             .withoutTransform.pipe(Effect.retry(Schedule.recurs(20))),
  //         { discard: true },
  //       ),
  //     )

  //     const afterFirstPromotion = Array.from(
  //       yield* Stream.runCollect(
  //         promotedClient.sql.unsafe('SELECT id, source FROM multi_handoff_tabs ORDER BY id ASC').stream,
  //       ),
  //     )
  //     yield* Fiber.await(closeMainFiber)
  //     expect(afterFirstPromotion).toEqual([...initialRows, ...promotedRows])

  //     const restartClient = yield* makeScopedClient(scope, dbName)
  //     const restartSeesPromotedMain = Array.from(
  //       yield* Stream.runCollect(
  //         restartClient.sql.unsafe('SELECT id, source FROM multi_handoff_tabs ORDER BY id ASC').stream,
  //       ),
  //     )
  //     expect(restartSeesPromotedMain).toEqual(afterFirstPromotion)

  //     const closePromotedFiber = yield* Effect.forkScoped(Scope.close(promotedClient.scope, Exit.void))
  //     yield* realDelay(200)

  //     yield* restartClient.sql.withTransaction(
  //       Effect.forEach(
  //         restartRows,
  //         ({ id, source }) =>
  //           restartClient.sql
  //             .unsafe('INSERT INTO multi_handoff_tabs (id, source) VALUES (?, ?)', [id, source])
  //             .withoutTransform.pipe(Effect.retry(Schedule.recurs(20))),
  //         { discard: true },
  //       ),
  //     )

  //     const afterSecondPromotion = Array.from(
  //       yield* Stream.runCollect(
  //         restartClient.sql.unsafe('SELECT id, source FROM multi_handoff_tabs ORDER BY id ASC').stream,
  //       ),
  //     )

  //     yield* Fiber.await(closePromotedFiber)

  //     expect(afterSecondPromotion).toEqual([...initialRows, ...promotedRows, ...restartRows])
  //     expect(afterSecondPromotion[0]).toEqual(initialRows[0])
  //     expect(afterSecondPromotion[63]).toEqual(initialRows[63])
  //     expect(afterSecondPromotion[64]).toEqual(promotedRows[0])
  //     expect(afterSecondPromotion[111]).toEqual(promotedRows[47])
  //     expect(afterSecondPromotion[112]).toEqual(restartRows[0])
  //     expect(afterSecondPromotion[151]).toEqual(restartRows[39])
  //   }),
  // )
})
