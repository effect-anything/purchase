import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { wrapWithEffect } from "./internal.ts"
import { Toaster } from "./toaster.ts"
import { makeWebToaster } from "./web.ts"

export const WebToaster = Layer.effect(
  Toaster,
  Effect.sync(() => wrapWithEffect(makeWebToaster()))
)
