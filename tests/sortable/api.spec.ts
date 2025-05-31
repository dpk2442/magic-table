import { test, expect, Locator } from '@playwright/test';
import { MagicTable, MagicTableSortInfo } from '../../src/index.ts';
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
    [5, 'asc', ['2', '4', '0', '1', '3']],
    [5, 'desc', ['3', '0', '1', '4', '2']],
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

test('publishes events when sorting', async ({ page }) => {
    const expectedSortInfos = [
        {
            columnIndex: 1,
            sortOrder: 'asc',
        },
        {
            columnIndex: 1,
            sortOrder: 'desc',
        },
    ];

    await page.addInitScript(() => {
        (window as any).mtSorted = [];
        (window as any).mtSortCleared = [];
        window.addEventListener('mtsorted', e =>
            (window as any).mtSorted.push({
                type: e.type,
                detail: (e as CustomEvent).detail,
            }),
        );
        window.addEventListener('mtsortcleared', e =>
            (window as any).mtSortCleared.push({
                type: e.type,
            }),
        );
    });

    await page.goto('/sortable/basic.html');
    const magicTable = page.locator('magic-table');

    await magicTable.evaluate((mt: MagicTable) => mt.sortByColumn(1));
    expect(await getCurrentTableOrder(magicTable)).toEqual(DATE_ORDER_ASC);
    expect(
        await magicTable.evaluate((mt: MagicTable) => mt.currentSortInfo),
    ).toMatchObject(expectedSortInfos[0]);

    await magicTable.evaluate((mt: MagicTable) => mt.sortByColumn(1));
    expect(await getCurrentTableOrder(magicTable)).toEqual(DATE_ORDER_DESC);
    expect(
        await magicTable.evaluate((mt: MagicTable) => mt.currentSortInfo),
    ).toMatchObject(expectedSortInfos[1]);

    await magicTable.evaluate((mt: MagicTable) => mt.clearSort());
    expect(await getCurrentTableOrder(magicTable)).toEqual(INITIAL_ORDER);
    expect(
        await magicTable.evaluate((mt: MagicTable) => mt.currentSortInfo),
    ).toBeUndefined();

    await page.waitForFunction(
        () =>
            (window as any).mtSorted.length === 2 &&
            (window as any).mtSortCleared.length === 1,
    );

    const { mtSorted, mtSortCleared } = await page.evaluate<{
        mtSorted: Array<{ type: string; detail: MagicTableSortInfo }>;
        mtSortCleared: Array<{ type: string }>;
    }>(() => ({
        mtSorted: (window as any).mtSorted,
        mtSortCleared: (window as any).mtSortCleared,
    }));

    expect(mtSorted).toMatchObject(
        expectedSortInfos.map(info => ({ type: 'mtsorted', detail: info })),
    );

    expect(mtSortCleared).toMatchObject([
        {
            type: 'mtsortcleared',
        },
    ]);
});

test('sort with explicit order does not repeat sort', async ({ page }) => {
    await page.addInitScript(() => {
        (window as any).mtSortedCount = 0;
        window.addEventListener(
            'mtsorted',
            () => (window as any).mtSortedCount++,
        );
    });

    await page.goto('/sortable/basic.html');
    const magicTable = page.locator('magic-table');

    await magicTable.evaluate((mt: MagicTable) => mt.sortByColumn(1, 'asc'));
    expect(
        await page.evaluate<number>(() => (window as any).mtSortedCount),
    ).toEqual(1);

    await magicTable.evaluate((mt: MagicTable) => mt.sortByColumn(1, 'asc'));
    expect(
        await page.evaluate<number>(() => (window as any).mtSortedCount),
    ).toEqual(1);
});
