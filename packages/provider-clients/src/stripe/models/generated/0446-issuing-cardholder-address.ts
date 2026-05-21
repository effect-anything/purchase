import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardholderAddress = Schema.Struct({
  address: Schema.suspend(
    (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
  )
})
export type IssuingCardholderAddress = typeof IssuingCardholderAddress.Type
