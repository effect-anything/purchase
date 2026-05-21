import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { LemonClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListLicenseKeysInput = Schema.Struct({
  "page[number]": Schema.optional(Schema.Number),
  "page[size]": Schema.optional(Schema.Number),
  "filter[store_id]": Schema.optional(Schema.String),
  "filter[order_id]": Schema.optional(Schema.String),
  "filter[product_id]": Schema.optional(Schema.String),
  include: Schema.optional(Schema.String)
})
export type ListLicenseKeysInput = typeof ListLicenseKeysInput.Type

export const ListLicenseKeysOutput = Models.LicenseKeyListResponse
export type ListLicenseKeysOutput = typeof ListLicenseKeysOutput.Type

export const listLicenseKeysOperation = defineOperation({
  id: "lemon.listLicenseKeys",
  method: "GET",
  path: "/license-keys",
  inputSchema: ListLicenseKeysInput,
  outputSchema: ListLicenseKeysOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page[number]", "page[size]", "filter[store_id]", "filter[order_id]", "filter[product_id]", "include"]
})

/**
 * List license keys
 */
export const listLicenseKeys = (input: ListLicenseKeysInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(listLicenseKeysOperation, input)))
