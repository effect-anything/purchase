import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { makeNativeToaster } from "./expo.ts"
import { wrapWithEffect } from "./internal.ts"
import { Toaster } from "./toaster.ts"

export const ExpoToaster = Layer.effect(
  Toaster,
  Effect.sync(() => wrapWithEffect(makeNativeToaster()))
)
