# Magic Table

Magic Table is a custom element that adds interactivity to an HTML table. It can make the header sticky, with more
features coming soon.

## Installation

### From NPM

To use Magic Table in a javascript project, install `magic-table` from NPM.

```shell
npm install @dpk2442/magic-table
```

This package exports the `MagicTable` class, which is a custom element. Typically this should be registered in
`window.customElements` as follows:

```js
import { MagicTable } from 'magic-table';
window.customElements.define('magic-table', MagicTable);
```

### Automatic Registration

Magic Table also ships with a script, `magic-table.js`, that will automatically load and register the custom element.
There are three ways to use this script:

1. Download it from the latest release.
2. Install the NPM package, as listed in the previous section, and then copy it from the `dist` folder.
3. Directly include it from a CDN. jsDelivr can serve files directly from NPM, and you can find `magic-table` here:
   https://www.jsdelivr.com/package/npm/@dpk2442/magic-table.

However you fetch the script, once including it in your page it will make the `<magic-table>` tag available for use.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Test magic-table</title>
        <script src="magic-table.js" defer></script>
    </head>
    <body>
        <magic-table sticky-header>
            <table>
                <thead>
                    <tr>
                        <th>Column 1</th>
                        <th>Column 2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Cell 1</td>
                        <td>Cell 2</td>
                    </tr>
                </tbody>
            </table>
        </magic-table>
    </body>
</html>
```

## Usage

When `magic-table` initializes, it will add the `mt-activated` class to itself. Individual features of the element are
enabled through attributes, and are documented below.

### Sticky Headers

Sticky headers can be enabled with the `sticky-header` attribute. The table must contain a thead element, which will
receive the class `mt-sticky-header` when sticky headers are enabled.

```html
<magic-table sticky-header>
    <table>
        <thead class="mt-sticky-header">
            ...
        </thead>
        <tbody>
            ...
        </tbody>
    </table>
</magic-table>
```
