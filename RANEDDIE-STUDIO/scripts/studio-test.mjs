/**
 * Studio workflow test.
 *
 *   npm run build && npm start -- --port 3210
 *   npm run test:studio
 *
 * Covers the paths a new user actually takes on day one, which the editor-focused
 * smoke test does not: creating a project from scratch, importing a real file,
 * putting it on the timeline, generating captions, and managing projects from the
 * dashboard.
 */
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3210'
const OUT = process.env.SCREENSHOT_DIR ?? './.smoke'
mkdirSync(OUT, { recursive: true })

const errors = []
const failures = []

const browser = await chromium.launch({
  ...(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {}),
  args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } })
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`))

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

/** A real 2×2 PNG, so the import pipeline has actual bytes to decode. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAHElEQVQI12P4//8/AzYEEmDAJgAT' +
    'YMAmABNgwCYAAF2FA/0ZlrEyAAAAAElFTkSuQmCC',
  'base64',
)

await step('create a project from the dashboard', async () => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
  // The dashboard offers this action in the header and again in the empty state.
  await page.getByRole('button', { name: 'New Project' }).first().click()
  await page.getByRole('heading', { name: 'New project' }).waitFor({ timeout: 5000 })
  await page.getByLabel('Project name').fill('Workflow Test')
  await page.getByRole('radio', { name: '9:16' }).click()
  await page.getByRole('button', { name: 'Create project' }).click()
  await page.waitForURL(/\/editor\//, { timeout: 20000 })
  await page.waitForTimeout(2000)
})

await step('new project opens with an empty timeline', async () => {
  const clips = await page.locator('[aria-label$="seconds"]').count()
  if (clips !== 0) throw new Error(`expected an empty timeline, found ${clips} clips`)
  await page.getByText('No media yet').waitFor({ timeout: 5000 })
})

await step('project settings reflect the chosen aspect ratio', async () => {
  const ratio = await page.evaluate(() => {
    const c = document.querySelector('canvas[role="img"]')
    return c ? c.width / c.height : 0
  })
  if (!(ratio > 0 && ratio < 1)) throw new Error(`expected a vertical frame, got ratio ${ratio}`)
})

await step('importing a file adds it to the media library', async () => {
  await page.setInputFiles('input[type="file"]', {
    name: 'test-plate.png',
    mimeType: 'image/png',
    buffer: PNG,
  })
  await page.getByText('test-plate.png').waitFor({ timeout: 15000 })
})

await step('adding the asset creates a clip on the timeline', async () => {
  await page.getByRole('button', { name: /Add test-plate\.png to the timeline/ }).click()
  await page.waitForTimeout(800)
  const clips = await page.locator('[aria-label$="seconds"]').count()
  if (clips !== 1) throw new Error(`expected one clip, found ${clips}`)
  await page.screenshot({ path: `${OUT}/30-new-project.png` })
})

await step('the clip renders in the preview', async () => {
  await page.keyboard.press('Home')
  for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(900)
  const distinct = await page.evaluate(() => {
    const canvas = document.querySelector('canvas[role="img"]')
    const probe = document.createElement('canvas')
    probe.width = canvas.width
    probe.height = canvas.height
    const ctx = probe.getContext('2d')
    ctx.drawImage(canvas, 0, 0)
    const { data } = ctx.getImageData(0, 0, probe.width, probe.height)
    const seen = new Set()
    for (let i = 0; i < data.length; i += 4 * 503) seen.add(`${data[i]},${data[i + 1]},${data[i + 2]}`)
    return seen.size
  })
  if (distinct < 2) throw new Error(`preview shows a flat frame (${distinct} colours)`)
})

await step('applying a template creates labelled slots', async () => {
  await page.getByRole('button', { name: 'Templates' }).first().click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /TikTok Listicle/ }).click()
  await page.getByRole('button', { name: 'Apply template' }).click()
  await page.waitForTimeout(1200)
  const clips = await page.locator('[aria-label$="seconds"]').count()
  // Slots announce what they are waiting for rather than showing invented media.
  const slots = await page.getByText(/Drop (video|an image|audio) here/).count()
  if (clips < 6) throw new Error(`template did not lay out clips (found ${clips})`)
  if (slots === 0) throw new Error('template created no placeholder slots for missing media')
  await page.screenshot({ path: `${OUT}/31-template-applied.png` })
})

await step('undo reverts the template', async () => {
  await page.keyboard.press('Control+z')
  await page.waitForTimeout(800)
  const clips = await page.locator('[aria-label$="seconds"]').count()
  if (clips !== 1) throw new Error(`expected the single clip back, found ${clips}`)
})

await step('caption generation reports honestly with no speech', async () => {
  await page.getByRole('button', { name: 'Elements' }).first().click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /Clean/ }).click()
  // The project holds one still image, so there is no audio to caption. The app
  // must say so rather than inventing captions.
  // The message appears in the toast and again in its description.
  await page
    .getByText(/No captions were created|no audio on the timeline/i)
    .first()
    .waitFor({ timeout: 12000 })
})

await step('the project persists across a reload', async () => {
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const clips = await page.locator('[aria-label$="seconds"]').count()
  if (clips !== 1) throw new Error(`clip did not survive a reload (found ${clips})`)

  // The active panel tab is a persisted preference, so open Media explicitly.
  await page.getByRole('button', { name: 'Media' }).first().click()
  await page.waitForTimeout(600)
  const panel = await page.locator('.panel-header').first().locator('xpath=..').innerText()
  if (!panel.includes('test-plate.png')) {
    throw new Error(`imported asset missing after reload: ${panel.slice(0, 120)}`)
  }
  await page.screenshot({ path: `${OUT}/33-after-reload.png` })
})

await step('duplicating a project from the dashboard', async () => {
  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  const before = await page.locator('article').count()
  await page.getByRole('button', { name: /Actions for Workflow Test/ }).first().click()
  await page.getByRole('menuitem', { name: 'Duplicate' }).click()
  await page.waitForTimeout(1500)
  const after = await page.locator('article').count()
  if (after !== before + 1) throw new Error(`duplicate did not add a project (${before} → ${after})`)
})

await step('renaming a project', async () => {
  await page.getByRole('button', { name: /Actions for Workflow Test copy/ }).first().click()
  await page.getByRole('menuitem', { name: 'Rename' }).click()
  await page.getByLabel('Project name').fill('Renamed Copy')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForTimeout(1200)
  await page.getByText('Renamed Copy').first().waitFor({ timeout: 5000 })
})

await step('deleting a project', async () => {
  const before = await page.locator('article').count()
  await page.getByRole('button', { name: /Actions for Renamed Copy/ }).first().click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete project' }).click()
  await page.waitForTimeout(1500)
  const after = await page.locator('article').count()
  if (after !== before - 1) throw new Error(`delete did not remove a project (${before} → ${after})`)
  await page.screenshot({ path: `${OUT}/32-projects.png` })
})

console.log('\n=== CONSOLE ERRORS ===')
console.log(errors.length ? errors.slice(0, 20).join('\n') : '(none)')
console.log('\n=== FAILURES ===')
console.log(failures.length ? failures.join('\n') : '(none)')

await browser.close()
process.exit(failures.length ? 1 : 0)
