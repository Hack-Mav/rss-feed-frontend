import { test, expect } from '@playwright/test';

test.describe('RSS Feed Reader - Accessibility', () => {
  test('has proper semantic HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Check main landmarks
    await expect(page.getByRole('banner')).toBeVisible(); // header
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check headings hierarchy
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  });

  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Should focus on skip link first
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    
    // Tab to theme toggle
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /switch to dark mode/i })).toBeFocused();
    
    // Tab to navigation buttons
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /Feed Reader/ })).toBeFocused();
    
    // Test Enter key on buttons
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: /Feed Reader/ })).toBeFocused();
  });

  test('has proper ARIA labels and descriptions', async ({ page }) => {
    await page.goto('/');
    
    // Check theme toggle has proper aria-label
    const themeToggle = page.getByRole('button', { name: /switch to dark mode/i });
    await expect(themeToggle).toHaveAttribute('aria-label');
    
    // Check form inputs have labels
    await expect(page.getByLabel(/custom rss feed/i)).toBeVisible();
    
    // Check error messages have proper roles
    // Add a feed that will fail to trigger error
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://invalid-url.com/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Wait for error
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  test('has sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This is a basic check - in real implementation you'd use axe-playwright
    // For now, just check that elements are visible
    await expect(page.getByRole('heading', { name: 'RSS Feed Reader' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Feed Reader/ })).toBeVisible();
    await expect(page.getByLabel(/custom rss feed/i)).toBeVisible();
  });

  test('screen reader announcements work', async ({ page }) => {
    await page.goto('/');
    
    // Test live regions
    await expect(page.getByRole('status')).toBeVisible(); // offline status
    
    // Trigger an error to test alert region
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://invalid-url.com/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Check that alert appears
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });

  test('focus management works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test focus trap in modals/dialogs if any exist
    // Test that focus stays within interactive elements
    
    // Test that focus moves logically through the page
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /switch to dark mode/i })).toBeFocused();
    
    // Test Shift+Tab for backward navigation
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Add a feed to get some articles with images
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://feeds.bbci.co.uk/news/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Wait for feed items
    await page.waitForSelector('.feed-item', { timeout: 10000 });
    
    // Check images have alt attributes
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
  });
});
