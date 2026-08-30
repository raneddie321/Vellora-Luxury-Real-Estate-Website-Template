/**
 * Export verification.
 *
 *   npm run build && npm start -- --port 3210
 *   npm run test:export
 *
 * The product claims the browser writes a real video file. This proves it, for
 * both containers: it runs a full export, then loads the produced blob back into
 * a fresh <video> element and checks that it decodes and has real picture
 * dimensions. A file that will not play back fails the test.
 *
 * The render runs in real time, so each pass takes roughly the sequence length.
 */
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3210'
const OUT = process.env.SCREENSHOT_DIR ?? './.smoke'
const CONTAINERS = (process.env.CONTAINERS ?? 'webm,mp4').split(',')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  ...(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {}),
  args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } })

const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`))

console.log('▸ opening the demo project…')
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Open demo project/i }).click()
await page.waitForURL(/\/editor\//, { timeout: 90000 })
await page.waitForTimeout(3000)

const problems = []

for (const container of CONTAINERS) {
  console.log(`\n▸ exporting ${container.toUpperCase()}…`)
  await page.getByRole('button', { name: 'Export' }).first().click()
  await page.getByRole('heading', { name: 'Export' }).waitFor({ timeout: 5000 })
  await page.getByRole('radio', { name: container === 'mp4' ? 'MP4' : 'WebM' }).click()
  await page.locator('#export-resolution').click()
  await page.getByRole('option', { name: '720p' }).click()
  await page.getByRole('button', { name: 'Start export' }).click()

  const downloadLink = page.getByRole('link', { name: 'Download file' })
  const deadline = Date.now() + 300000
  let finished = false
  while (Date.now() < deadline) {
    if (await downloadLink.count()) {
      finished = true
      break
    }
    const dialog = await page.locator('[role="dialog"]').innerText().catch(() => '')
    const line = dialog.split('\n').find((l) => /Rendering|Transcoding|Decoding|Preparing|failed/i.test(l))
    if (line) console.log('  …', line.trim())
    await page.waitForTimeout(3000)
  }

  if (!finished) {
    await page.screenshot({ path: `${OUT}/20-export-${container}-stalled.png` })
    problems.push(`${container}: export never completed`)
    await page.keyboard.press('Escape')
    continue
  }

  await page.screenshot({ path: `${OUT}/20-export-${container}.png` })

  const details = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[role="dialog"] dl dt')].map((dt) => [
      dt.textContent?.trim(),
      dt.nextElementSibling?.textContent?.trim(),
    ])
    const link = document.querySelector('[role="dialog"] a[download]')
    const notice = [...document.querySelectorAll('[role="dialog"] p')]
      .map((p) => p.textContent?.trim() ?? '')
      .find((t) => /WebM|MP4 conversion/.test(t))
    return { rows: Object.fromEntries(rows), href: link?.getAttribute('href') ?? null, notice }
  })
  console.log('  reported:', details.rows)
  if (details.notice) console.log('  notice:  ', details.notice.slice(0, 160))

  if (!details.href?.startsWith('blob:')) {
    problems.push(`${container}: no downloadable blob was produced`)
    await page.keyboard.press('Escape')
    continue
  }

  const playback = await page.evaluate(async (href) => {
    const blob = await (await fetch(href)).blob()
    const url = URL.createObjectURL(blob)
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'
    const result = await new Promise((resolve) => {
      const done = () =>
        resolve({
          bytes: blob.size,
          type: blob.type,
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        })
      video.onloadeddata = done
      video.onerror = () => resolve({ bytes: blob.size, type: blob.type, error: 'decode failed' })
      setTimeout(() => resolve({ bytes: blob.size, type: blob.type, error: 'decode timed out' }), 15000)
      video.src = url
    })
    URL.revokeObjectURL(url)
    return result
  }, details.href)

  console.log('  decoded: ', playback)

  if (playback.error) problems.push(`${container}: ${playback.error}`)
  if (!playback.bytes || playback.bytes < 20_000) problems.push(`${container}: only ${playback.bytes} bytes`)
  if (!playback.width || !playback.height) problems.push(`${container}: no picture dimensions`)
  if (playback.width && playback.height !== 720) {
    problems.push(`${container}: expected 720p, got ${playback.width}×${playback.height}`)
  }

  await page.getByRole('button', { name: 'Done' }).click()
  await page.waitForTimeout(600)
}

if (errors.length) problems.push(`console errors: ${errors.slice(0, 3).join(' | ')}`)

console.log(
  '\n' + (problems.length ? `FAIL\n - ${problems.join('\n - ')}` : 'PASS — every export is a real, playable file.'),
)
await browser.close()
process.exit(problems.length ? 1 : 0)
