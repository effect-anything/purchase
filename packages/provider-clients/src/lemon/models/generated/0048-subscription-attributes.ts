import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionAttributes = Schema.Record({ key: Schema.String, value: Schema.Unknown })
export type SubscriptionAttributes = typeof SubscriptionAttributes.Type
