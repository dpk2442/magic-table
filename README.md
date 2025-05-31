# Magic Table

Magic Table is a custom element that adds interactivity to an HTML table. The goal of the element is to enhance the
functionality of the table progressively, making as few changes to the DOM and styles as possible.

Magic Table supports sticky headers and sorting based on column values. Details for each feature can be found in the
[Usage](#usage) section below.

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

### Sorting

Sorting can be enabled with the `sortable` attribute. The header (`th`) of each sortable column should have a
`data-mt-sortable` attribute set to the sorting type to be used, and the header will have the `mt-sortable` class added
to it if sorting is enabled for that column.

```html
<magic-table sortable>
    <table>
        <thead>
            <tr>
                <th>Column 1</th>
                <th data-mt-sortable="string" class="mt-sortable">Column 2</th>
            </tr>
        </thead>
        <tbody>
            ...
        </tbody>
    </table>
</magic-table>
```

#### Available Sorting Types

<table>
    <tr><th>Type</th><th>Details</th></tr>
    <tr>
        <td><code>date</code></td>
        <td>
            This sort type will treat the values in the column as <code>Date</code> objects, using <code>new
            Date(columnValue)</code> to construct an instance to be used for sorting.
        </td>
    </tr>
    <tr>
        <td><code>string</code></td>
        <td>
            This sort will perform simple alphabetic sorting on the values in the column.
        </td>
    </tr>
    <tr>
        <td><code>natural</code></td>
        <td>
            This sort will perform "natural" sorting, treating numerical values as numbers.
        </td>
    </tr>
    <tr>
        <td><code>number</code></td>
        <td>
            This sort treats each value as a number, using <code>parseFloat</code> to convert the value.
        </td>
    </tr>
    <tr>
        <td><code>custom</code></td>
        <td>
            This sort allows using a custom function to sort the data in the column. The function name should be
            specified as <code>custom:functionName</code>, and the columns values will be passed as strings. The
            function should follow the definition of the <code>compareFn</code> that can be passed to <a
            href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#comparefn">Array.prototype.sort()</a>.
        </td>
    </tr>
</table>

#### Sorting Classes

When a column is sorted, the class `mt-sorted-asc` or `mt-sorted-desc` will be set on the column that is sorted,
depending on the order. All other columns will have neither of these classes set.

#### Sorting API

The table can be sorted by calling the API on a reference to the `magic-table` element.

<table>
    <tr><th>Type</th><th>Details</th></tr>
    <tr>
        <td><code>sortByColumn(indexOrId[, order])</code></td>
        <td>
            Sorts the table by the given column. The columns are indexed from 0, or can be referred to by using the
            value set in the `id` attribute. The second parameter controls sort order and can be set to `asc` or `desc`;
            if ommitted the sort order will be toggled, starting with `asc` if the table is not currently sorted by that
            column. 
        </td>
    </tr>
    <tr>
        <td><code>clearSort()</code></td>
        <td>
            Clears the sorting of the table and resets it to the page load order.
        </td>
    </tr>
    <tr>
        <td><code>currentSortInfo</code></td>
        <td>
            This property returns null if the table is in the default sorting order, or the current sorting info (see
            events section below) if the table is currently sorted.
        </td>
    </tr>
</table>

#### Sorting Events

When the table is sorted, a `CustomEvent` of type `mtsorted` will be published on the `magic-table`. When the sort is
cleared, a `CustomEvent` of type `mtsortcleared` is published. The `detail` field of the `mtsorted` event has the
following schema, which is also what is returned from the `currentSortInfo` property mentioned above.

```typescript
interface MagicTableSortInfo {
    columnIndex: number;
    header: HTMLTableCellElement;
    sortOrder: SortOrder;
}
```

#### Sorting Buttons

Any `button` element placed inside a sortable column header's `th` element can be given the `data-mt-sort` attribute to
automatically have an event handler attached to trigger a sort of that column. The attribute can have no value, in which
case the button will toggle the sort, or it can be set to `asc` or `desc` to force the sort in that order.

```html
<magic-table sortable>
    <table>
        <thead>
            <tr>
                <th>Column 1</th>
                <th data-mt-sortable="string" class="mt-sortable">
                    <button data-mt-sort>Column 2</button>
                </th>
            </tr>
        </thead>
        <tbody>
            ...
        </tbody>
    </table>
</magic-table>
```
