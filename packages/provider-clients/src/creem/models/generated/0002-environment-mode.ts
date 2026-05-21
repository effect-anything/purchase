import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const EnvironmentMode = Schema.Literal("test", "prod", "sandbox")
export type EnvironmentMode = typeof EnvironmentMode.Type
