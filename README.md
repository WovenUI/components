# WovenUI Components

HTML and CSS components (a UI kit) for the WovenUI design system: buttons, cards, forms, tables, modals, drawers, dropdowns, tabs, toasts and more, written as plain markup with `wu-` classes.

**[Live docs and demos](https://wovenui.com/components/docs/)** · [Components site](https://wovenui.com/components/) · [GitHub](https://github.com/WovenUI/components)

WovenUI Components needs one companion package, [`@wovenui/core`](https://www.npmjs.com/package/@wovenui/core). Core provides the design tokens (shared CSS variables for colors, spacing, radii and type) and the light and dark themes; the components read those variables, so they change with the theme.

## Quick start

Save this as an HTML file and open it in a browser. It loads core and the components from a CDN and shows a button that opens a modal, with no JavaScript:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WovenUI Components</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@wovenui/core/dist/wovenui.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@wovenui/components/dist/wovenui-kit.min.css">
  <!-- Optional: only for tabs, toast, autocomplete, data table sorting, table row selection and the input clear button -->
  <script src="https://cdn.jsdelivr.net/npm/@wovenui/components/dist/wovenui-kit.iife.js" defer></script>
</head>
<body>
  <button class="wu-btn brand" type="button" commandfor="hello" command="show-modal">Open the modal</button>

  <dialog class="wu-modal" id="hello" aria-labelledby="hello-title" closedby="any">
    <header class="wu-modal-header">
      <h2 class="wu-modal-title" id="hello-title">Hello</h2>
      <button class="wu-modal-close" type="button" commandfor="hello" command="close" aria-label="Close"></button>
    </header>
    <div class="wu-modal-body">This modal is a native dialog element, opened by the button with no script.</div>
    <form class="wu-modal-footer" method="dialog">
      <button class="wu-btn">Cancel</button>
      <button class="wu-btn brand" value="confirm">Save</button>
    </form>
  </dialog>
</body>
</html>
```

The `commandfor` attribute on a button names the element it controls, and `command` says what to do (`show-modal`, `close`). The browser opens and closes the dialog, moves focus and handles the Esc key.

The script line is optional. Leave it out unless the page uses tabs, toasts, autocomplete, data table sorting, table row selection and expandable rows, or the input clear button.

The same paths work on unpkg (`https://unpkg.com/@wovenui/components/...`). For production, pin an exact version after the package name.

## Install

### CSS only

```bash
npm i @wovenui/core @wovenui/components
```

Load core first, then the components:

```html
<link rel="stylesheet" href="node_modules/@wovenui/core/dist/wovenui.min.css">
<link rel="stylesheet" href="node_modules/@wovenui/components/dist/wovenui-kit.min.css">
```

### With Sass

To compile the components from SCSS (turn components off, load one component at a time, share your core settings), add Dart Sass:

```bash
npm i @wovenui/core @wovenui/components sass
```

See [SCSS setup](#scss-setup) below.

### Download

Download the built CSS and JS files from [wovenui.com](https://wovenui.com/components/docs/install/#direct-download) and host them yourself. Load the core CSS first, then the components CSS, then the script if you use it.

## Requirements

- [`@wovenui/core`](https://www.npmjs.com/package/@wovenui/core), loaded before the components.
- Dart Sass `>=1.79.0 <2`, only when you compile from SCSS. The prebuilt CSS needs no Sass.

Works in current Chrome, Firefox and Safari.

## Components

Each name links to its page with live examples.

- **Actions:** [Button](https://wovenui.com/components/docs/button/), [Button group](https://wovenui.com/components/docs/btn-group/)
- **Data display:** [Avatar](https://wovenui.com/components/docs/avatar/), [Avatar group](https://wovenui.com/components/docs/avatar-group/), [Badge](https://wovenui.com/components/docs/badge/), [Description list](https://wovenui.com/components/docs/desc-list/), [Info row](https://wovenui.com/components/docs/info-row/), [List](https://wovenui.com/components/docs/list/), [Stat](https://wovenui.com/components/docs/stat/), [Table](https://wovenui.com/components/docs/table/), [Tag](https://wovenui.com/components/docs/tag/), [Timeline](https://wovenui.com/components/docs/timeline/)
- **Feedback and status:** [Alert](https://wovenui.com/components/docs/alert/), [Circular progress](https://wovenui.com/components/docs/progress-circle/), [Empty state](https://wovenui.com/components/docs/empty-state/), [Progress bar](https://wovenui.com/components/docs/progress/), [Skeleton loader](https://wovenui.com/components/docs/skeleton/), [Spinner](https://wovenui.com/components/docs/spinner/), [Status dot](https://wovenui.com/components/docs/dot/)
- **Surfaces and text:** [Card](https://wovenui.com/components/docs/card/), [Code block](https://wovenui.com/components/docs/code-block/), [Divider](https://wovenui.com/components/docs/divider/), [Heading](https://wovenui.com/components/docs/title/), [Panel](https://wovenui.com/components/docs/panel/), [Text](https://wovenui.com/components/docs/text/)
- **Navigation and layout:** [Breadcrumb](https://wovenui.com/components/docs/breadcrumb/), [Page header](https://wovenui.com/components/docs/page-header/), [Pagination](https://wovenui.com/components/docs/pagination/), [Sidebar](https://wovenui.com/components/docs/sidebar/), [Toolbar](https://wovenui.com/components/docs/toolbar/), [Top bar](https://wovenui.com/components/docs/topbar/)
- **Forms:** [Checkbox](https://wovenui.com/components/docs/checkbox/), [Field message](https://wovenui.com/components/docs/field-message/), [Form actions](https://wovenui.com/components/docs/form-actions/), [Form field](https://wovenui.com/components/docs/field/), [Form field group](https://wovenui.com/components/docs/field-group/), [Input group](https://wovenui.com/components/docs/input-group/), [Radio button](https://wovenui.com/components/docs/radio/), [Segmented control](https://wovenui.com/components/docs/segmented/), [Select](https://wovenui.com/components/docs/select/), [Text input](https://wovenui.com/components/docs/input/), [Textarea](https://wovenui.com/components/docs/textarea/), [Toggle switch](https://wovenui.com/components/docs/toggle/)
- **Overlays and disclosure:** [Accordion](https://wovenui.com/components/docs/accordion/), [Confirmation dialog](https://wovenui.com/components/docs/confirm-modal/), [Drawer](https://wovenui.com/components/docs/drawer/), [Dropdown menu](https://wovenui.com/components/docs/dropdown/), [Modal](https://wovenui.com/components/docs/modal/), [Popover](https://wovenui.com/components/docs/popover/), [Tooltip](https://wovenui.com/components/docs/tooltip/) (part of core)
- **Interactive:** [Autocomplete](https://wovenui.com/components/docs/autocomplete/), [Data table](https://wovenui.com/components/docs/data-table/), [Tabs](https://wovenui.com/components/docs/tabs/), [Toast notification](https://wovenui.com/components/docs/toast/)

## Overview

- **CSS first.** Most components need no JavaScript. A small optional script, with no dependencies, covers the few that do.
- **Native HTML.** Modals and drawers are `<dialog>` elements opened with the `commandfor` attribute. Dropdowns and popovers use the `popover` attribute, open under their trigger and flip when there is no room. Accordions are `<details>` elements; accordions that share a `name` keep only one open.
- **Right to left.** Components use logical properties, so they follow `dir="rtl"` from the same stylesheet, with no separate RTL build.
- **Themes from core.** Colors, spacing, radii and type come from core. Change them once in core and the components follow, in light, dark, high-contrast and inverse sections (a section shown in the opposite theme of the page).
- **No motion unless you ask.** Animations are off until you turn them on, and they never run when the visitor has asked the system to reduce motion.
- **Bring your own icons.** Built-in indicators (select arrows, accordion chevrons, close marks) are drawn in CSS, and the package ships no icon files. An `svg` placed directly inside a component is sized to the text and keeps its own colors.

```html
<article class="wu-card">
  <header class="wu-card-header">
    <h3 class="wu-card-title">Team plan</h3>
    <span class="wu-badge success">Active</span>
  </header>
  <div class="wu-card-body">Seats, billing and members.</div>
  <footer class="wu-card-footer">
    <button class="wu-btn" type="button">Manage seats</button>
    <button class="wu-btn brand" type="button">Invite</button>
  </footer>
</article>
```

## Naming

- The component root carries the `wu-` prefix: `wu-btn`, `wu-card`, `wu-modal`.
- Modifiers are bare words, valid only together with the root: `wu-btn brand sm`. The CSS emits them as compounds (`.wu-btn.brand`), never alone, so they do not clash with other class names.
- Parts use the root name plus a part: `wu-card-header`, `wu-modal-body`.
- Color words are core role names: `brand`, `success`, `danger`, `warning`, `info`. There is no `primary`.
- State lives in attributes (`aria-selected`, `aria-expanded`, `aria-pressed`, `hidden`, `open`), not classes.

```html
<button class="wu-btn brand lg" type="button">Save</button>
<button class="wu-btn danger sm" type="button">Delete</button>
```

A dropdown on the `popover` attribute, with no script:

```html
<button class="wu-btn" type="button" popovertarget="menu1">Actions</button>
<div class="wu-dropdown" id="menu1" popover>
  <a class="wu-dropdown-item" href="/edit">Edit</a>
  <button class="wu-dropdown-item danger" type="button" popovertarget="menu1" popovertargetaction="hide">Delete</button>
</div>
```

## Right to left

Set `dir="rtl"` on the page or on one section, and components follow it. Arrows the kit draws itself turn on their own. For your own directional icons, `wu-mirror` flips the element in right to left:

```html
<section lang="ar" dir="rtl">
  <a class="wu-btn" href="/back"><svg class="wu-mirror" aria-hidden="true">...</svg>رجوع</a>
</section>
```

## Animations

Turn motion on per component with the word `animated`, or for a page or section with `wu-animated` on an ancestor:

```html
<button class="wu-btn brand animated" type="button">Save</button>

<body class="wu-animated">...</body>
```

Motion runs only when the visitor's system allows it (`prefers-reduced-motion: no-preference`).

## JavaScript

Most components are CSS only. These need the script: tabs, toast, autocomplete, data table sorting, table row selection and expandable rows, and the input clear button. Modals, drawers, dropdowns, popovers and accordions need none.

The script looks for these components by their class (`wu-tabs`, `wu-toast-region`, `wu-autocomplete`, `wu-table`, `wu-data-table`, `wu-input-clear`) and starts them when the page loads. There is no setup attribute.

Drop-in script, which defines the global `WovenUIKit`:

```html
<script src="node_modules/@wovenui/components/dist/wovenui-kit.iife.js" defer></script>
```

ES module:

```js
import { init, toast } from '@wovenui/components/js';

toast('Your changes are live.', { title: 'Saved', variant: 'success' });
toast('Upload failed.', { title: 'Error', variant: 'danger', duration: 0 }); // stays until closed
```

| Export | Use |
| --- | --- |
| `init(root)` | Starts every kit component inside `root` (`document` by default), including content added later. Each element starts once |
| `toast(message, options)` | Shows a toast and returns its element. Options: `title`, `variant`, `duration` (milliseconds, 0 keeps it), `closeLabel` |
| `dismiss(element)` | Closes a toast |
| `sortTable(table, th)` | Sorts a data table by a header cell |
| `initTabs`, `initToast`, `initAutocomplete`, `initDataTable`, `initTable`, `initInputClear` | Start one kind of component inside a root |

Apps built with React, Vue or another framework can skip the script and keep the CSS: set the same attributes (`aria-selected`, `aria-expanded`, `aria-sort`, `hidden`) from component state.

## Package files

| Export | File |
| --- | --- |
| `@wovenui/components` (`style`, `default`), `@wovenui/components/min.css` | `dist/wovenui-kit.min.css` |
| `@wovenui/components/css` | `dist/wovenui-kit.css` |
| `@wovenui/components/js` | `dist/wovenui-kit.js` (ES module) |
| `dist/wovenui-kit.iife.js` | Drop-in script, global `WovenUIKit` |
| `dist/llms-full.txt` | AI guide (below) |

## AI guide

`dist/llms-full.txt` ships in the package and is also at https://wovenui.com/components/llms-full.txt. Give it to an AI coding assistant so it writes correct markup: every component, its classes, modifiers, variables and examples.

## SCSS setup

### SCSS bundle

Through a bundler (Vite, webpack), which reads the package `sass` export, load all components in your global stylesheet:

```scss
@use "@wovenui/core";
@use "@wovenui/components";
```

Every component is on by default. Turn components off with `$components`:

```scss
@use "@wovenui/components" with ($components: ("toast": false, "data-table": false));
```

A component that needs another one stops the compile with an error naming both when the needed one is off:

| Component | Needs |
| --- | --- |
| `btn-group` | `button` |
| `avatar-group` | `avatar` |
| `pagination` | `button` |
| `confirm-modal` | `modal`, `button` |
| `autocomplete` | `input` |
| `data-table` | `table` |

### Per-component entries

For CSS modules and component `<style>` blocks, load one component with what it needs:

```scss
@use "@wovenui/components/button";
```

Every component has an entry named after it: `@wovenui/components/modal`, `@wovenui/components/data-table` and so on. Each entry also emits the shared kit values (`:root` custom properties such as `--wu-kit-ease-spring`).

Pick one path per project: the bundle or per-component entries, not both. Shared rules would be emitted twice.

### Configuration

Configure core once in a partial, as in the [core setup](https://www.npmjs.com/package/@wovenui/core). The components load `@wovenui/core/mixins` and follow the same configuration:

```scss
// src/styles/_woven.scss
@forward "@wovenui/core/mixins" with ($brand: #4361ee);

// src/styles/global.scss
@use "woven";
@use "@wovenui/core";
@use "@wovenui/components";
```

`@use "woven"` comes first, before core and the components load.

Compile through a bundler. The `sass` command line on its own cannot find the package files the components load; without a bundler, use the prebuilt CSS.

### Cascade layers

The CSS declares the layer order `@layer reset, base, components, recipes;`. Core uses the first three; `recipes` is an extra layer above the components, for patterns you build from them, and the package puts nothing in it. Every component lives in `@layer components`. Utility classes and your own unlayered CSS win over the components without `!important`.

## Documentation

- [Documentation](https://wovenui.com/components/docs/), one page per component with live examples
- [Install and download](https://wovenui.com/components/docs/install/)
- [JavaScript](https://wovenui.com/components/docs/javascript/)
- [Right to left](https://wovenui.com/components/docs/rtl/)
- [WovenUI Components site](https://wovenui.com/components/)
- [WovenUI core](https://wovenui.com/core/)
- [GitHub repository](https://github.com/WovenUI/components)

## License

WovenUI Components is open source under the [MIT License](LICENSE). Copyright (c) AALA IT Solutions.
