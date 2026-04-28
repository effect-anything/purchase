/// <reference types="@cloudflare/workers-types" />

import type * as EventJournal from "@effect-x/event-log/EventJournal"
import type { RemoteId } from "@effect-x/event-log/EventJournal"
import type { EventEmitter } from "@effect-x/event-log/Utils"
import type * as Scope from "effect/Scope"
import type { Mutable } from "effect/Types"

import * as CloudflareBindings from "@effect-x/cloudflare/bindings"
import * as CacheStorage from "@effect-x/cloudflare/cache-storage"
import { makeConfigProvider } from "@effect-x/cloudflare/config-provider"
import * as CloudflareContext from "@effect-x/cloudflare/execution-context"
import * as RpcServer from "@effect-x/cloudflare/rpc-server"
import * as DurableObjectUtils from "./DurableObjectUtils.ts"
import { SerializationLive, SyncAgentClientRpcs } from "./Rpc/SyncAgentClient.ts"
import { SyncServerClient, SyncServerConfig } from "./Rpc/SyncServer.ts"
import { SqlProxyLive, SyncStorageProxyConfig } from "./Rpc/SyncStorageProxy.ts"
import { CryptoLive } from "@effect-x/event-log/CryptoWeb"
import { SettingsEvents } from "@effect-x/event-log/DefaultEvents/Settings"
import * as EventLog from "@effect-x/event-log/EventLog"
import * as EventLogConfig from "@effect-x/event-log/EventLogConfig"
import * as EventLogEncryption from "@effect-x/event-log/EventLogEncryption"
import * as EventLogRemote from "@effect-x/event-log/EventLogRemote"
import * as EventLogStatesWorker from "@effect-x/event-log/EventLogStatesWorker"
import * as Events from "@effect-x/event-log/Events"
import * as Identity from "@effect-x/event-log/Identity"
import * as IdentityStorage from "@effect-x/event-log/IdentityStorage"
import { Default as IdentityLayer } from "@effect-x/event-log/IdentityWorker"
import * as Migrator from "@effect-x/event-log/Migrator"
import * as SqlEventJournal from "@effect-x/event-log/SqlEventJournal"
import * as Utils from "@effect-x/event-log/Utils"
import { LoggerLive, withGlobalLogLevel } from "@effect-x/server/logger"
import * as Reactivity from "@effect/experimental/Reactivity"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as SqlDo from "@effect/sql-sqlite-do/SqliteClient"
import { DurableObject } from "cloudflare:workers"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import { flow, pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as ManagedRuntime from "effect/ManagedRuntime"
import * as Option from "effect/Option"
import * as ParseResult from "effect/ParseResult"
import * as Runtime from "effect/Runtime"
import * as Schema from "effect/Schema"
import * as String from "effect/String"

type Handle = (
  onRequest: (remoteId: typeof EventJournal.RemoteId.Type, chunk: Uint8Array<ArrayBufferLike>) => Effect.Effect<void>
) => Effect.Effect<void, never, Scope.Scope>

export class SynAgentClientServerDataSources extends Context.Tag("@effect-x/event-log/SynAgentClientServerDataSources")<
  SynAgentClientServerDataSources,
  Handle
>() {
  static fromEmitter(emitter: EventEmitter) {
    return Layer.scoped(
      this,
      Effect.gen(function* () {
        const handle = Effect.fnUntraced(function* (
          onRequest: (
            remoteId: typeof EventJournal.RemoteId.Type,
            chunk: Uint8Array<ArrayBufferLike>
          ) => Effect.Effect<void>
        ) {
          const runtime = yield* Effect.runtime<never>()
          const runFork = Runtime.runFork(runtime)

          const handleRequest = (_: [typeof EventJournal.RemoteId.Type, Uint8Array]) => runFork(onRequest(_[0], _[1]))

          emitter.on("request", handleRequest)

          yield* Effect.addFinalizer(() => Effect.sync(() => emitter.off("request", handleRequest)))
        })

        return handle
      })
    )
  }
}

export interface EventLogNotify {
  notify: (remoteId: typeof EventJournal.RemoteId.Type, chunk: Uint8Array<ArrayBufferLike>) => Effect.Effect<void>
}
export const EventLogNotify = Context.GenericTag<EventLogNotify>("@effect-x/event-log/EventLog/EventLogNotify")

const makeEventLogServerProxy = <A>(layer: Layer.Layer<A, never, SynAgentClientServerDataSources>) => {
  let initialized = false
  const emitter = new Utils.EventEmitter()

  const Live: Layer.Layer<never> = layer.pipe(Layer.provide(SynAgentClientServerDataSources.fromEmitter(emitter)))

  let runtime = ManagedRuntime.make(Live)

  const init = async () => {
    await runtime.runtime()
    initialized = true
  }

  const send = async (remoteId: Uint8Array<ArrayBufferLike>, chunk: Uint8Array<ArrayBufferLike>) => {
    if (!initialized) {
      await init()
    }
    emitter.emit("request", [remoteId, chunk])
  }

  const dispose = async () => {
    initialized = false

    try {
      await runtime.dispose()
    } catch {
      // ignore
    }

    runtime = ManagedRuntime.make(Live)
  }

  return { init, send, dispose }
}

//
class AgentId extends Schema.NonEmptyString.pipe(
  Schema.compose(Schema.Trim),
  Schema.transform(Schema.String, {
    decode(a) {
      // Convert any string format to kebab-case (xxx-xxx)
      return a
        .replace(/([a-z])([A-Z])/g, "$1-$2") // camelCase to kebab-case
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2") // PascalCase to kebab-case
        .replace(/_/g, "-") // snake_case to kebab-case
        .replace(/\s+/g, "-") // spaces to hyphens
        .toLowerCase() // ensure lowercase
        .replace(/-+/g, "-") // remove duplicate hyphens
        .replace(/^-|-$/g, "") // remove leading/trailing hyphens
    },
    encode(a) {
      return a
    }
  })
) {
  static Array = Schema.Array(this)

  static decode = Schema.decodeSync(AgentId.Array)
}

const EventLogIdentityLive = IdentityLayer.pipe(
  Layer.provide([CryptoLive, IdentityStorage.Live, FetchHttpClient.layer])
)

const EventLogEncryptionLive = EventLogEncryption.layerSubtle.pipe(Layer.provide(CryptoLive))

const SqlDoLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const db = yield* DurableObjectUtils.DoSqlStorage
    return SqlDo.layer({
      db,
      transformQueryNames: String.camelToSnake,
      transformResultNames: String.snakeToCamel
    })
  })
)

const EventLogSqlEventJournalLive = SqlEventJournal.layer({
  sqlBatchSize: 32
}).pipe(Layer.provide(SqlDoLive), Layer.orDie)

const EventLogLive = pipe(
  EventLog.layer,
  Layer.provide([EventLogSqlEventJournalLive, Reactivity.layer]),
  Layer.provide(Reactivity.layer)
)

const EventLogStatesLive = EventLogStatesWorker.EventLogStatesLive.pipe(
  Layer.provide([EventLogIdentityLive, EventLogLive, Reactivity.layer])
)

const WebsocketTags = {
  Sync: "SyncClient",
  Rpc: "Rpc"
}

class RpcClientState extends Schema.Class<RpcClientState>("RpcClientState")({
  clientId: Schema.Number.pipe(
    Schema.optionalWith({
      exact: true,
      default: () => Math.round(Math.random() * 100000)
    })
  ),
  quit: Schema.Boolean.pipe(Schema.optionalWith({ exact: true, default: () => false }))
}) {
  static decode = Schema.decodeUnknownSync(RpcClientState)

  static encode = Schema.encodeUnknownSync(RpcClientState)
}

const EventLogSyncAgentLive = Layer.scopedDiscard(
  Effect.gen(function* () {
    const identity = yield* Identity.Identity
    const { incoming, outgoing } = yield* EventLogRemote.RemoteEventSources

    yield* EventLogConfig.EventLogMnemonic.pipe(
      Effect.flatMap((mnemonic) => identity.importFromMnemonic(mnemonic)),
      Effect.orDie
    )

    const { register } = yield* EventLogRemote.init

    const syncServerClient = yield* SyncServerClient

    // Send the message back to the sync server
    yield* outgoing.listen((data) => {
      if (data._tag === "RequestChanges") {
        return syncServerClient.requestChanges(data.startSequence).pipe(Effect.map((result) => result.changes))
      }

      return EventLogRemote.batchWrite(data, (chunk) =>
        syncServerClient.write(chunk).pipe(
          Effect.flatMap((result) =>
            Effect.gen(function* () {
              yield* incoming.publish([EventLogRemote.decodeResponse(result.response), result.response])

              yield* Effect.forEach(
                result.changes,
                (changeChunk) => incoming.publish([EventLogRemote.decodeResponse(changeChunk), changeChunk]),
                { discard: true }
              )
            })
          )
        )
      )
    })

    let flag = false

    // Sync Agent received data
    yield* Effect.flatMap(SynAgentClientServerDataSources, (handle) =>
      handle((remoteId, chunk) => {
        const handler = incoming.publish([EventLogRemote.decodeResponse(chunk), chunk])
        if (!flag) {
          flag = true
          return register(remoteId).pipe(Effect.zipRight(handler))
        }
        return handler
      })
    )
  })
).pipe(
  Layer.provide([
    EventLogIdentityLive,
    EventLogEncryptionLive,
    EventLogRemote.RemoteEventSources.Default,
    EventLogStatesLive,
    EventLogLive,
    SyncServerClient.Live
  ])
)

const SyncAgentServerLive = Layer.mergeAll(
  Reactivity.layer,
  EventLogIdentityLive,
  EventLogEncryptionLive,
  EventLogSyncAgentLive
)

class DurableState extends Schema.Class<DurableState>("DurableState")({
  identity: DurableObjectUtils.DurableObjectIdentitySchema.pipe(
    Schema.Option,
    Schema.optionalWith({ exact: true, default: () => Option.none() })
  )
}) {
  static json = Schema.parseJson(DurableState)

  static decode(_: string) {
    return Schema.decodeSync(DurableState.json)(_)
  }

  static encode(_: typeof DurableState.Type) {
    return Schema.encodeSync(DurableState.json)(_)
  }
}

const SyncAgentClientRpcLive = SyncAgentClientRpcs.toLayer(
  Effect.gen(function* () {
    const state = yield* DurableObjectUtils.StorageObjectState
    const notify = yield* EventLogNotify

    return {
      Write: Effect.fnUntraced(function* (payload: {
        remoteId: typeof RemoteId.Type
        change: Uint8Array<ArrayBufferLike>
      }) {
        return yield* notify.notify(payload.remoteId, payload.change).pipe(Effect.orDie)
      }),
      /**
       * clear all data
       */
      Destroy: Effect.fnUntraced(function* () {
        yield* Effect.promise(async () => {
          try {
            state.getWebSockets().forEach((ws) => {
              ws.close(1000)
            })
          } catch {}

          try {
            await state.storage.deleteAll()
            await state.storage.deleteAlarm()
            await state.storage.sync()
          } finally {
            state.abort()
          }
        })
      })
    }
  })
)

export declare namespace SyncAgentClientDurableObject {
  export type Options = {
    rpcPath: string
    syncServerBinding: string
    syncProxyStorageBinding: string
    resetOnStartup: boolean
    hibernatableWebSocketEventTimeout: number
    layer: Layer.Layer<never, never, never>
    schemaSql: string
    migrations: Record<string, string>
    events: ReadonlyArray<Events.EventLogClient.Any>
  }
}

abstract class SyncAgentClientDurableObject extends DurableObject {
  private options: SyncAgentClientDurableObject.Options

  private state!: DurableState

  private eventLogServer: ReturnType<typeof makeEventLogServerProxy>

  private rpcServer: ReturnType<ReturnType<typeof RpcServer.make>>

  private rpcClients: Map<WebSocket, Mutable<RpcClientState>>

  constructor(ctx: DurableObjectState, env: any, options: SyncAgentClientDurableObject.Options) {
    // console.log("------------ Sync Agent Client Server Waked ------------")

    super(ctx, env)

    this.options = options

    this.ctx.setHibernatableWebSocketEventTimeout(this.options.hibernatableWebSocketEventTimeout)

    const WithBaseLayer = flow(
      Layer.provideMerge(options.layer),
      Layer.provideMerge(
        Layer.mergeAll(
          CloudflareBindings.CloudflareBindings.fromEnv(env),
          CloudflareContext.CloudflareExecutionContext.fromContext(this.ctx, env),
          CacheStorage.fromGlobalCaches,
          Layer.setConfigProvider(
            makeConfigProvider(env, () => [
              ["NAMESPACE", "template"],
              ["SYNC.URL", "http://localhost"],
              ["MNEMONIC", "they sea craft payment ticket bind vague believe visit lady knife fox"]
            ])
          )
        )
      ),
      Layer.provide([LoggerLive, withGlobalLogLevel(env)]),
      Layer.tapErrorCause(Effect.logError),
      Layer.orDie
    )

    const DurableObjectIdentityLive = Layer.effect(
      FetchHttpClient.RequestInit,
      Effect.sync(() => {
        const headers = this.state.identity.pipe(
          Option.map((_) => _.toHeaders()),
          Option.getOrElse(() => new Headers())
        )

        return { headers }
      })
    )

    const MigratorLive = Migrator.fromRecord(() => ({
      schemaSql: this.options.schemaSql,
      migrations: this.options.migrations
    }))

    const SqliteLive = pipe(
      Layer.effectDiscard(
        Effect.gen(function* () {
          const migrator = yield* Migrator.Migrator

          yield* migrator.start
        })
      ),
      Layer.provide(MigratorLive),
      Layer.provideMerge(SqlProxyLive),
      Layer.provide(DurableObjectIdentityLive)
    )

    const EventLogServerLive = pipe(
      SyncAgentServerLive,
      Layer.provide(
        Layer.succeed(SyncServerConfig, {
          binding: this.options.syncServerBinding,
          rpcPath: this.options.rpcPath
        })
      ),
      Layer.provide(Events.register(SettingsEvents, ...this.options.events)),
      Layer.provide(DurableObjectIdentityLive),
      Layer.provideMerge(SqliteLive),
      Layer.provide(
        Layer.succeed(SyncStorageProxyConfig, {
          binding: this.options.syncProxyStorageBinding,
          rpcPath: this.options.rpcPath
        })
      ),
      Layer.provide(Layer.succeed(DurableObjectUtils.DoSqlStorage, ctx.storage.sql)),
      WithBaseLayer
    )

    this.eventLogServer = makeEventLogServerProxy(EventLogServerLive)

    const RpcServerLive = pipe(
      Layer.mergeAll(SyncAgentClientRpcLive, SerializationLive),
      Layer.provide(Layer.succeed(DurableObjectUtils.StorageObjectState, ctx)),
      Layer.provide(
        Layer.succeed(EventLogNotify, {
          notify: (remoteId, chunk) => Effect.promise(() => this.eventLogServer.send(remoteId, chunk))
        })
      ),
      WithBaseLayer
    )

    const makeRpcServer = RpcServer.make(SyncAgentClientRpcs, RpcServerLive, {
      onWrite: (clientId, data) => {
        const socket = Array.from(this.rpcClients.keys()).find((ws) => this.rpcClients.get(ws)?.clientId === clientId)
        if (!socket) {
          console.warn("client not found")
          return
        }
        const clientState = this.rpcClients.get(socket)
        if (clientState?.quit) {
          return
        }

        return socket.send(data)
      }
    })

    this.rpcServer = makeRpcServer({ disableTracing: true, concurrency: "unbounded" })

    this.rpcClients = new Map()

    this.ctx.getWebSockets(WebsocketTags.Rpc).forEach((websocket) => {
      this.rpcClients.set(websocket, RpcClientState.decode(websocket.deserializeAttachment()))
    })

    this.ctx.blockConcurrencyWhile(async () => {
      await this.initialize()

      if (options?.resetOnStartup) {
        const state = this.state
        try {
          await this.ctx.storage.deleteAll()
          await this.ctx.storage.deleteAlarm()
          await this.ctx.storage.sync()
        } finally {
          this.updateState(state)
        }
      }
    })
  }

  abstract onInitialize(): Promise<void>

  async initialize() {
    const value = await this.ctx.storage.get<string>("_state").catch(() => "")

    this.state = !value ? DurableState.make() : DurableState.decode(value)

    await this.onInitialize()
  }

  updateState(updates: Partial<DurableState>): void {
    const state = Object.assign({}, this.state, updates)

    this.state = state
    this.ctx.waitUntil(this.ctx.storage.put("_state", DurableState.encode(state)))
  }

  private async ensure(_: { identity: DurableObjectUtils.DurableObjectIdentitySchema }) {
    this.updateState({ identity: Option.fromNullable(_.identity) })
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url

    if (pathname.startsWith(this.options.rpcPath)) {
      const headersEither = DurableObjectUtils.DurableObjectIdentitySchema.fromHeaders(request.headers)

      if (Either.isLeft(headersEither)) {
        const error = headersEither.left
        const errorString = ParseResult.TreeFormatter.formatErrorSync(error)

        return new Response(errorString, { status: 400 })
      }

      const identity = headersEither.right

      this.ensure({ identity })

      const webSocketPair = new WebSocketPair()
      const [websocketClient, websocketServer] = Object.values(webSocketPair)

      const rpcClientState = RpcClientState.make()
      websocketServer.serializeAttachment(RpcClientState.encode(rpcClientState))
      this.rpcClients.set(websocketServer, rpcClientState)

      this.ctx.acceptWebSocket(websocketServer, [WebsocketTags.Rpc])

      return new Response(null, {
        status: 101,
        webSocket: websocketClient
      })
    }

    return new Response(null, { status: 404 })
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const tags = this.ctx.getTags(ws)

    await Utils.whenTags(tags, [
      [
        [WebsocketTags.Rpc],
        async () => {
          const rpcClientState = this.rpcClients.get(ws)
          if (!rpcClientState || rpcClientState.quit) {
            ws.close(1011, "WebSocket broken.")
            return
          }

          const data = Utils.toUint8Array(message)

          await this.rpcServer.send(rpcClientState.clientId, data)
        }
      ]
    ])
  }

  override async webSocketError(ws: WebSocket, _error: Error): Promise<void> {
    const tags = this.ctx.getTags(ws)

    await Utils.whenTags(tags, [
      [
        [WebsocketTags.Rpc],
        async () => {
          const rpcClientState = this.rpcClients.get(ws)
          if (rpcClientState) {
            rpcClientState.quit = true
            this.rpcServer.close(rpcClientState.clientId)
          }
          this.rpcClients.delete(ws)

          if (this.rpcClients.size === 0) {
            await this.rpcServer.dispose()
          }
        }
      ]
    ])
  }

  override async webSocketClose(ws: WebSocket, _code: number, _reason: string): Promise<void> {
    const tags = this.ctx.getTags(ws)

    await Utils.whenTags(tags, [
      [
        [WebsocketTags.Rpc],
        async () => {
          const rpcClientState = this.rpcClients.get(ws)
          if (rpcClientState) {
            rpcClientState.quit = true
            this.rpcServer.close(rpcClientState.clientId)
          }
          this.rpcClients.delete(ws)

          if (this.rpcClients.size === 0) {
            await this.rpcServer.dispose()
          }
        }
      ]
    ])

    ws.close()
  }
}

export const makeDurableObject = (options: {
  rpcPath?: string | undefined
  syncProxyStorageBinding: string
  syncServerBinding: string
  resetOnStartup?: boolean | undefined
  hibernatableWebSocketEventTimeout?: number | undefined
  layer?: Layer.Layer<never> | undefined
  schemaSql?: string | undefined
  migrations?: Record<string, string> | undefined
  events: ReadonlyArray<Events.EventLogClient.Any>
}): new (state: DurableObjectState, env: any) => SyncAgentClientDurableObject => {
  class SyncAgentClientDurableObjectServer extends SyncAgentClientDurableObject {
    constructor(state: DurableObjectState, env: any) {
      super(state, env, {
        rpcPath: options.rpcPath ?? "/rpc",
        syncServerBinding: options.syncServerBinding,
        syncProxyStorageBinding: options.syncProxyStorageBinding,
        resetOnStartup: options.resetOnStartup ?? false,
        hibernatableWebSocketEventTimeout: options.hibernatableWebSocketEventTimeout ?? 5000,
        layer: options.layer ?? Layer.empty,
        schemaSql: options.schemaSql ?? "",
        migrations: options.migrations ?? {},
        events: options.events
      })
    }

    async onInitialize(): Promise<void> {}
  }

  return SyncAgentClientDurableObjectServer
}

export const makeWorker = (options: {
  rpcPath?: string | undefined
  durableObjectPrefix?: string | undefined
  durableObjectBinding: string
}) => {
  return {
    fetch(request: Request, env: Record<string, any>) {
      const url = new URL(request.url)
      const { pathname } = url

      const rpcPath = options?.rpcPath ?? "/rpc"
      const durableObjectPrefix = options?.durableObjectPrefix ?? "sync-agent-client"
      const durableObjectBinding = options.durableObjectBinding

      if (pathname.startsWith(rpcPath)) {
        const headers = request.headers
        const upgradeHeader = headers.get("Upgrade")

        if (!upgradeHeader || upgradeHeader !== "websocket") {
          return new Response(null, {
            status: 426,
            statusText: "Durable Object expected Upgrade: websocket"
          })
        }

        const identityEither = DurableObjectUtils.DurableObjectIdentitySchema.fromHeaders(headers)

        if (Either.isLeft(identityEither)) {
          const error = identityEither.left
          const errorString = ParseResult.TreeFormatter.formatErrorSync(error)
          return new Response(errorString, { status: 400 })
        }

        const identity = identityEither.right
        const durableObjectIdentity = `${identity.id()}::${durableObjectPrefix}`

        const doNamespace = env[durableObjectBinding] as DurableObjectNamespace
        const durableObjectId = doNamespace.idFromName(durableObjectIdentity)
        const stub = doNamespace.get(durableObjectId) as unknown as SyncAgentClientDurableObject

        return stub.fetch(request)
      }

      return new Response(null, { status: 404 })
    }
  } satisfies ExportedHandler<any>
}
