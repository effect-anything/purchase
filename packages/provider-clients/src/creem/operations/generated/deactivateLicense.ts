import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const DeactivateLicenseInput = Schema.Struct({
  key: Schema.String,
  instance_id: Schema.String,
})
export type DeactivateLicenseInput = typeof DeactivateLicenseInput.Type

export const DeactivateLicenseOutput = Models.LicenseEntity
export type DeactivateLicenseOutput = typeof DeactivateLicenseOutput.Type

export const deactivateLicenseOperation = defineOperation({
  id: "creem.deactivateLicense",
  method: "POST",
  path: "/licenses/deactivate",
  inputSchema: DeactivateLicenseInput,
  outputSchema: DeactivateLicenseOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["key", "instance_id"]
})

/**
 * Deactivate a license key instance.
 */
export const deactivateLicense = (input: DeactivateLicenseInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(deactivateLicenseOperation, input)))
