import { layer } from "@effect/vitest"
import * as Effect from "effect/Effect"

import { expectCreditSpendDeniedWithoutBalanceChange, expectNoCreditLedgerActivity } from "../../utils/assertions.ts"
import { aiCredits500Pack } from "../../utils/business-fixtures.ts"
import * as Harness from "../../utils/harness.ts"
import { makeScenarioRuntime } from "../../utils/scenario-runtime.ts"

const Live = makeScenarioRuntime()

// Credit wallet scenarios cover prepaid balances that usage-based products depend on.
layer(Live)("credit wallet lifecycle scenarios", (it) => {
  // A successful real payment should increase the wallet the app reads back.
  // Implementation note:
  // - verify provider-side paid transaction/invoice through PaymentClient
  // - verify local invoice, credit_ledger, and entitlement rows through SqlClient
  // - use expectWalletBalance and expectDurableCreditLedger after wallet projection is observable
  it.todo(`credits ${aiCredits500Pack.amount} ${aiCredits500Pack.creditKey} after a real provider payment`)
  // App-side credit consumption must stay idempotent under retries.
  // Implementation note:
  // - verify no provider-side mutation is expected for pure app-side consume
  // - verify credit_ledger rows and wallet snapshot both converge
  // - use Harness.consumeCredits plus expectWalletBalance / expectDurableCreditLedger
  it.todo(`consumes ${aiCredits500Pack.creditKey} idempotently and records a non-duplicated ledger`)
  // Overspend attempts should fail safely even under concurrent requests.
  // Implementation note:
  // - verify provider-side state stays unchanged
  // - verify SqlClient rows do not grow unexpectedly
  it.effect("rejects overspend attempts without changing available balance or writing credit ledger rows", () =>
    Effect.gen(function* () {
      const customer = yield* Harness.openFreshCustomerAccount()

      const result = yield* Harness.tryConsumeCredits({
        session: customer.session,
        amount: aiCredits500Pack.amount,
        reason: "e2e-overspend"
      })
      const account = yield* Harness.viewAccount(customer.session)
      const durable = yield* Harness.getDurableState(customer.session)

      expectCreditSpendDeniedWithoutBalanceChange(account, result, {
        creditKey: aiCredits500Pack.creditKey
      })
      expectNoCreditLedgerActivity(durable, {
        creditKey: aiCredits500Pack.creditKey
      })
    })
  )
  // Refund handling must express the product rule for reversing or compensating credits.
  // Implementation note:
  // - verify provider-side refund plus local refund ledger semantics together
  it.todo("reverses or compensates credit balance correctly when the underlying purchase is refunded")
})
