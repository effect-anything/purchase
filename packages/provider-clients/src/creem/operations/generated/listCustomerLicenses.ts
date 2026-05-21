import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListCustomerLicensesInput = Schema.Struct({
  id: Schema.String,
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number)
})
export type ListCustomerLicensesInput = typeof ListCustomerLicensesInput.Type

export const ListCustomerLicensesOutput = Models.LicenseListEntity
export type ListCustomerLicensesOutput = typeof ListCustomerLicensesOutput.Type

export const listCustomerLicensesOperation = defineOperation({
  id: "creem.listCustomerLicenses",
  method: "GET",
  path: "/customers/{id}/licenses",
  inputSchema: ListCustomerLicensesInput,
  outputSchema: ListCustomerLicensesOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["page_number", "page_size"]
})

/**
 * List customer licenses
 */
export const listCustomerLicenses = (input: ListCustomerLicensesInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(listCustomerLicensesOperation, input)))
