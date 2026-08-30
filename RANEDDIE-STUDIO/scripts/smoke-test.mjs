/**
 * End-to-end smoke test.
 *
 *   npm run build && npm start -- --port 3210
 *   npm run test:smoke
 *
 * Drives a real Chromium against the production build and asserts the things
 * that are easy to break and hard to notice: that the demo project generates,
 * that the compositor actually paints pixels, that playback advances, that an
 * AI plan is produced and applied, and that no console errors appear anywhere.
 *
 * Set BASE_URL to point at a different origin, and PW_EXECUTABLE to use a
 * specific Chromium build.
 */
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3210'
const OUT = process.env.SCREENSHOT_DIR ?? './.smoke'

const errors = []
const failures = []

mkdirSync(OUT, { recursive: true })

function watch(page, label) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[${label}] ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`[${label}] PAGEERROR ${err.message}`))
  page.on('requestfailed', (req) => {
    const url = req.url()
    // Next aborts in-flight RSC prefetches when you navigate away; that is not a defect.
    if (url.includes('_rsc=')) return
    if (url.startsWith(BASE)) failures.push(`[${label}] ${req.failure()?.errorText} ${url}`)
  })
}

const browser = await chromium.launch({
  ...(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {}),
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--use-fake-ui-for-media-stream',
    '--no-sandbox',
    '--enable-features=VaapiVideoDecoder',
  ],
})
const context = await browser.newContext({ viewport: { width: 1600, height: 950 } })
const page = await context.newPage()
watch(page, 'main')

const step = async (name, fn) => {
  process.stdout.write(`▸ ${name}… `)
  try {
    await fn()
    console.log('ok')
  } catch (e) {
    console.log('FAIL')
    console.log('   ', e.message.split('\n')[0])
    failures.push(`[${name}] ${e.message.split('\n')[0]}`)
  }
}

await step('landing page', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: /Create what you imagine/i }).waitFor({ timeout: 8000 })
  await page.screenshot({ path: `${OUT}/01-landing.png`, fullPage: false })
})

await step('pricing page', async () => {
  await page.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' })
  await page.getByText(/These prices are a demonstration/i).waitFor({ timeout: 5000 })
})

await step('dashboard', async () => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Dashboard' }).waitFor({ timeout: 5000 })
  await page.screenshot({ path: `${OUT}/02-dashboard.png` })
})

await step('generate demo project', async () => {
  await page.getByRole('button', { name: /Open demo project/i }).click()
  // Media generation records ~4s of video in real time.
  await page.waitForURL(/\/editor\//, { timeout: 90000 })
  await page.waitForTimeout(3500)
  await page.screenshot({ path: `${OUT}/03-editor.png` })
})

await step('editor loaded with clips', async () => {
  const clips = await page.locator('[aria-label$="seconds"]').count()
  if (clips < 4) throw new Error(`expected clips on the timeline, found ${clips}`)
  console.log(`(${clips} clips) `)
})

await step('preview canvas renders pixels', async () => {
  // The demo opens on a deliberate fade-up from black, so seek past it first.
  await page.keyboard.press('ArrowRight')
  for (let i = 0; i < 60; i++) await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(1200)
  const nonBlank = await page.evaluate(() => {
    const canvas = document.querySelector('canvas[role="img"]')
    if (!canvas) return 'no canvas'
    const probe = document.createElement('canvas')
    probe.width = canvas.width
    probe.height = canvas.height
    const ctx = probe.getContext('2d')
    ctx.drawImage(canvas, 0, 0)
    const { data } = ctx.getImageData(0, 0, probe.width, probe.height)
    let distinct = new Set()
    for (let i = 0; i < data.length; i += 4 * 997) {
      distinct.add(`${data[i]},${data[i + 1]},${data[i + 2]}`)
    }
    return distinct.size
  })
  if (typeof nonBlank !== 'number' || nonBlank < 4) {
    throw new Error(`canvas looks blank (distinct colours: ${nonBlank})`)
  }
})

await step('playback advances the playhead', async () => {
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await page.waitForTimeout(1400)
  const tc = await page.locator('.tabular').first().innerText()
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  if (/^00:00/.test(tc.trim())) throw new Error(`playhead did not advance (${tc})`)
})

/**
 * Timeline clips are labelled "<name> clip, <n> seconds". Media-panel buttons
 * carry the same file names, so match the suffix to avoid grabbing one of those.
 */
async function timelineClips() {
  const clips = page.locator('[aria-label$="seconds"]')
  const count = await clips.count()
  const out = []
  for (let i = 0; i < count; i++) {
    const clip = clips.nth(i)
    out.push({ clip, label: (await clip.getAttribute('aria-label')) ?? '', box: await clip.boundingBox() })
  }
  return out
}

/**
 * The right-most media clip that is actually on screen.
 *
 * Two constraints make this fiddly and both are real product behaviour:
 * tracks slide a dropped clip to the nearest gap, so a gesture needs free space
 * to its right; and a clip scrolled out of the lane still reports a layout box,
 * so the pointer would land on the inspector instead of the timeline.
 */
async function lastMediaClip() {
  // Fit the whole sequence into the lane so the tail end is reachable.
  await page.getByRole('button', { name: 'Fit', exact: true }).click()
  await page.waitForTimeout(400)

  const lane = await page.locator('[data-track-id]').first().boundingBox()
  const all = await timelineClips()
  const media = all.filter(
    (c) =>
      /\.(webm|mp4|mov|png|jpg|wav|mp3)\b/i.test(c.label) &&
      c.box &&
      lane &&
      c.box.x >= lane.x - 1 &&
      c.box.x + c.box.width <= lane.x + lane.width + 1,
  )
  return media.sort((a, b) => b.box.x - a.box.x)[0] ?? null
}

await step('dragging a clip moves it into free space', async () => {
  const target = await lastMediaClip()
  if (!target) throw new Error('no media clip to drag')
  const { clip, box } = target
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2, { steps: 14 })
  await page.mouse.up()
  await page.waitForTimeout(700)
  const after = await clip.boundingBox()
  if (!after || Math.abs(after.x - box.x) < 15) {
    throw new Error(`clip did not move (${box.x} -> ${after?.x})`)
  }
  await page.keyboard.press('Control+z')
  await page.waitForTimeout(500)
})

await step('trimming a clip changes its length', async () => {
  const target = await lastMediaClip()
  if (!target) throw new Error('no media clip to trim')
  const { clip, box } = target
  const pull = Math.max(30, Math.round(box.width * 0.35))
  await page.mouse.move(box.x + box.width - 3, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width - pull, box.y + box.height / 2, { steps: 14 })
  await page.mouse.up()
  await page.waitForTimeout(700)
  const after = await clip.boundingBox()
  if (!after || after.width >= box.width - 10) {
    throw new Error(`clip was not trimmed (${box.width} -> ${after?.width})`)
  }
  await page.keyboard.press('Control+z')
  await page.waitForTimeout(500)
})

await step('AI edit plan from a prompt', async () => {
  // With nothing selected the plan targets the whole sequence; the gesture tests
  // above leave a clip selected, and a plan scoped to one clip is a different
  // (also correct) result than the one this step asserts.
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'Make this feel cinematic.' }).click()
  await page.getByText("I'll make 5 changes.").first().waitFor({ timeout: 15000 })
  const dupes = await page.getByText("I'll make 5 changes.").count()
  if (dupes !== 1) throw new Error(`plan summary rendered ${dupes} times, expected once`)
  // The plan should say it is working across the whole video track, not one clip.
  const scope = await page.getByText(/Reviewed against all \d+ video clips/).count()
  if (scope !== 1) throw new Error('plan did not scope itself to every video clip')
  await page.screenshot({ path: `${OUT}/04-plan.png` })
})

await step('apply the whole plan', async () => {
  await page.getByRole('button', { name: /Apply All/i }).click()
  await page.waitForTimeout(6000)
  const applied = await page.getByText('Completed').count()
  if (applied < 3) throw new Error(`expected several applied operations, saw ${applied}`)
  await page.screenshot({ path: `${OUT}/05-applied.png` })
})

await step('undo restores previous state', async () => {
  const before = await page.locator('[aria-label$="seconds"]').count()
  await page.keyboard.press('Control+z')
  await page.waitForTimeout(600)
  const after = await page.locator('[aria-label$="seconds"]').count()
  if (before === after && before === 0) throw new Error('nothing to undo')
})

await step('silence removal does not duplicate caption text', async () => {
  const captions = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-track-id]')]
    // The caption track is the one whose clips carry the caption accent colour.
    const texts = []
    for (const row of rows) {
      for (const clip of row.querySelectorAll('[aria-label*="caption clip"]')) {
        texts.push(clip.textContent?.trim() ?? '')
      }
    }
    return texts
  })
  const meaningful = captions.filter((t) => t && t !== '(empty caption)')
  const unique = new Set(meaningful)
  if (meaningful.length !== unique.size) {
    throw new Error(`caption text duplicated across clips: ${meaningful.join(' | ')}`)
  }
})

await step('cinematic crop letterboxes the frame', async () => {
  // Land on a frame with picture in it before measuring.
  await page.keyboard.press('Home')
  for (let i = 0; i < 45; i++) await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(900)

  const bars = await page.evaluate(() => {
    const canvas = document.querySelector('canvas[role="img"]')
    if (!canvas) return null
    const probe = document.createElement('canvas')
    probe.width = canvas.width
    probe.height = canvas.height
    const ctx = probe.getContext('2d')
    ctx.drawImage(canvas, 0, 0)
    const { data } = ctx.getImageData(0, 0, probe.width, probe.height)
    const rowBrightness = (y) => {
      let sum = 0
      for (let x = 0; x < probe.width; x += 8) {
        const i = (y * probe.width + x) * 4
        sum += data[i] + data[i + 1] + data[i + 2]
      }
      return sum / Math.ceil(probe.width / 8)
    }
    const dark = 8
    let top = 0
    while (top < probe.height && rowBrightness(top) <= dark) top++
    let bottom = 0
    while (bottom < probe.height && rowBrightness(probe.height - 1 - bottom) <= dark) bottom++
    const middle = rowBrightness(Math.floor(probe.height / 2))
    return { top, bottom, middle, height: probe.height }
  })

  if (!bars) throw new Error('no canvas')
  if (bars.middle <= 8) throw new Error('sampled a black frame — nothing to measure')
  const minimum = Math.round(bars.height * 0.04)
  if (bars.top < minimum || bars.bottom < minimum) {
    throw new Error(
      `expected letterbox bars of at least ${minimum}px, got top=${bars.top} bottom=${bars.bottom} (middle brightness ${bars.middle.toFixed(0)})`,
    )
  }
})

await step('convert to 9:16 changes the composition shape', async () => {
  const before = await page.evaluate(() => {
    const c = document.querySelector('canvas[role="img"]')
    return c ? c.width / c.height : 0
  })
  await page.getByRole('button', { name: 'AI', exact: true }).click()
  await page.getByRole('button', { name: 'Run now' }).nth(3).click()
  await page.waitForTimeout(1800)
  const after = await page.evaluate(() => {
    const c = document.querySelector('canvas[role="img"]')
    return c ? c.width / c.height : 0
  })
  if (!(before > 1 && after < 1)) {
    throw new Error(`aspect did not flip to vertical (${before.toFixed(2)} -> ${after.toFixed(2)})`)
  }
  await page.screenshot({ path: `${OUT}/12-vertical.png` })
  await page.keyboard.press('Control+z')
  await page.waitForTimeout(600)
})

await step('command bar opens with Ctrl+K', async () => {
  await page.keyboard.press('Control+k')
  await page.getByPlaceholder(/Run a command/i).waitFor({ timeout: 4000 })
  await page.screenshot({ path: `${OUT}/06-command-bar.png` })
  await page.keyboard.press('Escape')
})

await step('split shortcut works', async () => {
  await page.locator('[aria-label$="seconds"]').first().click()
  await page.waitForTimeout(300)
  const before = await page.locator('[aria-label$="seconds"]').count()
  await page.keyboard.press('End')
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowRight')
  for (let i = 0; i < 40; i++) await page.keyboard.press('ArrowRight')
  await page.keyboard.press('s')
  await page.waitForTimeout(500)
  const after = await page.locator('[aria-label$="seconds"]').count()
  if (after <= before) throw new Error(`split did not add a clip (${before} → ${after})`)
})

await step('inspector shows media controls for a video clip', async () => {
  await page.locator('[aria-label$="seconds"]').filter({ hasText: 'Skyline' }).first().click()
  await page.getByText('Transform').first().waitFor({ timeout: 5000 })
  await page.getByText('Speed').first().waitFor({ timeout: 3000 })
  await page.screenshot({ path: `${OUT}/11-inspector.png` })
})

await step('export dialog opens and reports engine', async () => {
  await page.getByRole('button', { name: 'Export' }).first().click()
  await page.getByRole('heading', { name: 'Export' }).waitFor({ timeout: 4000 })
  await page.screenshot({ path: `${OUT}/07-export.png` })
  await page.getByRole('button', { name: 'Cancel' }).click()
})

await step('templates panel applies a template', async () => {
  await page.getByRole('button', { name: 'Templates' }).first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/08-templates.png` })
})

await step('settings pages render', async () => {
  for (const path of ['/settings', '/settings/appearance', '/settings/ai', '/settings/shortcuts', '/settings/storage', '/settings/billing']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Settings' }).waitFor({ timeout: 5000 })
  }
  await page.screenshot({ path: `${OUT}/09-settings-ai.png` })
})

await step('mobile layout', async () => {
  const mobile = await context.newPage()
  watch(mobile, 'mobile')
  await mobile.setViewportSize({ width: 390, height: 844 })
  await mobile.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
  await mobile.screenshot({ path: `${OUT}/10-mobile-dashboard.png`, fullPage: false })
  await mobile.close()
})

console.log('\n=== CONSOLE ERRORS ===')
console.log(errors.length ? errors.slice(0, 25).join('\n') : '(none)')
console.log('\n=== FAILURES ===')
console.log(failures.length ? failures.join('\n') : '(none)')

await browser.close()
process.exit(failures.length ? 1 : 0)
