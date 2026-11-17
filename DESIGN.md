# InClass design

The supplied `inclass-ui-prototype.html` is the visual reference for the authenticated application. InClass serves administrators and teachers who manage university attendance; use a calm, legible workspace with clear hierarchy and compact data views.

## Palette and themes

| Role       | Light     | Dark      |
| ---------- | --------- | --------- |
| Canvas     | `#f6f8fc` | `#101827` |
| Surface    | `#ffffff` | `#19243a` |
| Ink        | `#15213a` | `#f0f3fb` |
| Muted text | `#7b879e` | `#aab6cb` |
| Border     | `#e9edf5` | `#30405b` |
| Primary    | `#635bff` | `#a29cff` |

Success, warning, and absence use green, amber, and red with text labels. The light palette should match the prototype closely; the dark palette preserves the same hierarchy and interaction cues. `app/globals.css` owns the runtime tokens; `next-themes` applies the `.dark` class.

## Layout and components

Use a 246px white sidebar, 80px top bar, and content width up to 1450px with 40px desktop gutters. At narrow widths, hide the fixed sidebar and expose navigation from the header. Cards and panels use a 17px radius, subtle border, and soft shadow. Controls use 10px radii. Tables use pale headers, compact uppercase column labels, and 15px cell padding.

Use Inter when available, falling back to system sans-serif. Page titles are 29px with tight tracking. The sidebar brand, violet geometric logo, purple active state, metric cards, chart, and circular breakdown carry the prototype's identity. Extend these patterns to detail screens and login, which the prototype does not fully specify.

Buttons, fields, labels, tables, badges, cards, menus, sheets, dialogs, tabs, progress, and loading blocks use shadcn components from `src/components/ui`, themed through the same palette.

## Content and behavior

Use real user identity, role, records, and dates. Never show prototype sample records as live data. Chart labels must describe the available data. Keep keyboard focus visible, actions named, empty and error states clear, and reduced motion respected.
