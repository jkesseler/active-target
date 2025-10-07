import { test, expect } from '@playwright/test';

test.describe('Application Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Expect page to load within 5 seconds (adjust as needed)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow some common non-critical errors but fail on others
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('favicon')
      && !error.includes('service-worker')
      && !error.includes('analytics'),
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have proper accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for basic accessibility - use first() to handle multiple matches
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();

    // Check for navigation landmarks
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });
});
