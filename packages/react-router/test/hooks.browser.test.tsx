import type { ReactNode } from "react"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, renderHook } from "vitest-browser-react"

const mockFn: typeof vi.fn = vi.fn

const revalidatorState = {
  revalidate: mockFn(),
  state: "idle" as "idle" | "loading"
}

const translationState = {
  i18n: {
    language: "en"
  }
}

const fetcherState = {
  data: undefined as any,
  state: "idle" as "idle" | "loading"
}

const routerDataState = {
  actionData: undefined as any,
  loaderData: undefined as any,
  routeLoaderData: undefined as any
}

const toast = {
  error: mockFn()
}

vi.mock("react-i18next", () => ({
  useTranslation: () => translationState
}))

vi.mock("@effect-x/toaster", () => ({
  useToaster: () => toast
}))

vi.mock("react-router", async (importOriginal) => {
  // oxlint-disable-next-line typescript/consistent-type-imports
  const actual = await importOriginal<typeof import("react-router")>()

  return {
    ...actual,
    useActionData: () => routerDataState.actionData,
    useFetcher: () => fetcherState,
    useLoaderData: () => routerDataState.loaderData,
    useRevalidator: () => revalidatorState,
    useRouteLoaderData: () => routerDataState.routeLoaderData
  }
})

import { Component } from "react"

import { GlobalConfigProvider, useGlobalConfig } from "../src/global/config.tsx"
import { useLanguageChangeRevalidator } from "../src/hooks/use-react-router-utils.ts"
import { useActionData, useFetcherData, useLoaderData, useRouteLoaderData } from "../src/hooks/use-safe-response.ts"
import { appStatusUtils, isAppRoute, NOTIFY_APP_STATUS_CHANGE } from "../src/utils"

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state: { error: Error | null } = {
    error: null
  }

  static getDerivedStateFromError(error: Error) {
    return {
      error
    }
  }

  override render() {
    if (this.state.error) {
      return <pre data-testid="error">{this.state.error.message}</pre>
    }

    return this.props.children
  }
}

const queryElement = (root: ParentNode, selector: string) => root.querySelector(selector) as HTMLElement | null

const resetDocumentCookies = () => {
  document.cookie = "x-app-flag=; Max-Age=0; Path=/; SameSite=Strict"
}

const resetMockState = () => {
  revalidatorState.revalidate.mockReset()
  revalidatorState.state = "idle"
  translationState.i18n.language = "en"
  fetcherState.data = undefined
  fetcherState.state = "idle"
  routerDataState.actionData = undefined
  routerDataState.loaderData = undefined
  routerDataState.routeLoaderData = undefined
  toast.error.mockReset()
}

beforeEach(() => {
  resetMockState()
  resetDocumentCookies()
  window.history.replaceState({}, "", "/")
  vi.spyOn(console, "log").mockImplementation(() => undefined)
})

afterEach(() => {
  resetMockState()
  resetDocumentCookies()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("useLanguageChangeRevalidator", () => {
  it("ignores the first render, revalidates on later language changes, and skips while loading", async () => {
    const hook = await renderHook(() => useLanguageChangeRevalidator())

    expect(hook.result.current).toBeNull()
    expect(revalidatorState.revalidate).not.toHaveBeenCalled()

    translationState.i18n.language = "fr"
    await hook.rerender()

    await vi.waitFor(() => {
      expect(revalidatorState.revalidate).toHaveBeenCalledTimes(1)
    })

    revalidatorState.state = "loading"
    translationState.i18n.language = "ja"
    await hook.rerender()

    await vi.waitFor(() => {
      expect(revalidatorState.revalidate).toHaveBeenCalledTimes(1)
    })
  })
})

describe("safe react-router data hooks", () => {
  it("returns safe loader data and route loader data values", async () => {
    routerDataState.loaderData = {
      success: true,
      result: {
        id: "root"
      }
    }
    routerDataState.routeLoaderData = {
      success: false,
      error: {
        _tag: "ValidationError",
        message: "invalid"
      }
    }

    const loaderHook = await renderHook(() => useLoaderData<any>())
    const routeHook = await renderHook(() => useRouteLoaderData<any>("root"))

    expect(loaderHook.result.current).toEqual({
      success: true,
      result: {
        id: "root"
      }
    })
    expect(routeHook.result.current).toEqual({
      success: false,
      error: {
        _tag: "ValidationError",
        message: "invalid"
      }
    })
  })

  it("throws when loader data is missing or when a server error should escape to the boundary", async () => {
    const MissingLoaderProbe = () => {
      useLoaderData<any>()
      return <div data-testid="ok">ok</div>
    }

    const RouteServerErrorProbe = () => {
      useRouteLoaderData<any>("root")
      return <div data-testid="ok">ok</div>
    }

    routerDataState.loaderData = undefined
    const missingScreen = await render(
      <ErrorBoundary>
        <MissingLoaderProbe />
      </ErrorBoundary>
    )

    await expect
      .element(queryElement(missingScreen.container, '[data-testid="error"]'))
      .toHaveTextContent("Unexpected error occurred")
    await missingScreen.unmount()

    routerDataState.routeLoaderData = {
      success: false,
      error: {
        _tag: "BadRequestError",
        message: "bad route"
      }
    }

    const routeScreen = await render(
      <ErrorBoundary>
        <RouteServerErrorProbe />
      </ErrorBoundary>
    )

    await expect.element(queryElement(routeScreen.container, '[data-testid="error"]')).toHaveTextContent("bad route")
    await routeScreen.unmount()
  })

  it("invokes success and failure handlers for fetchers and falls back to toaster for server errors", async () => {
    const onSuccess = mockFn()
    const onFailure = mockFn()

    fetcherState.data = {
      success: true,
      result: {
        ok: true
      }
    }

    const successHook = await renderHook(() => useFetcherData<any>({ onSuccess, onFailure }))

    expect(successHook.result.current).toBe(fetcherState)
    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        ok: true
      })
    })
    expect(onFailure).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()

    fetcherState.data = {
      success: false,
      error: {
        _tag: "ValidationError",
        message: "invalid payload"
      }
    }
    await successHook.rerender()

    await vi.waitFor(() => {
      expect(onFailure).toHaveBeenCalledWith({
        _tag: "ValidationError",
        message: "invalid payload"
      })
    })

    fetcherState.data = {
      success: false,
      error: {
        _tag: "BadRequestError",
        message: "bad request"
      }
    }
    await successHook.rerender()

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("BadRequestError: bad request")
    })
  })

  it("lets onServerError override the default fetcher toast", async () => {
    const onServerError = mockFn()
    fetcherState.data = {
      success: false,
      error: {
        _tag: "InternalServerError",
        message: "boom"
      }
    }

    await renderHook(() => useFetcherData<any>({ onServerError }))

    await vi.waitFor(() => {
      expect(onServerError).toHaveBeenCalledWith({
        _tag: "InternalServerError",
        message: "boom"
      })
    })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("uses toaster fallback for action server errors and lets onServerError override it", async () => {
    routerDataState.actionData = {
      success: false,
      error: {
        _tag: "BadRequestError",
        message: "action failed"
      }
    }

    const actionHook = await renderHook(() => useActionData<any>({}))

    expect(actionHook.result.current).toEqual(routerDataState.actionData)
    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("BadRequestError: action failed")
    })

    await actionHook.unmount()
    toast.error.mockReset()
    const onServerError = mockFn()
    routerDataState.actionData = {
      success: false,
      error: {
        _tag: "InternalServerError",
        message: "fatal"
      }
    }

    await renderHook(() => useActionData<any>({ onServerError }))

    await vi.waitFor(() => {
      expect(onServerError).toHaveBeenCalledWith({
        _tag: "InternalServerError",
        message: "fatal"
      })
    })
    expect(toast.error).not.toHaveBeenCalled()
  })
})

describe("global config hooks", () => {
  it("reads global config values from the provider", async () => {
    const ConfigProbe = () => {
      const config = useGlobalConfig()
      return <pre data-testid="config">{JSON.stringify(config.languages)}</pre>
    }

    await render(
      <GlobalConfigProvider
        languages={[
          {
            value: "en",
            label: "English"
          }
        ]}
      >
        <ConfigProbe />
      </GlobalConfigProvider>
    )

    await expect.element(queryElement(document, '[data-testid="config"]')).toHaveTextContent("English")
  })

  it("throws when the global config hook is used outside the provider", async () => {
    const ConfigProbe = () => {
      useGlobalConfig()
      return <div data-testid="ok">ok</div>
    }

    await render(
      <ErrorBoundary>
        <ConfigProbe />
      </ErrorBoundary>
    )

    await expect
      .element(queryElement(document, '[data-testid="error"]'))
      .toHaveTextContent("useAppContext must be used within AppProvider")
  })
})

describe("appStatusUtils and route matching", () => {
  it("toggles the app cookie and dispatches app status events in the browser", async () => {
    const handler = mockFn()
    window.addEventListener(NOTIFY_APP_STATUS_CHANGE, handler as EventListener)

    try {
      appStatusUtils.enableApp()
      expect(document.cookie).toContain("x-app-flag=1")
      expect(appStatusUtils.isAppEnabled()).toBe(true)
      expect(appStatusUtils.isAppDisabled()).toBe(false)

      appStatusUtils.disableApp()
      expect(document.cookie).toContain("x-app-flag=0")
      expect(appStatusUtils.isAppEnabled()).toBe(false)
      expect(appStatusUtils.isAppDisabled()).toBe(true)

      await vi.waitFor(() => {
        expect(handler).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            detail: true
          })
        )
        expect(handler).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            detail: false
          })
        )
      })
    } finally {
      window.removeEventListener(NOTIFY_APP_STATUS_CHANGE, handler as EventListener)
    }
  })

  it("treats desktop environments as always enabled without mutating cookies", () => {
    vi.stubGlobal("isDesktop", true)

    appStatusUtils.enableApp()
    appStatusUtils.disableApp()

    expect(appStatusUtils.isAppEnabled()).toBe(true)
    expect(appStatusUtils.isAppDisabled()).toBe(false)
  })

  it("matches app routes using react-router path patterns", () => {
    expect(isAppRoute(["/app/*", "/settings"], "/app/profile")).toBe(true)
    expect(isAppRoute(["/app/*", "/settings"], "/settings")).toBe(true)
    expect(isAppRoute(["/app/*", "/settings"], "/marketing")).toBe(false)
  })
})
