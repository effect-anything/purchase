import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { LemonClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetLicenseKeyInput = Schema.Struct({
  id: Schema.String,
  include: Schema.optional(Schema.String)
})
export type GetLicenseKeyInput = typeof GetLicenseKeyInput.Type

export const GetLicenseKeyOutput = Models.LicenseKeyResponse
export type GetLicenseKeyOutput = typeof GetLicenseKeyOutput.Type

export const getLicenseKeyOperation = defineOperation({
  id: "lemon.getLicenseKey",
  method: "GET",
  path: "/license-keys/{id}",
  inputSchema: GetLicenseKeyInput,
  outputSchema: GetLicenseKeyOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["include"]
})

/**
 * Get license key
 */
export const getLicenseKey = (input: GetLicenseKeyInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(getLicenseKeyOperation, input)))
