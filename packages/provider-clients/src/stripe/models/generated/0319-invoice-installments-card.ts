import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoiceInstallmentsCard = Schema.Struct({
  enabled: Schema.NullOr(Schema.Boolean),
})
export type InvoiceInstallmentsCard = typeof InvoiceInstallmentsCard.Type
