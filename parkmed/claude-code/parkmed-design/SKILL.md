---
name: parkmed-design
description: Design Parkmed app screens with Kalka and get them ready for APEX - start from the Parkmed starter document, draft screens into the running Kalka app through its MCP tools, import Claude Design projects, run the Parkmed check (spacing, radius, type, colours, positioning) and fix what it can, then hand screens marked ready to the apex-build skill. Use when the user wants to design, tidy, check or hand off a Parkmed screen, mentions Kalka, Claude Design imports, spacing or positioning problems in a design, or asks to build the screens marked ready in Kalka.
---

# Parkmed design with Kalka

The person finishes designs by hand in Kalka; your job is to give them drafts that need little
finishing, keep every value on the Parkmed look, and turn finished screens into APEX pages.

## Where things are

- **The Kalka checkout**: the person's fork of Kalka (`rs303593/kalka`, branch
  `parkmed-workflow` or its successor). It holds `parkmed/` (this workflow) and the `kalka` CLI.
  If you do not know where it is, find a folder holding `parkmed/check.ts`, or ask.
  Once per checkout: `bun install && bun run build:packages`.
- **The Parkmed starter**: `parkmed/starter/`, a Kalka document folder with the Parkmed
  variables, the shared classes (styles.css), three artboards (Orders list, New order form,
  Components) and the agent instructions (rules, `/parkmed-screen`, `/parkmed-tidy`,
  `/parkmed-handoff`, Parkmed `/polish` and `/direction`).
- **The values**: `parkmed/parkmed-values.json`. Every rule below comes from it.
- **Kalka's MCP server**: connected from Kalka, Settings → MCP → Claude Code. Its tools are
  `kalka` tools (get_page_tree, write_html, get_css_classes, update_styles, set_layout,
  get_screenshot, set_frame_review, get_frame_reviews…).

## A new design

1. Copy the starter to a new folder, never edit the starter itself:
   `cp -R <checkout>/parkmed/starter ~/Designs/<app>-<screen>` and ask the person to open that
   folder in Kalka (Open Folder).
2. Read `instructions/rules.md` and `instructions/skills/parkmed-screen.md` in that folder and
   follow them: duplicate the nearest artboard, build with the classes (get_css_classes first),
   one blue button, auto layout everywhere.
3. Check your draft: `get_screenshot`, then from the checkout `bun parkmed/check.ts --app`.
   Fix what it lists before showing the person.

## A draft from Claude Design

1. The person exports the project from Claude Design (Export → Download as .zip) and imports it
   in Kalka (File → Import Claude Design project…, or drop the .zip on Kalka).
2. Run `bun parkmed/check.ts --app` to see the damage, then `bun parkmed/check.ts --app --fix`
   to snap spacing, radius and near colours, and turn teal into Parkmed blue. It changes the
   open document live; `bun kalka undo` steps back.
3. For what remains (layers placed by x/y, font sizes, other colours), follow
   `instructions/skills/parkmed-tidy.md` from the starter with the MCP tools, or ask the person
   to paste the artboard into a copy of the starter and run `/parkmed-tidy` in Kalka's agent.
4. Run the check again. Report the numbers: fixed, left, and what the person should decide.

## Saved files instead of the app

`bun parkmed/check.ts <folder or .fig>` reports; `--fix -o <new folder>` writes a fixed copy
(never over the original). Exit code 1 means something is left to look at.

## Hand-off to APEX

When the person says a screen is finished, they mark it ready for development in Kalka (or run
`/parkmed-handoff`). Then:

1. `get_frame_reviews` lists the artboards marked ready. Read each with get_page_tree and
   get_screenshot.
2. Build it with the apex-build skill, in the app's folder: map each Parkmed class to the APEX
   stylesheet as `instructions/skills/parkmed-handoff.md` lists (`.btn .pri` → `.btn.pri`,
   `.grid-row` → `grid_row`, `.f`/`.inp` → `.f` with an input…). The design gives the page's
   parts, order, text and states; the APEX stylesheet gives the values. Never copy a design's
   pixel values into the app.
3. Keep the owner's flow: the design changes how the page looks, never its steps.
4. Check the built page against the screenshot at 1440 and 375 wide, as apex-build says.

## Never

- Never edit `parkmed/starter` in place for a project; copy it.
- Never run Kalka's `lint_fix` with suggestions on a Parkmed design: its spacing scale is
  4-based and would move the Parkmed 6, 10 and 14.
- Never use teal, a new colour, or a font size above 24.
