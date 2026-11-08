# AGENTS.md

Guidance for AI coding tools working on this repository (`@wovenui/components`, WovenUI Components, the UI kit).

## 1. What this repo is

HTML and CSS components built on `@wovenui/core`, plus a small vanilla JavaScript layer. Components load `@wovenui/core/mixins` (the core API with no CSS output), read core tokens (`--wu-*`) and emit only their own rules.
The package ships `dist` and `src` only (`files` in `package.json`). The `.mjs` files in `scripts/` and `test/` are build tools and tests.

The documentation site lives in a separate project (served at https://wovenui.com/components/docs/). It compiles the kit from this repo's `src`, so markup and class changes here need a matching docs update there.

## 2. Commands

Run from the repository root with `pnpm`.

| Command | What it does |
| --- | --- |
| `pnpm build` | `build:scss`, `build:minify`, `build:js` and `build:docs` in order |
| `pnpm build:scss` | Compiles `src/index.scss` to `dist/wovenui-kit.css` with a source map (`scripts/build-scss.mjs`) |
| `pnpm build:minify` | Minifies `dist/wovenui-kit.css` to `dist/wovenui-kit.min.css` with cssnano |
| `pnpm build:docs` | Reads the doc block of every component into `dist/components.json` and `dist/llms-full.txt` (`scripts/build-docs.mjs`); `--strict` fails on a missing or incomplete block |
| `pnpm build:js` | Joins `src/js` into `dist/wovenui-kit.js` (ES module) and `dist/wovenui-kit.iife.js` (global `WovenUIKit`) (`scripts/build-js.mjs`) |
| `pnpm dev` | Watches `src` and rebuilds `dist/wovenui-kit.css` |
| `pnpm test` | Builds first, then runs `test/compile.mjs`, `switches.mjs`, `entries.mjs`, `caret.mjs`, `modifiers.mjs`, `size.mjs`, `js.mjs` and `docs.mjs` |
| `pnpm check` | Modifier-name check alone (`scripts/check-modifiers.mjs` on `dist/wovenui-kit.css`) |
| `pnpm lint` | stylelint on `src/**/*.scss` |
| `pnpm format` / `pnpm format:check` | Prettier write / check on `src/**/*.scss`, `src/js/**/*.js`, `scripts/**/*.mjs` |

`test/parse.mjs` is not part of `pnpm test`: run `node test/parse.mjs` after `pnpm build` to check that `dist/wovenui-kit.css` passes cssnano (and Lightning CSS when it is installed).

Scripts that compile SCSS run Node with `--conditions=sass`, so bare `@wovenui/*` URLs resolve through the package `sass` exports. Before finishing a change, run at least `node scripts/build-docs.mjs --strict` (required for new components), `pnpm test`, `pnpm lint` and `pnpm format:check`.

`@wovenui/core` is a dev dependency from npm. To develop against a local core checkout, run `pnpm link ../../core` (it is not saved to `package.json`).

Dev server ports 4321 and 4322 belong to the human. Never start, stop or touch them. Use your own scratch port when you need a server.

## 3. Repository layout

```
src/
  index.scss        Bundle entry (@use "@wovenui/components"), takes $components
  _kit.scss         $registry, enabled(), with-needs() and the emit() loader
  _shared.scss      Shared :root values (--wu-kit-* custom properties)
  _helpers.scss     Kit-wide helpers emitted with every component (wu-mirror)
  _close.scss       Close button mixin shared by modal, drawer and toast
  components/       One partial per component, _{name}.scss
  entries/          One entry per component, {name}.scss (@wovenui/components/{name})
  js/               ES modules: index.js, util.js and one module per scripted component
scripts/            build-scss.mjs, build-js.mjs, build-docs.mjs, check-modifiers.mjs
test/               *.mjs suites and helpers.mjs
examples/           index.html, a local button demo (not shipped)
dist/               Build output
```

## 4. Naming grammar

- Prefixed root: `wu-btn`.
- Bare compound modifiers, valid only together with the root: `wu-btn brand sm` emits `.wu-btn.brand`, never a lone `.brand`.
- Color and emphasis words use core role names (`brand`, `success`, `danger`, `warning`, `info`). Never `primary`.
- Parts are `wu-<name>-<part>`: `wu-card-header`.
- A modifier word never reuses a core class name. `scripts/check-modifiers.mjs` (run by `test/modifiers.mjs`) enforces it against core's CSS, and also fails a modifier used without a `.wu-*` root in the same compound.
- Component variables use `--wu-<name>--Prop` (`--wu-btn--BackgroundColor`) as read values with fallbacks. Kit files declare only private `--wu-kit-*` properties; `test/compile.mjs` fails on any other `--wu-*` declaration.

## 5. Authoring rules

- Plain declarations with `woven.token()` (`@use "@wovenui/core/mixins" as woven;`). Never `apply()`: it compiles slower.
- Each file in `src/components/` opens with a doc block (section 10). Keep other comments short. Do not narrate history or decisions in source.
- State lives in attributes (`aria-*`, `hidden`, `open`), not classes.
- Native first: `<dialog>` with `commandfor` and `command`, `popover`, `<details name>`. Anchor positioning sits behind `@supports (anchor-name: --x)`.
- `:has()` is scoped to the component root, never `body:has()`.
- Logical properties for right to left. Use `:dir(rtl)` where a physical shape must flip.
- Layer order is `@layer reset, base, components, recipes;`. The kit sits in `components`. Utilities and app CSS are unlayered.
- No changes to `@wovenui/core` from kit work. Report what core would need instead.
- Tooltips belong to core, not the kit.

### Motion

Calm by default. Motion is opt-in with the compound word `animated` (`wu-btn-group animated`) or `wu-animated` on an ancestor, always inside `@media (prefers-reduced-motion: no-preference)`. The skeleton shimmer is opt-in the same way. JS motion uses the `animated()` check in `src/js/util.js`.

### Icons

- The kit ships no icons and no icon library or component.
- Built-in indicators (select and dropdown arrows, accordion chevron, close marks) are drawn in CSS: masks, borders and pseudo-elements. Any other icon comes from the app's own `svg`. The kit never ships icon files.
- A direct child `svg` in a component is only sized (`1em`, `flex-shrink: 0`). Never set `fill` or `stroke`, so the app's icon set, stroke or filled, works.
- `wu-mirror` (in `src/_helpers.scss`) flips directional icons in right to left.

### Terms

- `with-needs(name)` (`src/_kit.scss`): the component plus every component it needs, needs first.
- `emit(names)` (`src/_kit.scss`): writes the layer order, the shared values and helpers, then the named components in registry order, all in `@layer components`.
- `recipes` layer: the last layer in the order, above `components`. The kit leaves it empty; app-level patterns built from kit components (recipes in `../landing`) go there.
- `wu-mirror`: helper class that flips an element horizontally under `:dir(rtl)`.
- `fresh(root, selector)` (`src/js/util.js`): the elements matching the selector inside `root` (and `root` itself), each returned only once, so `init*()` can run again safely.
- `animated(el, name)` (`src/js/util.js`): true when the element has the `animated` word or a `wu-animated` ancestor, and the user allows motion.
- Found by class: each script looks for its component root class: `.wu-tabs`, `.wu-toast-region`, `.wu-autocomplete`, `.wu-table`, `.wu-data-table`, `.wu-input-clear`.
- Reading a component variable: always with a fallback, so the component works when nobody sets it:

  ```scss
  inline-size: var(--wu-btn--CaretSize, 0.4em);
  ```

## 6. Add a component

`src/_kit.scss` holds `$registry`: each component name and the components it needs. The bundle (`src/index.scss`) takes `$components: ("name": false)`; unknown names, non-boolean values and a needed component switched off raise errors.

Use `button` as the reference component: copy the shape of its partial, entry, export, doc block and docs page. Do every step:

1. **Partial** `src/components/_{name}.scss`, opening with its doc block (grammar in section 10).
2. **Registry line** in `$registry` in `src/_kit.scss`, in reading order, listing the components it needs (an empty list when none):

   ```scss
   "button": (),
   "pagination": ("button"),
   ```

3. **Entry** `src/entries/{name}.scss`, exactly like `src/entries/button.scss`:

   ```scss
   // @wovenui/components/button: the button and what it needs, without the bundle
   @use "../kit";

   @include kit.emit(kit.with-needs("button"));
   ```

4. **Export** in `package.json`: `"./{name}": { "sass": "./src/entries/{name}.scss" }`, before `"./js"`.
5. **JS**, only when the component needs a script: a module `src/js/{name}.js` exporting `init{Name}(root = document)` (`tabs.js` and `initTabs`, `input-clear.js` and `initInputClear`), then the three places in section 7: `src/js/index.js` (import, call in `init()`, export list), `scripts/build-js.mjs` (`order` and `api`) and `test/js.mjs` (`expected` and the module list). Set `@js` in the doc block to match.
6. **Tests**: add checks that fail without the change, in the suite that owns the area (section 8).
7. **Docs page** in the docs site project (`uikits/site` in the WovenUI workspace): `src/content/docs/docs/{name}.mdx`, plus the name in its group in `src/groups.mjs` (alphabetical by page title inside the group).
8. **Commands**, all passing: `node scripts/build-docs.mjs --strict`, `pnpm test`, `pnpm lint`, `pnpm format:check`.

## 7. JS layer

- ES modules in `src/js/`, no dependencies, no framework.
- Components are found by class. Each `init*(root)` is idempotent (shared `fresh()` in `util.js`), and `init(root)` starts everything, including content added later. `index.js` calls `init()` on `DOMContentLoaded`.
- A new export goes in three places: `src/js/index.js`, `scripts/build-js.mjs` (the `order` list for a new module and the `api` list) and `test/js.mjs` (`expected`, and the module list).
- The build joins the modules in order, drops imports and collects exports, so top-level names must be unique across modules.
- Be honest about which components need JS.

## 8. Tests

| Suite | Checks |
| --- | --- |
| `compile.mjs` | The bundle and every entry compile and declare no `--wu-*` property outside `--wu-kit-*` |
| `switches.mjs` | `$components` switches remove components; unknown names, bad values and missing needs raise errors |
| `entries.mjs` | Each entry matches the bundle with only that component and its needs on |
| `caret.mjs` | Caret button and checkable button group selectors exist in the built CSS |
| `modifiers.mjs` | Runs `scripts/check-modifiers.mjs` on the built CSS |
| `size.mjs` | Reports gzip sizes of the minified CSS and the ES module (no limit) |
| `js.mjs` | The modules and both dist builds load without a DOM and export the same functions |
| `docs.mjs` | Doc blocks match the compiled CSS, `$registry` and `src/js/index.js` (details in section 10) |

`UIKIT_SRC` and `UIKIT_DIST` point the tests at other folders, to prove a test fails without a change. Add tests that fail without the change, in the suite that owns the area.

## 9. Writing rules

- American English (color, behavior, center).
- No em dashes or arrows in code, comments or docs.
- No version numbers, dates or counts in prose: they go stale. Use computed values only. Exempt: `@since` and `@changed` versions in doc blocks, which are data.
- Public text (README, docs) targets current browsers: no old-browser caveats or fallback notes.
- Before writing an example (README, comments, tests), check every class against the built `dist/wovenui-kit.css` and every core token or mixin against `@wovenui/core`.
- Keep the change small and in the narrowest code path. Do not refactor adjacent code.

WovenUI core reference: https://wovenui.com/llms-full.txt.

## 10. Doc blocks

Each `src/components/_{name}.scss` opens with one doc block. It is the single source for `dist/llms-full.txt` (the AI guide), `dist/components.json` (tooling) and changelog data. `scripts/build-docs.mjs` reads it; `test/docs.mjs` checks it (below).

The block uses the SassDoc poster syntax (`////`, as in `@wovenui/core`) and SassDoc's own `@since` and `@example` tags. Kit partials hold rules, not mixins or functions, so SassDoc has no items to attach a poster to; the kit reads the block with its own strict parser instead.

```scss
////
//// @component wu-btn
//// Buttons for actions, in sizes and roles, with a caret for menus and split buttons.
////
//// Optional note paragraphs, one line each.
////
//// @since 1.0.0
//// @needs none
//// @js none
//// @example html
////   <button class="wu-btn brand" type="button">Save</button>
//// @modifier brand - Solid brand fill @since 1.0.0
//// @modifier sm | lg - Small or large control height @since 1.0.0
//// @part wu-badge-host - Wrapper that a corner badge pins to @since 1.0.0
//// @variable --wu-btn--CaretSize [0.4em] - Size of the caret @since 1.0.0
//// @state aria-busy="true" - Blocks pointer clicks and keeps full opacity @since 1.0.0
//// @changed 1.0.1 - sm: smaller font size
////

@use "@wovenui/core/mixins" as woven;
```

### Layout

- The block is the first lines of the file, followed by a blank line. The first and last lines are a bare `////`. Every line is `////` followed by one space and text, or a bare `////`.
- Line two is `//// @component <root class>`, the class without the dot (`wu-btn`). The registry name is the file name.
- Line three is the summary: one sentence.
- Optional note paragraphs follow, one line each, separated by bare lines.
- Then the tags, one per line, in this order: `@since`, `@needs`, `@js`, `@example`, `@modifier`, `@part`, `@variable`, `@state`, `@changed`. Bare lines between tags are allowed.
- Every tag is one line, except `@example`.

### Tags

| Tag | Grammar | Count |
| --- | --- | --- |
| `@since` | `@since <version>`: the release that added the component | One, required |
| `@needs` | `@needs none`, or `@needs <name>, <name>`: exactly the components `$registry` lists for it | One, required |
| `@js` | `@js none`, `@js required <export>, <export>` or `@js optional <export>`: exports of `src/js/index.js` | One, required |
| `@example` | `@example html`, then code lines indented two spaces (`////   <div ...>`) | One or more, required |
| `@modifier` | `@modifier <word> - <description> @since <version>` | Any |
| `@part` | `@part <class> - <description> @since <version>`, the class without the dot | Any |
| `@variable` | `@variable <--name> [<default>] - <description> @since <version>`; `[<default>]` is optional | Any |
| `@state` | `@state <key> - <description> @since <version>`; the key is an attribute (`aria-busy="true"`, `open`) or a pseudo-class (`:empty`), with no spaces | Any |
| `@changed` | `@changed <version> - <note>`; the note starts with the item it changes (`sm: ...`) | Any |

- Per-item versions: `@modifier`, `@part`, `@variable` and `@state` lines end with ` @since <version>`. The first release is `1.0.0`; a later addition gets the version it ships in (`@since 1.0.1`), never older than the component's `@since`.
- `|` joins names that share one description: `@modifier sm | lg - ...`, `@state disabled | aria-disabled="true" - ...`. Each name may appear once per tag.
- A version is `major.minor.patch`, optionally with a pre-release (`1.1.0-beta.1`).
- Descriptions are plain text with backticks for code. No `{`, `}`, em dashes or arrows. American English.
- Example markup uses only classes the built CSS emits and real attributes. Never `href="#"` for actions.

### What `test/docs.mjs` checks

- Every bare modifier word the compiled partial emits on a `.wu-*` compound (the `scripts/check-modifiers.mjs` rule) is a `@modifier`, and every `@modifier` is emitted.
- Every class of the compiled partial that starts with `<root>-` and is not another component's root is a `@part`, and every `@part` is in the compiled partial.
- Every custom property the partial reads that starts with `--<root>--` is a `@variable`, and every `@variable` is read by the partial.
- `@needs` equals the `$registry` line; `@js` names exports of `src/js/index.js`; every version is valid and no item is older than its component.

Components without a block are listed as warnings and skipped. `node scripts/build-docs.mjs --strict` fails on any missing or incomplete block; new components must pass it.
