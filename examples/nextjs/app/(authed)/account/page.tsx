import { requireSession } from "@/lib/auth-session"
import { flattenCatalogOffers, formatBenefitLabel, formatBenefitValue, formatOfferPrice } from "@/lib/catalog-view"
import { makeServerHttpApiClient } from "@/lib/http-api-client"

import { AccountCheckoutButton, AccountPlaceholderButton } from "./account-actions.tsx"

export default async function AccountPage() {
  await requireSession()
  const client = await makeServerHttpApiClient()
  const [catalogResponse, account] = await Promise.all([client.catalog.get(), client.account.get()])
  const catalog = flattenCatalogOffers(catalogResponse.catalog.products)

  const activeOfferIds = new Set(account.snapshot.activeOfferIds.map(String))
  const subscriptionOffers = catalog.filter((entry) => entry.offer.type === "subscription")
  const free = subscriptionOffers.find((entry) => entry.offer.isDefault || entry.offer.priceAmount === undefined)
  const monthly = subscriptionOffers.find((entry) => entry.offer.billingInterval === "month")
  const yearly = subscriptionOffers.find((entry) => entry.offer.billingInterval === "year")
  const otherSubscriptions = subscriptionOffers.filter(
    (entry) => entry !== free && entry !== monthly && entry !== yearly
  )
  const lifetimeOffers = catalog.filter((entry) => entry.offer.type === "one_time")
  const creditPacks = catalog.filter((entry) => entry.offer.type === "credits")

  return (
    <main className="app-page account-page">
      <section className="billing-section">
        <div className="section-heading section-heading-single">
          <div>
            <p className="section-label">Subscription</p>
            <h2>Choose the workspace plan</h2>
          </div>
          <p>
            Free is the baseline. Pro monthly and yearly use the configured payment provider for this signed-in account.
          </p>
        </div>
        <div className="pricing-plan-grid">
          {free ? (
            <AccountPlanCard
              product={free.product}
              offer={free.offer}
              active={activeOfferIds.has(free.offer.id)}
              tone="quiet"
            />
          ) : null}
          {monthly ? (
            <AccountPlanCard
              product={monthly.product}
              offer={monthly.offer}
              active={activeOfferIds.has(monthly.offer.id)}
              tone="featured"
            />
          ) : null}
          {yearly ? (
            <AccountPlanCard
              product={yearly.product}
              offer={yearly.offer}
              active={activeOfferIds.has(yearly.offer.id)}
              badge="Best value"
              tone="standard"
            />
          ) : null}
          {otherSubscriptions.map((entry) => (
            <AccountPlanCard
              key={entry.offer.id}
              product={entry.product}
              offer={entry.offer}
              active={activeOfferIds.has(entry.offer.id)}
              tone="standard"
            />
          ))}
        </div>
      </section>

      <section className="billing-section billing-section-split">
        {lifetimeOffers.length > 0 ? (
          <article className="billing-addon-panel">
            <div>
              <p className="section-label">Lifetime</p>
              <h2>Desktop licenses</h2>
              <p className="muted-copy">
                One-time purchases unlock local power-user features without changing the subscription.
              </p>
            </div>
            <div className="credit-pack-list">
              {lifetimeOffers.map(({ product, offer }) => {
                const active = activeOfferIds.has(offer.id)
                return (
                  <div key={offer.id} className={`credit-pack-row${active ? " credit-pack-row-active" : ""}`}>
                    <div>
                      <strong>{offer.name}</strong>
                      <p>{offer.benefits.map((benefit) => formatBenefitLabel(benefit)).join(" · ")}</p>
                    </div>
                    <div>
                      {active ? <span className="offer-badge">Active</span> : null}
                      <span>{formatOfferPrice(offer)}</span>
                      <AccountCheckoutButton offerId={offer.id}>{active ? "Buy again" : "Buy"}</AccountCheckoutButton>
                    </div>
                  </div>
                )
              })}
            </div>
          </article>
        ) : null}

        <article className="billing-addon-panel">
          <div>
            <p className="section-label">AI credits</p>
            <h2>Top up usage</h2>
            <p className="muted-copy">
              Credit packs are one-time purchases and immediately affect the workspace wallet.
            </p>
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
                  <AccountCheckoutButton offerId={offer.id}>Buy</AccountCheckoutButton>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <p className="section-label">Current ownership</p>
          <div className="table-list">
            {account.snapshot.subscriptions.length === 0 && account.snapshot.purchases.length === 0 ? (
              <p className="muted-copy">No paid subscription or one-time purchase yet.</p>
            ) : null}
            {account.snapshot.subscriptions.map((subscription) => (
              <div key={subscription.id} className="table-row">
                <div>
                  <strong>{subscription.offerId}</strong>
                  <p>{subscription.productId}</p>
                </div>
                <div>
                  <span>{subscription.status}</span>
                </div>
              </div>
            ))}
            {account.snapshot.purchases.map((purchase) => (
              <div key={purchase.id} className="table-row">
                <div>
                  <strong>{purchase.offerId}</strong>
                  <p>{purchase.productId}</p>
                </div>
                <div>
                  <span>{purchase.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <p className="section-label">Credit usage</p>
          <div className="table-list">
            {account.snapshot.wallets.map((wallet) => (
              <div key={wallet.id} className="table-row">
                <div>
                  <strong>{wallet.productId}</strong>
                  <p>Wallet balance</p>
                </div>
                <div>
                  <span>{wallet.available}</span>
                </div>
              </div>
            ))}
            {account.activity.creditLedger.length === 0 ? (
              <p className="muted-copy">No credit usage recorded yet.</p>
            ) : null}
            {account.activity.creditLedger.map((entry) => (
              <div key={entry.id} className="table-row">
                <div>
                  <strong>{entry.direction}</strong>
                  <p>{entry.reason ?? "Ledger entry"}</p>
                </div>
                <div>
                  <span>
                    {entry.amount} {entry.productId}
                  </span>
                  <p>{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="two-column-section">
        <article className="dashboard-card">
          <p className="section-label">Checkout history</p>
          <div className="table-list">
            {account.activity.checkoutIntents.length === 0 ? (
              <p className="muted-copy">No checkout intents yet.</p>
            ) : (
              account.activity.checkoutIntents.map((intent) => (
                <div key={intent.id} className="table-row">
                  <div>
                    <strong>{intent.offerId}</strong>
                    <p>{intent.id}</p>
                  </div>
                  <div>
                    <span>{intent.status}</span>
                    <p>{new Date(intent.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="dashboard-card">
          <p className="section-label">Audit log</p>
          <div className="table-list">
            {account.activity.events.length === 0 ? (
              <p className="muted-copy">No billing events recorded yet.</p>
            ) : (
              account.activity.events.map((event) => (
                <div key={event.id} className="table-row">
                  <div>
                    <strong>{event.kind}</strong>
                    <p>{event.offerId ?? "Account event"}</p>
                  </div>
                  <div>
                    <span>{event.provider}</span>
                    <p>{new Date(event.occurredAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-card workspace-panel">
        <p className="section-label">Entitlements</p>
        <div className="table-list">
          {account.entitlements.benefits.map((item) => (
            <div key={item.id} className="table-row">
              <div>
                <strong>{item.key}</strong>
                <p>{item.type}</p>
              </div>
              <div>
                <span>{formatBenefitValue(item)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function AccountPlanCard(props: {
  readonly product: any
  readonly offer: any
  readonly active: boolean
  readonly tone: "quiet" | "standard" | "featured"
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
      <div className="inline-action-block inline-action-block-compact">
        <AccountPlaceholderButton
          children={props.active ? "Manage" : "Select"}
          message="Pricing interactions stay in the account page."
        />
      </div>
    </article>
  )
}
