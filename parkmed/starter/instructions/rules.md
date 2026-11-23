# Rules

- The look is decided: the Parkmed look (@parkmed-look.md). Never pick a new direction, style or palette.
- Start from the classes in styles.css (get_css_classes): .btn and .pri, .f with .inp, .phead, .inline-form, .grid, .note, .pill with .pill-ok/.pill-warn/.pill-bad. Give a new element a class rather than its own values; change a class to change every copy.
- Colours: navy ink #0D1724, muted #536076, lines #DDE2EA, Parkmed blue #2A62A9 for actions, links and the current page. Green #55AE65 only in the wordmark. Amber #8B5A13 for due soon, red #AC3636 only for critical. Never teal.
- Spacing: 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 40 (18 only as a card's padding, as .gcard has it). Inside a button, field, badge or note also 5, 7, 9 or 11. Never 13, 15, 17 or 30-something.
- Type: system-ui; sizes 24 (page title, weight 600), 18, 16, 14 (body), 12 (labels, table headers). Nothing larger than 24.
- Corners: 4 on buttons and fields, 6 on cards and panels, a pill only for a count badge or the current menu item.
- Layout: every box is auto layout (flex) with a gap. Never place layers by x/y, never absolute positioning, never a group. The container owns the gap; children have no margins.
- Regions of the content 18 apart; the filter panel 28 under the page head; the count line 8 above a table, the pager 10 below.
- One blue button per screen. Lists that can pass 50 rows are dense tables: rows 35px, cells 7 x 10, pages of 50 with a count line above and a pager below.
- People appear by name and role, never by e-mail. Sample data is fictitious.
- Keep the owner's flow: change how a screen looks, never the steps, their order or the documents.
- Artboards are 1440 wide; add a 375 phone breakpoint when the screen is used on phones.
- Before saying a screen is done: get_screenshot, then /polish.
