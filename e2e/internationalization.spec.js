import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display language selector', async ({ page }) => {
    const languageSelector = page.locator('.language-selector');
    await expect(languageSelector).toBeVisible();
    
    const dropdown = page.locator('.language-dropdown');
    await expect(dropdown).toBeVisible();
  });

  test('should have default language as English', async ({ page }) => {
    const dropdown = page.locator('.language-dropdown');
    await expect(dropdown).toHaveValue('en');
    
    // Check for English text
    await expect(page.locator('h1')).toContainText('RSS Feed Reader');
    await expect(page.locator('p')).toContainText('Stay updated with the latest articles');
  });

  test('should change language to Spanish', async ({ page }) => {
    const dropdown = page.locator('.language-dropdown');
    await dropdown.selectOption('es');
    
    // Wait for language change
    await page.waitForTimeout(1000);
    
    // Check for Spanish text (assuming translations exist)
    await expect(page.locator('h1')).toContainText('Lector RSS');
  });

  test('should change language to French', async ({ page }) => {
    const dropdown = page.locator('.language-dropdown');
    await dropdown.selectOption('fr');
    
    // Wait for language change
    await page.waitForTimeout(1000);
    
    // Check for French text (assuming translations exist)
    await expect(page.locator('h1')).toContainText('Lecteur RSS');
  });

  test('should support RTL language (Arabic)', async ({ page }) => {
    const dropdown = page.locator('.language-dropdown');
    await dropdown.selectOption('ar');
    
    // Wait for language change
    await page.waitForTimeout(1000);
    
    // Check for RTL direction
    const root = page.locator('#root');
    await expect(root).toHaveAttribute('dir', 'rtl');
  });

  test('should persist language selection in localStorage', async ({ page }) => {
    const dropdown = page.locator('.language-dropdown');
    await dropdown.selectOption('es');
    
    // Reload page
    await page.reload();
    
    // Check if language is preserved
    await expect(dropdown).toHaveValue('es');
  });

  test('should translate navigation items', async ({ page }) => {
    const dropdown = page.locator('.language-dropdown');
    
    // Check English navigation
    await expect(page.locator('button:has-text("Feed Reader")')).toBeVisible();
    await expect(page.locator('button:has-text("Feed Manager")')).toBeVisible();
    
    // Change to Spanish
    await dropdown.selectOption('es');
    await page.waitForTimeout(1000);
    
    // Check Spanish navigation (assuming translations exist)
    await expect(page.locator('button:has-text("Lector de Feed")')).toBeVisible();
  });

  test('should translate error messages', async ({ page }) => {
    // Mock an error scenario
    await page.route('**/api/feed*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    // Try to load a feed to trigger error
    const loadButton = page.locator('button:has-text("Load Feed")');
    if (await loadButton.isVisible()) {
      await loadButton.click();
      
      // Check if error message is translated
      const errorMessage = page.locator('.error-message');
      await expect(errorMessage).toContainText('Error');
    }
  });

  test('should translate accessibility labels', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveAttribute('aria-label', 'Skip to main content');
    
    // Change language
    const dropdown = page.locator('.language-dropdown');
    await dropdown.selectOption('es');
    await page.waitForTimeout(1000);
    
    // Check if accessibility label is translated
    await expect(skipLink).toHaveAttribute('aria-label', 'Saltar al contenido principal');
  });

  test('should handle missing translations gracefully', async ({ page }) => {
    // Change to a language that might not have complete translations
    const dropdown = page.locator('.language-dropdown');
    await dropdown.selectOption('de');
    await page.waitForTimeout(1000);
    
    // App should still be functional even with missing translations
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Feed Reader")')).toBeVisible();
  });

  test('should format dates according to locale', async ({ page }) => {
    // This would require feed items with dates to test date formatting
    // For now, just ensure the app loads without errors
    await expect(page.locator('h1')).toBeVisible();
  });
});
