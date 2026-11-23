# Polish (Parkmed)

This project's version of Kalka's /polish: the same pass, with the Parkmed values in place of
Kalka's general scale. The last pass before a screen is handed over. The structure is decided;
this pass makes it exact. If something needs rethinking, say so and stop.

## 1. Look, then sort

Take an image (get_screenshot). Write down everything that is off, then work in this order, by
damage, not by ease:

1. anything that stops a task: an action that cannot be found or reached
2. missing states (empty, error, long text)
3. drift from the Parkmed classes and tokens
4. spacing, alignment, type, colour
5. names and cleanup

A mistake that repeats has one cause: fix it in the class or the variable, not layer by layer.

## 2. Space

- Every gap and padding is a Parkmed step: 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 40 (18 only
  as a card's padding). Inside a button, field, badge or note also 5, 7, 9, 11.
- Regions of the content are 18 apart; the filter panel 28 under the page head; the count line
  8 above its table and the pager 10 below it; the page head's title and line 6; buttons in a row 8;
  fields in a form 14 down and 16 across; label to box 5.
- Space inside a group is smaller than space between groups.
- The same relation has the same value everywhere: every card the same padding (18), every
  filter bar 12.
- Every box is auto layout. No x/y placement, no absolute positioning, no groups.

## 3. Alignment

- Edges that should line up do, to the pixel. No sizes like 13.5.
- Table cells line up with their header cell: same width, same 10px side padding. Numbers are
  right-aligned.
- Labels sit on the left edge of their box.

## 4. Shape

- Corners 4 on buttons and fields, 6 on cards and the filter bar, a pill only for a count badge
  or the current menu item.
- Lines are 1px #DDE2EA (#C7CFDB under a table header and around buttons). A line on one side
  only is a 1px inset shadow in its class (Kalka keeps a border only on all four sides): keep
  those. No drop shadows except a dialog's.

## 5. Type

- One family (system-ui; Menlo for codes). Sizes 24, 18, 16, 14, 12; 13 and 11 only for small
  detail. Weights 400, 500, 600.
- The page title is 24/600 with -0.4px tracking. Labels and table headers 12. Body 14.
- Names first, codes after; codes in Menlo 12 (600 only when the code is the row's link, or a
  locator).

## 6. Colour

- Only the Parkmed tokens. Blue is for actions, links, focus and the current page. Status is a
  coloured word, never a coloured box: green done, amber due soon, red critical, a normal state
  uncoloured. Green appears only in the wordmark otherwise. Never teal.

## 7. Check

Take an image again and compare. Report what you changed and what is left for the person.
