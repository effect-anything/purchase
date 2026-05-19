"use client"

import { makeBrowserHttpApiClient } from "@/services/api/http-api-client-browser"
import { Effect } from "effect"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export function AccountCheckoutButton(props: { readonly offerId: string; readonly children: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div className="inline-action-block inline-action-block-compact">
      <button
        type="button"
        className="primary-button"
        disabled={pending}
        onClick={() => {
          setMessage(null)
          startTransition(async () => {
            const client = await makeBrowserHttpApiClient()
            const response = await Effect.runPromise(client.checkout.start({ payload: { offerId: props.offerId } }))
            const { checkout } = response

            switch (checkout.mode) {
              case "redirect":
              case "bootstrap-redirect":
                if (checkout.url) {
                  window.location.href = checkout.url
                  return
                }
                setMessage(`Checkout ${checkout.intentId} returned no URL.`)
                return
              case "inline-sdk":
                // TODO: open provider overlay in-place using checkout.sessionId
                // e.g. Paddle.Checkout.open({ transactionId: checkout.sessionId })
                setMessage(`Inline checkout ${checkout.intentId} ready (session ${checkout.sessionId}).`)
                router.refresh()
                return
            }
          })
        }}
      >
        {pending ? "Working..." : props.children}
      </button>
      {message ? <p className="inline-message">{message}</p> : null}
    </div>
  )
}

export function AccountPlaceholderButton(props: { readonly children: string; readonly message: string }) {
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div className="inline-action-block inline-action-block-compact">
      <button type="button" className="ghost-button" onClick={() => setMessage(props.message)}>
        {props.children}
      </button>
      {message ? <p className="inline-message">{message}</p> : null}
    </div>
  )
}
