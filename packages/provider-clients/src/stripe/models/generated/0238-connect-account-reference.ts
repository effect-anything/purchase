import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ConnectAccountReference = Schema.Struct({
  account: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account))),
  type: Schema.Literal("account", "self"),
})
export type ConnectAccountReference = typeof ConnectAccountReference.Type
