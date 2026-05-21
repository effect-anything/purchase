import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type ConnectAccountReference = {
  readonly account?: string | Models.Account
  readonly type: "account" | "self"
}

export const ConnectAccountReference = Schema.Struct({
  account: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  type: Schema.Literal("account", "self")
})
