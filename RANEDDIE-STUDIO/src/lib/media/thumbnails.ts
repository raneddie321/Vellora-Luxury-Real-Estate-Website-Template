/** Poster and filmstrip generation, all done locally in a canvas. */

const THUMB_WIDTH = 320

function drawToDataUrl(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  width = THUMB_WIDTH,
): string {
  const ratio = sourceHeight / sourceWidth || 9 / 16
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = Math.max(1, Math.round(width * ratio))
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.72)
}

export async function generateImageThumbnail(url: string): Promise<string> {
  const img = await loadImage(url)
  return drawToDataUrl(img, img.naturalWidth, img.naturalHeight)
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image could not be loaded.'))
    img.src = url
  })
}

/** Grabs a single frame at `time` seconds. */
export function captureVideoFrame(url: string, time = 0.1, width = THUMB_WIDTH): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'

    const fail = () => {
      video.removeAttribute('src')
      video.load()
      reject(new Error('Could not read a frame from this video.'))
    }

    video.onloadeddata = () => {
      const target = Math.min(time, Math.max(0, (video.duration || 1) - 0.05))
      video.currentTime = target
    }
    video.onseeked = () => {
      try {
        const url = drawToDataUrl(video, video.videoWidth, video.videoHeight, width)
        resolve(url)
      } catch {
        fail()
        return
      }
      video.removeAttribute('src')
      video.load()
    }
    video.onerror = fail
    video.src = url
  })
}

/**
 * Extracts `count` evenly-spaced frames for the timeline clip strip.
 * Runs sequentially: parallel seeks on one element produce torn frames.
 */
export async function generateFilmstrip(url: string, duration: number, count = 6, width = 160): Promise<string[]> {
  const frames: string[] = []
  const video = document.createElement('video')
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve()
    video.onerror = () => reject(new Error('Could not open this video for thumbnails.'))
    video.src = url
  })

  for (let i = 0; i < count; i++) {
    const time = (duration * (i + 0.5)) / count
    // eslint-disable-next-line no-await-in-loop -- seeks must be serialised
    await seek(video, time)
    frames.push(drawToDataUrl(video, video.videoWidth, video.videoHeight, width))
  }
  video.removeAttribute('src')
  video.load()
  return frames
}

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener('seeked', done)
      resolve()
    }
    video.addEventListener('seeked', done)
    video.currentTime = Math.min(time, Math.max(0, (video.duration || 1) - 0.05))
  })
}
