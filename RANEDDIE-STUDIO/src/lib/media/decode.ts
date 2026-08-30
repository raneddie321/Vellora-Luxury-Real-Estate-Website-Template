/**
 * Waiting for a media element to become usable.
 *
 * Attaching listeners *after* setting `src` is a race: a blob URL the browser
 * has already cached can fire `loadeddata` before the listener exists, and the
 * caller then waits forever. Everything here attaches first, checks the current
 * `readyState`, and gives up loudly rather than hanging.
 */

const DEFAULT_TIMEOUT = 30000

export class DecodeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DecodeError'
  }
}

export function loadMediaElement<T extends HTMLVideoElement | HTMLAudioElement>(
  element: T,
  url: string,
  label: string,
  timeoutMs = DEFAULT_TIMEOUT,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false

    const cleanup = () => {
      element.removeEventListener('loadeddata', onReady)
      element.removeEventListener('canplay', onReady)
      element.removeEventListener('error', onError)
      clearTimeout(timer)
    }
    const onReady = () => {
      if (settled) return
      settled = true
      cleanup()
      resolve(element)
    }
    const onError = () => {
      if (settled) return
      settled = true
      cleanup()
      reject(
        new DecodeError(
          `"${label}" could not be decoded by your browser. Try re-encoding it as H.264 MP4.`,
        ),
      )
    }
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      cleanup()
      reject(new DecodeError(`Timed out while decoding "${label}".`))
    }, timeoutMs)

    // Listeners first, then the source — never the other way around.
    element.addEventListener('loadeddata', onReady)
    element.addEventListener('canplay', onReady)
    element.addEventListener('error', onError)
    element.src = url

    // A recycled element may already be past HAVE_CURRENT_DATA.
    if (element.readyState >= 2) onReady()
  })
}

export function loadImageElement(
  image: HTMLImageElement,
  url: string,
  label: string,
  timeoutMs = DEFAULT_TIMEOUT,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      image.onload = null
      image.onerror = null
      fn()
    }
    const timer = setTimeout(
      () => finish(() => reject(new DecodeError(`Timed out while decoding "${label}".`))),
      timeoutMs,
    )
    image.onload = () => finish(() => resolve(image))
    image.onerror = () => finish(() => reject(new DecodeError(`"${label}" could not be decoded.`)))
    image.src = url
    if (image.complete && image.naturalWidth > 0) finish(() => resolve(image))
  })
}
