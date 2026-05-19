import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingNetworkTokenNetworkData = Schema.Struct({
  device: Schema.optional(Schema.suspend((): typeof Models.IssuingNetworkTokenDevice => Models.IssuingNetworkTokenDevice)),
  mastercard: Schema.optional(Schema.suspend((): typeof Models.IssuingNetworkTokenMastercard => Models.IssuingNetworkTokenMastercard)),
  type: Schema.Literal("mastercard", "visa"),
  visa: Schema.optional(Schema.suspend((): typeof Models.IssuingNetworkTokenVisa => Models.IssuingNetworkTokenVisa)),
  wallet_provider: Schema.optional(Schema.suspend((): typeof Models.IssuingNetworkTokenWalletProvider => Models.IssuingNetworkTokenWalletProvider)),
})
export type IssuingNetworkTokenNetworkData = typeof IssuingNetworkTokenNetworkData.Type
