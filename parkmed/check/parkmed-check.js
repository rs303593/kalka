// Parkmed design check. Runs inside `kalka eval` (Figma plugin API), on a saved file or on the
// document open in the Kalka app. The runner (parkmed/check.ts) puts three constants before it:
//   V     the look's values (parkmed/parkmed-values.json, or garo-values.json with --look garo)
//   FIX   true to snap spacing, radius and near-palette colours; false to only report
//   ONLY  an artboard name to check alone, or '' for every artboard
// It returns { pages, artboards, layers, issues, fixed }.

const SPACING_PROPS = ['itemSpacing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']
const SPACING_NAMES = { itemSpacing: 'gap', counterAxisSpacing: 'row gap' }
const SHAPES = new Set([
  'VECTOR',
  'BOOLEAN_OPERATION',
  'ELLIPSE',
  'RECTANGLE',
  'LINE',
  'STAR',
  'POLYGON'
])
const PALETTE = [...Object.values(V.colors.tokens), ...V.colors.alsoUsed].map((hex) =>
  hex.toLowerCase()
)

const issues = []
let layers = 0
let artboards = 0
let fixed = 0

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)
const round = (value) => Math.round(value * 100) / 100

function neighbours(value, steps) {
  const below = [...steps].reverse().find((step) => step <= value)
  const above = steps.find((step) => step >= value)
  return [below, above].filter(
    (step, index, all) => step !== undefined && all.indexOf(step) === index
  )
}

function nearest(value, steps) {
  let best = steps[0]
  for (const step of steps) {
    const distance = Math.abs(step - value)
    const bestDistance = Math.abs(best - value)
    if (distance < bestDistance || (distance === bestDistance && step < best)) best = step
  }
  return best
}

function hexOf(color) {
  const part = (channel) =>
    Math.round(channel * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${part(color.r)}${part(color.g)}${part(color.b)}`
}

function rgbOf(hex) {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function distance(a, b) {
  const [ar, ag, ab] = rgbOf(a)
  const [br, bg, bb] = rgbOf(b)
  return Math.hypot(ar - br, ag - bg, ab - bb)
}

// Blue-green with real saturation: hue 155-200 degrees (the same test as parkmed_look.py).
function isTeal(hex) {
  const [r, g, b] = rgbOf(hex).map((channel) => channel / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max - min < 0.12) return false
  let hue
  if (max === r) hue = 60 * (((g - b) / (max - min)) % 6)
  else if (max === g) hue = 60 * ((b - r) / (max - min) + 2)
  else hue = 60 * ((r - g) / (max - min) + 4)
  if (hue < 0) hue += 360
  return hue >= 155 && hue <= 200
}

function report(context, node, issue) {
  issues.push({
    page: context.page,
    artboard: context.artboard,
    path: context.path.join(' / '),
    id: node.id,
    ...issue
  })
}

function checkSpacing(node, context) {
  if (!('layoutMode' in node) || node.layoutMode === 'NONE') return
  const props =
    node.layoutWrap === 'WRAP' ? [...SPACING_PROPS, 'counterAxisSpacing'] : SPACING_PROPS
  // Every padding and gap is a multiple of the look's base (4 for Parkmed and GARO); 0 is no space.
  const onScale = (value) => value % V.spacing.base === 0
  for (const prop of props) {
    const value = node[prop]
    if (!isNumber(value) || value === 0 || onScale(round(value))) continue
    const to = nearest(Math.max(value, 0), V.spacing.snapTo)
    const issue = {
      kind: 'spacing',
      severity: 'warning',
      prop: SPACING_NAMES[prop] ?? prop,
      value: round(value),
      expected: neighbours(value, V.spacing.snapTo),
      fix: to
    }
    if (FIX) {
      node[prop] = to
      issue.fixed = true
      fixed++
    }
    report(context, node, issue)
  }
}

function checkRadius(node, context) {
  if (!('cornerRadius' in node)) return
  const corners =
    typeof node.cornerRadius === 'symbol'
      ? ['topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius']
      : ['cornerRadius']
  const shortSide = Math.min(node.width || 0, node.height || 0)
  // A mark (a dot, a tick, an icon) keeps its own radius where the look says so (GARO: 64 px or smaller).
  const mark = V.radius.marksUpTo
  if (mark && node.width > 0 && node.width <= mark && node.height > 0 && node.height <= mark) return
  for (const prop of corners) {
    const value = node[prop]
    if (!isNumber(value) || value === 0 || V.radius.allowed.includes(round(value))) continue
    const isPill = value >= 8 && shortSide > 0 && value * 2 >= shortSide - 1
    if (isPill || value >= 999) continue
    const to = nearest(value, V.radius.allowed)
    const issue = {
      kind: 'radius',
      severity: 'warning',
      prop: prop === 'cornerRadius' ? 'corner radius' : prop,
      value: round(value),
      expected: neighbours(value, V.radius.allowed),
      fix: to
    }
    if (FIX) {
      node[prop] = to
      issue.fixed = true
      fixed++
    }
    report(context, node, issue)
  }
}

function checkType(node, context) {
  if (node.type !== 'TEXT' || !isNumber(node.fontSize)) return
  const size = round(node.fontSize)
  if (V.fontSizes.allowed.includes(size)) return
  report(context, node, {
    kind: 'type',
    severity: 'warning',
    prop: 'font size',
    value: size,
    expected: neighbours(
      size,
      V.fontSizes.scale.toSorted((a, b) => a - b)
    )
  })
}

function checkPaints(node, context, key) {
  if (!(key in node) || !Array.isArray(node[key])) return
  const paints = node[key]
  let changed = false
  const next = paints.map((paint) => {
    if (!paint || paint.type !== 'SOLID' || paint.visible === false) return paint
    if (paint.boundVariables && paint.boundVariables.color) return paint
    const hex = hexOf(paint.color)
    if (PALETTE.includes(hex)) return paint
    const what = key === 'fills' ? (node.type === 'TEXT' ? 'text colour' : 'fill') : 'stroke'
    if (isTeal(hex)) {
      // As parkmed_look.py does: teal becomes the look's action colour (Parkmed blue; GARO's forest accent).
      const issue = {
        kind: 'colour',
        severity: 'error',
        prop: what,
        value: hex,
        expected: [`no teal: ${V.colors.tealTo}`],
        fix: V.colors.tealTo
      }
      if (!FIX) {
        report(context, node, issue)
        return paint
      }
      const [r, g, b] = rgbOf(V.colors.tealTo).map((channel) => channel / 255)
      changed = true
      issue.fixed = true
      fixed++
      report(context, node, issue)
      return { ...paint, color: { r, g, b } }
    }
    const closest = PALETTE.reduce(
      (best, candidate) => (distance(hex, candidate) < distance(hex, best) ? candidate : best),
      PALETTE[0]
    )
    const near = distance(hex, closest) <= V.colors.nearMatch
    const issue = {
      kind: 'colour',
      severity: near ? 'info' : 'warning',
      prop: what,
      value: hex,
      expected: [closest],
      fix: near ? closest : undefined
    }
    if (FIX && near) {
      const [r, g, b] = rgbOf(closest).map((channel) => channel / 255)
      changed = true
      issue.fixed = true
      fixed++
      report(context, node, issue)
      return { ...paint, color: { r, g, b } }
    }
    report(context, node, issue)
    return paint
  })
  if (changed) node[key] = next
}

function checkPosition(node, context, parent) {
  if (node.type === 'GROUP') {
    report(context, node, {
      kind: 'position',
      severity: 'warning',
      prop: 'group',
      value: 'group',
      expected: ['a frame with auto layout']
    })
  }
  if (
    parent &&
    'layoutMode' in parent &&
    parent.layoutMode !== 'NONE' &&
    node.layoutPositioning === 'ABSOLUTE'
  ) {
    report(context, node, {
      kind: 'position',
      severity: 'warning',
      prop: 'absolute',
      value: 'placed by x/y inside auto layout',
      expected: ['a child of the auto layout']
    })
  }
  if (node.type === 'FRAME' && node.layoutMode === 'NONE' && 'children' in node) {
    const placed = node.children.filter(
      (child) => child.visible !== false && !SHAPES.has(child.type)
    )
    if (placed.length >= 2) {
      report(context, node, {
        kind: 'position',
        severity: 'warning',
        prop: 'layout',
        value: `${placed.length} layers placed by x/y`,
        expected: ['auto layout (flex) with a gap from the scale']
      })
    }
  }
}

function visit(node, context, parent) {
  if (node.visible === false) return
  layers++
  const here = { ...context, path: [...context.path, node.name] }
  checkSpacing(node, here)
  checkRadius(node, here)
  checkType(node, here)
  checkPaints(node, here, 'fills')
  checkPaints(node, here, 'strokes')
  checkPosition(node, here, parent)
  if ('children' in node) for (const child of node.children) visit(child, here, node)
}

const pages = figma.root.children
for (const page of pages) {
  for (const artboard of page.children) {
    if (ONLY && artboard.name !== ONLY) continue
    artboards++
    visit(artboard, { page: page.name, artboard: artboard.name, path: [] }, null)
  }
}

return { pages: pages.length, artboards, layers, fixed, issues }
