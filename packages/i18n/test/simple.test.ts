import { afterEach, describe, expect, it, vi } from "@effect/vitest"

import { getBrowserLocales, resolveLocaleFromLanguage } from "../src/locale-utils.ts"
import { detectLanguage, getClientLocales, getHeaders, initI18n, LanguageDetector } from "../src/server.ts"
import { findCookieByName } from "../src/utils.ts"

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("locale utilities", () => {
  it("resolves mapped locales and falls back to matching available locales", () => {
    expect(resolveLocaleFromLanguage("zh-CN")).toBe("zh-Hans")
    expect(resolveLocaleFromLanguage("ZH_hant")).toBe("zh-TW")
    expect(resolveLocaleFromLanguage("fr-CA", ["en", "fr-CA"])).toBe("fr-ca")
    expect(resolveLocaleFromLanguage("", ["ja", "en"])).toBe("ja")
  })

  it("reads browser locale preferences and falls back on the server", () => {
    vi.stubGlobal("navigator", undefined)

    expect(getBrowserLocales()).toEqual(["en"])

    vi.stubGlobal("navigator", {
      language: "en-US",
      languages: ["zh-CN", "en-US"]
    })

    expect(getBrowserLocales()).toEqual(["zh-CN", "en-US", "en-US"])
  })
})

describe("cookie utilities", () => {
  it("finds cookies by name without disturbing surrounding values or encoded payloads", () => {
    expect(findCookieByName("x-lng", "theme=dark; x-lng=zh-Hans; session=abc")).toBe("zh-Hans")
    expect(findCookieByName("token", "theme=dark; token=part.one=two; x-lng=zh-Hans")).toBe("part.one=two")
    expect(findCookieByName("missing", "theme=dark; x-lng=zh-Hans")).toBeUndefined()
  })
})

describe("server language detection", () => {
  it("parses client locales from request headers and x-lng overrides", () => {
    expect(getClientLocales(new Headers())).toBeUndefined()
    expect(
      getClientLocales(
        new Headers({
          "Accept-Language": "en-US,en;q=0.9"
        })
      )
    ).toEqual(["en-US", "en"])
    expect(
      getClientLocales(
        new Request("https://example.com", {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "x-lng": "zh-CN,zh;q=0.8,en;q=0.5"
          }
        })
      )
    ).toEqual(["zh-CN", "zh", "en"])
  })

  it("normalizes Requests to Headers", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-lng": "ja"
      }
    })

    expect(getHeaders(request).get("x-lng")).toBe("ja")
    expect(getHeaders(request.headers).get("x-lng")).toBe("ja")
  })

  it("rejects cookie-only detection without a cookie parser", () => {
    expect(
      () =>
        new LanguageDetector({
          supportedLanguages: ["en", "zh-Hans"],
          fallbackLanguage: "en",
          order: ["cookie"]
        })
    ).toThrowError("You need a cookie if you want to only get the locale from the cookie")
  })

  it("prefers search params, then cookies, then request headers, before falling back", () => {
    const detector = new LanguageDetector({
      supportedLanguages: ["en", "zh-Hans", "ja"],
      fallbackLanguage: "en",
      order: ["searchParams", "cookie", "header"],
      cookie: {
        name: "x-lng",
        isSigned: false,
        parse: (value) => findCookieByName("x-lng", value ?? ""),
        serialize: (value) => String(value)
      }
    })

    expect(
      detector.detect(
        new Request("https://example.com/?lng=ja", {
          headers: {
            Cookie: "x-lng=zh-CN",
            "Accept-Language": "en-US,en;q=0.9"
          }
        })
      )
    ).toBe("ja")

    expect(
      detector.detect(
        new Request("https://example.com/?lng=fr", {
          headers: {
            Cookie: "x-lng=zh-CN",
            "Accept-Language": "en-US,en;q=0.9"
          }
        })
      )
    ).toBe("zh-Hans")

    expect(
      detector.detect(
        new Request("https://example.com", {
          headers: {
            "Accept-Language": "fr-FR,fr;q=0.9"
          }
        })
      )
    ).toBe("en")
  })

  it("uses the package-level helper to detect the effective language", () => {
    const request = new Request("https://example.com", {
      headers: {
        Cookie: "x-lng=zh-CN",
        "Accept-Language": "en-US,en;q=0.9"
      }
    })

    expect(
      detectLanguage(
        request,
        {
          fallbackLng: "en",
          supportedLngs: ["en", "zh-Hans"]
        },
        ["cookie", "header"]
      )
    ).toBe("zh-Hans")
  })

  it("resolves fallback languages from array and object init options", () => {
    const request = new Request("https://example.com")

    expect(
      detectLanguage(
        request,
        {
          fallbackLng: ["ja", "en"],
          supportedLngs: ["en", "ja"]
        },
        ["header"]
      )
    ).toBe("ja")

    expect(
      detectLanguage(
        request,
        {
          fallbackLng: {
            default: ["zh-Hans", "en"]
          },
          supportedLngs: ["en", "zh-Hans"]
        },
        ["header"]
      )
    ).toBe("zh-Hans")
  })

  it("creates isolated server instances per request while reusing cached resources", async () => {
    const loadCalls: Array<string> = []
    const setup = initI18n({
      defaultNS: "translation",
      fallbackLng: "en",
      ns: ["translation"],
      supportedLngs: ["en", "zh-Hans"],
      loadResource: async (lng) => {
        loadCalls.push(lng)
        return {
          greeting: lng === "zh-Hans" ? "你好" : "Hello"
        }
      }
    })

    const zhInstance = await setup(
      new Request("https://example.com", {
        headers: {
          "x-lng": "zh-CN"
        }
      })
    )
    const enInstance = await setup(
      new Request("https://example.com", {
        headers: {
          "x-lng": "en"
        }
      })
    )
    const enInstanceAgain = await setup(
      new Request("https://example.com", {
        headers: {
          "x-lng": "en"
        }
      })
    )

    expect(zhInstance).not.toBe(enInstance)
    expect(enInstance).not.toBe(enInstanceAgain)
    expect(zhInstance.t("greeting")).toBe("你好")
    expect(enInstance.t("greeting")).toBe("Hello")
    expect(enInstanceAgain.t("greeting")).toBe("Hello")
    expect(loadCalls).toEqual(["zh-Hans", "en"])
  })

  it("retries resource loading after a cached request fails", async () => {
    let attempts = 0
    const setup = initI18n({
      defaultNS: "translation",
      fallbackLng: "en",
      ns: ["translation"],
      supportedLngs: ["en"],
      loadResource: async () => {
        attempts += 1

        if (attempts === 1) {
          throw new Error("temporary failure")
        }

        return {
          greeting: "Hello again"
        }
      }
    })

    const firstInstance = await setup(
      new Request("https://example.com", {
        headers: {
          "x-lng": "en"
        }
      })
    )

    const instance = await setup(
      new Request("https://example.com", {
        headers: {
          "x-lng": "en"
        }
      })
    )

    expect(firstInstance.t("greeting")).toBe("greeting")
    expect(instance.t("greeting")).toBe("Hello again")
    expect(attempts).toBe(2)
  })
})
