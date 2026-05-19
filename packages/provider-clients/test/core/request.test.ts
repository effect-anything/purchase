import { describe, expect, it } from "vitest"

import { splitRequestParts } from "../../src/core/request.ts"
import { createCreditLedgerEntryOperation } from "../../src/dodo/operations/generated/createCreditLedgerEntry.ts"
import { createCheckoutOperation } from "../../src/lemon/operations/generated/createCheckout.ts"
import { listProductsOperation } from "../../src/lemon/operations/generated/listProducts.ts"

describe("provider client request encoding", () => {
  it("splits Dodo nested credit balance path params and JSON body", () => {
    const parts = splitRequestParts(
      createCreditLedgerEntryOperation.path,
      {
        credit_entitlement_id: "cde_123",
        customer_id: "cus_456",
        amount: "10.5",
        entry_type: "credit",
        reason: "manual top-up",
        metadata: { source: "test" }
      },
      createCreditLedgerEntryOperation
    )

    expect(parts.path).toBe("/credit-entitlements/cde_123/balances/cus_456/ledger-entries")
    expect(parts.query).toEqual([])
    expect(parts.body).toEqual({
      amount: "10.5",
      entry_type: "credit",
      reason: "manual top-up",
      metadata: { source: "test" }
    })
  })

  it("keeps Lemon JSON:API filter query names intact", () => {
    const parts = splitRequestParts(
      listProductsOperation.path,
      {
        "page[number]": 2,
        "page[size]": 50,
        "filter[store_id]": "store_123",
        include: "variants"
      },
      listProductsOperation
    )

    expect(parts.path).toBe("/products")
    expect(parts.body).toBeUndefined()
    expect(parts.query).toEqual([
      ["page[number]", "2"],
      ["page[size]", "50"],
      ["filter[store_id]", "store_123"],
      ["include", "variants"]
    ])
  })

  it("sends Lemon checkout creation as a JSON:API data document", () => {
    const input = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: { embed: true },
          checkout_data: { email: "customer@example.com" },
          test_mode: true
        },
        relationships: {
          store: { data: { type: "stores", id: "123" } },
          variant: { data: { type: "variants", id: "456" } }
        }
      }
    }

    const parts = splitRequestParts(createCheckoutOperation.path, input, createCheckoutOperation)

    expect(parts.path).toBe("/checkouts")
    expect(parts.query).toEqual([])
    expect(parts.body).toEqual(input)
  })
})
