import { definePurchaseProject } from "./vitest.shared.ts"

export default definePurchaseProject({
  test: {
    name: "@effect-x/purchase-unit",
    include: ["test/**/!(*.browser).test.{ts,tsx}"],
    exclude: ["e2e/**"]
  }
})
