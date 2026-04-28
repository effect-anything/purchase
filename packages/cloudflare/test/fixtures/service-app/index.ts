import { appMessage } from "./message.ts"

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url)

    if (url.pathname === "/service") {
      const response = await env.ECHO_SERVICE.fetch("http://echo-service/through-app", {
        method: "POST"
      })

      return Response.json({
        app: appMessage,
        bindingName: env.NAME,
        logLevel: env.LOG_LEVEL,
        stage: env.STAGE,
        test: env.TEST,
        service: await response.json()
      })
    }

    return Response.json({
      app: appMessage,
      bindingName: env.NAME,
      logLevel: env.LOG_LEVEL,
      stage: env.STAGE,
      test: env.TEST
    })
  }
}
