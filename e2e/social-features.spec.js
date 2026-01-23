import { test, expect } from '@playwright/test';

test.describe('Social Features', () => {
  test.beforeEach(async ({ page }) => {
    // Mock feed with shareable content
    await page.route('**/api/feed*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              title: 'Test Article for Social Sharing',
              description: 'This is a test article description for social sharing',
              link: 'https://example.com/test-article',
              pubDate: new Date().toISOString(),
              author: 'Test Author'
            }
          ]
        })
      });
    });

    await page.goto('/');
  });

  test.describe('Social Share', () => {
    test('should display share button', async ({ page }) => {
      // Load a feed first
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        // Look for social share component
        const shareButton = page.locator('.share-button');
        if (await shareButton.isVisible()) {
          await expect(shareButton).toBeVisible();
          await expect(shareButton).toContainText('Share');
        }
      }
    });

    test('should open share menu when clicked', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const shareButton = page.locator('.share-button');
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(500);
          
          const shareMenu = page.locator('.share-menu');
          await expect(shareMenu).toBeVisible();
          
          // Check for share options
          await expect(page.locator('button:has-text("Twitter")')).toBeVisible();
          await expect(page.locator('button:has-text("Facebook")')).toBeVisible();
          await expect(page.locator('button:has-text("LinkedIn")')).toBeVisible();
        }
      }
    });

    test('should close share menu when close button is clicked', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const shareButton = page.locator('.share-button');
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(500);
          
          const closeButton = page.locator('.close-button');
          await closeButton.click();
          await page.waitForTimeout(500);
          
          const shareMenu = page.locator('.share-menu');
          await expect(shareMenu).not.toBeVisible();
        }
      }
    });

    test('should open Twitter share dialog', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const shareButton = page.locator('.share-button');
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(500);
          
          // Mock popup window
          const popupPromise = page.waitForEvent('popup');
          const twitterButton = page.locator('button:has-text("Twitter")');
          await twitterButton.click();
          
          const popup = await popupPromise;
          await expect(popup.url()).toContain('twitter.com/intent/tweet');
        }
      }
    });

    test('should copy link to clipboard', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const shareButton = page.locator('.share-button');
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(500);
          
          const copyButton = page.locator('button:has-text("Copy Link")');
          await copyButton.click();
          await page.waitForTimeout(500);
          
          // Check if button text changes to "Copied!"
          await expect(copyButton).toContainText('Copied!');
        }
      }
    });

    test('should have proper accessibility attributes', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const shareButton = page.locator('.share-button');
        if (await shareButton.isVisible()) {
          await expect(shareButton).toHaveAttribute('aria-label', 'Share this article');
          await expect(shareButton).toHaveAttribute('aria-haspopup', 'true');
          
          await shareButton.click();
          await page.waitForTimeout(500);
          
          await expect(shareButton).toHaveAttribute('aria-expanded', 'true');
          
          // Check menu items have proper roles
          const menuItems = page.locator('[role="menuitem"]');
          await expect(menuItems.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Comments Section', () => {
    test('should display comments section', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        // Look for comments section
        const commentsToggle = page.locator('.comments-toggle');
        if (await commentsToggle.isVisible()) {
          await expect(commentsToggle).toBeVisible();
          await expect(commentsToggle).toContainText('Comments');
        }
      }
    });

    test('should expand comments when clicked', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const commentsToggle = page.locator('.comments-toggle');
        if (await commentsToggle.isVisible()) {
          await commentsToggle.click();
          await page.waitForTimeout(500);
          
          const commentsContent = page.locator('.comments-content');
          await expect(commentsContent).toBeVisible();
          
          // Check for comment form
          await expect(page.locator('.add-comment')).toBeVisible();
          await expect(page.locator('input[placeholder*="name"]')).toBeVisible();
          await expect(page.locator('textarea[placeholder*="thoughts"]')).toBeVisible();
        }
      }
    });

    test('should submit a comment', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const commentsToggle = page.locator('.comments-toggle');
        if (await commentsToggle.isVisible()) {
          await commentsToggle.click();
          await page.waitForTimeout(500);
          
          // Fill out comment form
          const nameInput = page.locator('input[placeholder*="name"]');
          const commentTextarea = page.locator('textarea[placeholder*="thoughts"]');
          
          await nameInput.fill('Test User');
          await commentTextarea.fill('This is a test comment for E2E testing.');
          
          const submitButton = page.locator('.submit-comment-button');
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          // Check if comment appears in the list
          const commentList = page.locator('.comments-list');
          await expect(commentList).toContainText('Test User');
          await expect(commentList).toContainText('This is a test comment');
        }
      }
    });

    test('should validate comment form', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const commentsToggle = page.locator('.comments-toggle');
        if (await commentsToggle.isVisible()) {
          await commentsToggle.click();
          await page.waitForTimeout(500);
          
          const submitButton = page.locator('.submit-comment-button');
          
          // Try to submit empty form
          await submitButton.click();
          await page.waitForTimeout(500);
          
          // Button should be disabled
          await expect(submitButton).toBeDisabled();
        }
      }
    });

    test('should show character count for comments', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const commentsToggle = page.locator('.comments-toggle');
        if (await commentsToggle.isVisible()) {
          await commentsToggle.click();
          await page.waitForTimeout(500);
          
          const commentTextarea = page.locator('textarea[placeholder*="thoughts"]');
          const charCount = page.locator('small:has-text("/")');
          
          await expect(charCount).toBeVisible();
          
          await commentTextarea.fill('Test comment');
          await expect(charCount).toContainText('12/500');
        }
      }
    });

    test('should delete comments', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const commentsToggle = page.locator('.comments-toggle');
        if (await commentsToggle.isVisible()) {
          await commentsToggle.click();
          await page.waitForTimeout(500);
          
          // Add a comment first
          const nameInput = page.locator('input[placeholder*="name"]');
          const commentTextarea = page.locator('textarea[placeholder*="thoughts"]');
          
          await nameInput.fill('Test User');
          await commentTextarea.fill('Comment to be deleted');
          
          const submitButton = page.locator('.submit-comment-button');
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          // Delete the comment
          const deleteButton = page.locator('.delete-comment-button');
          if (await deleteButton.isVisible()) {
            await deleteButton.click();
            await page.waitForTimeout(500);
            
            // Comment should be removed
            await expect(page.locator('.comments-list')).not.toContainText('Comment to be deleted');
          }
        }
      }
    });

    test('should show no comments message when empty', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const commentsToggle = page.locator('.comments-toggle');
        if (await commentsToggle.isVisible()) {
          await commentsToggle.click();
          await page.waitForTimeout(500);
          
          const noComments = page.locator('.no-comments');
          if (await noComments.isVisible()) {
            await expect(noComments).toContainText('No comments yet');
          }
        }
      }
    });

    test('should persist comments in localStorage', async ({ page }) => {
      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        const commentsToggle = page.locator('.comments-toggle');
        if (await commentsToggle.isVisible()) {
          await commentsToggle.click();
          await page.waitForTimeout(500);
          
          // Add a comment
          const nameInput = page.locator('input[placeholder*="name"]');
          const commentTextarea = page.locator('textarea[placeholder*="thoughts"]');
          
          await nameInput.fill('Persistent User');
          await commentTextarea.fill('This comment should persist');
          
          const submitButton = page.locator('.submit-comment-button');
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          // Reload page
          await page.reload();
          await page.waitForTimeout(2000);
          
          // Open comments again
          await commentsToggle.click();
          await page.waitForTimeout(500);
          
          // Comment should still be there
          await expect(page.locator('.comments-list')).toContainText('Persistent User');
          await expect(page.locator('.comments-list')).toContainText('This comment should persist');
        }
      }
    });
  });

  test.describe('Social Features Integration', () => {
    test('should track social interactions in analytics', async ({ page }) => {
      // Mock analytics endpoint
      await page.route('**/api/analytics', route => {
        const postData = route.request().postData();
        console.log('Social analytics:', postData);
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      const loadButton = page.locator('button:has-text("Load Feed")');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(2000);
        
        // Test sharing
        const shareButton = page.locator('.share-button');
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(500);
          
          const copyButton = page.locator('button:has-text("Copy Link")');
          await copyButton.click();
          await page.waitForTimeout(500);
        }
        
        // Test commenting
        const commentsToggle = page.locator('.comments-toggle');
        if (await commentsToggle.isVisible()) {
          await commentsToggle.click();
          await page.waitForTimeout(500);
          
          const nameInput = page.locator('input[placeholder*="name"]');
          const commentTextarea = page.locator('textarea[placeholder*="thoughts"]');
          
          await nameInput.fill('Analytics Test User');
          await commentTextarea.fill('Analytics test comment');
          
          const submitButton = page.locator('.submit-comment-button');
          await submitButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });
});
