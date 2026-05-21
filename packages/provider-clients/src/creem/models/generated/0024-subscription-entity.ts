import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend(
    (): Schema.Schema<Models.EnvironmentMode, any, any> =>
      Models.EnvironmentMode as Schema.Schema<Models.EnvironmentMode, any, any>
  ),
  object: Schema.String,
  product: Schema.Union(
    Schema.suspend(
      (): Schema.Schema<Models.ProductEntity, any, any> =>
        Models.ProductEntity as Schema.Schema<Models.ProductEntity, any, any>
    ),
    Schema.String
  ),
  customer: Schema.Union(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerEntity, any, any> =>
        Models.CustomerEntity as Schema.Schema<Models.CustomerEntity, any, any>
    ),
    Schema.String
  ),
  items: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.SubscriptionItemEntity, any, any> =>
          Models.SubscriptionItemEntity as Schema.Schema<Models.SubscriptionItemEntity, any, any>
      )
    )
  ),
  collection_method: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionCollectionMethod, any, any> =>
      Models.SubscriptionCollectionMethod as Schema.Schema<Models.SubscriptionCollectionMethod, any, any>
  ),
  status: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionStatus, any, any> =>
      Models.SubscriptionStatus as Schema.Schema<Models.SubscriptionStatus, any, any>
  ),
  last_transaction_id: Schema.optional(Schema.String),
  last_transaction: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionEntity, any, any> =>
        Models.TransactionEntity as Schema.Schema<Models.TransactionEntity, any, any>
    )
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
