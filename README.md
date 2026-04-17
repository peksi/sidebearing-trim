# sidebearing-trim

Align text by visible ink, not by glyph box origin. Reads OpenType metrics to measure where the first ink lands on each line and shifts the element left by exactly that amount.

## Install

```bash
npm install sidebearing-trim opentype.js
```

## Usage

### Vanilla JS

```ts
import { trimSidebearings } from "sidebearing-trim";

const controller = await trimSidebearings(
  document.querySelector(".headline"),
  "/fonts/inter-latin-400-normal.woff",
);

// Later — re-run after dynamic content changes:
controller.recompute();

// Clean up when done:
controller.destroy();
```

### React

```tsx
import { Sidebearing } from "sidebearing-trim/react";

<Sidebearing as="h1" fontSource="/fonts/inter-latin-400-normal.woff">
  Lorem <em>ipsum</em> dolor sit amet
</Sidebearing>
```

The component re-runs automatically when content or font changes. Nested markup is supported.

---

## API

### `trimSidebearings(targets, fontSource, options?)`

```ts
import { trimSidebearings } from "sidebearing-trim";
```

| Parameter | Type | Description |
|---|---|---|
| `targets` | `HTMLElement \| Iterable<HTMLElement> \| ArrayLike<HTMLElement>` | Element(s) to trim |
| `fontSource` | `string \| ArrayBuffer \| Font` | URL to a `.woff` file, raw font bytes, or a pre-parsed opentype.js `Font` object |
| `options` | `TrimSidebearingsOptions` | Optional — see below |

**Returns** a `SidebearingController`:

| Method | Description |
|---|---|
| `recompute()` | Re-measure line starts and reapply trim (call after layout or content changes) |
| `destroy()` | Remove all injected spans and event listeners, restoring original DOM |
| `getState()` | Returns `{ targetCount, lineStartCount, trimmedCount }` |

**Options (`TrimSidebearingsOptions`):**

| Option | Type | Default | Description |
|---|---|---|---|
| `trimEnabled` | `boolean` | `true` | Apply trim. Set to `false` to measure without trimming |
| `observeResize` | `boolean` | `true` | Re-run on window resize |
| `applyOverlayVariable` | `boolean` | `true` | Set `--lsb-em` CSS variable for overlay/debug use |
| `overlayVariable` | `string` | `"--lsb-em"` | Name of the CSS variable |
| `spanClassName` | `string` | `"sb-glyph"` | Class applied to each injected glyph span |

---

### `<Sidebearing>` (React)

```ts
import { Sidebearing } from "sidebearing-trim/react";
```

Accepts all props of the rendered element (via `as`) plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `fontSource` | `string \| ArrayBuffer \| Font` | — | URL to a `.woff` file, raw font bytes, or a pre-parsed `Font` object |
| `as` | `ElementType` | `"span"` | HTML element to render |
| `trim` | `boolean` | `true` | Enable or disable trimming |
| `overlay` | `boolean` | `true` | Set `--lsb-em` CSS variable |
| `overlayVariable` | `string` | `"--lsb-em"` | Name of the CSS variable |
| `glyphClassName` | `string` | `"sb-glyph"` | Class applied to each injected glyph span |
| `observeResize` | `boolean` | `true` | Re-run on window resize |

---

## Development

This repository uses [pnpm](https://pnpm.io) workspaces. Make sure you have pnpm installed before contributing.

```bash
npm install -g pnpm  # install pnpm if you don't have it
pnpm install         # install all workspace dependencies
pnpm build           # build the package
pnpm test            # run tests
pnpm dev:docs        # start the docs dev server
```

## Known limitations

- **Only `.woff` fonts are supported.** WOFF2 support would add ~1.15 MB to the bundle due to Brotli decompression.
- **Requires mounted DOM nodes.** The element must be rendered and visible before trimming runs so that line-start positions can be detected.
- **You need the `.woff` file at hand.** The font used in CSS and the `fontSource` must point to the same file — a mismatch produces a console warning in development.
- **No RTL support yet.**
