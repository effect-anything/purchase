import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { LemonClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListVariantsInput = Schema.Struct({
  "page[number]": Schema.optional(Schema.Number),
  "page[size]": Schema.optional(Schema.Number),
  "filter[product_id]": Schema.optional(Schema.String),
  "filter[status]": Schema.optional(Schema.Literal("pending", "draft", "published")),
  include: Schema.optional(Schema.String)
})
export type ListVariantsInput = typeof ListVariantsInput.Type

export const ListVariantsOutput = Models.VariantListResponse
export type ListVariantsOutput = typeof ListVariantsOutput.Type

export const listVariantsOperation = defineOperation({
  id: "lemon.listVariants",
  method: "GET",
  path: "/variants",
  inputSchema: ListVariantsInput,
  outputSchema: ListVariantsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page[number]", "page[size]", "filter[product_id]", "filter[status]", "include"]
})

/**
 * List variants
 */
export const listVariants = (input: ListVariantsInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(listVariantsOperation, input)))
