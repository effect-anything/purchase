import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerAuthenticationToken = Schema.Struct({
  customer_auth_token: Schema.suspend(
    (): Schema.Schema<Models.CustomerAuthToken, any, any> =>
      Models.CustomerAuthToken as Schema.Schema<Models.CustomerAuthToken, any, any>
  ),
  expires_at: Schema.suspend(
    (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
  )
})
export type CustomerAuthenticationToken = typeof CustomerAuthenticationToken.Type
