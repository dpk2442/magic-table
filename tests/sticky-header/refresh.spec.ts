import { test, expect } from '@playwright/test';

test('header stays stuck on page reload', async ({ page }) => {
    await page.goto('/sticky_header/long_table.html');
    const thead = page.locator('thead');

    await page.evaluate(() => window.scrollBy({ top: 100 }));
    expect((await thead.boundingBox())!.y).toBe(0);

    await page.evaluate(() => window.location.reload());
    expect((await thead.boundingBox())!.y).toBe(0);
});

test('header stays stuck on page reload with constrained table', async ({
    page,
}) => {
    await page.goto('/sticky_header/height_constrained_table.html');
    const thead = page.locator('thead');

    expect((await thead.boundingBox())!.y).toBeGreaterThan(0);
    await page.evaluate(() => window.scrollBy({ top: 100 }));
    expect((await thead.boundingBox())!.y).toBeCloseTo(0, 5);

    await page.evaluate(() => window.location.reload());
    expect((await thead.boundingBox())!.y).toBeCloseTo(0, 5);
});
