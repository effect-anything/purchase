import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Meta = Schema.Struct({
  request_id: Schema.String
})
export type Meta = typeof Meta.Type
