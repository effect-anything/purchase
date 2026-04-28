import * as Console from "effect/Console"
import * as Effect from "effect/Effect"

export interface SqliteDebugAnnotations {
  readonly [key: string]: unknown
}

export interface SqliteDebugEntry {
  readonly namespace: string
  readonly event: string
  readonly annotations?: SqliteDebugAnnotations | undefined
}

const normalizeDebugValue = (value: unknown, seen = new WeakSet<object>()): unknown => {
  switch (typeof value) {
    case "bigint":
      return value.toString()
    case "function":
      return "[Function]"
    case "object": {
      if (value === null) return null
      if (value instanceof Uint8Array) return Array.from(value)
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack
        }
      }
      if (seen.has(value)) return "[Circular]"
      seen.add(value)

      if (Array.isArray(value)) {
        return value.map((item) => normalizeDebugValue(item, seen))
      }

      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeDebugValue(item, seen)]))
    }
    default:
      return value
  }
}

const normalizeAnnotations = (annotations?: SqliteDebugAnnotations | undefined) =>
  annotations ? (normalizeDebugValue(annotations) as SqliteDebugAnnotations) : undefined

const getDebugEnabled = () =>
  Boolean((globalThis as typeof globalThis & { __sqlite_lock_debug?: boolean }).__sqlite_lock_debug)

const appendDebugEntry = (entry: SqliteDebugEntry) =>
  Effect.sync(() => {
    const target = globalThis as typeof globalThis & {
      __sqliteDebugLogs?: Array<SqliteDebugEntry>
      __sqliteLockLogs?: Array<{ message: string; details?: Record<string, unknown> }>
    }

    target.__sqliteDebugLogs ??= []
    target.__sqliteDebugLogs.push(entry)

    if (entry.namespace === "sqlite-lock") {
      target.__sqliteLockLogs ??= []
      target.__sqliteLockLogs.push(
        entry.annotations
          ? {
              message: entry.event,
              details: { ...entry.annotations }
            }
          : { message: entry.event }
      )
    }
  })

const applyLevel = (namespace: string, event: string, level: "Trace" | "Debug" | "Info") => {
  const message = `[${namespace}] ${event}`

  switch (level) {
    case "Trace":
      return Console.log(message)
    case "Debug":
      return Console.log(message)
    case "Info":
      return Console.log(message)
  }
}

export const sqliteDebugLog = (
  namespace: string,
  event: string,
  annotations?: SqliteDebugAnnotations | undefined,
  options?: {
    readonly level?: "Trace" | "Debug" | "Info" | undefined
    readonly logSpan?: string | undefined
    readonly spanName?: string | undefined
  }
) => {
  if (!getDebugEnabled()) {
    return Effect.void
  }

  const normalizedAnnotations = normalizeAnnotations(annotations)

  const effect = applyLevel(namespace, event, options?.level ?? "Info").pipe(
    Effect.annotateLogs({
      namespace,
      event,
      ...normalizedAnnotations
    }),
    Effect.withLogSpan(options?.logSpan ?? namespace)
  )

  return (options?.spanName ? effect.pipe(Effect.withSpan(options.spanName)) : effect).pipe(
    Effect.zipLeft(
      appendDebugEntry({
        namespace,
        event,
        annotations: normalizedAnnotations
      })
    )
  )
}

export const runSqliteDebugLog = (
  namespace: string,
  event: string,
  annotations?: SqliteDebugAnnotations | undefined,
  options?: {
    readonly level?: "Trace" | "Debug" | "Info" | undefined
    readonly logSpan?: string | undefined
    readonly spanName?: string | undefined
  }
) => {
  if (!getDebugEnabled()) {
    return
  }

  Effect.runFork(sqliteDebugLog(namespace, event, annotations, options).pipe(Effect.withTracerEnabled(false)))
}
