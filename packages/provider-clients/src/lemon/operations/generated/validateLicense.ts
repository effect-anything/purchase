import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const ValidateLicenseInput = Schema.Struct({
  license_key: Schema.String,
  instance_id: Schema.optional(Schema.String),
})
export type ValidateLicenseInput = typeof ValidateLicenseInput.Type

export const ValidateLicenseOutput = Models.LicenseValidateResponse
export type ValidateLicenseOutput = typeof ValidateLicenseOutput.Type

export const validateLicenseOperation = defineOperation({
  id: "lemon.validateLicense",
  method: "POST",
  path: "/licenses/validate",
  inputSchema: ValidateLicenseInput,
  outputSchema: ValidateLicenseOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["license_key", "instance_id"]
})

/**
 * Validate license
 */
export const validateLicense = (input: ValidateLicenseInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(validateLicenseOperation, input)))
