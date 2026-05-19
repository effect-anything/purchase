import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomFieldRequestType = Schema.Literal("text", "checkbox")
export type CustomFieldRequestType = typeof CustomFieldRequestType.Type
