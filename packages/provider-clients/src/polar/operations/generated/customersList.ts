import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CustomersListInput = Schema.Struct({
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  query: Schema.optional(Schema.NullOr(Schema.String)),
  page: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
  sorting: Schema.optional(Schema.NullOr(Schema.Array(Models.CustomerSortProperty))),
  metadata: Schema.optional(Models.MetadataQuery)
})
export type CustomersListInput = typeof CustomersListInput.Type

export const CustomersListOutput = Models.ListResourceCustomer
export type CustomersListOutput = typeof CustomersListOutput.Type

export const customersListOperation = defineOperation({
  id: "polar.customers:list",
  method: "GET",
  path: "/v1/customers/",
  inputSchema: CustomersListInput,
  outputSchema: CustomersListOutput,
  status: [200],
  contentType: "json",
  queryParams: ["organization_id", "email", "query", "page", "limit", "sorting", "metadata"]
})

/**
 * List Customers
 */
export const customersList = (input: CustomersListInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersListOperation, input)))
