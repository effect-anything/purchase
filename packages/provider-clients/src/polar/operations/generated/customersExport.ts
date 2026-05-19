import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const CustomersExportInput = Schema.Struct({
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
})
export type CustomersExportInput = typeof CustomersExportInput.Type

export const CustomersExportOutput = Schema.Unknown
export type CustomersExportOutput = typeof CustomersExportOutput.Type

export const customersExportOperation = defineOperation({
  id: "polar.customers:export",
  method: "GET",
  path: "/v1/customers/export",
  inputSchema: CustomersExportInput,
  outputSchema: CustomersExportOutput,
  status: [200],
  contentType: "json",
  queryParams: ["organization_id"]
})

/**
 * Export Customers
 */
export const customersExport = (input: CustomersExportInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersExportOperation, input)))
