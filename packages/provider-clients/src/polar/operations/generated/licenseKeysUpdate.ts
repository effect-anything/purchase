import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const LicenseKeysUpdateInput = Schema.Struct({
  id: Schema.String,
  status: Schema.optional(Schema.NullOr(Models.LicenseKeyStatus)),
  usage: Schema.optional(Schema.Number),
  limit_activations: Schema.optional(Schema.NullOr(Schema.Number)),
  limit_usage: Schema.optional(Schema.NullOr(Schema.Number)),
  expires_at: Schema.optional(Schema.NullOr(Schema.String))
})
export type LicenseKeysUpdateInput = typeof LicenseKeysUpdateInput.Type

export const LicenseKeysUpdateOutput = Models.LicenseKeyRead
export type LicenseKeysUpdateOutput = typeof LicenseKeysUpdateOutput.Type

export const licenseKeysUpdateOperation = defineOperation({
  id: "polar.license_keys:update",
  method: "PATCH",
  path: "/v1/license-keys/{id}",
  inputSchema: LicenseKeysUpdateInput,
  outputSchema: LicenseKeysUpdateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["status", "usage", "limit_activations", "limit_usage", "expires_at"]
})

/**
 * Update License Key
 */
export const licenseKeysUpdate = (input: LicenseKeysUpdateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(licenseKeysUpdateOperation, input)))
