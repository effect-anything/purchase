import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerType = Schema.Literal("individual", "team")
export type CustomerType = typeof CustomerType.Type
