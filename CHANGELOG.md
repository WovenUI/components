# Changelog

All notable changes to `@wovenui/components` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-11-12

Requires `@wovenui/core` 2.4.0 or later.

### Added

- `wu-field-row`: a row of fields that wrap and share a size (`sm`, `lg`), with `--wu-field-row--MinWidth`.
- `wu-field-label-row` (label and a help button at the inline end) and `wu-field-help`, the small round help button.
- `wu-field` modifier `live`: reserves one message line, and the error replaces the hint while the control is invalid.
- `wu-field-label` modifier `visually-hidden`: hides the text and keeps its line, for a control in a row of labeled ones.
- The legend of a `wu-field-group` gets the required marker when a required control sits in the group outside a `wu-field`.
- File input styling: `wu-input` with `type="file"` draws the field edge, hover and focus ring around the browser's file button.
- `wu-modal` modifier `full`: fills the viewport with no radius or margin; the header and footer stay and the body scrolls.
- `wu-tag` role colors `brand`, `success`, `danger`, `warning` and `info` for status words.
- A toast slides in once; moving the region into or out of a dialog does not replay the entrance.

### Changed

- Plain buttons, tags and the `wu-segmented` segments use the `border-strong` edge.
- Fields take 14 px type at `md`, 12 px at `sm` and 16 px at `lg` (input, textarea, select).
- The checked segment of `wu-segmented` takes the button group pressed look: selected tint, brand text and an inner brand ring.
- Inputs and selects size to their content in `wu-toolbar` and `wu-pagination`, up to 16rem.
- `wu-pagination` `sm` and `lg` reach the page size select and the total text.
- Checkbox, radio and toggle text follow the input sizes, and take the size of a `wu-field-row`.
- `wu-avatar-group` overlaps avatars by a fifth of their size and draws the ring in the page background (`bg-base`); set `--wu-avatar--RingColor` on a card.
- The panel of `wu-tabs` `card` is framed and takes the surface background.
- Toasts render as a plain column; the scaled stack that fanned out on hover is removed.
- `toast()` moves the region into the topmost open modal dialog, so its toasts stay clickable and announced, and moves it back when the dialog closes.
- Modal, drawer, dropdown and popover rest at `scale: none` and `translate: none`.
- Modal and drawer examples recommend `closedby="closerequest"` for dialogs that hold a form, and the docs note that a menu, popover or toast used in a modal must be inside the dialog element.
- `wu-badge` is documented as the count pill; `wu-tag` is the word chip.
- Close buttons keep a square hit area.
- The pressed check of `wu-tag` uses the shared check mark of the kit.
- Autofilled fields keep the surface background, including invalid ones.

## [1.1.0] - 2026-11-11

Requires `@wovenui/core` 2.3.0.

### Added

- Drawer size modifiers `sm` (18rem) and `lg` (32rem) for side drawers; the default stays 24rem.

### Changed

- The status dot, the avatar offline ring, timeline markers and the breadcrumb underline use `border-control`, so they keep 3:1 contrast.
- Button, tag and card hover edges use `border-control`, one step stronger than their `border-regular` resting edge.

### Fixed

- The checked segment of `wu-segmented` uses `bg-raised` (was `bg-surface`), so it stands out from the track in dark theme.
- The warning fill of `wu-progress`, `wu-progress-circle` and the `wu-timeline-item` marker uses `text-warning`, so it keeps 3:1 contrast against its track and the page in light theme (was 1.11 to 1.63:1).
- The `wu-autocomplete-empty` message is a live region (`role="status"`, set by the script and shown in the example markup), so screen readers announce "No matches".

## [1.0.0] - 2026-11-08

First release.

### Added

- HTML and CSS components with `wu-` classes, built on the `@wovenui/core` design tokens and themes (light, dark, high contrast and inverse).
- Buttons, cards, forms, tables, modals, drawers, dropdowns, tabs, toasts, alerts, navigation and more, grouped on the [components page](https://wovenui.com/components/docs/).
- Native HTML behavior: modals and drawers as `<dialog>` elements, dropdowns and popovers on the `popover` attribute, accordions as `<details>` elements.
- Right-to-left support through logical properties, with no separate build.
- An optional script with no dependencies for tabs, toasts, autocomplete, data table sorting, table row selection and the input clear button.
- SCSS entries to compile the full kit or load one component at a time.
