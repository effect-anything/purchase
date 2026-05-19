"use client"

import { useState, type ReactNode } from "react"

export type CodeTab = {
  readonly id: string
  readonly label: string
  readonly content: ReactNode
}

export function CodeTabs(props: { readonly tabs: ReadonlyArray<CodeTab>; readonly ariaLabel: string }) {
  const [active, setActive] = useState(props.tabs[0]?.id ?? "")

  return (
    <div className="purchase-codeblock">
      <div role="tablist" aria-label={props.ariaLabel} className="purchase-tablist">
        {props.tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className="purchase-tab"
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {props.tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
          className="purchase-codepanel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
