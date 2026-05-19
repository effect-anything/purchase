import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const ActivateLicenseInput = Schema.Struct({
  key: Schema.String,
  instance_name: Schema.String,
})
export type ActivateLicenseInput = typeof ActivateLicenseInput.Type

export const ActivateLicenseOutput = Models.LicenseEntity
export type ActivateLicenseOutput = typeof ActivateLicenseOutput.Type

export const activateLicenseOperation = defineOperation({
  id: "creem.activateLicense",
  method: "POST",
  path: "/licenses/activate",
  inputSchema: ActivateLicenseInput,
  outputSchema: ActivateLicenseOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["key", "instance_name"]
})

/**
 * Activates a license key.
 */
export const activateLicense = (input: ActivateLicenseInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(activateLicenseOperation, input)))
