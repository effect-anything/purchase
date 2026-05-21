import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ValidateLicenseInput = Schema.Struct({
  license_key: Schema.String,
  license_key_instance_id: Schema.optional(Schema.NullOr(Schema.String))
})
export type ValidateLicenseInput = typeof ValidateLicenseInput.Type

export const ValidateLicenseOutput = Models.LicenseValidateResponse
export type ValidateLicenseOutput = typeof ValidateLicenseOutput.Type

export const validateLicenseOperation = defineOperation({
  id: "dodo.validateLicense",
  method: "POST",
  path: "/licenses/validate",
  inputSchema: ValidateLicenseInput,
  outputSchema: ValidateLicenseOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["license_key", "license_key_instance_id"]
})

/**
 * Validate license
 */
export const validateLicense = (input: ValidateLicenseInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(validateLicenseOperation, input)))
