import { serviceMessage } from "./message.ts"

export default {
  fetch(request: Request) {
    const url = new URL(request.url)

    return Response.json({
      service: serviceMessage,
      pathname: url.pathname,
      method: request.method
    })
  }
}
