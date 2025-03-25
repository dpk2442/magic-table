import { test, expect, Locator } from '@playwright/test';
import { MagicTable } from '../../src/index.ts';
import { SortOrder } from '../../src/lib/sortable/SortableTypes.ts';

function getCurrentTableOrder(magicTable: Locator) {
    return magicTable.locator('tbody > tr > td:first-child').allInnerTexts();
}

const INITIAL_ORDER = ['0', '1', '2', '3', '4'];
const DATE_ORDER_ASC = ['0', '3', '4', '1', '2'];
const DATE_ORDER_DESC = ['2', '1', '4', '3', '0'];

[
    [1, 'asc', DATE_ORDER_ASC],
    [1, 'desc', DATE_ORDER_DESC],
    [2, 'asc', ['1', '2', '0', '4', '3']],
    [2, 'desc', ['3', '4', '0', '2', '1']],
    [3, 'asc', ['2', '1', '0', '3', '4']],
    [3, 'desc', ['4', '3', '0', '1', '2']],
    [4, 'asc', ['3', '0', '2', '1', '4']],
    [4, 'desc', ['4', '1', '2', '0', '3']],
].forEach(([columnId, sortOrder, expectedOrder]) => {
    test(`sorting api sorts as expected: column ${columnId} ${sortOrder}`, async ({
        page,
    }) => {
        await page.goto('/sortable/basic.html');
        const magicTable = page.locator('magic-table');

        await magicTable.evaluate(
            (mt: MagicTable, [_columnId, _sortOrder]) =>
                mt.sortByColumn(_columnId as number, _sortOrder as SortOrder),
            [columnId, sortOrder],
        );

        expect(await getCurrentTableOrder(magicTable)).toEqual(expectedOrder);
    });
});

test('headers get sortable class', async ({ page }) => {
    await page.goto('/sortable/basic.html');
    const magicTable = page.locator('magic-table');
    const headers = await magicTable.locator('thead > tr > th').all();
    await expect(headers[0]).not.toHaveClass(/mt-sortable/);
    await Promise.all(
        headers.slice(1).map(h => expect(h).toHaveClass(/mt-sortable/)),
    );
});

test('sorting api toggles sort', async ({ page }) => {
    await page.goto('/sortable/basic.html');
    const magicTable = page.locator('magic-table');
    const dateColumnHeader = magicTable.locator('thead > tr > th:nth-child(2)');

    // Without arguments, should sort asc then desc
    await magicTable.evaluate((mt: MagicTable) => mt.sortByColumn(1));
    await expect(dateColumnHeader).toHaveClass(/mt-sorted-asc/);
    expect(await getCurrentTableOrder(magicTable)).toEqual(DATE_ORDER_ASC);

    // Calling again without arguments should sort desc
    await magicTable.evaluate((mt: MagicTable) => mt.sortByColumn(1));
    await expect(dateColumnHeader).toHaveClass(/mt-sorted-desc/);
    expect(await getCurrentTableOrder(magicTable)).toEqual(DATE_ORDER_DESC);

    // Calling once more should sort asc again
    await magicTable.evaluate((mt: MagicTable) => mt.sortByColumn(1));
    await expect(dateColumnHeader).toHaveClass(/mt-sorted-asc/);
    expect(await getCurrentTableOrder(magicTable)).toEqual(DATE_ORDER_ASC);

    // Clearing the sort should reset the order
    await magicTable.evaluate((mt: MagicTable) => mt.clearSort());
    await expect(dateColumnHeader).not.toHaveClass(/mt-sorted/);
    expect(await getCurrentTableOrder(magicTable)).toEqual(INITIAL_ORDER);
});

test('can sort by id', async ({ page }) => {
    await page.goto('/sortable/basic.html');
    const magicTable = page.locator('magic-table');
    await magicTable.evaluate((mt: MagicTable) => mt.sortByColumn('date'));
    expect(await getCurrentTableOrder(magicTable)).toEqual(DATE_ORDER_ASC);
});

test('cannot sort by unsortable column', async ({ page }) => {
    await page.goto('/sortable/basic.html');
    const magicTable = page.locator('magic-table');
    await expect(
        magicTable.evaluate((mt: MagicTable) => mt.sortByColumn(0)),
    ).rejects.toThrow('Specified column is not sortable');
});
