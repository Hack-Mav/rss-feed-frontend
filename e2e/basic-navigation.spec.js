import { test, expect } from '@playwright/test';

test.describe('RSS Feed Reader - Basic Navigation', () => {
  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RSS Feed Reader/);
  });

  test('navigates between reader and manager sections', async ({ page }) => {
    await page.goto('/');
    
    // Check initial state - reader section should be visible
    await expect(page.getByRole('heading', { name: 'RSS Feed Reader' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Feed Reader/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Feed Manager/ })).toBeVisible();
    
    // Navigate to manager section
    await page.getByRole('button', { name: /Feed Manager/ }).click();
    
    // Check manager section is visible
    await expect(page.getByRole('heading', { name: /Feed Manager/i })).toBeVisible();
  });

  test('theme toggle works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /switch to dark mode/i });
    await expect(themeToggle).toBeVisible();
    
    // Toggle to dark mode
    await themeToggle.click();
    
    // Check theme changed
    await expect(page.getByRole('button', { name: /switch to light mode/i })).toBeVisible();
    
    // Toggle back to light mode
    await page.getByRole('button', { name: /switch to light mode/i }).click();
    await expect(page.getByRole('button', { name: /switch to dark mode/i })).toBeVisible();
  });

  test('skip link functionality', async ({ page }) => {
    await page.goto('/');
    
    // Skip link should be present but not visible until focused
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeVisible();
    
    // Click skip link
    await skipLink.click();
    
    // Should focus on main content
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeFocused();
  });
});
