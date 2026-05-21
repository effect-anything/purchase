import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { LemonClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const DeactivateLicenseInput = Schema.Struct({
  license_key: Schema.String,
  instance_id: Schema.String
})
export type DeactivateLicenseInput = typeof DeactivateLicenseInput.Type

export const DeactivateLicenseOutput = Models.LicenseDeactivateResponse
export type DeactivateLicenseOutput = typeof DeactivateLicenseOutput.Type

export const deactivateLicenseOperation = defineOperation({
  id: "lemon.deactivateLicense",
  method: "POST",
  path: "/licenses/deactivate",
  inputSchema: DeactivateLicenseInput,
  outputSchema: DeactivateLicenseOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["license_key", "instance_id"]
})

/**
 * Deactivate license
 */
export const deactivateLicense = (input: DeactivateLicenseInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(deactivateLicenseOperation, input)))
