// oxlint-disable-next-line import/no-unassigned-import
import "vitest"

declare module "vitest" {
  export interface ProvidedContext {
    readonly purchaseProviderE2E: {
      readonly localBaseURL: string
      readonly publicBaseURL: string
      readonly webhookURL: string
    }
  }
}
