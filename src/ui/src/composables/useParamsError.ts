export function extractParamsErrorI18nKey(error): string | null {
  if (error?.response?.status === 100000) {
    const regex = /"([^"]+)"\s/
    const match = error?.response?.statusText.match(regex)
    if (match) {
      const keyParts = match[1].split('.')
      return `paramsError.${keyParts[keyParts.length - 1]}`
    }
    return null
  }
  return null
}
