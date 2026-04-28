import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import type * as SqliteSchema from "../schema.ts"

class EventEmitter {
  private listeners: Map<string, Set<(message: any) => void>> = new Map()

  on(event: string, listener: (message: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(listener)
  }

  emit(event: string, message: any) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach((listener) => listener(message))
    }
  }

  off(event: string, listener: (message: any) => void) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  clear() {
    this.listeners.clear()
  }
}

const makeSqliteRuntimeEvents = Effect.gen(function* () {
  const emitter = new EventEmitter()
  const pending: Array<SqliteSchema.SqliteUpdateEvent> = []
  let subscriberCount = 0

  const publish = (event: SqliteSchema.SqliteUpdateEvent) =>
    Effect.sync(() => {
      if (subscriberCount === 0) {
        pending.push(event)
        return
      }

      emitter.emit("event", event)
    }).pipe(Effect.asVoid)

  const stream = Stream.async<SqliteSchema.SqliteUpdateEvent, never, never>((emit) => {
    const handle = (event: SqliteSchema.SqliteUpdateEvent) => emit.single(event)
    emitter.on("event", handle)
    subscriberCount += 1

    while (pending.length > 0) {
      const event = pending.shift()
      if (event) {
        emit.single(event)
      }
    }

    return Effect.sync(() => {
      emitter.off("event", handle)
      subscriberCount = Math.max(0, subscriberCount - 1)
    })
  })

  return {
    publish,
    stream
  }
})

export class SqliteRuntimeEvents extends Effect.Tag("@effect-x/sql-sqlite/runtime-events")<
  SqliteRuntimeEvents,
  Effect.Effect.Success<typeof makeSqliteRuntimeEvents>
>() {
  static Live = Layer.effect(this, makeSqliteRuntimeEvents)
}
