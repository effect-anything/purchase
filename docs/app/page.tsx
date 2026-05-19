import Link from "next/link"

import { highlight } from "fumadocs-core/highlight"

import { CodeTabs, type CodeTab } from "@/components/code-tabs"
import { GlyphArrow, GlyphGrid, GlyphLayers, GlyphSplit, GlyphTerminal } from "@/components/glyphs"

const rail = [
  { href: "/docs", label: "Documentation" },
  { href: "/docs/getting-started/quickstart", label: "Quickstart" },
  { href: "/docs/concepts/architecture", label: "Architecture" },
  { href: "/docs/providers/overview", label: "Adapters" },
  { href: "/docs/examples/overview", label: "Examples" },
  { href: "/docs/roadmap", label: "Roadmap" }
] as const

const catalogCode = `import { BaseSDK, featureFlag, plan, quotaFeature, subscriptionProduct } from "@effect-x/purchase"

const premiumAccess = featureFlag({ id: "premium_access" })
const apiCalls = quotaFeature({ id: "api_calls" })

const plans = [
  plan({ id: "free", group: "main", default: true, includes: [] }),
  plan({
    id: "pro_monthly",
    group: "main",
    price: { amount: 12, interval: "month" },
    includes: [premiumAccess(), apiCalls({ limit: 100_000, reset: "month" })],
    provider: { stripe: "pro_monthly", paddle: "pro_monthly" }
  })
] as const

const products = [
  subscriptionProduct("app", { name: "App", plans })
] as const

export class Pay extends BaseSDK<Pay, {}, typeof plans, typeof products>({
  plans,
  products
}) {}`

const checkoutCode = `import * as Effect from "effect/Effect"
import { Pay } from "./pay"

const startCheckout = (customerId: string) =>
  Effect.gen(function* () {
    const sdk = yield* Pay
    return yield* sdk.checkout.start({
      customerId,
      offerId: "app:pro_monthly",
      successUrl: "https://app.example.com/billing/success",
      cancelUrl: "https://app.example.com/billing/cancel"
    })
  })`

const webhookCode = `import * as Effect from "effect/Effect"
import { Pay } from "./pay"

export const handleStripeWebhook = (request: Request) =>
  Effect.gen(function* () {
    const sdk = yield* Pay
    const result = yield* sdk.webhooks.handle({
      provider: "stripe",
      signature: request.headers.get("stripe-signature") ?? "",
      body: yield* Effect.promise(() => request.text())
    })
    // accepted | normalizedEvents | reconciliationTriggers
    return result
  })`

const snapshotCode = `import * as Effect from "effect/Effect"
import { Pay } from "./pay"

export const readAccount = (customerId: string) =>
  Effect.gen(function* () {
    const sdk = yield* Pay
    const snapshot = yield* sdk.customer.getSnapshot({ customerId })
    const entitlements = yield* sdk.customer.getEntitlements({ customerId })
    return { snapshot, entitlements }
  })`

const codeSources = [
  { id: "catalog", label: "Catalog", code: catalogCode },
  { id: "checkout", label: "Checkout", code: checkoutCode },
  { id: "webhook", label: "Webhook", code: webhookCode },
  { id: "snapshot", label: "Snapshot", code: snapshotCode }
] as const

const surfaces = [
  {
    index: "01",
    href: "/docs/concepts/architecture",
    title: "Catalog DSL",
    body: "Author features, plans, products, quotas, and credit units as typed values. The catalog compiles into a normalized model every workflow shares."
  },
  {
    index: "02",
    href: "/docs/guides/checkout",
    title: "Workflow runtime",
    body: "Checkout, webhooks, subscription mutations, refunds, and portal entry points run inside a single durable workflow surface with SQL-backed state."
  },
  {
    index: "03",
    href: "/docs/guides/credits",
    title: "Customer projections",
    body: "Read snapshots, entitlements, wallets, and credit balances. The application reasons about commercial state, not provider objects."
  }
]

const references = [
  {
    href: "/docs/examples/overview",
    kicker: "Walkthrough",
    title: "Build a SaaS billing app",
    body: "Auth, pricing, hosted checkout, webhooks, account portal, and credits consumption — wired into a single Next.js reference."
  },
  {
    href: "/docs/providers/overview",
    kicker: "Adapters",
    title: "Stripe and Paddle, behind one runtime",
    body: "Provider catalogs reconcile against the DSL. Swap layers without touching workflow or projection code."
  },
  {
    href: "/docs/roadmap",
    kicker: "Direction",
    title: "Roadmap and design notes",
    body: "Where the runtime is going next: D1 deployments, additional adapters, and the long-running shape of credits and entitlements."
  }
]

export default async function HomePage() {
  const codeTabs: ReadonlyArray<CodeTab> = await Promise.all(
    codeSources.map(async (src) => ({
      id: src.id,
      label: src.label,
      content: await highlight(src.code, {
        lang: "ts",
        themes: { light: "github-light", dark: "github-light" },
        components: {
          pre: ({ children, ...rest }) => <pre {...rest}>{children}</pre>
        }
      })
    }))
  )

  return (
    <main className="bg-docs-surface-muted">
      <div className="mx-auto w-full max-w-[var(--page-max-width)] px-[var(--page-padding-x)] pt-[var(--page-padding-top)] pb-24 max-md:pb-[72px]">
        <div className="grid min-h-[calc(100vh-var(--page-padding-top)-var(--page-padding-bottom))] gap-0 md:grid-cols-[var(--rail-width)_minmax(0,1fr)]">
          {/* Rail */}
          <header
            className="purchase-rail sticky top-[var(--page-padding-top)] self-start pr-10 md:flex md:flex-col md:gap-[18px] md:opacity-[.94]"
            aria-label="Section navigation"
          >
            <Link
              className="inline-flex items-center py-[6px] text-docs-text-primary no-underline"
              href="/"
              aria-label="Purchase home"
            >
              <span className="grid gap-[2px]">
                <strong className="font-docs-mono text-[13px] leading-none font-medium uppercase">Purchase</strong>
              </span>
            </Link>
            <nav className="purchase-rail-nav" aria-label="Sections">
              {rail.map((item) => (
                <Link key={item.href} className="purchase-rail-link" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          {/* Content */}
          <div className="grid min-w-0 gap-[72px]">
            {/* HERO */}
            <section
              id="overview"
              className="pt-16 lg:grid lg:min-h-[52vh] lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-start lg:gap-12"
              aria-labelledby="home-title"
            >
              <div className="min-w-0">
                <span className="purchase-badge" aria-label="Effect-first">
                  Effect-first
                </span>
                <h1
                  id="home-title"
                  className="mt-6 mb-0 max-w-[15ch] text-[clamp(36px,7.4vw,88px)] leading-[0.96] tracking-[-0.05em] max-md:max-w-none"
                >
                  Two runtime surfaces built for commerce-grade Effect apps.
                </h1>
                <p className="mt-6 max-w-[54ch] text-[15px] leading-[24px] text-docs-text-secondary">
                  Purchase gives teams one typed commercial layer for catalog authoring, checkout, webhooks,
                  entitlements, credits, refunds, and account activity. Stripe and Paddle stay behind the runtime; SQL
                  storage stays with the app.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3 max-md:flex-col max-md:items-stretch">
                  <Link className="purchase-btn purchase-btn-primary" href="/docs/getting-started/quickstart">
                    Get the SDK
                  </Link>
                  <Link className="purchase-btn purchase-btn-ghost" href="/docs/examples/overview">
                    Open walkthrough
                  </Link>
                </div>
              </div>
              <div aria-hidden="true" className="mt-10 lg:mt-0 lg:justify-self-end lg:w-[min(100%,240px)]">
                <svg viewBox="0 0 200 200" className="purchase-hero-glyph" role="presentation">
                  <circle cx="100" cy="100" r="86" className="glyph-ring" />
                  <circle cx="100" cy="100" r="58" className="glyph-ring glyph-ring-strong" />
                  <circle cx="100" cy="100" r="30" className="glyph-ring" />
                  <line x1="14" y1="100" x2="186" y2="100" className="glyph-axis" />
                  <line x1="100" y1="14" x2="100" y2="186" className="glyph-axis" />
                  <path d="M30 100 A70 70 0 0 1 170 100" className="glyph-arc" />
                  <circle cx="100" cy="100" r="4.5" className="glyph-dot" />
                  <circle cx="158" cy="100" r="3.5" className="glyph-dot-outline" />
                  <circle cx="42" cy="100" r="3.5" className="glyph-dot-outline" />
                </svg>
              </div>
            </section>

            {/* MODULE 1: RUNTIME */}
            <section id="runtime" className="purchase-module" aria-labelledby="runtime-title">
              <div className="purchase-module-eyebrow">
                <span className="purchase-badge">Core</span>
                <GlyphLayers />
                <span className="font-docs-mono text-[11px] uppercase tracking-[0.08em] text-docs-text-secondary">
                  @effect-x/purchase
                </span>
              </div>
              <div className="purchase-module-grid">
                <div>
                  <h2 id="runtime-title" className="purchase-module-title">
                    The catalog and workflow runtime.
                  </h2>
                  <p className="purchase-module-lede">
                    One typed commercial model drives checkout, webhooks, subscription mutations, refunds, credits, and
                    portal entry points. Every workflow reads the same catalog, every projection writes the same
                    normalized state.
                  </p>
                  <div className="purchase-module-actions">
                    <Link className="purchase-btn purchase-btn-primary" href="/docs/getting-started/quickstart">
                      Quickstart
                    </Link>
                    <Link className="purchase-btn purchase-btn-link" href="/docs/concepts/architecture">
                      Architecture →
                    </Link>
                  </div>
                </div>
                <div className="purchase-metrics" role="list" aria-label="Runtime coverage">
                  <div className="purchase-metric" role="listitem">
                    <div className="purchase-metric-label">Workflows</div>
                    <div className="purchase-metric-value">7</div>
                    <div className="purchase-metric-note">checkout, webhook, refund, mutate, portal, credit, sync</div>
                  </div>
                  <div className="purchase-metric" role="listitem">
                    <div className="purchase-metric-label">Catalog kinds</div>
                    <div className="purchase-metric-value">4</div>
                    <div className="purchase-metric-note">subscription · one-time · quota · credit unit</div>
                  </div>
                  <div className="purchase-metric" role="listitem">
                    <div className="purchase-metric-label">State stores</div>
                    <div className="purchase-metric-value">SQL</div>
                    <div className="purchase-metric-note">SQLite, D1, Postgres, MySQL-oriented</div>
                  </div>
                  <div className="purchase-metric" role="listitem">
                    <div className="purchase-metric-label">Runtime</div>
                    <div className="purchase-metric-value">Effect</div>
                    <div className="purchase-metric-note">Node and Cloudflare-friendly layers</div>
                  </div>
                </div>
              </div>
            </section>

            {/* MODULE 2: ADAPTERS */}
            <section id="adapters" className="purchase-module" aria-labelledby="adapters-title">
              <div className="purchase-module-eyebrow">
                <span className="purchase-badge" data-tone="muted">
                  Adapters
                </span>
                <GlyphSplit />
                <span className="font-docs-mono text-[11px] uppercase tracking-[0.08em] text-docs-text-secondary">
                  Stripe · Paddle
                </span>
              </div>
              <div className="purchase-module-grid">
                <div>
                  <h2 id="adapters-title" className="purchase-module-title">
                    Provider neutrality without the integration tax.
                  </h2>
                  <p className="purchase-module-lede">
                    Provider catalogs reconcile against the DSL. Swap Stripe for Paddle by exchanging a layer — workflows,
                    projections, and product code stay untouched.
                  </p>
                  <div className="purchase-module-actions">
                    <Link className="purchase-btn purchase-btn-primary" href="/docs/providers/overview">
                      Adapter guide
                    </Link>
                    <Link className="purchase-btn purchase-btn-link" href="/docs/providers/stripe">
                      Stripe notes →
                    </Link>
                  </div>
                </div>
                <div className="purchase-metrics" aria-label="Adapter coverage">
                  <div className="purchase-metric">
                    <div className="purchase-metric-label">Adapters shipped</div>
                    <div className="purchase-metric-value">2</div>
                    <div className="purchase-metric-note">Stripe · Paddle</div>
                  </div>
                  <div className="purchase-metric">
                    <div className="purchase-metric-label">Event coverage</div>
                    <div className="purchase-metric-value">100%</div>
                    <div className="purchase-metric-note">normalized webhook envelope</div>
                  </div>
                  <div className="purchase-metric">
                    <div className="purchase-metric-label">Catalog drift</div>
                    <div className="purchase-metric-value">0</div>
                    <div className="purchase-metric-note">DSL is the source of truth</div>
                  </div>
                  <div className="purchase-metric">
                    <div className="purchase-metric-label">Switching cost</div>
                    <div className="purchase-metric-value">Layer</div>
                    <div className="purchase-metric-note">one layer swap, no rewrites</div>
                  </div>
                </div>
              </div>
            </section>

            {/* GET STARTED */}
            <section id="start" className="border-t border-docs-border-subtle pt-10" aria-labelledby="start-title">
              <div className="grid max-w-[76ch] gap-4">
                <p className="purchase-eyebrow">
                  <GlyphTerminal />
                  Get started
                </p>
                <h2
                  id="start-title"
                  className="m-0 max-w-[22ch] text-[28px] leading-[1.08] tracking-[-0.03em] lg:text-[var(--font-size-3xl)]"
                >
                  Define a catalog, start checkout, finalize with webhooks.
                </h2>
                <p className="m-0 max-w-[64ch] text-[14px] leading-[22px] text-docs-text-secondary">
                  The shape stays the same across providers. Pick a tab to read the matching surface.
                </p>
              </div>
              <div className="mt-6">
                <CodeTabs tabs={codeTabs} ariaLabel="Purchase code examples" />
              </div>
            </section>

            {/* SURFACE GRID */}
            <section id="surface" className="border-t border-docs-border-subtle pt-10" aria-labelledby="surface-title">
              <div className="grid max-w-[76ch] gap-4">
                <p className="purchase-eyebrow">
                  <GlyphGrid />
                  Runtime surface
                </p>
                <h2
                  id="surface-title"
                  className="m-0 max-w-[20ch] text-[28px] leading-[1.08] tracking-[-0.03em] lg:text-[var(--font-size-3xl)]"
                >
                  One coherent surface for the operational parts of billing.
                </h2>
              </div>
              <div className="purchase-surface-grid mt-8">
                {surfaces.map((cell) => (
                  <Link key={cell.index} href={cell.href} className="purchase-surface-cell block no-underline">
                    <div className="purchase-surface-index">{cell.index}</div>
                    <h3 className="purchase-surface-title">{cell.title}</h3>
                    <p className="purchase-surface-body">{cell.body}</p>
                    <span className="purchase-surface-link">Read</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* REFERENCE */}
            <section
              id="reference"
              className="border-t border-docs-border-subtle pt-10"
              aria-labelledby="reference-title"
            >
              <div className="grid max-w-[76ch] gap-4">
                <p className="purchase-eyebrow">
                  <GlyphArrow />
                  Reference
                </p>
                <h2
                  id="reference-title"
                  className="m-0 max-w-[22ch] text-[28px] leading-[1.08] tracking-[-0.03em] lg:text-[var(--font-size-3xl)]"
                >
                  Where to go next.
                </h2>
              </div>
              <div className="purchase-refs mt-8">
                {references.map((ref) => (
                  <Link key={ref.href} href={ref.href} className="purchase-ref">
                    <div className="purchase-ref-kicker">{ref.kicker}</div>
                    <h3 className="purchase-ref-title">{ref.title}</h3>
                    <p className="purchase-ref-body">{ref.body}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-docs-border-subtle pt-5 pb-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <p className="m-0 max-w-[52ch] text-[13px] leading-[21px] text-docs-text-secondary">
                  Purchase is a billing runtime for Effect applications that want to own commercial state, not rent it.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link className="text-[13px] leading-5 text-docs-text-secondary no-underline" href="/docs">
                    Docs
                  </Link>
                  <Link
                    className="text-[13px] leading-5 text-docs-text-secondary no-underline"
                    href="/docs/examples/overview"
                  >
                    Examples
                  </Link>
                  <Link className="text-[13px] leading-5 text-docs-text-secondary no-underline" href="/docs/roadmap">
                    Roadmap
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  )
}
