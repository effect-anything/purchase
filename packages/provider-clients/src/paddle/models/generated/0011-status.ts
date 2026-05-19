import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Status = Schema.Literal("active", "archived")
export type Status = typeof Status.Type
