import { AuthForm } from "../sign-in/sign-in-form.tsx"

export default async function SignUpPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="hero-copy">
          <p className="eyebrow">Create account</p>
          <h1>Start on the free plan and upgrade in place</h1>
          <p className="lede">The free workspace can later unlock Pro subscriptions, licenses, and AI credits.</p>
        </div>
        <AuthForm mode="sign-up" />
      </section>
    </main>
  )
}
