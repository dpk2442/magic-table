import { test, expect, Locator } from '@playwright/test';

function getCurrentTableOrder(magicTable: Locator) {
    return magicTable.locator('tbody > tr > td:first-child').allInnerTexts();
}

const INITIAL_ORDER = ['0', '1', '2', '3', '4'];
const VALUE_ORDER_ASC = ['3', '0', '2', '1', '4'];
const VALUE_ORDER_DESC = ['4', '1', '2', '0', '3'];

test('toggle button', async ({ page }) => {
    await page.goto('/sortable/buttons.html');
    const magicTable = page.locator('magic-table');
    const toggleButton = page.locator('#toggle');

    expect(await getCurrentTableOrder(magicTable)).toEqual(INITIAL_ORDER);
    await toggleButton.click();
    expect(await getCurrentTableOrder(magicTable)).toEqual(VALUE_ORDER_ASC);
    await toggleButton.click();
    expect(await getCurrentTableOrder(magicTable)).toEqual(VALUE_ORDER_DESC);
    await toggleButton.click();
    expect(await getCurrentTableOrder(magicTable)).toEqual(VALUE_ORDER_ASC);
});

test('ascending and descending buttons', async ({ page }) => {
    await page.goto('/sortable/buttons.html');
    const magicTable = page.locator('magic-table');
    const ascButton = page.locator('#asc');
    const descButton = page.locator('#desc');

    expect(await getCurrentTableOrder(magicTable)).toEqual(INITIAL_ORDER);

    await ascButton.click();
    expect(await getCurrentTableOrder(magicTable)).toEqual(VALUE_ORDER_ASC);
    await ascButton.click();
    expect(await getCurrentTableOrder(magicTable)).toEqual(VALUE_ORDER_ASC);

    await descButton.click();
    expect(await getCurrentTableOrder(magicTable)).toEqual(VALUE_ORDER_DESC);
    await descButton.click();
    expect(await getCurrentTableOrder(magicTable)).toEqual(VALUE_ORDER_DESC);
});
