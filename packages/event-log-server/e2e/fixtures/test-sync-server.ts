import { CryptoLive } from "@effect-x/event-log/CryptoWeb"
import * as EventLog from "@effect-x/event-log/EventLog"
import * as EventLogAudit from "@effect-x/event-log/EventLogAudit"
import * as EventLogConfig from "@effect-x/event-log/EventLogConfig"
import * as EventLogDaemon from "@effect-x/event-log/EventLogDaemon"
import * as EventLogEncryption from "@effect-x/event-log/EventLogEncryption"
import * as EventLogPlatformEffects from "@effect-x/event-log/EventLogPlatformEffects"
import * as EventLogRemoteSocket from "@effect-x/event-log/EventLogRemoteSocket"
import * as EventLogStates from "@effect-x/event-log/EventLogStates"
import * as Events from "@effect-x/event-log/Events"
import * as Identity from "@effect-x/event-log/Identity"
import * as IdentityStorage from "@effect-x/event-log/IdentityStorage"
import { Default as IdentityLayer } from "@effect-x/event-log/IdentityWorker"
import { WorkerSession, WorkerSessionLayer } from "@effect-x/event-log/Session"
import * as SqlEventJournal from "@effect-x/event-log/SqlEventJournal"
import * as Reactivity from "@effect/experimental/Reactivity"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as NodeSqliteClient from "@effect/sql-sqlite-node/SqliteClient"
import { Config, ConfigProvider, Effect, Layer, Option, pipe, Redacted, Stream, String } from "effect"
import { resolve } from "node:path"

import { ClientEvents } from "./test-events.ts"

const cwd = import.meta.dirname

const SqliteLive = NodeSqliteClient.layerConfig({
  filename: Config.succeed(resolve(cwd, ".miniflare-cache/client.sqlite")),
  // filename: Config.succeed(":memory:"),
  disableWAL: Config.succeed(true),
  transformQueryNames: Config.succeed(String.camelToSnake),
  transformResultNames: Config.succeed(String.snakeToCamel)
})

const DBLive = SqliteLive.pipe(Layer.provide(Reactivity.layer), Layer.orDie)

const IdentityLive = IdentityLayer.pipe(Layer.provide([CryptoLive, IdentityStorage.Memory, FetchHttpClient.layer]))

const EventLogEncryptionLive = EventLogEncryption.layerSubtle.pipe(Layer.provide(CryptoLive))

const SqlEventJournalLive = SqlEventJournal.layer({ sqlBatchSize: 64 })

const EventLogLayer = EventLog.layer.pipe(
  Layer.provide([Events.register(ClientEvents), SqlEventJournalLive]),
  Layer.provide([Reactivity.layer, DBLive])
)

const EventLogStatesLive = pipe(
  Layer.mergeAll(EventLogStates.EventLogStatesLive, EventLogAudit.EventLogAudit.Default),
  Layer.provide([EventLogLayer, IdentityLive, Reactivity.layer, DBLive])
)

const PlatformEffectsLive = EventLogPlatformEffects.Noop

const EventLogLive = pipe(
  Layer.mergeAll(
    EventLogRemoteSocket.layerWebSocketBrowser(
      Effect.gen(function* () {
        const { namespace, syncUrl } = yield* EventLogConfig.EventLogConfig.pipe(Effect.orDie)
        const identity = yield* Identity.Identity
        const session = yield* WorkerSession

        return pipe(
          Stream.zipLatestAll(session.changes, identity.publicKeyStream),
          Stream.map(([token, publicKey]) =>
            pipe(
              token,
              Option.map((sessionToken) => btoa(`${namespace}:${publicKey}:${Redacted.value(sessionToken)}`)),
              Option.map((query) => `${syncUrl.replace(/^https?/, "ws")}?q=${query}`)
            )
          )
        )
      }).pipe(Effect.provide(WorkerSessionLayer))
    ),
    EventLogDaemon.EventLogDaemonLayer.pipe(Layer.provide(PlatformEffectsLive))
  ),
  Layer.provide([IdentityLive, EventLogEncryptionLive, EventLogStatesLive]),
  Layer.provideMerge(EventLogLayer),
  Layer.provide([Reactivity.layer, DBLive])
)

//
const Live = Layer.mergeAll(Reactivity.layer, DBLive, IdentityLive, EventLogLive, EventLogStatesLive).pipe(
  Layer.tapErrorCause(Effect.logError),
  Layer.provide(
    Layer.setConfigProvider(
      ConfigProvider.fromJson({
        NAMESPACE: "template",
        SYNC: {
          URL: "http://127.0.0.1:5999/sync"
        }
      })
    )
  )
)
void Live

//
const TestMnemonic = Redacted.make("they sea craft payment ticket bind vague believe visit lady knife fox")
void TestMnemonic
//
const TestToken = Redacted.make("7w3jnwsw3j24xsvvxfvssk6pxuhcuwiut5u5hudc")
void TestToken

//
const program = Effect.never
void program
// const miniflare = yield* Miniflare
// const _url = miniflare.url

// const sql = yield* SqlClient.SqlClient
// const identity = yield* Identity.Identity
// const _eventLog = yield* EventLog.EventLog

// const tables = yield* sql<{ name: string }>`SELECT name FROM sqlite_master WHERE type='table'`
// yield* Effect.forEach(tables, (table) => sql`DELETE FROM ${sql(table.name)}`, { discard: true })

// yield* SubscriptionRef.set(GlobalAccessToken, Option.some(TestToken))

// yield* identity.importFromMnemonic(TestMnemonic)

// yield* ClientEvents.trigger('SetName', { name: 'Ray' })
// yield* ClientEvents.trigger("SetName", { name: "A" })
// yield* ClientEvents.trigger("SetName", { name: "B" })
