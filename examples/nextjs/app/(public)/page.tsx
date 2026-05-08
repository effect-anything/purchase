import { getSession } from "@/services/auth"
import Link from "next/link"

export default async function HomePage() {
  return (
    <main className="landing-page marketing-page">
      <section className="marketing-hero">
        <div>
          <p className="eyebrow">Notes commerce app</p>
          <h1>A focused notes workspace with billing built in</h1>
          <p className="lede">
            Capture team notes, keep product decisions searchable, and unlock sync, AI assistance, desktop features, and
            credit packs when the workspace grows.
          </p>
          <div className="hero-actions">
            <Link href="/sign-up" className="primary-button">
              Start free
            </Link>
            <Link href="/pricing" className="ghost-button">
              View pricing
            </Link>
          </div>
        </div>
        <div className="product-preview">
          <div className="preview-toolbar">
            <span>Weekly product memo</span>
            <strong>Draft</strong>
          </div>
          <div className="preview-note">
            <h2>Launch checklist</h2>
            <p>Ship onboarding, invite billing admins, review account usage, and collect upgrade feedback.</p>
          </div>
          <div className="preview-grid">
            <span>12 notes</span>
            <span>3 editors</span>
            <span>Synced</span>
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="section-heading">
          <div>
            <p className="section-label">Workspace</p>
            <h2>Built around everyday team note workflows</h2>
          </div>
          <p>Billing exists in the account area, while the application stays focused on writing and using notes.</p>
        </div>
        <div className="feature-grid">
          <article>
            <strong>Structured notes</strong>
            <p>Keep meeting notes, decisions, drafts, and operating docs in one workspace.</p>
          </article>
          <article>
            <strong>Sync and history</strong>
            <p>Upgrade when the team needs longer history, more storage, and cross-device sync.</p>
          </article>
          <article>
            <strong>AI assistance</strong>
            <p>Use credit packs for summaries, rewrites, and smart editing actions.</p>
          </article>
        </div>
      </section>

      <section className="pricing-teaser">
        <div>
          <p className="section-label">Pricing</p>
          <h2>Free workspace, Pro plans, lifetime desktop, and credits</h2>
        </div>
        <Link href="/pricing" className="primary-button">
          Compare plans
        </Link>
      </section>
    </main>
  )
}
