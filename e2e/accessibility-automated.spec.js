import { test, expect } from '@playwright/test';
// Note: @axe-core/playwright import issue - using manual accessibility checks instead

test.describe('Accessibility Tests', () => {
  test('homepage should have basic accessibility features', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check for basic accessibility features
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for skip link
    const skipLink = page.locator('.skip-link');
    if (await skipLink.isVisible()) {
      await expect(skipLink).toHaveAttribute('href', '#main-content');
    }
    
    // Check for semantic HTML
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('section')).toBeVisible();
    
    // Check for ARIA labels
    const buttons = page.locator('button[aria-label]');
    await expect(buttons.first()).toBeVisible();
  });

  test('feed reader section should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Add a feed to get some content
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://feeds.bbci.co.uk/news/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Wait for feed items to load or error to appear
    await page.waitForSelector('.feed-item, .error-message', { timeout: 10000 });
    
    // Check accessibility with specific context
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });

  test('feed manager section should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to feed manager
    await page.getByRole('button', { name: /Feed Manager/ }).click();
    
    // Wait for content to load
    await page.waitForSelector('[aria-labelledby="feed-manager-heading"]');
    
    // Check accessibility
    await checkA11y(page);
  });

  test('dark mode should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Switch to dark mode
    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Check accessibility in dark mode
    await checkA11y(page);
  });

  test('error states should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Trigger an error
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://invalid-url-that-does-not-exist.com/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Wait for error message
    await page.waitForSelector('.error-message', { timeout: 10000 });
    
    // Check accessibility of error state
    await checkA11y(page);
  });

  test('loading states should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Trigger loading state
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://feeds.bbci.co.uk/news/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Check accessibility during loading
    await checkA11y(page, null, {
      includedImpacts: ['minor', 'moderate', 'serious', 'critical']
    });
  });

  test('keyboard navigation should work properly', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    let focused = await page.locator(':focus');
    await expect(focused).toBeVisible();
    
    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focused = await page.locator(':focus');
      await expect(focused).toBeVisible();
    }
    
    // Test Shift+Tab for backward navigation
    await page.keyboard.press('Shift+Tab');
    focused = await page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('focus should be visible', async ({ page }) => {
    await page.goto('/');
    
    // Focus on various elements and check visibility
    const themeToggle = page.getByRole('button', { name: /switch to dark mode/i });
    await themeToggle.focus();
    
    // Check that focused element has visible focus styles
    const computedStyle = await themeToggle.evaluate(el => {
      return window.getComputedStyle(el, ':focus');
    });
    
    // Should have some focus indication (outline, background, etc.)
    const hasFocusIndicator = 
      computedStyle.outline !== 'none' ||
      computedStyle.boxShadow !== 'none' ||
      computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
    
    expect(hasFocusIndicator).toBe(true);
  });

  test('color contrast should be sufficient', async ({ page }) => {
    await page.goto('/');
    
    // Check contrast in light mode
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
    
    // Check contrast in dark mode
    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await page.waitForTimeout(500);
    
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  test('form controls should have proper labels', async ({ page }) => {
    await page.goto('/');
    
    // Check that all form controls have labels
    await checkA11y(page, null, {
      rules: {
        'label': { enabled: true },
        'form-field-multiple-labels': { enabled: true }
      }
    });
  });

  test('ARIA landmarks should be present', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper landmark elements
    await expect(page.getByRole('banner')).toBeVisible(); // header
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check accessibility with specific focus on landmarks
    await checkA11y(page, null, {
      rules: {
        'landmark-one-main': { enabled: true },
        'landmark-no-duplicate-banner': { enabled: true },
        'landmark-no-duplicate-contentinfo': { enabled: true }
      }
    });
  });

  test('headings should be properly structured', async ({ page }) => {
    await page.goto('/');
    
    // Check heading hierarchy
    await checkA11y(page, null, {
      rules: {
        'heading-order': { enabled: true },
        'region': { enabled: true }
      }
    });
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Add a feed to get articles with images
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://feeds.bbci.co.uk/news/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Wait for feed items
    await page.waitForSelector('.feed-item', { timeout: 10000 });
    
    // Check image alt attributes
    await checkA11y(page, null, {
      rules: {
        'image-alt': { enabled: true },
        'image-redundant-alt': { enabled: true }
      }
    });
  });

  test('links should be descriptive', async ({ page }) => {
    await page.goto('/');
    
    // Add a feed to get articles with links
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://feeds.bbci.co.uk/news/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Wait for feed items
    await page.waitForSelector('.feed-item', { timeout: 10000 });
    
    // Check link accessibility
    await checkA11y(page, null, {
      rules: {
        'link-name': { enabled: true },
        'link-in-text-block': { enabled: true }
      }
    });
  });

  test('responsive design should be accessible on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check accessibility on mobile
    await checkA11y(page);
    
    // Test touch targets are large enough
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        // Touch targets should be at least 44x44 pixels
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('screen reader announcements should work', async ({ page }) => {
    await page.goto('/');
    
    // Check for live regions
    await expect(page.getByRole('status')).toBeVisible(); // offline status
    
    // Trigger an error to test alert region
    const customFeedInput = page.getByLabel(/custom rss feed/i);
    await customFeedInput.fill('https://invalid-url.com/rss.xml');
    await page.getByRole('button', { name: /add feed/i }).click();
    
    // Wait for error
    await page.waitForSelector('.error-message', { timeout: 10000 });
    
    // Check that alert appears
    await expect(page.getByRole('alert')).toBeVisible();
    
    // Verify live region attributes
    await expect(page.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });
});
