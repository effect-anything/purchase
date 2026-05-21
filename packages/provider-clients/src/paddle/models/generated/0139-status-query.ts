import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const StatusQuery = Schema.Literal("active", "archived")
export type StatusQuery = typeof StatusQuery.Type
