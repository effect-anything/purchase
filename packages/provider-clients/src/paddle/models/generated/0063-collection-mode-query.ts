import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CollectionModeQuery = Schema.Literal("automatic", "manual")
export type CollectionModeQuery = typeof CollectionModeQuery.Type
