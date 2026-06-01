import * as Schema from "effect/Schema"

import { PaymentProviderTag } from "./provider/types.ts"

export const isPaymentProvider = Schema.is(PaymentProviderTag)

export type { PaymentProvider } from "./provider/client.ts"
export { PaymentEnvironmentTag, PaymentProviderTag } from "./provider/types.ts"
