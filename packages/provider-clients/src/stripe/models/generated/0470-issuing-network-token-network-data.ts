import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingNetworkTokenNetworkData = Schema.Struct({
  device: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingNetworkTokenDevice, any, any> =>
        Models.IssuingNetworkTokenDevice as Schema.Schema<Models.IssuingNetworkTokenDevice, any, any>
    )
  ),
  mastercard: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingNetworkTokenMastercard, any, any> =>
        Models.IssuingNetworkTokenMastercard as Schema.Schema<Models.IssuingNetworkTokenMastercard, any, any>
    )
  ),
  type: Schema.Literal("mastercard", "visa"),
  visa: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingNetworkTokenVisa, any, any> =>
        Models.IssuingNetworkTokenVisa as Schema.Schema<Models.IssuingNetworkTokenVisa, any, any>
    )
  ),
  wallet_provider: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingNetworkTokenWalletProvider, any, any> =>
        Models.IssuingNetworkTokenWalletProvider as Schema.Schema<Models.IssuingNetworkTokenWalletProvider, any, any>
    )
  )
})
export type IssuingNetworkTokenNetworkData = typeof IssuingNetworkTokenNetworkData.Type
