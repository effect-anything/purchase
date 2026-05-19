import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Checkbox = Schema.Struct({
  label: Schema.optional(Schema.NullOr(Schema.String)),
  value: Schema.optional(Schema.NullOr(Schema.Boolean)),
})
export type Checkbox = typeof Checkbox.Type
