import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const ActivateLicenseInput = Schema.Struct({
  license_key: Schema.String,
  name: Schema.String,
})
export type ActivateLicenseInput = typeof ActivateLicenseInput.Type

export const ActivateLicenseOutput = Models.LicenseActivateResponse
export type ActivateLicenseOutput = typeof ActivateLicenseOutput.Type

export const activateLicenseOperation = defineOperation({
  id: "dodo.activateLicense",
  method: "POST",
  path: "/licenses/activate",
  inputSchema: ActivateLicenseInput,
  outputSchema: ActivateLicenseOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["license_key", "name"]
})

/**
 * Activate license
 */
export const activateLicense = (input: ActivateLicenseInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(activateLicenseOperation, input)))
