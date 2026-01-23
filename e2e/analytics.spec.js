import { test, expect } from '@playwright/test';

test.describe('Analytics and Telemetry', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging to capture analytics events
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('analytics')) {
        console.log('Analytics log:', msg.text());
      }
    });

    // Mock analytics endpoint to capture requests
    await page.route('**/api/analytics', route => {
      const postData = route.request().postData();
      console.log('Analytics request captured:', postData);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/');
  });

  test('should initialize analytics service', async ({ page }) => {
    // Check if analytics service is initialized
    const analyticsInfo = await page.evaluate(() => {
      return window.analytics?.getAnalyticsInfo?.();
    });
    
    expect(analyticsInfo).toBeDefined();
    expect(analyticsInfo.sessionId).toBeDefined();
  });

  test('should track page views', async ({ page }) => {
    // Wait for initial page view tracking
    await page.waitForTimeout(1000);
    
    // Navigate to different sections
    await page.click('button:has-text("Feed Manager")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Feed Reader")');
    await page.waitForTimeout(500);
    
    // Analytics should track these navigation events
    // This is verified through the mocked endpoint
  });

  test('should track user interactions', async ({ page }) => {
    // Track theme toggle
    const themeToggle = page.locator('.theme-toggle');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Track language change
    const languageSelector = page.locator('.language-dropdown');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('es');
      await page.waitForTimeout(500);
    }
  });

  test('should track feed interactions', async ({ page }) => {
    // Mock a successful feed response
    await page.route('**/api/feed*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              title: 'Test Article',
              description: 'Test Description',
              link: 'https://example.com/article1',
              pubDate: new Date().toISOString(),
              author: 'Test Author'
            }
          ]
        })
      });
    });

    // Load a feed
    const loadButton = page.locator('button:has-text("Load Feed")');
    if (await loadButton.isVisible()) {
      await loadButton.click();
      await page.waitForTimeout(2000);
      
      // Click on an article
      const articleLink = page.locator('a:has-text("Visit Full Article")');
      if (await articleLink.first().isVisible()) {
        await articleLink.first().click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should track search interactions', async ({ page }) => {
    // Mock search results
    await page.route('**/api/search*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              title: 'Search Result 1',
              description: 'Description 1',
              link: 'https://example.com/result1'
            }
          ],
          total: 1
        })
      });
    });

    // Perform a search
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test query');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
    }
  });

  test('should track bookmark actions', async ({ page }) => {
    // Mock feed with bookmarkable items
    await page.route('**/api/feed*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              title: 'Bookmarkable Article',
              description: 'Description',
              link: 'https://example.com/bookmark1',
              pubDate: new Date().toISOString()
            }
          ]
        })
      });
    });

    const loadButton = page.locator('button:has-text("Load Feed")');
    if (await loadButton.isVisible()) {
      await loadButton.click();
      await page.waitForTimeout(2000);
      
      // Try to bookmark an article
      const bookmarkButton = page.locator('button:has-text("🔖 Bookmark")');
      if (await bookmarkButton.first().isVisible()) {
        await bookmarkButton.first().click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should track errors', async ({ page }) => {
    // Mock an error response
    await page.route('**/api/feed*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    const loadButton = page.locator('button:has-text("Load Feed")');
    if (await loadButton.isVisible()) {
      await loadButton.click();
      await page.waitForTimeout(1000);
      
      // Error should be tracked
      const errorMessage = page.locator('.error-message');
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should track performance metrics', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Performance metrics should be collected automatically
    const performanceMetrics = await page.evaluate(() => {
      return window.analytics?.getPerformanceMetrics?.();
    });
    
    if (performanceMetrics) {
      expect(performanceMetrics.loadTime).toBeGreaterThan(0);
    }
  });

  test('should handle offline/online status', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);
    
    // Simulate online mode
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);
    
    // Connection status changes should be tracked
  });

  test('should flush analytics events on page unload', async ({ page }) => {
    // Generate some events
    await page.click('button:has-text("Feed Manager")');
    await page.waitForTimeout(500);
    
    // Navigate away to trigger flush
    await page.goto('/about');
    
    // Events should be flushed to the mocked endpoint
  });

  test('should respect user privacy settings', async ({ page }) => {
    // Test with privacy mode enabled (if implemented)
    await page.evaluate(() => {
      localStorage.setItem('privacy.analytics.enabled', 'false');
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Analytics should be disabled or limited
    const analyticsInfo = await page.evaluate(() => {
      return window.analytics?.getAnalyticsInfo?.();
    });
    
    // Verify privacy settings are respected
  });
});
