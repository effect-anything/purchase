import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomField = Schema.Struct({
  type: Schema.suspend(() => Models.CustomFieldType),
  key: Schema.String,
  label: Schema.String,
  optional: Schema.optional(Schema.NullOr(Schema.Boolean)),
  text: Schema.optional(Schema.suspend(() => Models.Text)),
  checkbox: Schema.optional(Schema.suspend(() => Models.Checkbox)),
})
export type CustomField = typeof CustomField.Type
