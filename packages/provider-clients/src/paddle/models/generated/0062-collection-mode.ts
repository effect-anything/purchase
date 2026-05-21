import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CollectionMode = Schema.Literal("automatic", "manual")
export type CollectionMode = typeof CollectionMode.Type
