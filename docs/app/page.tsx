const sections = [
  {
    id: "overview",
    label: "Overview",
    title: "A provider-neutral billing runtime for Effect applications.",
    body: "Purchase gives teams one typed commercial layer for catalog authoring, checkout, webhooks, entitlements, credits, refunds, and account activity. The goal is to keep billing logic coherent as products, providers, and operational workflows grow."
  },
  {
    id: "why",
    label: "Why Purchase",
    title: "Most billing complexity appears after the first successful checkout.",
    body: "Provider SDKs expose APIs. They do not give product teams one shared commercial model, one workflow runtime, or one durable place to normalize lifecycle behavior. Purchase is aimed at that missing layer."
  },
  {
    id: "walkthrough",
    label: "Walkthrough",
    title: "Follow the example app like a real SaaS build, not a disconnected API tour.",
    body: "The docs now include a full `Build a SaaS billing app` path extracted from `examples/nextjs`, covering auth, pricing, checkout, webhooks, account activity, and credits consumption."
  },
  {
    id: "surface",
    label: "Surface",
    title: "One runtime surface for the operational parts of billing.",
    body: "Purchase is intentionally shaped around recurring product concerns: catalog synchronization, checkout launch, webhook ingestion, projection refresh, credit consumption, refunds, subscription mutations, and portal entry points."
  }
] as const

const principles = [
  {
    title: "One commercial model",
    body: "Define plans, credits, and lifecycle rules once instead of distributing business logic across provider adapters and app-specific utilities."
  },
  {
    title: "Application-owned state",
    body: "Keep durable workflow state, projections, and schema decisions inside infrastructure the application already owns."
  },
  {
    title: "Operationally explicit",
    body: "Treat replay, entitlement updates, customer state changes, refunds, and provider mismatch handling as first-class runtime concerns."
  }
]

const walkthrough = [
  {
    href: "/docs/examples/auth-and-customers",
    title: "Authentication and customers",
    body: "Start from app-owned identity with Better Auth and map signed-in users into Purchase customer ids."
  },
  {
    href: "/docs/examples/pricing-and-catalog",
    title: "Pricing and catalog",
    body: "Render free, subscription, lifetime, and credits offers from the normalized commercial catalog."
  },
  {
    href: "/docs/examples/checkout-flow",
    title: "Checkout and webhooks",
    body: "Launch hosted checkout from `offerId`, then let provider callbacks reconcile durable state locally."
  },
  {
    href: "/docs/examples/account-portal-and-activity",
    title: "Account and credits",
    body: "Show ownership, activity, entitlements, wallet balances, and credits consumption inside the product."
  }
]

const capabilities = [
  "Catalog DSL for subscriptions, one-time purchases, quotas, and credit units",
  "Shared workflow APIs for checkout, webhooks, portals, refunds, subscription mutations, and credits",
  "Typed customer snapshots, entitlements, wallets, and workflow receipts",
  "Node and Cloudflare-oriented runtime direction with SQL-backed state",
  "Reference Next.js app showing auth, pricing, checkout, account activity, and credits consumption"
]

export default function HomePage() {
  return (
    <main className="bg-docs-surface-muted">
      <div className="mx-auto w-full max-w-[var(--page-max-width)] px-[var(--page-padding-x)] pt-[var(--page-padding-top)] pb-24 max-md:pb-[72px]">
        <div className="grid min-h-[calc(100vh-var(--page-padding-top)-var(--page-padding-bottom))] gap-0 md:grid-cols-[var(--rail-width)_minmax(0,1fr)]">
          <header className="purchase-rail sticky top-[var(--page-padding-top)] self-start pr-10 md:flex md:flex-col md:gap-[18px] md:opacity-[.94]">
            <a
              className="inline-flex items-center py-[6px] text-docs-text-primary no-underline"
              href="/"
              aria-label="Purchase home"
            >
              <span className="grid gap-[2px]">
                <strong className="font-docs-mono text-[13px] leading-none font-medium uppercase">Purchase</strong>
              </span>
            </a>

            <nav className="purchase-rail-nav" aria-label="Sections">
              {sections.map((section) => (
                <a
                  key={section.id}
                  className={`purchase-rail-link purchase-rail-link-${section.id}`}
                  href={`#${section.id}`}
                >
                  {section.label}
                </a>
              ))}
              <a className="purchase-rail-link" href="/docs/examples/overview">
                Example App
              </a>
              <a className="purchase-rail-link" href="/docs">
                Documentation
              </a>
              <a className="purchase-rail-link" href="/docs/roadmap">
                Roadmap
              </a>
            </nav>
          </header>

          <div className="grid min-w-0 gap-[72px]">
            <section
              id="overview"
              className="border-t-0 pt-16 lg:grid lg:min-h-[42vh] lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.9fr)] lg:items-start lg:gap-12"
              aria-labelledby="home-title"
            >
              <div className="min-w-0">
                <p className="font-docs-mono text-[13px] leading-none uppercase text-docs-text-secondary">
                  Effect-first commerce runtime
                </p>
                <h1
                  id="home-title"
                  className="mt-4 mb-0 max-w-[14ch] text-[clamp(32px,7vw,84px)] leading-[0.96] tracking-[-0.055em] max-md:max-w-none"
                >
                  {sections[0].title}
                </h1>
              </div>

              <div className="grid min-w-0 gap-4 pt-8 lg:max-w-[34rem] lg:justify-self-end lg:pt-[clamp(72px,12vw,128px)]">
                <p className="m-0 max-w-[50ch] text-[15px] leading-[24px] text-docs-text-secondary">
                  {sections[0].body}
                </p>

                <div className="grid gap-2 border-t border-docs-border-subtle pt-4">
                  <p className="m-0 max-w-[50ch] text-[14px] leading-[22px] text-docs-text-secondary">
                    Stripe and Paddle stay behind the runtime. SQLite, D1, PostgreSQL, and MySQL-oriented deployments
                    stay with the app.
                  </p>
                  <p className="m-0 max-w-[50ch] text-[14px] leading-[22px] text-docs-text-secondary">
                    The application reads snapshots, entitlements, wallet balances, and activity instead of reasoning
                    directly about provider objects.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 max-md:flex-col max-md:items-stretch">
                  <a
                    className="inline-flex min-h-10 items-center justify-center border border-docs-surface-base bg-docs-surface-base px-4 text-[14px] leading-5 text-docs-text-tertiary no-underline transition-opacity hover:opacity-[.92] active:opacity-[.92] max-md:w-full"
                    href="/docs/examples/overview"
                  >
                    Build a SaaS billing app
                  </a>
                  <a
                    className="inline-flex min-h-10 items-center justify-center text-[14px] leading-5 font-medium text-docs-text-secondary no-underline transition-colors hover:text-docs-text-primary active:text-docs-text-primary"
                    href="/docs"
                  >
                    Documentation
                  </a>
                </div>
              </div>

              <div className="purchase-hero-figure" aria-hidden="true">
                <svg viewBox="0 0 340 240" role="presentation">
                  <path d="M42 42H132" className="svg-rule" />
                  <path d="M42 78H104" className="svg-rule svg-rule-muted" />
                  <path d="M198 34H298" className="svg-rule" />
                  <path d="M198 70H272" className="svg-rule svg-rule-muted" />
                  <path d="M124 120V58" className="svg-link" />
                  <path d="M124 120H214" className="svg-link" />
                  <circle cx="124" cy="120" r="52" className="svg-node" />
                  <circle cx="124" cy="120" r="18" className="svg-node-core-ring" />
                  <circle cx="124" cy="120" r="6" className="svg-node-core" />
                  <rect x="18" y="25" width="58" height="22" rx="0" className="svg-pill" />
                  <rect x="216" y="18" width="72" height="22" rx="0" className="svg-pill" />
                  <rect x="216" y="166" width="84" height="22" rx="0" className="svg-pill" />
                  <path d="M210 120h72" className="svg-rule" />
                </svg>
              </div>
            </section>

            <section id="why" className="border-t border-docs-border-subtle pt-8" aria-labelledby="why-title">
              <div className="grid max-w-[76ch] gap-4">
                <p className="font-docs-mono text-[13px] leading-none uppercase text-docs-text-secondary">
                  {sections[1].label}
                </p>
                <h2
                  id="why-title"
                  className="m-0 max-w-[17ch] text-[24px] leading-[1.3] tracking-[-0.03em] max-md:max-w-none lg:text-[var(--font-size-3xl)]"
                >
                  {sections[1].title}
                </h2>
                <p className="m-0 max-w-[60ch] text-[14px] leading-[22px] text-docs-text-secondary">
                  {sections[1].body}
                </p>
              </div>

              <div className="mt-6 flex justify-start">
                <svg viewBox="0 0 220 44" className="purchase-hero-mini" role="presentation" aria-hidden="true">
                  <path d="M12 26H74" className="svg-rule" />
                  <path d="M78 26H130" className="svg-rule svg-rule-muted" />
                  <path d="M134 26H208" className="svg-rule" />
                  <circle cx="74" cy="26" r="4" className="svg-node-core" />
                  <circle cx="130" cy="26" r="4" className="svg-node-core-ring" />
                </svg>
              </div>
            </section>

            <section
              id="walkthrough"
              className="border-t border-docs-border-subtle pt-8"
              aria-labelledby="walkthrough-title"
            >
              <div className="grid max-w-[76ch] gap-4">
                <p className="font-docs-mono text-[13px] leading-none uppercase text-docs-text-secondary">
                  {sections[3].label}
                </p>
                <h2
                  id="walkthrough-title"
                  className="m-0 max-w-[17ch] text-[24px] leading-[1.3] tracking-[-0.03em] max-md:max-w-none lg:text-[var(--font-size-3xl)]"
                >
                  {sections[3].title}
                </h2>
                <p className="m-0 max-w-[60ch] text-[14px] leading-[22px] text-docs-text-secondary">
                  {sections[3].body}
                </p>
              </div>

              <div className="mt-6 grid gap-0">
                {walkthrough.map((item) => (
                  <a
                    key={item.href}
                    className="grid gap-2 border-t border-docs-border-subtle py-5 text-docs-text-primary no-underline transition-colors hover:text-docs-text-secondary active:text-docs-text-secondary last:border-b"
                    href={item.href}
                  >
                    <h3 className="m-0 text-[16px] leading-6 font-medium">{item.title}</h3>
                    <p className="m-0 max-w-[64ch] text-[14px] leading-[22px] text-docs-text-secondary">{item.body}</p>
                  </a>
                ))}
              </div>
            </section>

            <section id="surface" className="border-t border-docs-border-subtle pt-8" aria-labelledby="surface-title">
              <div className="mt-6 grid gap-0">
                {capabilities.map((item) => (
                  <div
                    key={item}
                    className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 border-t border-docs-border-subtle py-4 last:border-b"
                  >
                    <span
                      className="mt-[6px] h-[10px] w-[10px] rounded-full bg-docs-surface-strong"
                      aria-hidden="true"
                    />
                    <p className="m-0 max-w-[64ch] text-[16px] leading-6">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex items-center justify-end">
                <svg viewBox="0 0 180 36" className="purchase-hero-mini" role="presentation" aria-hidden="true">
                  <path d="M8 18H56" className="svg-rule" />
                  <path d="M60 18H108" className="svg-rule svg-rule-muted" />
                  <path d="M112 18H172" className="svg-rule" />
                  <circle cx="56" cy="18" r="4" className="svg-node-core" />
                  <circle cx="108" cy="18" r="4" className="svg-node-core-ring" />
                </svg>
              </div>
            </section>

            <section className="border-t border-docs-border-subtle pt-8 pb-6" aria-labelledby="next-steps">
              <div className="grid max-w-[76ch] gap-4">
                <p className="font-docs-mono text-[13px] leading-none uppercase text-docs-text-secondary">Next steps</p>
                <h2
                  id="next-steps"
                  className="m-0 max-w-[17ch] text-[24px] leading-[1.3] tracking-[-0.03em] max-md:max-w-none lg:text-[var(--font-size-3xl)]"
                >
                  Open the walkthrough, then drop into the technical docs.
                </h2>
                <p className="m-0 max-w-[60ch] text-[14px] leading-[22px] text-docs-text-secondary">
                  If you want the fastest path to understanding the system, start with the example app series and then
                  read the architecture, workflows, and deployment pages.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 max-md:flex-col max-md:items-stretch">
                <a
                  className="inline-flex min-h-10 items-center justify-center border border-docs-surface-base bg-docs-surface-base px-4 text-[14px] leading-5 text-docs-text-tertiary no-underline transition-opacity hover:opacity-[.92] active:opacity-[.92] max-md:w-full"
                  href="/docs/examples/overview"
                >
                  Open walkthrough
                </a>
                <a
                  className="inline-flex min-h-10 items-center justify-center text-[14px] leading-5 font-medium text-docs-text-secondary no-underline transition-colors hover:text-docs-text-primary active:text-docs-text-primary"
                  href="/docs/concepts/architecture"
                >
                  Read architecture
                </a>
              </div>
            </section>

            <footer className="border-t border-docs-border-subtle pt-5 pb-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <p className="m-0 max-w-[52ch] text-[13px] leading-[21px] text-docs-text-secondary">
                  Purchase is a billing runtime for Effect applications that want to own commercial state, not rent it.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a className="text-[13px] leading-5 text-docs-text-secondary no-underline" href="/docs">
                    Docs
                  </a>
                  <a
                    className="text-[13px] leading-5 text-docs-text-secondary no-underline"
                    href="/docs/examples/overview"
                  >
                    Examples
                  </a>
                  <a className="text-[13px] leading-5 text-docs-text-secondary no-underline" href="/docs/roadmap">
                    Roadmap
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  )
}
