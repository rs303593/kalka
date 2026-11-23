# Parkmed screen

Uses: /polish

Draw a new screen for a Parkmed app from the starter's shell and classes, so it needs little
finishing by hand. The person's request says which app and which page; ask only if it does not.

## 1. Decide before drawing

Write three lines, then draw:

- The kind of page: a list (a dense table), a form (fields in cards), a record (a list's row
  opened full width with Back to list, Previous and Next), or a home (the person's tasks).
- Its parts in reading order: page head (title, one line, actions), then filters, then the body.
- The one main action, the only blue button.

## 2. Start from what is here

- Duplicate the artboard nearest in kind ("Orders" for a list, "New order" for a form) and
  rename it. Keep the top bar, the menu and its groups; change the product name, the page
  name, and which menu item is current.
- Read the classes first (get_css_classes). Build with them in write_html: a button is
  `<button class="btn" data-kalka-type="frame"><span class="btn-label">…</span></button>`,
  the main one `class="btn pri"` with `pri-label`; a field is `.f` holding `.f-label`,
  `.inp inp-fill` (add `inp-select` and a `.chev` ▾ for a select, `err` on an error) and an
  `<em class="msg-err">` message; table rows are `.grid-row` of `.td` cells; status is
  `.pill` plus `pill-ok`, `pill-warn` or `pill-bad`; filters sit in `.inline-form`.
- A box that holds one text needs `data-kalka-type="frame"`, or it becomes a text layer.
- A box that should fill its parent's width says `align-self: stretch` (its class already does
  for the shell, the page head, the list, the grid and its rows).

## 3. Numbers

- Spacing: 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 40; inside a control also 5, 7, 9, 11.
  Between regions of the content 18; the filter panel 28 under the page head (group the two);
  the count line 8 above the table and the pager 10 below it; inside the page head 6; between
  buttons 8.
- Type: 24/600 page title, 18/600 card title, 14 body, 12 labels and table headers.
- Corners: 4 controls, 6 cards. Rows 35px; cells 7 x 10.

## 4. Never

- Never place by x/y, never absolute positioning, never a group: auto layout with a gap.
- Never a new colour, never teal, never green outside the wordmark, never red for something
  that is not critical.
- Never invent a step, a confirmation or a bulk action the request did not ask for.
- Never a real person's name or e-mail: fictitious names, shown with their role.

## 5. Check

Take an image (get_screenshot) of the artboard. Then run /polish. Report what the screen shows,
what you assumed, and anything the person should decide.
