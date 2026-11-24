/**
 * Container queries, for the import. A rule inside `@container` applies to some elements and not
 * to others: it depends on the nearest container of that name around the element and on that
 * container's size, which only the browser's layout knows. So the page's rules are listed with
 * the container queries around them, and the browser is asked which queries apply to each element.
 */

/** A style rule of the page, and the container queries around it by their index, outermost first. */
export interface ContainedStyleRule {
  rule: CSSStyleRule
  containers: readonly number[]
}

/** The custom property that says, on an element, whether the query at an index applies to it. */
const answer = (index: number) => `--kalka-container-${index}`

/**
 * Every element first says no query applies to it, then each query, written around a rule for
 * every element, says it does where the browser finds so. Without the first rule an element
 * would inherit the answer of an ancestor that sits in a wider container.
 */
function askingCSS(queries: readonly string[]): string {
  const none = queries.map((_, index) => `${answer(index)}:0`).join(';')
  const each = queries.map((query, index) => `@container ${query}{*{${answer(index)}:1}}`)
  return `*{${none}}${each.join('')}`
}

/**
 * Which of the page's container queries apply to each element, by their index. `styleHome` is
 * where the page's stylesheets are: its head, or the shadow root it was rendered in.
 */
export function containerQueriesApplying(
  styleHome: Node,
  elements: Iterable<Element>,
  queries: readonly string[]
): Map<Element, ReadonlySet<number>> {
  const applying = new Map<Element, ReadonlySet<number>>()
  const view = styleHome.ownerDocument?.defaultView
  if (!view || queries.length === 0) return applying
  const asking = view.document.createElement('style')
  asking.textContent = askingCSS(queries)
  styleHome.appendChild(asking)
  try {
    for (const element of elements) {
      const computed = view.getComputedStyle(element)
      const indexes = queries.flatMap((_, index) =>
        computed.getPropertyValue(answer(index)).trim() === '1' ? [index] : []
      )
      applying.set(element, new Set(indexes))
    }
  } finally {
    asking.remove()
  }
  return applying
}

/** The rules that can apply to an element: one inside `@container` only where each query around it does. */
export function rulesApplyingTo(
  rules: readonly ContainedStyleRule[],
  applying: ReadonlySet<number> | undefined
): CSSStyleRule[] {
  return rules.flatMap(({ rule, containers }) =>
    containers.every((index) => applying?.has(index) === true) ? [rule] : []
  )
}
