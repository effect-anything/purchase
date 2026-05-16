import { describe, it } from "@effect/vitest"

// Catalog e2e scenarios verify how app-defined commerce maps into real provider resources.
describe("catalog provider sync scenarios", () => {
  // The provider catalog should expose the same stable offers that the app uses publicly.
  it.todo(
    "syncs a realistic SaaS catalog into the provider sandbox and exposes stable offer ids through the app pricing API"
  )
  // Sync must respect the boundary between sdk-owned and app-owned provider resources.
  it.todo(
    "keeps sdk-owned products and prices in sync without mutating provider resources that belong to the application team"
  )
  // Re-running sync should converge without duplicate provider artifacts.
  it.todo("survives repeated catalog sync runs with no duplicate products, prices, or provider refs")
})
