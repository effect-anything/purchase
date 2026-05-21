import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetLicenseKeyInput = Schema.Struct({
  id: Schema.String
})
export type GetLicenseKeyInput = typeof GetLicenseKeyInput.Type

export const GetLicenseKeyOutput = Models.LicenseKey
export type GetLicenseKeyOutput = typeof GetLicenseKeyOutput.Type

export const getLicenseKeyOperation = defineOperation({
  id: "dodo.getLicenseKey",
  method: "GET",
  path: "/license_keys/{id}",
  inputSchema: GetLicenseKeyInput,
  outputSchema: GetLicenseKeyOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get license key
 */
export const getLicenseKey = (input: GetLicenseKeyInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getLicenseKeyOperation, input)))
