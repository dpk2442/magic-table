import { test, expect } from '@playwright/test';

test('fully constrained table adds overflow classes', async ({ page }) => {
    await page.goto('/overflow_classes.html');

    const magicTable = page.locator('magic-table#full');
    await magicTable.waitFor({ state: 'attached' });

    await expect(magicTable).not.toHaveClass(/mt-overflow-top/);
    await expect(magicTable).toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-left/);
    await expect(magicTable).toHaveClass(/mt-overflow-right/);

    await magicTable.evaluate(mt => mt.scrollTo({ left: 100 }));
    await expect(magicTable).not.toHaveClass(/mt-overflow-top/);
    await expect(magicTable).toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).toHaveClass(/mt-overflow-left/);
    await expect(magicTable).toHaveClass(/mt-overflow-right/);

    await magicTable.evaluate(mt => mt.scrollTo({ top: 100 }));
    await expect(magicTable).toHaveClass(/mt-overflow-top/);
    await expect(magicTable).toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).toHaveClass(/mt-overflow-left/);
    await expect(magicTable).toHaveClass(/mt-overflow-right/);

    await magicTable.evaluate(mt => mt.scrollTo({ left: mt.scrollWidth }));
    await expect(magicTable).toHaveClass(/mt-overflow-top/);
    await expect(magicTable).toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).toHaveClass(/mt-overflow-left/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-right/);

    await magicTable.evaluate(mt => mt.scrollTo({ top: mt.scrollHeight }));
    await expect(magicTable).toHaveClass(/mt-overflow-top/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).toHaveClass(/mt-overflow-left/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-right/);
});

test('horizontally constrained table adds overflow classes', async ({
    page,
}) => {
    await page.goto('/overflow_classes.html');

    const magicTable = page.locator('magic-table#horizontal');
    await magicTable.waitFor({ state: 'attached' });

    await expect(magicTable).not.toHaveClass(/mt-overflow-top/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-left/);
    await expect(magicTable).toHaveClass(/mt-overflow-right/);

    await magicTable.evaluate(mt => mt.scrollTo({ left: 100 }));
    await expect(magicTable).not.toHaveClass(/mt-overflow-top/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).toHaveClass(/mt-overflow-left/);
    await expect(magicTable).toHaveClass(/mt-overflow-right/);

    await magicTable.evaluate(mt => mt.scrollTo({ left: mt.scrollWidth }));
    await expect(magicTable).not.toHaveClass(/mt-overflow-top/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).toHaveClass(/mt-overflow-left/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-right/);
});

test('vertically constrained table adds overflow classes', async ({ page }) => {
    await page.goto('/overflow_classes.html');

    const magicTable = page.locator('magic-table#vertical');
    await magicTable.waitFor({ state: 'attached' });

    await expect(magicTable).not.toHaveClass(/mt-overflow-top/);
    await expect(magicTable).toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-left/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-right/);

    await magicTable.evaluate(mt => mt.scrollTo({ top: 100 }));
    await expect(magicTable).toHaveClass(/mt-overflow-top/);
    await expect(magicTable).toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-left/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-right/);

    await magicTable.evaluate(mt => mt.scrollTo({ top: mt.scrollHeight }));
    await expect(magicTable).toHaveClass(/mt-overflow-top/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-bottom/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-left/);
    await expect(magicTable).not.toHaveClass(/mt-overflow-right/);
});
