# Parkmed design workflow for Kalka

Claude and Claude Design draft a screen; you finish it by hand in Kalka; Claude Code builds it in
APEX. This folder makes the drafts arrive closer to finished, and makes spacing and positioning
problems visible and quick to fix. It adds files only: Kalka itself is unchanged, so this fork can
keep taking Kalka's updates.

| What | Where | What it does |
|---|---|---|
| Parkmed starter | `starter/` | A Kalka document with the Parkmed colours, spacing and type as variables, the Parkmed classes (button, field, table, page head…), three artboards (a list, a form, the components) and instructions for Kalka's agent |
| Parkmed check | `check.ts` | Lists every spacing, corner, font size and colour that is not a Parkmed value, and every layer placed by x/y; `--fix` snaps what has one right answer |
| Agent skills | `starter/instructions/skills/` | `/parkmed-screen`, `/parkmed-tidy`, `/parkmed-handoff`, and Parkmed versions of Kalka's `/polish` and `/direction` |
| Claude Code skill | `claude-code/parkmed-design/` | The same loop for Claude Code in the terminal, ending in the apex-build skill |
| The values | `parkmed-values.json` | One source for all of the above, counted from the Parkmed APEX stylesheet |

## Why drafts come out with spacing and positioning problems

- **Values typed per layer.** A draft writes 13, 17, 19 and 37 because nothing tells it the
  scale. Here every element comes from a shared class, and the check lists anything else.
- **Layers placed by x/y.** A draft places text at left 22, top 23. It looks right until
  something moves. Here every box is auto layout (flex) with a gap, and the check lists any frame
  that is not.
- **The wrong scale.** Kalka's own `/polish` and `lint_fix` use a 4px scale (4, 8, 12, 16) and
  would push your 6, 10 and 14 away. Parkmed's stylesheet has no single 4px base, so the starter
  replaces `/polish` with a Parkmed one and the check uses your values.

## Set up once (on your Mac)

1. Install Kalka from [kalka.design](https://kalka.design) and open it once (System Settings →
   Privacy & Security → Open Anyway, because the beta is not signed).
2. Install Bun, which runs the check:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```
3. Get this fork and build it once (a few minutes):
   ```bash
   git clone -b parkmed-workflow https://github.com/rs303593/kalka.git ~/Code/kalka
   ```
   ```bash
   cd ~/Code/kalka && bun install && bun run build:packages
   ```
4. In Kalka: **Settings → MCP → Claude Code → Connect**.
5. Give Claude Code the Parkmed skill:
   ```bash
   cp -R ~/Code/kalka/parkmed/claude-code/parkmed-design ~/.claude/skills/
   ```

## The loop

1. **Start from the starter.** Copy it for each project, then open the copy in Kalka (Open
   Folder):
   ```bash
   cp -R ~/Code/kalka/parkmed/starter ~/Designs/po-invoices-receipts
   ```
2. **Draft.** Either:
   - in Kalka's agent panel: `/parkmed-screen a receipts list for PO & Invoices`, or
   - in Claude Code: "design the receipts list in Kalka, Parkmed style", or
   - in Claude Design, then Export → Download as .zip, and in Kalka File → Import Claude Design
     project…
3. **Tidy.** Let the tools fix what has one right answer:
   ```bash
   cd ~/Code/kalka && bun parkmed/check.ts --app --fix
   ```
   Then, in Kalka's agent panel, `/parkmed-tidy` turns layers placed by x/y into auto layout and
   applies the Parkmed classes. Anything you dislike: Cmd+Z in Kalka, or `bun kalka undo`.
4. **Finish by hand.** Tips that keep it clean:
   - Change a class, not a layer: Assets → Classes, edit `.btn` and every button follows.
   - Space with the gap and padding fields of auto layout, never by dragging. Use 4, 6, 8, 10,
     12, 14, 16, 20, 24.
   - Copy pieces from the **Components** artboard instead of drawing new ones.
5. **Check.** When it says Clean, the spacing, corners, type and colours are all Parkmed:
   ```bash
   cd ~/Code/kalka && bun parkmed/check.ts --app
   ```
6. **Hand off.** Run `/parkmed-handoff` in Kalka, mark the artboard ready for development, then
   in Claude Code, in the app's folder: "build the screens marked ready in Kalka with the
   apex-build skill".

## Commands

| Command | Does |
|---|---|
| `bun parkmed/check.ts --app` | Check the document open in Kalka |
| `bun parkmed/check.ts --app --fix` | Fix it live: spacing, corners, near colours, teal to Parkmed blue |
| `bun parkmed/check.ts <folder>` | Check a saved Kalka folder (or a `.fig`) |
| `bun parkmed/check.ts <folder> --fix -o <new folder>` | Write a fixed copy; the original is untouched |
| `--artboard "Orders"` | Only that artboard |

Try it on the sample: `bun parkmed/check.ts parkmed/samples/messy-draft` lists 36 problems;
`--fix -o /tmp/fixed` fixes 25 of them and leaves the 11 that need a decision (the header
placed by x/y, nine font sizes, one red).

## What the check accepts

- **Spacing:** 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 40, 60. Inside a control (a box
  that holds only text, or a field: label, box, message) also 3, 5, 7, 9, 11, the values the
  button, field and note classes use.
- **Corners:** 0, 2, 3, 4, 6, or a pill.
- **Font sizes:** 24, 18, 16, 14, 12, and the stylesheet's detail sizes 22, 20, 13, 11, 11.5,
  10.5, 10.
- **Colours:** the Parkmed tokens and the greys the stylesheet uses. A colour very close to one
  is fixed to it; teal is an error and becomes Parkmed blue on `--fix`.
- **Positioning:** a frame with two or more layers needs auto layout; no absolute positioning
  inside auto layout; no groups.

To change a rule, change `parkmed-values.json` (and the same value in `starter/styles.css` and
`starter/instructions/rules.md`).

## Known limits

- Tested here on saved files: the check, the fix, and opening and saving the starter through
  Kalka's own reader and writer. **Not yet tried in the desktop app:** `--app` mode, the agent
  skills, the Claude Design import, and pasting between documents. Try them on a copy first.
- Kalka keeps only the first font of a list: the starter uses `system-ui` (SF on a Mac) and
  Menlo for codes. Where Kalka cannot find a font it shows Inter.
- Kalka does not keep tabular figures or underlines, and keeps a border only on all four sides;
  the starter draws one-sided lines as 1px inset shadows.
- The check reads numbers, not judgement: a clean check means on-scale, not well designed. Look
  at the screen too.
