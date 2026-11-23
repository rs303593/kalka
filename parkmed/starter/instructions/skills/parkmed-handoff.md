# Parkmed handoff

Get a finished screen ready to be built in APEX by Claude Code (the apex-build skill). The
person runs this when they have finished a screen by hand.

## 1. Clean names

Every layer the builder needs has a name a person would use: "Page head", "Filters", "Orders",
"Row OR00412", "New order" (the button). Rename "Frame 12" and "div" (name_layers helps).

## 2. Classes say what each part is

Each part carries its Parkmed class. The builder maps them to the APEX stylesheet:

| Kalka class | APEX |
|---|---|
| `.btn`, `.btn .pri`, `.danger-label` | `.btn`, `.btn.pri`, `.btn.danger` |
| `.f`, `.f-label`, `.inp`, `.inp-select`, `em.msg-err`, `.err`, `.inp-saved` | `.f` with `<span>` label, `<input>` / `<select>`, `<em>` message; `.f.err`, `.f.saved` on the field |
| `.phead`, `.title`, `.lede`, `.row` | `.phead` with `h1`, `p`, `.row` |
| `.inline-form` | `.inline-form` (not `.filterbar`, which is a different bar) |
| `.list`, `.grid-meta`, `.grid`, `.grid-row`, `.td`, `.th` with `.th-on` and `.sorti` | `grid_meta`, `grid_open`, `grid_row`, `gc`, `sorth` (`table.grid`, `.sortb.on`) |
| `.pager`, `.pg`, `.pg-on` | `pager` |
| `.gcard`, `.h2`, `.fgrid`, `.frow` | `.gcard`, `h2`, `.fgrid` |
| `.note`, `.note-info` | `.note`, `.note.info` |
| `.pill`, `.pill .pill-ok`, `.pill .pill-warn`, `.pill .pill-bad` | `.pill`, `.pill.ok`, `.pill.warn`, `.pill.bad` |
| `.badge` | `.<prefix>-badge` |
| `.loc`, `.mono`, `.rowlink` | `.loc`, `.mono`, `.rowlink` |
| shell: `.topbar`, `.menu`, `.menu-item .current` | the app's own shell (`<prefix>_ui.nav`); not rebuilt |

A part with no class is new: name it and write a note on the artboard saying what it does.

Groups such as "Head and filters" and "Count and table" exist only to carry spacing, because
Kalka has no margins. In APEX their children are siblings and the builder drops these groups. The
design's spaces (16 between regions, 24 under the page head, 8 above and below a table) are on
the 4 scale; the app's stylesheet may still write its older 18, 10 and 28 there. Build the page
with the stylesheet as it is, and move that screen's spaces to the scale in the same work only
when the owner's rule for that app says so (GARO's way: a screen's spaces move when it is changed).

## 3. States

Next to the main artboard, the states the page can be in: empty list ("No orders match these
filters" and Clear filters), an error on a field, a long name cut with an ellipsis, a phone
width if the page is used on phones. Duplicate the artboard for each and change only that.

## 4. Mark it ready

Mark the artboard ready for development (set_frame_review). Tell the person: in Claude Code, in
the app's folder, ask "build the screens marked ready in Kalka with the apex-build skill".
