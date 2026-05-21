import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { LemonClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const UpdateLicenseKeyInput = Schema.Struct({
  id: Schema.String,
  data: Models.LicenseKeyUpdateData
})
export type UpdateLicenseKeyInput = typeof UpdateLicenseKeyInput.Type

export const UpdateLicenseKeyOutput = Models.LicenseKeyResponse
export type UpdateLicenseKeyOutput = typeof UpdateLicenseKeyOutput.Type

export const updateLicenseKeyOperation = defineOperation({
  id: "lemon.updateLicenseKey",
  method: "PATCH",
  path: "/license-keys/{id}",
  inputSchema: UpdateLicenseKeyInput,
  outputSchema: UpdateLicenseKeyOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["data"]
})

/**
 * Update license key
 */
export const updateLicenseKey = (input: UpdateLicenseKeyInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(updateLicenseKeyOperation, input)))
