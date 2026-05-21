import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerSortProperty = Schema.Literal("created_at", "-created_at", "email", "-email", "name", "-name")
export type CustomerSortProperty = typeof CustomerSortProperty.Type
