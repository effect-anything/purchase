import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Disposition = Schema.Literal("attachment", "inline")
export type Disposition = typeof Disposition.Type
