import { initSessionTracking } from "@effect-x/otel/session/session"
import { startTransition } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { HydratedRouter } from "react-router/dom"

// declare global this
declare global {
  interface Window {
    __react_pwa_render_mode: "createRoot" | "hydrate"

    __react_pwa_hydrate_data:
      | {
          meta: []
          modulepreload: Array<{
            type: "script" | "modulepreload"
            href: string
          }>
          links: Array<{
            rel: string
            href: string
          }>
          scripts: []
          context: []
          routeModules: []
        }
      | undefined
  }
}

const filterCommentNode = (nodes: NodeListOf<ChildNode>) => {
  return Array.from(nodes).filter((node) => {
    if (node.nodeType === Node.COMMENT_NODE) {
      return false
    }
    return true
  })
}

export function init() {
  const root = document.getElementById("root-layout")
  const hasChildren = root ? filterCommentNode(root.childNodes).length > 0 : false

  if (hasChildren) {
    window.__react_pwa_render_mode = "hydrate"

    startTransition(() => {
      hydrateRoot(
        document,
        // <StrictMode>
        <HydratedRouter />
        // </StrictMode>,
      )
    })
  } else {
    let data: any
    const textContent = document.getElementById("__react_pwa_hydrate_data")?.textContent || ""

    try {
      data = JSON.parse(textContent || "{}")
      window.__react_pwa_hydrate_data = data
    } catch (e) {
      console.error(e)
    }

    window.__react_pwa_render_mode = "createRoot"

    const clientRoot = createRoot(document as unknown as HTMLElement)
    clientRoot.render(
      // <StrictMode>
      <HydratedRouter />
      // </StrictMode>,
    )
  }
}

initSessionTracking()
