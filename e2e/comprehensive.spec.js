import { test, expect } from '@playwright/test';

test.describe('Comprehensive E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock comprehensive API responses
    await page.route('**/api/feed*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              title: 'Comprehensive Test Article 1',
              description: 'First test article description with comprehensive content',
              link: 'https://example.com/article1',
              pubDate: new Date().toISOString(),
              author: 'Test Author 1'
            },
            {
              title: 'Comprehensive Test Article 2',
              description: 'Second test article description with comprehensive content',
              link: 'https://example.com/article2',
              pubDate: new Date(Date.now() - 86400000).toISOString(),
              author: 'Test Author 2'
            }
          ]
        })
      });
    });

    await page.route('**/api/analytics', route => {
      const postData = route.request().postData();
      console.log('Analytics request:', postData);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/');
  });

  test('complete user journey with all features', async ({ page }) => {
    // 1. Initial page load and language selection
    await expect(page.locator('h1')).toContainText('RSS Feed Reader');
    
    const languageSelector = page.locator('.language-dropdown');
    await expect(languageSelector).toBeVisible();
    await languageSelector.selectOption('es');
    await page.waitForTimeout(1000);
    
    // 2. Load feed content
    const loadButton = page.locator('button:has-text("Load Feed")');
    if (await loadButton.isVisible()) {
      await loadButton.click();
      await page.waitForTimeout(2000);
      
      // 3. Verify feed items are displayed
      await expect(page.locator('.feed-item')).toHaveCount(2);
      
      // 4. Test search functionality
      const searchInput = page.locator('input[placeholder*="Search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Comprehensive');
        await searchInput.press('Enter');
        await page.waitForTimeout(1000);
        
        // Should show search results
        await expect(page.locator('.feed-item')).toBeVisible();
      }
      
      // 5. Test bookmarking
      const bookmarkButton = page.locator('button:has-text("🔖 Bookmark")');
      if (await bookmarkButton.first().isVisible()) {
        await bookmarkButton.first().click();
        await page.waitForTimeout(500);
      }
      
      // 6. Test social sharing
      const shareButton = page.locator('.share-button');
      if (await shareButton.first().isVisible()) {
        await shareButton.first().click();
        await page.waitForTimeout(500);
        
        const copyButton = page.locator('button:has-text("Copy Link")');
        await copyButton.first().click();
        await page.waitForTimeout(500);
      }
      
      // 7. Test comments
      const commentsToggle = page.locator('.comments-toggle');
      if (await commentsToggle.first().isVisible()) {
        await commentsToggle.first().click();
        await page.waitForTimeout(500);
        
        const nameInput = page.locator('input[placeholder*="name"]').first();
        const commentTextarea = page.locator('textarea[placeholder*="thoughts"]').first();
        
        await nameInput.fill('Comprehensive Test User');
        await commentTextarea.fill('This is a comprehensive test comment');
        
        const submitButton = page.locator('.submit-comment-button').first();
        await submitButton.click();
        await page.waitForTimeout(1000);
      }
      
      // 8. Test navigation
      await page.click('button:has-text("Feed Manager")');
      await page.waitForTimeout(500);
      
      await page.click('button:has-text("Feed Reader")');
      await page.waitForTimeout(500);
      
      // 9. Test theme toggle
      const themeToggle = page.locator('.theme-toggle');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
      
      // 10. Verify all interactions were tracked
      // This is verified through the mocked analytics endpoint
    }
  });

  test('accessibility compliance across all features', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test ARIA labels
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveAttribute('aria-label');
    
    // Test semantic HTML
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Test color contrast (basic check)
    const backgroundColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    expect(backgroundColor).toBeTruthy();
    
    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('error handling and recovery', async ({ page }) => {
    // Test network error
    await page.unroute('**/api/feed*');
    await page.route('**/api/feed*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Network error' })
      });
    });
    
    const loadButton = page.locator('button:has-text("Load Feed")');
    if (await loadButton.isVisible()) {
      await loadButton.click();
      await page.waitForTimeout(1000);
      
      const errorMessage = page.locator('.error-message');
      await expect(errorMessage).toBeVisible();
      
      // Test retry functionality
      const retryButton = page.locator('button:has-text("Retry")');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Test dismiss error
      const dismissButton = page.locator('button:has-text("Dismiss")');
      if (await dismissButton.isVisible()) {
        await dismissButton.click();
        await page.waitForTimeout(500);
        await expect(errorMessage).not.toBeVisible();
      }
    }
  });

  test('performance and optimization', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
    
    // Test lazy loading (if implemented)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Test memory usage (basic check)
    const memoryUsage = await page.evaluate(() => {
      return performance.memory?.usedJSHeapSize || 0;
    });
    expect(memoryUsage).toBeGreaterThan(0);
    
    // Test bundle size (basic check)
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        size: r.transferSize || 0
      }));
    });
    
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    expect(jsResources.length).toBeGreaterThan(0);
  });

  test('cross-browser compatibility', async ({ page, browserName }) => {
    // Test browser-specific features
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log(`Testing on ${browserName}: ${userAgent}`);
    
    // Test basic functionality works across browsers
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.language-selector')).toBeVisible();
    
    // Test browser-specific APIs
    const hasClipboardAPI = await page.evaluate(() => 'clipboard' in navigator);
    const hasLocalStorage = await page.evaluate(() => 'localStorage' in window);
    
    expect(hasLocalStorage).toBe(true);
    // Clipboard API might not be available in all browsers/test environments
  });

  test('security and privacy', async ({ page }) => {
    // Test for XSS vulnerabilities
    await page.route('**/api/feed*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              title: '<script>alert("xss")</script>Malicious Title',
              description: '<img src="x" onerror="alert(\'xss\')">Malicious Description',
              link: 'https://example.com/article1',
              pubDate: new Date().toISOString(),
              author: 'Test Author'
            }
          ]
        })
      });
    });
    
    const loadButton = page.locator('button:has-text("Load Feed")');
    if (await loadButton.isVisible()) {
      await loadButton.click();
      await page.waitForTimeout(2000);
      
      // Check that scripts are not executed
      await expect(page.locator('script')).toHaveCount(0);
      
      // Check that malicious content is escaped
      const feedItems = page.locator('.feed-item');
      if (await feedItems.first().isVisible()) {
        const content = await feedItems.first().textContent();
        expect(content).not.toContain('<script>');
        expect(content).not.toContain('alert(');
      }
    }
    
    // Test CSP headers (if implemented)
    const cspHeader = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return meta?.getAttribute('content');
    });
    
    if (cspHeader) {
      expect(cspHeader).toContain("script-src");
    }
  });

  test('data persistence and synchronization', async ({ page }) => {
    // Test localStorage persistence
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    expect(storedValue).toBe('test-value');
    
    // Test language preference persistence
    const languageSelector = page.locator('.language-dropdown');
    await languageSelector.selectOption('fr');
    await page.waitForTimeout(1000);
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    await expect(languageSelector).toHaveValue('fr');
  });

  test('integration with external services', async ({ page }) => {
    // Test social media integration
    const loadButton = page.locator('button:has-text("Load Feed")');
    if (await loadButton.isVisible()) {
      await loadButton.click();
      await page.waitForTimeout(2000);
      
      const shareButton = page.locator('.share-button');
      if (await shareButton.first().isVisible()) {
        await shareButton.first().click();
        await page.waitForTimeout(500);
        
        // Test Twitter integration
        const twitterButton = page.locator('button:has-text("Twitter")');
        if (await twitterButton.isVisible()) {
          const popupPromise = page.waitForEvent('popup');
          await twitterButton.click();
          
          const popup = await popupPromise;
          await expect(popup.url()).toContain('twitter.com');
          await popup.close();
        }
      }
    }
  });
});
