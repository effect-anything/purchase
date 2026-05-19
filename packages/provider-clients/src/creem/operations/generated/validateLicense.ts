import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const ValidateLicenseInput = Schema.Struct({
  key: Schema.String,
  instance_id: Schema.String,
})
export type ValidateLicenseInput = typeof ValidateLicenseInput.Type

export const ValidateLicenseOutput = Models.LicenseEntity
export type ValidateLicenseOutput = typeof ValidateLicenseOutput.Type

export const validateLicenseOperation = defineOperation({
  id: "creem.validateLicense",
  method: "POST",
  path: "/licenses/validate",
  inputSchema: ValidateLicenseInput,
  outputSchema: ValidateLicenseOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["key", "instance_id"]
})

/**
 * Validates a license key or instance.
 */
export const validateLicense = (input: ValidateLicenseInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(validateLicenseOperation, input)))
