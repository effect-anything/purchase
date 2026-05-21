import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionOrigin = Schema.suspend(
  (): Schema.Schema<Models.PublicTransactionOrigin, any, any> =>
    Models.PublicTransactionOrigin as Schema.Schema<Models.PublicTransactionOrigin, any, any>
)
export type TransactionOrigin = typeof TransactionOrigin.Type
