import type * as ParseResult from "effect/ParseResult"
import type * as Request from "effect/Request"

import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Runtime from "effect/Runtime"
import * as Schema from "effect/Schema"
import { SqliteRunError, WorkerError } from "../schema.ts"

type ConstructType<A> = A extends { new (...args: Array<any>): infer R } ? R : never

type ArrToUnion<A> = A extends ReadonlyArray<infer F> ? ConstructType<F> : never

type ExtractFromUnion<A> =
  A extends Schema.Union<infer Members> ? ArrToUnion<Members> : A extends Schema.Schema.Any ? A["Type"] : never

type TaggedRequestIns<T> = T extends { success: any; failure: any }
  ? {
      success: T["success"]["Type"]
      failure: ExtractFromUnion<T["failure"]>
    }
  : never

type Constructor<T> = new (...args: any) => T

type TaggedReq = Constructor<Request.Request<any, any>> & { _tag: string }

type TaggedRequestMessage = Schema.TaggedRequest<string, any, any, never, any, any, any, any, never>

type TaggedRequestSuccess<T extends TaggedRequestMessage> = Schema.WithResult.Success<T>

type TaggedRequestFailure<T extends TaggedRequestMessage> = Schema.WithResult.Failure<T>

type SendOptions = {
  readonly ignoreUnhandled?: boolean | undefined
  readonly timeoutMs?: number | undefined
}

type SendAndWaitOptions = SendOptions & {
  readonly discard?: false | undefined
}

type SendAndDiscardOptions = SendOptions & {
  readonly discard: true
}

class Req extends Schema.TaggedStruct("Req", {
  id: Schema.Number,
  data: Schema.Any
}) {
  static encode = Schema.encodeUnknownSync(Req)
}

class Ack extends Schema.TaggedStruct("Ack", {
  id: Schema.Number,
  data: Schema.Exit({
    defect: Schema.Never,
    failure: SqliteRunError,
    // Already serialized so no longer needed
    success: Schema.Any
  })
}) {
  static encode = Schema.encodeUnknownSync(Ack)
}
const decodeMessage = Schema.decodeUnknown(Schema.Union(Req, Ack))

export const createBroadcastChannel = Effect.fn("sqlite.createBroadcastChannel")(function* (
  name: string,
  whenOpen: <A, E>(_: Effect.Effect<A, E>) => Effect.Effect<A, E>
) {
  let currentId = 1
  const pending = new Map<
    number,
    {
      readonly ignoreUnhandled: boolean
      readonly resume: (effect: Exit.Exit<any, any>) => void
    }
  >()
  const handles = new Map<TaggedReq, (_: any) => Effect.Effect<any, any>>()
  const channel = new BroadcastChannel(name)

  const runtime = yield* Effect.runtime<never>()
  const runFork = Runtime.runFork(runtime)

  const handleError =
    <A extends TaggedRequestMessage>(
      encoder: (u: unknown) => Effect.Effect<TaggedRequestFailure<A>, ParseResult.ParseError>
    ) =>
    (cause: Cause.Cause<unknown>): Effect.Effect<never, TaggedRequestFailure<A> | ParseResult.ParseError> =>
      encoder(Cause.squash(cause)).pipe(
        Effect.catchAllCause((encodeCause) => Effect.die(Cause.squash(encodeCause))),
        Effect.flatMap(Effect.fail)
      )

  const encodeFinalResult =
    <A extends TaggedRequestMessage>(
      successEncoder: (u: unknown) => Effect.Effect<TaggedRequestSuccess<A>, ParseResult.ParseError>,
      failureEncoder: (u: unknown) => Effect.Effect<TaggedRequestFailure<A>, ParseResult.ParseError>
    ) =>
    (
      exit: Exit.Exit<any, any>
    ): Effect.Effect<TaggedRequestSuccess<A>, TaggedRequestFailure<A> | ParseResult.ParseError> =>
      Exit.isSuccess(exit)
        ? successEncoder(exit.value).pipe(Effect.catchAllCause(handleError(failureEncoder)))
        : handleError(failureEncoder)(exit.cause)

  const ack = (id: number, data: Exit.Exit<any, any>) =>
    Effect.sync(() => {
      channel.postMessage(Ack.encode(Ack.make({ id, data })))
    })

  const makeMissingHandlerError = (tag: string) =>
    new WorkerError({
      reason: "unknown",
      cause: new Error(`broadcast channel "${name}" has no handler for ${tag}`)
    })

  const makeClosedError = () =>
    new WorkerError({
      reason: "unknown",
      cause: new Error(`broadcast channel "${name}" closed`)
    })

  const makeTimeoutError = (tag: string, timeoutMs: number) =>
    new WorkerError({
      reason: "unknown",
      cause: new Error(`broadcast channel "${name}" timed out waiting for ${tag} after ${timeoutMs}ms`)
    })

  const isMissingHandlerError = (error: unknown) =>
    error instanceof WorkerError &&
    error.reason === "unknown" &&
    error.cause instanceof Error &&
    error.cause.message.includes("has no handler for")

  const handleMessage = Effect.fnUntraced(function* (
    id: number,
    type: (typeof Req)["Type"]["_tag"] | (typeof Ack)["Type"]["_tag"],
    data: any
  ) {
    if (type === "Req") {
      const found = Array.from(handles.entries()).find(([k]) => k._tag === data._tag)
      if (!found) {
        return yield* ack(id, Exit.fail(makeMissingHandlerError(data._tag)))
      }
      const handle = found[1]
      if (!handle) {
        return yield* ack(id, Exit.fail(makeMissingHandlerError(data._tag)))
      }
      const exit = yield* Effect.exit(handle(data))
      return yield* ack(id, exit)
    }
    if (type === "Ack") {
      const pendingRequest = pending.get(id)
      if (!pendingRequest) return

      if (
        pendingRequest.ignoreUnhandled &&
        Exit.isFailure(data) &&
        Cause.isFailType(data.cause) &&
        isMissingHandlerError(data.cause.error)
      ) {
        return
      }

      pending.delete(id)
      pendingRequest.resume(data)
    }
  })

  const onMessage = (event: { data: unknown }) => {
    if (!event.data) return

    runFork(
      pipe(
        decodeMessage(event.data),
        Effect.flatMap((message) => whenOpen(handleMessage(message.id, message._tag, message.data))),
        Effect.catchAll((cause) =>
          Effect.logDebug("ignored invalid sqlite broadcast channel message").pipe(
            Effect.annotateLogs({
              channelName: name,
              cause
            })
          )
        )
      )
    )
  }

  channel.addEventListener("message", onMessage)

  function send<A extends TaggedRequestMessage>(
    message: A,
    options: SendAndDiscardOptions
  ): Effect.Effect<void, WorkerError>
  function send<A extends TaggedRequestMessage>(
    message: A,
    options?: SendAndWaitOptions
  ): Effect.Effect<TaggedRequestSuccess<A>, TaggedRequestFailure<A> | ParseResult.ParseError | WorkerError>
  function send<A extends TaggedRequestMessage>(
    message: A,
    options?: SendAndWaitOptions | SendAndDiscardOptions
  ): Effect.Effect<void | TaggedRequestSuccess<A>, TaggedRequestFailure<A> | ParseResult.ParseError | WorkerError> {
    const normalizedOptions = options ?? { discard: false }
    const messageTag = message._tag

    return whenOpen(
      Effect.async<void | TaggedRequestSuccess<A>, TaggedRequestFailure<A> | ParseResult.ParseError | WorkerError>(
        (resume) => {
          const id = currentId++
          let timeoutId: ReturnType<typeof setTimeout> | undefined
          if (!normalizedOptions.discard) {
            const successSchema = Schema.decodeUnknown(Schema.successSchema(message))
            const failureSchema = Schema.decodeUnknown(Schema.failureSchema(message))
            const getFinalExit = encodeFinalResult(successSchema, failureSchema)
            pending.set(id, {
              ignoreUnhandled: normalizedOptions.ignoreUnhandled === true,
              resume: (exit) => {
                if (timeoutId) {
                  clearTimeout(timeoutId)
                }
                resume(getFinalExit(exit))
              }
            })
          }
          try {
            //
            channel.postMessage(Req.encode(Req.make({ id, data: message })))
          } catch (cause) {
            pending.delete(id)
            resume(Effect.fail(new WorkerError({ reason: "send", cause })))
            return
          }
          if (normalizedOptions.discard) {
            resume(Effect.void)
          }

          if (!normalizedOptions.discard && normalizedOptions.timeoutMs !== undefined) {
            timeoutId = setTimeout(() => {
              if (!pending.has(id)) {
                return
              }

              pending.delete(id)
              resume(Effect.fail(makeTimeoutError(messageTag, normalizedOptions.timeoutMs!)))
            }, normalizedOptions.timeoutMs)
          }

          return Effect.sync(() => {
            if (timeoutId) {
              clearTimeout(timeoutId)
            }
            pending.delete(id)
          })
        }
      )
    )
  }

  return {
    send,
    handle: <A extends TaggedReq>(
      schema: A,
      handle: (
        _: ConstructorParameters<A>[0]
      ) => Effect.Effect<TaggedRequestIns<A>["success"], TaggedRequestIns<A>["failure"]>
    ) => {
      handles.set(schema, handle)
    },
    close: Effect.sync(() => {
      const error = makeClosedError()

      for (const pendingRequest of pending.values()) {
        pendingRequest.resume(Exit.fail(error))
      }

      currentId = 1
      pending.clear()
      handles.clear()
      if ("removeEventListener" in channel && typeof channel.removeEventListener === "function") {
        channel.removeEventListener("message", onMessage)
      }
      channel.close()
    })
  }
})

export type SchemaBroadcastChannel = Effect.Effect.Success<ReturnType<typeof createBroadcastChannel>>
