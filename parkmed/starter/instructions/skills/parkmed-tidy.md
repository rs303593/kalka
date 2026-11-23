# Parkmed tidy

Fix the spacing and positioning of a draft made elsewhere (a Claude Design import, pasted HTML,
an agent's first draft) so the person can finish it by hand. It changes how the screen is built,
never what it shows: same parts, same order, same text.

## 1. Look and list

Take an image (get_screenshot). Read the tree (get_page_tree) and list, by layer:

- layers placed by x/y: a frame without auto layout that holds two or more layers, a child
  with absolute positioning, a group;
- gaps and paddings that are not Parkmed steps (below);
- corners, font sizes and colours that are not Parkmed values.

`lint` helps with structure, but its spacing scale is 4-based: ignore its spacing and radius
suggestions and never run lint_fix with suggestions here.

## 2. Structure first

Work from the outside in, one frame at a time:

1. A frame whose children are placed by x/y gets auto layout (set_layout): vertical when the
   children sit one under another, horizontal when side by side. Order the children as they read.
2. Its gap is the most common distance between those children, rounded to a Parkmed step.
3. A child with absolute positioning becomes a normal child (set_layout_child) unless it truly
   floats (a badge on an icon); say which ones you kept.
4. A group becomes a frame with auto layout: ungroup it (ungroup_node) and put its layers in a
   frame of their own.
5. A child that should fill the width gets FILL sizing; text that should wrap gets a width.

Take an image after each top-level frame. If the screen no longer reads the same, undo that step.

## 3. Then the numbers

- Spacing: 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 40; inside a control (a box holding only
  text) also 5, 7, 9, 11. Snap anything else to the nearest step, the smaller on a tie.
- Corners: 0, 2, 3, 4, 6, or a pill. Font sizes: 24, 18, 16, 14, 12 (13 and 11 for small detail).
- Colours: the variables (Parkmed tokens). A colour within a shade of a token becomes the token;
  teal becomes Parkmed blue #2A62A9; anything else, ask.

## 4. Then the classes

Give each repeated element its Parkmed class (update_styles): buttons .btn / .pri, fields .f and
.inp, the page title .title, table rows .grid-row, notes .note. Then drop the layer's own copies
of what the class sets (edit_css_class reset_layer), so a change to the class reaches it.

## 5. Check

Take an image and compare it with the first one: same parts, same order, cleaner. Report what
changed in numbers (layers given auto layout, values snapped, classes applied) and what is left
for the person. The person can run `bun parkmed/check.ts --app` from the Kalka checkout for an
exact list.
