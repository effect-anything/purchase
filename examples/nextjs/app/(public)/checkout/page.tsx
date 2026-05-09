export default async function CheckoutPage() {
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="hero-copy">
          <p className="eyebrow">Paddle checkout</p>
          <h1>Secure payment</h1>
          <p className="lede">This page is the app-owned Paddle payment link used for transaction checkout URLs.</p>
        </div>
        {clientToken ? (
          <>
            <p className="muted-copy">Paddle checkout should open automatically when a transaction is present.</p>
            <script src="https://cdn.paddle.com/paddle/v2/paddle.js" />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  Paddle.Environment.set("sandbox");
                  Paddle.Initialize({ token: ${JSON.stringify(clientToken)} });
                `
              }}
            />
          </>
        ) : (
          <p className="inline-message">Missing PADDLE_CLIENT_TOKEN. Configure a Paddle client-side token first.</p>
        )}
      </section>
    </main>
  )
}
