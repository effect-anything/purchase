import type { CommercialCatalog } from "@effect-x/purchase/schema"

import { makeServerHttpApiClient } from "@/services/api/http-api-client"
import { getSession } from "@/services/auth"
import {
  flattenCatalogOffers,
  formatBenefitLabel,
  formatBenefitValue,
  formatOfferPrice
} from "@/services/catalog/catalog-view"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function PricingPage() {
  const session = await getSession()
  if (session) {
    redirect("/workspace")
  }

  const client = await makeServerHttpApiClient()
  const catalogPayload = await client.catalog.get()
  const offers = flattenCatalogOffers(catalogPayload.catalog.products)
  const subscriptionOffers = offers.filter((entry) => entry.offer.type === "subscription")
  const free = subscriptionOffers.find((entry) => entry.offer.isDefault || entry.offer.priceAmount === undefined)
  const monthly = subscriptionOffers.find((entry) => entry.offer.billingInterval === "month")
  const yearly = subscriptionOffers.find((entry) => entry.offer.billingInterval === "year")
  const otherSubscriptions = subscriptionOffers.filter(
    (entry) => entry !== free && entry !== monthly && entry !== yearly
  )
  const lifetimeOffers = offers.filter((entry) => entry.offer.type === "one_time")
  const creditPacks = offers.filter((entry) => entry.offer.type === "credits")

  return (
    <main className="commerce-page pricing-page">
      <section className="pricing-hero">
        <div>
          <p className="eyebrow">Pricing</p>
          <h1>Notes plans for teams that grow into paid features</h1>
          <p className="lede">
            Start with the free workspace, upgrade to Pro for sync and scale, add a desktop lifetime license, or top up
            AI credits as usage grows.
          </p>
        </div>
        <div className="pricing-hero-actions">
          <Link href="/sign-up" className="primary-button">
            Create account
          </Link>
          <Link href="/sign-in" className="ghost-button">
            Sign in
          </Link>
        </div>
      </section>

      <section className="billing-section">
        <div className="section-heading section-heading-single">
          <div>
            <p className="section-label">Subscription</p>
            <h2>Free first, Pro when the workspace needs more</h2>
          </div>
        </div>
        <div className="pricing-plan-grid">
          {free ? <PublicPlanCard product={free.product} offer={free.offer} tone="quiet" cta="Start free" /> : null}
          {monthly ? (
            <PublicPlanCard product={monthly.product} offer={monthly.offer} tone="featured" cta="Choose monthly" />
          ) : null}
          {yearly ? (
            <PublicPlanCard
              product={yearly.product}
              offer={yearly.offer}
              tone="standard"
              cta="Choose yearly"
              badge="Best value"
            />
          ) : null}
          {otherSubscriptions.map((entry) => (
            <PublicPlanCard
              key={entry.offer.id}
              product={entry.product}
              offer={entry.offer}
              tone="standard"
              cta="Choose plan"
            />
          ))}
        </div>
      </section>

      <section className="billing-section billing-section-split">
        {lifetimeOffers.length > 0 ? (
          <article className="billing-addon-panel">
            <div>
              <p className="section-label">Lifetime</p>
              <h2>Own desktop features permanently</h2>
              <p className="muted-copy">
                One-time purchases unlock local power-user features without changing the subscription.
              </p>
            </div>
            <div className="credit-pack-list">
              {lifetimeOffers.map(({ offer }) => (
                <div key={offer.id} className="credit-pack-row">
                  <div>
                    <strong>{offer.name}</strong>
                    <p>{offer.benefits.map((benefit) => formatBenefitLabel(benefit)).join(" · ")}</p>
                  </div>
                  <div>
                    <span>{formatOfferPrice(offer)}</span>
                    <Link href="/sign-up" className="ghost-button">
                      Buy
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        <article className="billing-addon-panel">
          <div>
            <p className="section-label">AI credits</p>
            <h2>Top up usage without changing plans</h2>
            <p className="muted-copy">Credit packs are one-time purchases for AI generation and smart editing.</p>
          </div>
          <div className="credit-pack-list">
            {creditPacks.map(({ offer }) => (
              <div key={offer.id} className="credit-pack-row">
                <div>
                  <strong>{offer.name}</strong>
                  <p>{offer.benefits.map((benefit) => formatBenefitValue(benefit)).join(" · ")}</p>
                </div>
                <div>
                  <span>{formatOfferPrice(offer)}</span>
                  <Link href="/sign-up" className="ghost-button">
                    Buy
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}

function PublicPlanCard(props: {
  readonly product: (typeof CommercialCatalog.Encoded.products)[number]
  readonly offer: (typeof CommercialCatalog.Encoded.products)[number]["offers"][number]
  readonly tone: "quiet" | "standard" | "featured"
  readonly cta: string
  readonly badge?: string
}) {
  return (
    <article className={`pricing-plan-card pricing-plan-card-${props.tone}`}>
      <div className="offer-header">
        <span className="offer-type">{props.offer.name}</span>
        {props.badge ? <span className="offer-badge">{props.badge}</span> : null}
      </div>
      <strong>{formatOfferPrice(props.offer)}</strong>
      <p className="offer-copy">{props.product.description ?? ""}</p>
      <ul className="benefit-list">
        {props.offer.benefits.map((benefit) => (
          <li key={`${props.offer.id}:${benefit.key}`}>
            <span>{formatBenefitLabel(benefit)}</span>
            <strong>{formatBenefitValue(benefit)}</strong>
          </li>
        ))}
      </ul>
      <Link href="/sign-up" className={props.tone === "featured" ? "primary-button" : "ghost-button"}>
        {props.cta}
      </Link>
    </article>
  )
}
