import type * as Layer from "effect/Layer"

import path from "node:path"
import { pathToFileURL } from "node:url"

import type { PurchaseConfig } from "../core/config.ts"

import { BaseSDK } from "../sdk.ts"

export interface PurchaseConfigModule {
  readonly config: PurchaseConfig
  readonly plans: ReadonlyArray<unknown> | undefined
  readonly products: ReadonlyArray<unknown> | undefined
  readonly layer: Layer.Layer<any, unknown, unknown>
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
      `No purchase config found in ${options.modulePath}. Export defineConfig(...), plans/products, or a BaseSDK subclass.`
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
    readonly plans?: ReadonlyArray<unknown> | undefined
    readonly products?: ReadonlyArray<unknown> | undefined
  }

  const plans =
    candidate.plans ??
    (loaded.plans as ReadonlyArray<unknown> | undefined) ??
    (loaded.CommercialPlans as ReadonlyArray<unknown> | undefined)

  const products =
    candidate.products ??
    (loaded.products as ReadonlyArray<unknown> | undefined) ??
    (loaded.CommercialProducts as ReadonlyArray<unknown> | undefined)

  if (!plans || !products) {
    throw new Error(`Purchase config ${options.modulePath} must provide both plans and products.`)
  }

  class CliPay extends BaseSDK<CliPay, Record<string, never>, ReadonlyArray<unknown>, ReadonlyArray<unknown>>({
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
