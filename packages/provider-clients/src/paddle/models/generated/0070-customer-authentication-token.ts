import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerAuthenticationToken = Schema.Struct({
  customer_auth_token: Schema.suspend((): Schema.Schema<Models.CustomerAuthToken> => Models.CustomerAuthToken),
  expires_at: Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)
})
export type CustomerAuthenticationToken = typeof CustomerAuthenticationToken.Type
