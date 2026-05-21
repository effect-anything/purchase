import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomFieldType = Schema.Literal("text", "checkbox")
export type CustomFieldType = typeof CustomFieldType.Type
