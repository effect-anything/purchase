import type { CommercialCatalog } from "@effect-x/purchase/schema"

type CatalogProduct = (typeof CommercialCatalog.Encoded.products)[number]
type CatalogOffer = CatalogProduct["offers"][number]
type CatalogBenefit = CatalogOffer["benefits"][number]

export const flattenCatalogOffers = (products: ReadonlyArray<CatalogProduct>) =>
  products.flatMap((product) => product.offers.map((offer) => ({ product, offer }) as const))

export const formatOfferPrice = (offer: CatalogOffer) => {
  if (offer.priceAmount === undefined) {
    return "Free"
  }

  if (offer.billingInterval === "month") {
    return `$${offer.priceAmount}/mo`
  }

  if (offer.billingInterval === "year") {
    return `$${offer.priceAmount}/yr`
  }

  return `$${offer.priceAmount}`
}

export const formatBenefitLabel = (benefit: CatalogBenefit) =>
  benefit.key
    .split(/[_:-]/u)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ")

export const formatBenefitValue = (benefit: CatalogBenefit) => {
  switch (benefit.type) {
    case "credit_balance":
      return String(benefit.amount)
    case "quota_limit":
      return String(benefit.limit)
    case "feature_flag":
      return benefit.enabled ? "Enabled" : "Disabled"
    case "license_grant":
      return benefit.perpetual ? "Perpetual" : benefit.scope
  }
}
