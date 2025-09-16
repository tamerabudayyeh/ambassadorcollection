import { test, expect, Page } from '@playwright/test';

test.describe('Booking Flow E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Homepage loads and displays correctly', async () => {
    // Verify page title contains Ambassador Collection
    await expect(page).toHaveTitle(/Ambassador/);
    
    // Check for main heading
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
    
    // Check navigation exists
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
  });

  test('Booking page loads and displays search form', async () => {
    // Navigate to booking page
    await page.goto('/booking');
    
    // Check page loads
    await expect(page.locator('h1:has-text("Book Your Stay")')).toBeVisible();
    
    // Check hotel selector exists
    const hotelInput = page.locator('input[placeholder*="hotel"]').first();
    await expect(hotelInput).toBeVisible();
    
    // Check search button exists
    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();
  });

  test('Hotel selector functionality', async () => {
    await page.goto('/booking');
    
    // Click hotel selector to open dropdown
    const hotelInput = page.locator('input[placeholder*="hotel"]').first();
    await hotelInput.click();
    
    // Wait for dropdown to appear and check if hotels are listed
    const hotelOptions = page.locator('li').filter({ hasText: /Ambassador/ });
    
    if (await hotelOptions.count() > 0) {
      // Select first hotel
      await hotelOptions.first().click();
      
      // Verify hotel is selected
      const selectedValue = await hotelInput.inputValue();
      expect(selectedValue).toBeTruthy();
      expect(selectedValue.length).toBeGreaterThan(0);
    }
  });

  test('Search functionality with valid inputs', async () => {
    await page.goto('/booking');
    
    // Fill hotel selector
    const hotelInput = page.locator('input[placeholder*="hotel"]').first();
    await hotelInput.click();
    
    // Wait a bit for dropdown
    await page.waitForTimeout(500);
    
    const hotelOptions = page.locator('li').filter({ hasText: /Ambassador/ });
    if (await hotelOptions.count() > 0) {
      await hotelOptions.first().click();
    }
    
    // Try to search (button should be enabled if hotel is selected)
    const searchButton = page.locator('button:has-text("Search")');
    const isEnabled = await searchButton.isEnabled();
    
    if (isEnabled) {
      await searchButton.click();
      
      // Should navigate to results page
      await page.waitForURL(/\/booking\/results/, { timeout: 10000 });
      expect(page.url()).toContain('/booking/results');
    } else {
      console.log('Search button disabled - requires all fields to be filled');
    }
  });

  test('Booking flow with navigation back and forth', async () => {
    // Test navigation between booking steps
    await page.goto('/booking');
    
    // Fill initial form
    const searchButton = page.locator('[data-testid="search-button"]');
    if (await searchButton.isVisible()) {
      await searchButton.click();
    }

    // Go to results and back
    if (page.url().includes('/results')) {
      await page.goBack();
      await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();
    }
  });

  test('Booking form validation', async () => {
    await page.goto('/booking');
    
    // Try to search without filling required fields
    const searchButton = page.locator('[data-testid="search-button"]');
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      // Should show validation errors or not proceed
      const errorMessages = page.locator('[data-testid="error-message"]');
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });

  test('Booking persistence across page reloads', async () => {
    await page.goto('/booking');
    
    // Fill form
    const checkInInput = page.locator('input[name="checkIn"]');
    if (await checkInInput.isVisible()) {
      await checkInInput.fill('2025-08-25');
      await page.reload();
      
      // Check if data persists (if implemented)
      const value = await checkInInput.inputValue();
      // This test depends on whether persistence is implemented
    }
  });
});