let retryAttempts = 0

export default {
  async fetch(request: Request) {
    const url = new URL(request.url)

    if (url.pathname === "/retry") {
      retryAttempts = retryAttempts + 1

      if (retryAttempts < 3) {
        return new Response("retry later", { status: 503 })
      }

      return Response.json({
        attempts: retryAttempts
      })
    }

    return Response.json({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    })
  }
}
