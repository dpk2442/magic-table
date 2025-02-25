# Magic Table

Magic Table is a custom element that adds interactivity to an HTML table. It
can make the header sticky, with more features coming soon.

## Installation

Grab `magic-table.js` from the latest release and include it in your page. It
will make the `<magic-table>` tag available for use in your page.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Test magic-table</title>
        <script src="path/to/magic-table.js" defer></script>
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

When `magic-table` initializes, it will add the `mt-activated` class to itself. Individual features of the element are enabled through attributes, and are documented below.

### Sticky Headers

Sticky headers can be enabled with the `sticky-header` attribute. The table must contain a
thead element, which will receive the class `mt-sticky-header` when sticky headers are
enabled.

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
