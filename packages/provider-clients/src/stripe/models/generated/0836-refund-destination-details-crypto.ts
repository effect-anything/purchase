import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundDestinationDetailsCrypto = Schema.Struct({
  reference: Schema.NullOr(Schema.String),
})
export type RefundDestinationDetailsCrypto = typeof RefundDestinationDetailsCrypto.Type
