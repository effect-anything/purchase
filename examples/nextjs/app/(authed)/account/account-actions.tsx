"use client"

import { makeBrowserHttpApiClient } from "@/lib/http-api-client-browser"
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
            const response = await client.checkout.start({ payload: { offerId: props.offerId } })

            if (response.checkout.url) {
              window.location.href = response.checkout.url
              return
            }

            setMessage(`Checkout intent ${response.checkout.intentId} recorded.`)
            router.refresh()
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
