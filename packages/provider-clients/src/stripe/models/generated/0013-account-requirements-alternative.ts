import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountRequirementsAlternative = Schema.Struct({
  alternative_fields_due: Schema.Array(Schema.String),
  original_fields_due: Schema.Array(Schema.String),
})
export type AccountRequirementsAlternative = typeof AccountRequirementsAlternative.Type
