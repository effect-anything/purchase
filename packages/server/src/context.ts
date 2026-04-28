import { LoggerLive } from "./logger.ts"
import { OtelLive } from "./otel.ts"
import { RatelimiterLocal } from "./ratelimit/limit-local.ts"
import * as Layer from "effect/Layer"

import { RatelimiterNodeLive } from "./ratelimit/limit-node.ts"

export const NodeServerLive = Layer.mergeAll(
  // @ts-ignore
  process.env.DISABLE_RATELIMIT || process.env.NODE_ENV === "development" || process.env.TEST
    ? RatelimiterLocal
    : RatelimiterNodeLive,
  OtelLive,
  LoggerLive
)
