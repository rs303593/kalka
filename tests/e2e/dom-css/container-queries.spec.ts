import { publicBrowserHTMLLayers } from '#tests/helpers/dom-css-browser'

import { expect, test } from '../fixtures'

/** A page whose menu shows, beside its content, only where the container around it is wide. */
const MENU_PAGE = `<style>
  body { margin: 0 }
  .app { container: app / inline-size }
  .shell { display: grid; grid-template-columns: 1fr; cursor: default }
  .side { display: none }
  .main { height: 120px }
  @container app (min-width: 1024px) {
    .shell { grid-template-columns: 240px 1fr; cursor: crosshair }
    .side { display: flex; flex-direction: column; gap: 8px }
  }
</style>
<div class="app"><div class="shell"><nav class="side"><a>Rooms</a><a>Visits</a></nav><main class="main">Today</main></div></div>`

/** The same card in a wide container, and in a narrow container inside that wide one. */
const NESTED_CONTAINERS_PAGE = `<style>
  body { margin: 0 }
  .wide { container-type: inline-size; width: 900px }
  .narrow { container-type: inline-size; width: 300px }
  .card { height: 20px; cursor: default }
  @container (min-width: 600px) { .card { cursor: crosshair } }
</style>
<div class="wide"><div class="card" id="in-wide"></div><div class="narrow"><div class="card" id="in-narrow"></div></div></div>`

/**
 * One box per way a container rule can sit among other conditions, in a container 500px wide.
 * Each box starts at `cursor: default`, and the rule under test would make it `crosshair`.
 */
const CONDITIONS_PAGE = `<style>
  body { margin: 0 }
  .frame { container: frame / inline-size; width: 500px }
  .frame > div { height: 10px; cursor: default }
  @media (min-width: 1px) { @container frame (min-width: 400px) { #in-held-media { cursor: crosshair } } }
  @media (max-width: 1px) { @container frame (min-width: 400px) { #in-unheld-media { cursor: crosshair } } }
  @container frame (min-width: 400px) { @supports (display: grid) { #around-held-supports { cursor: crosshair } } }
  @container frame (min-width: 400px) { @media (max-width: 1px) { #around-unheld-media { cursor: crosshair } } }
  @container frame (min-width: 400px) { @container frame (max-width: 600px) { #in-two-held { cursor: crosshair } } }
  @container frame (min-width: 400px) { @container frame (max-width: 450px) { #in-one-unheld { cursor: crosshair } } }
  @container frame (min-width: 400px) { #before-a-later-rule { cursor: crosshair } }
  #before-a-later-rule { cursor: wait }
</style>
<div class="frame"><div id="in-held-media"></div><div id="in-unheld-media"></div><div id="around-held-supports"></div><div id="around-unheld-media"></div><div id="in-two-held"></div><div id="in-one-unheld"></div><div id="before-a-later-rule"></div></div>`

for (const sandbox of ['iframe', 'shadow-root'] as const) {
  test.describe(`HTML import reads container queries, measured in ${sandbox}`, () => {
    test('keeps what a container rule says where its container is wide enough', async ({
      page
    }) => {
      const layers = await publicBrowserHTMLLayers(page, MENU_PAGE, {
        viewportWidth: 1040,
        sandbox
      })
      const shell = layers.find((layer) => layer.name === 'shell')
      expect(shell?.style['grid-template-columns']).toBe('240px 1fr')
      expect(shell?.style.cursor).toBe('crosshair')
      // The page draws the menu, so its layer must not keep the rule that hides it elsewhere.
      const side = layers.find((layer) => layer.name === 'side')
      expect(side).toMatchObject({ visible: true, width: 240 })
      expect(side?.style.display).not.toBe('none')
    })

    test('keeps the rule outside the container rule where the container is too narrow', async ({
      page
    }) => {
      const layers = await publicBrowserHTMLLayers(page, MENU_PAGE, {
        viewportWidth: 600,
        sandbox
      })
      const shell = layers.find((layer) => layer.name === 'shell')
      expect(shell?.style['grid-template-columns']).toBe('1fr')
      expect(shell?.style.cursor).toBe('default')
      expect(layers.filter((layer) => layer.name === 'side')).toHaveLength(0)
    })

    test('asks the nearest container, not a wider one around it', async ({ page }) => {
      const layers = await publicBrowserHTMLLayers(page, NESTED_CONTAINERS_PAGE, {
        viewportWidth: 1000,
        sandbox
      })
      expect(layers.find((layer) => layer.name === 'in-wide')?.style.cursor).toBe('crosshair')
      expect(layers.find((layer) => layer.name === 'in-narrow')?.style.cursor).toBe('default')
    })

    test('reads a container rule only where every condition around and inside it holds', async ({
      page
    }) => {
      const layers = await publicBrowserHTMLLayers(page, CONDITIONS_PAGE, {
        viewportWidth: 1000,
        sandbox
      })
      const cursors = Object.fromEntries(layers.map((layer) => [layer.name, layer.style.cursor]))
      expect(cursors).toMatchObject({
        'in-held-media': 'crosshair',
        'in-unheld-media': 'default',
        'around-held-supports': 'crosshair',
        'around-unheld-media': 'default',
        'in-two-held': 'crosshair',
        'in-one-unheld': 'default',
        // Rules keep the order they are written in: a later rule still wins.
        'before-a-later-rule': 'wait'
      })
    })
  })
}
