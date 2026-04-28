/// <reference types="@cloudflare/workers-types" />

import handler from "vinext/server/app-router-entry"
/**
 * Cloudflare Worker entry point with image optimization.
 *
 * For apps without image optimization, use vinext/server/app-router-entry
 * directly in wrangler.jsonc: "main": "vinext/server/app-router-entry"
 */
import { handleImageOptimization } from "vinext/server/image-optimization"

interface Env {
  DB: D1Database
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>
      }
    }
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Image optimization via Cloudflare Images binding
    if (url.pathname === "/_vinext/image") {
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body)
            .transform(width > 0 ? { width } : {})
            .output({ format, quality })
          return result.response()
        }
      })
    }

    // Delegate everything else to vinext
    return handler.fetch(request, env, ctx)
  }
}
