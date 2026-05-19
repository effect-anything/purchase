import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const LicenseKeysListInput = Schema.Struct({
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  benefit_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  status: Schema.optional(Schema.NullOr(Schema.Union(Models.LicenseKeyStatus, Schema.Array(Models.LicenseKeyStatus)))),
  page: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
})
export type LicenseKeysListInput = typeof LicenseKeysListInput.Type

export const LicenseKeysListOutput = Models.ListResourceLicenseKeyRead
export type LicenseKeysListOutput = typeof LicenseKeysListOutput.Type

export const licenseKeysListOperation = defineOperation({
  id: "polar.license_keys:list",
  method: "GET",
  path: "/v1/license-keys/",
  inputSchema: LicenseKeysListInput,
  outputSchema: LicenseKeysListOutput,
  status: [200],
  contentType: "json",
  queryParams: ["organization_id", "benefit_id", "status", "page", "limit"]
})

/**
 * List License Keys
 */
export const licenseKeysList = (input: LicenseKeysListInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(licenseKeysListOperation, input)))
