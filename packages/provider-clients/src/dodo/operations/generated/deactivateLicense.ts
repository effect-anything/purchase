import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const DeactivateLicenseInput = Schema.Struct({
  license_key: Schema.String,
  license_key_instance_id: Schema.String,
})
export type DeactivateLicenseInput = typeof DeactivateLicenseInput.Type

export const DeactivateLicenseOutput = Schema.Unknown
export type DeactivateLicenseOutput = typeof DeactivateLicenseOutput.Type

export const deactivateLicenseOperation = defineOperation({
  id: "dodo.deactivateLicense",
  method: "POST",
  path: "/licenses/deactivate",
  inputSchema: DeactivateLicenseInput,
  outputSchema: DeactivateLicenseOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["license_key", "license_key_instance_id"]
})

/**
 * Deactivate license
 */
export const deactivateLicense = (input: DeactivateLicenseInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(deactivateLicenseOperation, input)))
