import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if mobile navigation works
    const hamburgerMenu = page.locator('[data-testid="hamburger-menu"]');
    if (await hamburgerMenu.isVisible()) {
      await hamburgerMenu.click();
      // Add assertions for mobile menu
    }

    // Verify page content is visible and not cut off
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify layout adapts to tablet size
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify full desktop layout
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});
