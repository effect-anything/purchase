import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListLicenseKeysInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
  created_at_gte: Schema.optional(Schema.String),
  created_at_lte: Schema.optional(Schema.String),
  customer_id: Schema.optional(Schema.String),
  product_id: Schema.optional(Schema.String),
  source: Schema.optional(Schema.Literal("auto", "import")),
  status: Schema.optional(Models.LicenseKeyStatus)
})
export type ListLicenseKeysInput = typeof ListLicenseKeysInput.Type

export const ListLicenseKeysOutput = Models.LicenseKeyListResponse
export type ListLicenseKeysOutput = typeof ListLicenseKeysOutput.Type

export const listLicenseKeysOperation = defineOperation({
  id: "dodo.listLicenseKeys",
  method: "GET",
  path: "/license_keys",
  inputSchema: ListLicenseKeysInput,
  outputSchema: ListLicenseKeysOutput,
  status: [200],
  contentType: "json",
  queryParams: [
    "page_number",
    "page_size",
    "created_at_gte",
    "created_at_lte",
    "customer_id",
    "product_id",
    "source",
    "status"
  ]
})

/**
 * List license keys
 */
export const listLicenseKeys = (input: ListLicenseKeysInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listLicenseKeysOperation, input)))
