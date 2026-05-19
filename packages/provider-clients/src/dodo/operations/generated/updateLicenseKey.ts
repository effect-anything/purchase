import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const UpdateLicenseKeyInput = Schema.Struct({
  id: Schema.String,
  activations_limit: Schema.optional(Schema.NullOr(Schema.Number)),
  disabled: Schema.optional(Schema.NullOr(Schema.Boolean)),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
})
export type UpdateLicenseKeyInput = typeof UpdateLicenseKeyInput.Type

export const UpdateLicenseKeyOutput = Models.LicenseKey
export type UpdateLicenseKeyOutput = typeof UpdateLicenseKeyOutput.Type

export const updateLicenseKeyOperation = defineOperation({
  id: "dodo.updateLicenseKey",
  method: "PATCH",
  path: "/license_keys/{id}",
  inputSchema: UpdateLicenseKeyInput,
  outputSchema: UpdateLicenseKeyOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["activations_limit", "disabled", "expires_at"]
})

/**
 * Update license key
 */
export const updateLicenseKey = (input: UpdateLicenseKeyInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(updateLicenseKeyOperation, input)))
