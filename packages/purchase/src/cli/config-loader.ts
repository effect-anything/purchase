import type * as SqlClient from "@effect/sql/SqlClient"
import type * as Layer from "effect/Layer"

import path from "node:path"
import { pathToFileURL } from "node:url"

import type { PurchaseConfig } from "../core/config.ts"
import type { Product, ProductsModule, PurchasePlan, PurchasePlansModule } from "../dsl.ts"
import type { PaymentProvider } from "../provider.ts"

import { PurchaseSDK } from "../sdk.ts"

export interface PurchaseConfigModule {
  readonly config: PurchaseConfig
  readonly plans: PurchasePlansModule
  readonly products: ProductsModule
  readonly layer: Layer.Layer<never, never, PaymentProvider | SqlClient.SqlClient>
}

const resolveModulePath = (modulePath: string) =>
  path.isAbsolute(modulePath) ? modulePath : path.resolve(process.cwd(), modulePath)

export const loadPurchaseConfigModule = async (options: {
  readonly modulePath: string
  readonly exportName?: string | undefined
}): Promise<PurchaseConfigModule> => {
  const importModule = new Function("specifier", `return ${"imp"}ort(specifier)`) as (
    specifier: string
  ) => Promise<Record<string, unknown>>

  const loaded = await importModule(pathToFileURL(resolveModulePath(options.modulePath)).href)

  const selected = options.exportName
    ? loaded[options.exportName]
    : (loaded.purchase ??
      loaded.config ??
      loaded.Pay ??
      loaded.default ??
      (loaded.plans && loaded.products ? loaded : undefined) ??
      (loaded.CommercialPlans && loaded.CommercialProducts ? loaded : undefined))

  if (!selected) {
    throw new Error(
      `No purchase config found in ${options.modulePath}. Export defineConfig(...), plans/products, or a PurchaseSDK subclass.`
    )
  }

  if (typeof selected === "function" && "layer" in selected) {
    const tag = selected as any
    const config = {
      plans: tag.plans,
      products: tag.products
    } satisfies PurchaseConfig

    return {
      config,
      plans: tag.plans,
      products: tag.products,
      layer: tag.layer(tag)
    }
  }

  const candidate = selected as PurchaseConfig & {
    readonly plans?: ReadonlyArray<any>
    readonly products?: ReadonlyArray<any>
  }

  // TODO: schema decode
  const plans: ReadonlyArray<PurchasePlan> = candidate.plans ?? (loaded.plans as any) ?? []
  const products: ReadonlyArray<Product> = candidate.products ?? (loaded.products as any) ?? []

  if (!plans || !products) {
    throw new Error(`Purchase config ${options.modulePath} must provide both plans and products.`)
  }

  class CliPay extends PurchaseSDK<CliPay, Record<string, never>, ReadonlyArray<any>, ReadonlyArray<any>>({
    plans,
    products
  }) {}

  return {
    config: { ...candidate, plans, products },
    plans,
    products,
    layer: CliPay.layer(CliPay)
  }
}
