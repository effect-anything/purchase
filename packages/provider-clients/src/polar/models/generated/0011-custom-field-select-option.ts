import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomFieldSelectOption = Schema.Struct({
  value: Schema.String,
  label: Schema.String
})
export type CustomFieldSelectOption = typeof CustomFieldSelectOption.Type
