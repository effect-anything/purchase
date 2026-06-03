import { describe, layer } from "@effect/vitest"
import { Effect } from "effect"

import { aiCredits500Pack } from "../../business-fixtures.ts"
import { assert } from "../../utils/assertions.ts"
import { Harness } from "../../utils/harness.ts"
import { filteredScenarioPaymentProviders, makeScenarioRuntime } from "../../utils/scenario-runtime.ts"

describe.each(filteredScenarioPaymentProviders)(
  "%s credit wallet lifecycle scenarios",
  (_providerName, paymentProvider) => {
    const Live = makeScenarioRuntime(paymentProvider)

    // Credit wallet scenarios cover prepaid balances that usage-based products depend on.
    layer(Live, { excludeTestServices: true })((it) => {
      // A successful real payment should increase the wallet the app reads back.
      // Implementation note:
      // - create the credit checkout through the app HTTP API, then complete the hosted provider payment in browser
      // - verify provider-side paid transaction/invoice through PaymentProvider
      // - verify local invoice, credit_ledger, and entitlement rows through SqlClient
      // - use assert.credit.wallet and assert.credit.durableLedger after wallet projection is observable
      it.todo(`credits ${aiCredits500Pack.amount} ${aiCredits500Pack.creditKey} after a real provider payment`)

      // Retried app-side credit consumption must not double-spend the purchased balance.
      // Implementation note:
      // - start from a real paid credit-pack checkout and webhook projection
      // - send the same consume idempotency key through the app HTTP API more than once
      // - verify no provider-side mutation is expected for pure app-side consume
      // - verify credit_ledger rows and wallet snapshot both converge to a single consume entry
      it.todo(`consumes ${aiCredits500Pack.creditKey} idempotently after a real credit-pack purchase`)

      // Overspend attempts should fail safely even under concurrent requests.
      // Implementation note:
      // - verify provider-side state stays unchanged
      // - verify SqlClient rows do not grow unexpectedly
      it.effect(
        "rejects overspend attempts without changing available balance or writing credit ledger rows",
        Effect.fn(function* () {
          const harness = yield* Harness
          const customer = yield* harness.openFreshCustomerAccount()
          const result = yield* Effect.either(
            harness.consumeCredits({
              session: customer.session,
              amount: aiCredits500Pack.amount,
              reason: "e2e-overspend"
            })
          )
          const account = yield* harness.getAccount(customer.session)
          const durable = yield* harness.getDurableState(customer.session)
          assert.credit.spendDenied(account, result, {
            creditKey: aiCredits500Pack.creditKey
          })
          assert.credit.noLedger(durable, {
            creditKey: aiCredits500Pack.creditKey
          })
        })
      )

      // Refund handling must express the product rule for reversing or compensating credits.
      // Implementation note:
      // - verify provider-side refund plus local refund ledger semantics together
      it.todo("reverses or compensates credit balance correctly when the underlying purchase is refunded")
    })
  }
)
