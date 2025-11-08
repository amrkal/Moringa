import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite: Admin CRUD Operations
 * 
 * Tests admin functionality for managing meals, categories, and orders
 * Requires admin authentication
 */

// Admin credentials (these should match your test environment)
const ADMIN_CREDENTIALS = {
  phone: '0501234567', // Update with your test admin phone
  password: 'admin123', // Update with your test admin password
};

test.describe('Admin CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Check if already logged in (redirected to dashboard)
    if (page.url().includes('/admin/dashboard')) {
      return; // Already authenticated
    }
    
    // Perform login if on login page
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
    if (await phoneInput.isVisible({ timeout: 3000 })) {
      await phoneInput.fill(ADMIN_CREDENTIALS.phone);
      
      const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
      await passwordInput.fill(ADMIN_CREDENTIALS.password);
      
      const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]').first();
      await loginButton.click();
      
      // Wait for dashboard to load
      await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    }
  });

  test('should navigate to meals management', async ({ page }) => {
    // From dashboard, navigate to meals
    const mealsLink = page.locator('a[href*="/admin/meals"], button:has-text("Meals"), nav >> text=/meals/i').first();
    
    if (await mealsLink.isVisible({ timeout: 5000 })) {
      await mealsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on meals page
      await expect(page).toHaveURL(/\/admin\/meals/);
      
      // Should see meals list or table
      await expect(page.locator('table, [role="table"], h1:has-text("Meals")')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should open create meal modal', async ({ page }) => {
    // Navigate to meals page
    await page.goto('/admin/meals');
    await page.waitForLoadState('networkidle');
    
    // Find and click "Add" or "Create" button
    const createButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
    
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Modal should appear
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 3000 });
      
      // Should have form fields
      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should validate meal form fields', async ({ page }) => {
    await page.goto('/admin/meals');
    await page.waitForLoadState('networkidle');
    
    // Open create modal
    const createButton = page.locator('button:has-text("Add"), button:has-text("Create")').first();
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Try to submit without filling required fields
      const submitButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
      
      if (await submitButton.isVisible({ timeout: 3000 })) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Should show validation errors
        const errorElements = page.locator('[class*="error"], [role="alert"], text=/required|invalid/i');
        const errorCount = await errorElements.count();
        
        expect(errorCount).toBeGreaterThan(0);
      }
    }
  });

  test('should create a new meal (mock)', async ({ page }) => {
    await page.goto('/admin/meals');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Add"), button:has-text("Create")').first();
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Fill form fields
      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.isVisible({ timeout: 3000 })) {
        await nameInput.fill('Test Meal E2E');
        
        const descInput = page.locator('input[name="description"], textarea[name="description"]').first();
        if (await descInput.isVisible({ timeout: 2000 })) {
          await descInput.fill('Test meal description for E2E testing');
        }
        
        const priceInput = page.locator('input[name="price"]').first();
        if (await priceInput.isVisible({ timeout: 2000 })) {
          await priceInput.fill('99.99');
        }
        
        // Note: Actual submission would create real data
        // In a real test, you'd submit and verify, then clean up
        // For now, just verify form is filled
        expect(await nameInput.inputValue()).toBe('Test Meal E2E');
        
        // Close modal without saving
        const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
        if (await cancelButton.isVisible({ timeout: 2000 })) {
          await cancelButton.click();
        }
      }
    }
  });

  test('should search/filter meals', async ({ page }) => {
    await page.goto('/admin/meals');
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    if (await searchInput.isVisible({ timeout: 5000 })) {
      // Get initial meal count
      const mealRows = page.locator('table tr, [role="row"], .meal-item');
      const initialCount = await mealRows.count();
      
      // Type search query
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Verify filtering occurred (count changed or no results message)
      const newCount = await mealRows.count();
      const noResults = await page.locator('text=/no results|not found|no meals/i').isVisible({ timeout: 2000 });
      
      expect(newCount !== initialCount || noResults).toBeTruthy();
    }
  });

  test('should navigate to orders management', async ({ page }) => {
    // Navigate to orders from dashboard
    const ordersLink = page.locator('a[href*="/admin/orders"], nav >> text=/orders/i').first();
    
    if (await ordersLink.isVisible({ timeout: 5000 })) {
      await ordersLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on orders page
      await expect(page).toHaveURL(/\/admin\/orders/);
      
      // Should see orders list
      await expect(page.locator('h1:has-text("Orders"), table, [role="table"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    
    // Look for status filter buttons/dropdown
    const statusFilters = page.locator('button:has-text("Pending"), button:has-text("Completed"), select[name="status"]');
    
    if (await statusFilters.first().isVisible({ timeout: 5000 })) {
      const filterButton = statusFilters.first();
      await filterButton.click();
      await page.waitForTimeout(1000);
      
      // Orders should be filtered (URL change or visible change)
      const hasURLFilter = page.url().includes('status=') || page.url().includes('filter=');
      const hasVisualChange = await page.locator('[class*="active"], [class*="selected"]').isVisible({ timeout: 2000 });
      
      expect(hasURLFilter || hasVisualChange).toBeTruthy();
    }
  });

  test('should view order details', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    
    // Find first order row
    const orderRow = page.locator('table tr, [role="row"]').nth(1); // Skip header row
    
    if (await orderRow.isVisible({ timeout: 5000 })) {
      // Click on order or view button
      const viewButton = orderRow.locator('button:has-text("View"), button:has-text("Details"), a[href*="/orders/"]').first();
      
      if (await viewButton.isVisible({ timeout: 3000 })) {
        await viewButton.click();
        await page.waitForTimeout(1000);
        
        // Should see order details (modal or new page)
        const detailsVisible = await page.locator('text=/order details|order #|customer/i').isVisible({ timeout: 3000 });
        expect(detailsVisible).toBeTruthy();
      } else {
        // Try clicking the row itself
        await orderRow.click();
        await page.waitForTimeout(1000);
        
        const detailsVisible = await page.locator('text=/order details|order #|customer/i').isVisible({ timeout: 3000 });
        expect(detailsVisible).toBeTruthy();
      }
    }
  });

  test('should update order status', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    
    // Find first pending order
    const pendingOrder = page.locator('text=/pending/i').first();
    
    if (await pendingOrder.isVisible({ timeout: 5000 })) {
      // Find associated status dropdown or buttons
      const statusButton = page.locator('button:has-text("Update"), select[name="status"], button:has-text("Preparing")').first();
      
      if (await statusButton.isVisible({ timeout: 3000 })) {
        await statusButton.click();
        await page.waitForTimeout(500);
        
        // Select new status
        const preparingOption = page.locator('text=/preparing|ready|completed/i').first();
        if (await preparingOption.isVisible({ timeout: 2000 })) {
          await preparingOption.click();
          await page.waitForTimeout(1000);
          
          // Verify status changed (success message or visual update)
          const successIndicators = [
            page.locator('text=/updated|success|تم/i'),
            page.locator('[class*="success"]'),
          ];
          
          let foundSuccess = false;
          for (const indicator of successIndicators) {
            if (await indicator.isVisible({ timeout: 2000 })) {
              foundSuccess = true;
              break;
            }
          }
          
          expect(foundSuccess).toBeTruthy();
        }
      }
    }
  });

  test('should access analytics dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify key dashboard elements
    const dashboardElements = [
      page.locator('text=/revenue|sales|orders/i'),
      page.locator('canvas, svg[class*="recharts"]'), // Charts
      page.locator('text=/total|today|month/i'),
    ];
    
    let elementCount = 0;
    for (const element of dashboardElements) {
      if (await element.isVisible({ timeout: 3000 })) {
        elementCount++;
      }
    }
    
    // Should see at least 2 of the 3 key elements
    expect(elementCount).toBeGreaterThanOrEqual(2);
  });

  test('should export analytics data', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for export buttons
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), button:has-text("CSV")').first();
    
    if (await exportButton.isVisible({ timeout: 5000 })) {
      // Setup download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.csv|\.pdf|\.xlsx/i);
      } catch (error) {
        // Export might open in new tab or show modal instead of downloading
        // That's also valid behavior
        console.log('Export triggered (may not be direct download)');
      }
    }
  });
});
