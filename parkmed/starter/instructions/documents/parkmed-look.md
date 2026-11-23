# The Parkmed look

The owner's rules for every Parkmed output (12 Oct 2026: "Stop using apex inbuilt themes and
giving all outputs in teal themes"), with the values of the Parkmed APEX stylesheet.

## Colour

| Role | Value | Use |
|---|---|---|
| Ink | #0D1724 | text |
| Muted | #536076 | secondary text, labels in tables |
| Line / strong line | #DDE2EA / #C7CFDB | dividers; button and table-header lines |
| Field line | #BCC5D3 | input boxes |
| Sunk | #F4F6F9 | filter bars, quiet panels |
| Menu | #F7F8FB | the side menu |
| Table head | #FAFBFC | table header row |
| Parkmed blue | #2A62A9 (hover #21508C, soft #E8EFF9) | actions, links, focus, current page, selected row |
| Parkmed green | #55AE65 | the wordmark only ("Park" green, "med" blue) |
| Done | #2A7140 on #E7F4EA | done or OK text |
| Due | #8B5A13 on #FFF7E8 | due soon, below target |
| Critical | #AC3636 on #FFF1F1 | critical only |

Colour means something: a normal state ("Open", "Invoiced") has no colour. Status is a coloured
word, never a coloured box. Never teal.

## Type

System font (system-ui; SF on a Mac, Segoe UI on Windows); Menlo for codes. Scale 24 / 18 / 16 /
14 / 12. Page title 24/600, -0.4px. Card title 18/600. Body 14. Labels, table headers and helper
text 12. Table header 12/500 muted.

## Spacing and shape

Even steps, no single 4px base: 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 40. Controls also use
5, 7, 9, 11 inside (button 7 x 12, field 7 x 10, note 11 x 14, field label to box 5). Regions of
the content 18 apart; the filter panel 28 under the page head; the count line 8 above a table and
the pager 10 below it; content padding 24; page head gap 20; card padding 18; filter panel 12.
Corners 4 (controls), 6 (cards, panels), pills for count badges and the current menu item.

## The shell

A white 60px top bar: the wordmark split "Park" (green) "med" (blue), the product name, then the
page name. A light grey menu 216px wide in titled groups with count badges, a Parkmed-blue pill
for the current page, the signed-in person's name and role at the bottom. No footer.

## Long lists

Any list that can pass about 50 rows: a dense table, pages of 50, the count above ("51–100 of
401 items") and the pager below. Rows 35px (one line) or 52px (two); cells 7 x 10; numbers
right-aligned; codes in Menlo 12 (600 when the code is the row's link); name first, code after. A row opens its record full width with
Back to list, "12 of 401", Previous and Next. Long option lists are typed (a field with
suggestions), not dropped down.

## The owner's working rules

- Change how a screen looks, never the steps, their order or the documents. No new confirmation
  steps, bulk actions or row checkboxes unless asked.
- One-time set-up is a generator form (ranges and counts), not one record at a time.
- People by name and role, never by e-mail, outside People and Activity.
