import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingTransactionNetworkData = Schema.Struct({
  authorization_code: Schema.NullOr(Schema.String),
  processing_date: Schema.NullOr(Schema.String),
  transaction_id: Schema.NullOr(Schema.String),
})
export type IssuingTransactionNetworkData = typeof IssuingTransactionNetworkData.Type
