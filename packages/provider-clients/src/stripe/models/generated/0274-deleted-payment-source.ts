import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DeletedPaymentSource = Schema.Union(Schema.suspend((): typeof Models.DeletedBankAccount => Models.DeletedBankAccount), Schema.suspend((): typeof Models.DeletedCard => Models.DeletedCard))
export type DeletedPaymentSource = typeof DeletedPaymentSource.Type
