import { test, expect } from '@playwright/test';

test('adds classes when activated', async ({ page }) => {
    await page.goto('/sticky_header/long_table.html');

    const magicTable = page.locator('magic-table');
    await magicTable.waitFor({ state: 'attached' });
    expect(magicTable).toHaveClass(/mt-activated/);
    expect(page.locator('thead')).toHaveClass(/mt-sticky-header/);
});

test('header stays at page top when scrolling', async ({ page }) => {
    await page.goto('/sticky_header/long_table.html');
    const table = page.locator('table');
    const thead = page.locator('thead');

    expect((await table.boundingBox())!.y).toBeGreaterThan(0);
    expect((await thead.boundingBox())!.y).toBeGreaterThan(0);

    await page.evaluate(() => window.scrollBy({ top: 100 }));

    expect((await table.boundingBox())!.y).toBeLessThan(0);
    expect((await thead.boundingBox())!.y).toBe(0);
});

test('header stops at bottom of table', async ({ page }) => {
    await page.goto('/sticky_header/long_table.html');
    const table = page.locator('table');
    const thead = page.locator('thead');

    const tableBoundingBox = (await table.boundingBox())!;
    const tableBottomY = tableBoundingBox.y + tableBoundingBox.height;
    const theadHeight = (await thead.boundingBox())!.height;

    await page.evaluate(
        ([top]) => window.scrollTo({ top }),
        [tableBottomY - theadHeight / 2],
    );

    expect((await table.boundingBox())!.y).toBeLessThan(0);
    expect((await thead.boundingBox())!.y).toBeLessThan(0);
});

test('header scrolls away with table', async ({ page }) => {
    await page.goto('/sticky_header/long_table.html');
    const table = page.locator('table');
    const thead = page.locator('thead');

    const tableBoundingBox = (await table.boundingBox())!;
    const tableBottomY = tableBoundingBox.y + tableBoundingBox.height;

    await page.evaluate(
        ([top]) => window.scrollTo({ top }),
        [tableBottomY + 100],
    );

    expect((await table.boundingBox())!.y).toBeLessThan(0);
    expect((await thead.boundingBox())!.y).toBeLessThan(0);
});
