import { test, expect } from '@playwright/test';

test.describe('Active Target PWA', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if the page has loaded properly
    await expect(page).toHaveTitle(/Active Target/);
  });

  test('should have navigation', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for navigation elements
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should navigate to different routes', async ({ page }) => {
    await page.goto('/');

    // Test navigation to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain('/dashboard');

    // Test navigation to manage section
    await page.goto('/manage');
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain('/manage');
  });
});
