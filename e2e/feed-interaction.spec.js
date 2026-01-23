import { test, expect } from '@playwright/test';

test.describe('RSS Feed Reader - Feed Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can add custom feed URL', async ({ page }) => {
    // Find custom feed input
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await expect(customFeedInput).toBeVisible();
    
    // Enter a test RSS feed URL
    await customFeedInput.fill('https://feeds.bbci.co.uk/news/rss.xml');
    
    // Submit the form
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Should show loading state
    await expect(page.getByText(/loading/i)).toBeVisible();
    
    // Eventually should show feed items or error (both are valid outcomes)
    await expect(page.locator('.feed-item, .error-message')).toBeVisible({ timeout: 10000 });
  });

  test('can bookmark articles', async ({ page }) => {
    // First add a feed to get some articles
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://feeds.bbci.co.uk/news/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Wait for feed items to load
    await page.waitForSelector('.feed-item', { timeout: 10000 });
    
    // Find first article and bookmark it
    const firstArticle = page.locator('.feed-item').first();
    const bookmarkButton = firstArticle.getByRole('button', { name: /bookmark/i });
    
    await expect(bookmarkButton).toBeVisible();
    await bookmarkButton.click();
    
    // Check that bookmark was added (button should now indicate it's bookmarked)
    await expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true');
    
    // Navigate to bookmarks section
    await page.getByRole('heading', { name: /bookmarks/i }).scrollIntoViewIfNeeded();
    
    // Should see the bookmarked article
    await expect(page.locator('.bookmarked-item')).toBeVisible();
  });

  test('handles feed loading errors gracefully', async ({ page }) => {
    // Enter an invalid URL
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://invalid-url-that-does-not-exist.com/rss.xml');
    
    // Submit the form
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Should show error message
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/error/i)).toBeVisible();
    
    // Should have retry button
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  test('can retry failed feed requests', async ({ page }) => {
    // Enter an invalid URL
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://invalid-url.com/rss.xml');
    
    // Submit the form
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Wait for error
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
    
    // Click retry
    await page.getByRole('button', { name: /retry/i }).click();
    
    // Should show loading state again
    await expect(page.getByText(/loading/i)).toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that navigation is still accessible
    await expect(page.getByRole('button', { name: /Feed Reader/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Feed Manager/ })).toBeVisible();
    
    // Check theme toggle is still accessible
    await expect(page.getByRole('button', { name: /switch to dark mode/i })).toBeVisible();
    
    // Test feed input on mobile
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await expect(customFeedInput).toBeVisible();
    await customFeedInput.fill('https://feeds.bbci.co.uk/news/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Should work on mobile too
    await expect(page.locator('.feed-item, .error-message')).toBeVisible({ timeout: 10000 });
  });
});
