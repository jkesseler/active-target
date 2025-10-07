import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should navigate between pages using the navigation menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click navigation links
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Test clicking the first few navigation links
      for (let i = 0; i < Math.min(3, linkCount); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');

        if (href && href !== '#') {
          await link.click();
          await page.waitForLoadState('networkidle');

          // Verify URL changed
          expect(page.url()).toContain(href);
        }
      }
    }
  });

  test('should handle browser back and forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/dashboard');

    // Go forward
    await page.goForward();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/dashboard');
  });
});