import { AuthForm } from "../sign-in/sign-in-form.tsx"

export default function SignInPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="hero-copy">
          <p className="eyebrow">Sign in</p>
          <h1>Return to your workspace</h1>
          <p className="lede">Use email and password auth backed by Better Auth on Cloudflare D1.</p>
        </div>
        <AuthForm mode="sign-in" />
      </section>
    </main>
  )
}
