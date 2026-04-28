"use client"

import { makeBrowserHttpApiClient } from "@/lib/http-api-client-browser"
import { useState } from "react"

export function WorkspaceClient() {
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const consumeCredits = async () => {
    setPending(true)
    setMessage(null)

    try {
      const client = await makeBrowserHttpApiClient()
      const response = await client.credits.consume({
        payload: {
          amount: 25,
          reason: "AI note summarization"
        }
      })
      setMessage(`Summary queued. Remaining AI credits: ${response.wallet.available}.`)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="workspace-actions">
      <button type="button" className="primary-button" onClick={() => setMessage("New note draft created.")}>
        New note
      </button>
      <button type="button" className="ghost-button" disabled={pending} onClick={consumeCredits}>
        Summarize
      </button>
      {message ? <p className="inline-message">{message}</p> : null}
    </div>
  )
}
