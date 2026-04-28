import { CloudflareExecutionContext } from "./execution-context.ts"
import * as KV from "./kv.ts"
import { RatelimiterWorkerLive } from "./limit.ts"
import { OtelLive } from "./otel.ts"
import * as R2 from "./r2.ts"
import { LoggerLive } from "@effect-x/server/logger"
import { RatelimiterLocal } from "@effect-x/server/ratelimit/limit-local"
import { WaitUntil } from "@effect-x/server/wait-until"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export const WaitUntilGlobalLive = Layer.effect(
  WaitUntil,
  Effect.gen(function* () {
    const ctx = yield* CloudflareExecutionContext.getRawContext()
    return (promise: Promise<any>) => ctx.waitUntil(promise)
  })
)

export const CloudflareLive = Layer.mergeAll(
  WaitUntilGlobalLive,
  // @ts-ignore
  process.env.DISABLE_RATELIMIT || process.env.NODE_ENV === "development" || process.env.TEST
    ? RatelimiterLocal
    : RatelimiterWorkerLive,
  KV.Default,
  R2.Default
).pipe(Layer.provide([OtelLive, LoggerLive]))
