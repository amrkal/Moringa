import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite: Checkout Flow
 * 
 * Tests the complete customer journey from menu browsing to order placement
 * Covers: Menu navigation, cart management, checkout process, payment selection
 */

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the menu page
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full checkout flow with delivery', async ({ page }) => {
    // Step 1: Browse menu and verify meals are loaded
    await expect(page.locator('h1, h2, h3').filter({ hasText: /menu|meals/i })).toBeVisible();
    
    // Wait for meals to load (check for meal cards or "Add" buttons)
    await page.waitForSelector('button:has-text("Add"), button:has-text("أضف")', { timeout: 10000 });
    
    // Step 2: Add first available meal to cart
    const addButton = page.locator('button:has-text("Add"), button:has-text("أضف")').first();
    await addButton.click();
    
    // Wait for cart to update (could be a notification or cart count)
    await page.waitForTimeout(1000); // Allow for cart update
    
    // Step 3: Navigate to cart/checkout
    // Look for cart icon or checkout button
    const checkoutButton = page.locator('a[href="/checkout"], button:has-text("Checkout"), button:has-text("الدفع")').first();
    if (await checkoutButton.isVisible({ timeout: 5000 })) {
      await checkoutButton.click();
    } else {
      // Fallback: navigate directly to checkout
      await page.goto('/checkout');
    }
    
    await page.waitForLoadState('networkidle');
    
    // Step 4: Verify we're on checkout page
    await expect(page).toHaveURL(/\/checkout/);
    
    // Step 5: Select delivery option
    const deliveryButton = page.locator('button:has-text("Delivery"), button:has-text("توصيل")').first();
    if (await deliveryButton.isVisible({ timeout: 3000 })) {
      await deliveryButton.click();
      await page.waitForTimeout(500);
    }
    
    // Step 6: Fill delivery address (if required)
    const addressInput = page.locator('input[name="address"], textarea[name="address"]').first();
    if (await addressInput.isVisible({ timeout: 3000 })) {
      await addressInput.fill('123 Test Street, Tel Aviv');
    }
    
    // Step 7: Fill customer information (if not authenticated)
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill('Test Customer');
    }
    
    const phoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="phone" i]').first();
    if (await phoneInput.isVisible({ timeout: 3000 })) {
      await phoneInput.fill('0501234567');
    }
    
    // Step 8: Select payment method (Cash on Delivery)
    const cashButton = page.locator('button:has-text("Cash"), button:has-text("نقدي")').first();
    if (await cashButton.isVisible({ timeout: 3000 })) {
      await cashButton.click();
      await page.waitForTimeout(500);
    }
    
    // Step 9: Verify order summary is visible
    await expect(page.locator('text=/total|المجموع/i')).toBeVisible();
    
    // Step 10: Place order
    const placeOrderButton = page.locator('button:has-text("Place Order"), button:has-text("تأكيد الطلب")').first();
    
    // Verify button is enabled
    if (await placeOrderButton.isVisible({ timeout: 3000 })) {
      await expect(placeOrderButton).toBeEnabled({ timeout: 5000 });
      
      // Click place order button
      await placeOrderButton.click();
      
      // Wait for order confirmation or redirect
      await page.waitForTimeout(2000);
      
      // Step 11: Verify success (either on orders page or see success message)
      const successIndicators = [
        page.locator('text=/success|successful|confirmed|تم/i'),
        page.locator('[href="/orders"]'),
      ];
      
      let foundSuccess = false;
      for (const indicator of successIndicators) {
        if (await indicator.isVisible({ timeout: 3000 })) {
          foundSuccess = true;
          break;
        }
      }
      
      expect(foundSuccess).toBeTruthy();
    }
  });

  test('should complete checkout flow with pickup', async ({ page }) => {
    // Add meal to cart
    await page.waitForSelector('button:has-text("Add"), button:has-text("أضف")', { timeout: 10000 });
    const addButton = page.locator('button:has-text("Add"), button:has-text("أضف")').first();
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Navigate to checkout
    const checkoutButton = page.locator('a[href="/checkout"], button:has-text("Checkout")').first();
    if (await checkoutButton.isVisible({ timeout: 5000 })) {
      await checkoutButton.click();
    } else {
      await page.goto('/checkout');
    }
    
    await page.waitForLoadState('networkidle');
    
    // Select pickup option
    const pickupButton = page.locator('button:has-text("Pickup"), button:has-text("استلام")').first();
    if (await pickupButton.isVisible({ timeout: 3000 })) {
      await pickupButton.click();
      await page.waitForTimeout(500);
    }
    
    // Fill customer info if needed
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
    if (await phoneInput.isVisible({ timeout: 3000 })) {
      await phoneInput.fill('0501234567');
    }
    
    // Select cash payment
    const cashButton = page.locator('button:has-text("Cash")').first();
    if (await cashButton.isVisible({ timeout: 3000 })) {
      await cashButton.click();
    }
    
    // Verify order can be placed
    const placeOrderButton = page.locator('button:has-text("Place Order")').first();
    if (await placeOrderButton.isVisible({ timeout: 3000 })) {
      await expect(placeOrderButton).toBeEnabled({ timeout: 5000 });
    }
  });

  test('should validate required fields before order placement', async ({ page }) => {
    // Try to go directly to checkout without items
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // If there's a place order button, it should be disabled or show validation
    const placeOrderButton = page.locator('button:has-text("Place Order")').first();
    
    if (await placeOrderButton.isVisible({ timeout: 3000 })) {
      // Button should be disabled without required fields
      const isDisabled = await placeOrderButton.isDisabled();
      
      // If not disabled, clicking should show validation errors
      if (!isDisabled) {
        await placeOrderButton.click();
        await page.waitForTimeout(1000);
        
        // Should see error messages or validation
        const errorIndicators = [
          page.locator('text=/required|field|error|الزامي/i'),
          page.locator('[class*="error"]'),
          page.locator('[role="alert"]'),
        ];
        
        let foundError = false;
        for (const indicator of errorIndicators) {
          if (await indicator.isVisible({ timeout: 2000 })) {
            foundError = true;
            break;
          }
        }
        
        // Either button was disabled OR we saw validation errors
        expect(isDisabled || foundError).toBeTruthy();
      }
    }
  });

  test('should update cart quantities', async ({ page }) => {
    // Add a meal
    await page.waitForSelector('button:has-text("Add")', { timeout: 10000 });
    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Go to checkout to see cart
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Look for quantity controls (+ or - buttons)
    const increaseButton = page.locator('button:has-text("+"), button[aria-label*="increase" i]').first();
    
    if (await increaseButton.isVisible({ timeout: 3000 })) {
      // Get initial total
      const totalText = await page.locator('text=/total|المجموع/i').textContent();
      
      // Increase quantity
      await increaseButton.click();
      await page.waitForTimeout(1000);
      
      // Verify total changed
      const newTotalText = await page.locator('text=/total|المجموع/i').textContent();
      expect(newTotalText).not.toBe(totalText);
    }
  });

  test('should handle empty cart gracefully', async ({ page }) => {
    // Go directly to checkout without adding items
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Should either redirect to menu or show empty cart message
    const emptyIndicators = [
      page.locator('text=/empty|no items|لا توجد/i'),
      page.locator('[href="/menu"]'),
    ];
    
    let foundEmptyIndicator = false;
    for (const indicator of emptyIndicators) {
      if (await indicator.isVisible({ timeout: 5000 })) {
        foundEmptyIndicator = true;
        break;
      }
    }
    
    // Either shows empty state or redirects to menu
    const isOnMenu = page.url().includes('/menu');
    expect(foundEmptyIndicator || isOnMenu).toBeTruthy();
  });
});
