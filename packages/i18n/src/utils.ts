export function findCookieByName(key: string, cookie: string) {
  const cookies = cookie.split(";")
  for (const c of cookies) {
    const separatorIndex = c.indexOf("=")
    if (separatorIndex === -1) {
      continue
    }

    const name = c.slice(0, separatorIndex).trim()
    if (name === key) {
      return c.slice(separatorIndex + 1)
    }
  }
  return undefined
}
