import { test, expect } from '@playwright/test';

test('unconstrained header returns to correct location when scrolling down and up', async ({
    page,
}) => {
    await page.goto('/sticky_header/tables_with_captions.html');
    const table = page.locator('magic-table#unconstrained table');
    const thead = table.locator('thead');

    const initialTheadLocation = (await thead.boundingBox())!.y;

    expect((await table.boundingBox())!.y).toBeGreaterThan(0);
    expect((await thead.boundingBox())!.y).toBeGreaterThan(0);

    await page.evaluate(() => window.scrollBy({ top: 200 }));

    expect((await table.boundingBox())!.y).toBeLessThan(0);
    expect((await thead.boundingBox())!.y).toBe(0);

    await page.evaluate(() => window.scrollTo({ top: 0 }));

    expect((await table.boundingBox())!.y).toBeGreaterThan(0);
    expect((await thead.boundingBox())!.y).toBe(initialTheadLocation);
});

test('constrained header returns to correct location when scrolling down and up', async ({
    page,
}) => {
    await page.goto('/sticky_header/tables_with_captions.html');
    const magicTable = page.locator('magic-table#constrained');
    const table = magicTable.locator('table');
    const thead = table.locator('thead');

    const magicTableTop = (await magicTable.boundingBox())!.y;
    await page.evaluate(
        ([top]) => window.scrollTo({ top }),
        [magicTableTop - 1],
    );

    const initialTheadLocation = (await thead.boundingBox())!.y;

    expect((await table.boundingBox())!.y).toBeGreaterThan(0);
    expect((await thead.boundingBox())!.y).toBeGreaterThan(0);

    await page.evaluate(() => window.scrollBy({ top: 100 }));

    expect((await table.boundingBox())!.y).toBeLessThan(0);
    expect((await thead.boundingBox())!.y).toBe(0);

    await page.evaluate(() => window.scrollBy({ top: -100 }));

    expect((await table.boundingBox())!.y).toBeGreaterThan(0);
    expect((await thead.boundingBox())!.y).toBe(initialTheadLocation);
});
