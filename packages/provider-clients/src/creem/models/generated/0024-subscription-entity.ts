import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend((): Schema.Schema<Models.EnvironmentMode> => Models.EnvironmentMode),
  object: Schema.String,
  product: Schema.Union(
    Schema.suspend((): Schema.Schema<Models.ProductEntity> => Models.ProductEntity),
    Schema.String
  ),
  customer: Schema.Union(
    Schema.suspend((): Schema.Schema<Models.CustomerEntity> => Models.CustomerEntity),
    Schema.String
  ),
  items: Schema.optional(
    Schema.Array(Schema.suspend((): Schema.Schema<Models.SubscriptionItemEntity> => Models.SubscriptionItemEntity))
  ),
  collection_method: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionCollectionMethod> => Models.SubscriptionCollectionMethod
  ),
  status: Schema.suspend((): Schema.Schema<Models.SubscriptionStatus> => Models.SubscriptionStatus),
  last_transaction_id: Schema.optional(Schema.String),
  last_transaction: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.TransactionEntity> => Models.TransactionEntity)
  ),
  last_transaction_date: Schema.optional(Schema.String),
  next_transaction_date: Schema.optional(Schema.String),
  current_period_start_date: Schema.optional(Schema.String),
  current_period_end_date: Schema.optional(Schema.String),
  canceled_at: Schema.optional(Schema.NullOr(Schema.String)),
  created_at: Schema.String,
  updated_at: Schema.String,
  discount: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
})
export type SubscriptionEntity = typeof SubscriptionEntity.Type
