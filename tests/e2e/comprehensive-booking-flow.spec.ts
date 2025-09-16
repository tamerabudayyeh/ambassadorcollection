/**
 * Comprehensive Booking Flow E2E Tests
 * Tests complete booking scenarios with realistic data
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_HOTELS = [
  {
    name: 'Ambassador Jerusalem',
    slug: 'ambassador-jerusalem',
    location: 'Jerusalem, Israel'
  },
  {
    name: 'Ambassador Boutique',
    slug: 'ambassador-boutique',
    location: 'Jerusalem, Israel'
  }
];

const TEST_GUEST_DATA = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith.test@example.com',
  phone: '+1-555-123-4567',
  country: 'United States',
  city: 'New York',
  address: '123 Test Street',
  postalCode: '10001'
};

// Helper functions
async function fillBookingDates(page: Page) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);
  
  const checkIn = tomorrow.toISOString().split('T')[0];
  const checkOut = dayAfter.toISOString().split('T')[0];
  
  await page.fill('input[type="date"]:first-child', checkIn);
  await page.fill('input[type="date"]:last-child', checkOut);
  
  return { checkIn, checkOut };
}

async function selectHotel(page: Page, hotelName: string) {
  // Look for hotel selector dropdown or input
  const hotelSelector = page.locator('select, input').filter({ hasText: /hotel|property/i }).first();
  
  if (await hotelSelector.count() > 0) {
    const elementType = await hotelSelector.evaluate(el => el.tagName.toLowerCase());
    
    if (elementType === 'select') {
      await hotelSelector.selectOption({ label: hotelName });
    } else {
      await hotelSelector.click();
      await page.waitForTimeout(500);
      await page.locator(`text=${hotelName}`).click();
    }
  }
}

async function fillGuestInformation(page: Page, guestData = TEST_GUEST_DATA) {
  await page.fill('input[name="firstName"], input[placeholder*="first name" i]', guestData.firstName);
  await page.fill('input[name="lastName"], input[placeholder*="last name" i]', guestData.lastName);
  await page.fill('input[name="email"], input[type="email"]', guestData.email);
  await page.fill('input[name="phone"], input[type="tel"]', guestData.phone);
  
  // Handle country selector
  const countrySelect = page.locator('select[name="country"], select').filter({ hasText: /country/i }).first();
  if (await countrySelect.count() > 0) {
    await countrySelect.selectOption({ label: guestData.country });
  }
  
  // Optional fields
  if (await page.locator('input[name="city"]').count() > 0) {
    await page.fill('input[name="city"]', guestData.city);
  }
  
  if (await page.locator('input[name="address"]').count() > 0) {
    await page.fill('input[name="address"]', guestData.address);
  }
  
  if (await page.locator('input[name="postalCode"]').count() > 0) {
    await page.fill('input[name="postalCode"]', guestData.postalCode);
  }
}

test.describe('Comprehensive Booking Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('Complete booking flow - Happy path', async ({ page }) => {
    // Step 1: Navigate to booking page
    await page.goto('/booking');
    await expect(page.locator('h1')).toContainText('Book Your Stay');

    // Step 2: Fill search criteria
    await fillBookingDates(page);
    await selectHotel(page, TEST_HOTELS[0].name);

    // Select guests
    const guestSelector = page.locator('select').filter({ hasText: /guest|people/i }).first();
    if (await guestSelector.count() > 0) {
      await guestSelector.selectOption('2');
    }

    // Step 3: Search for rooms
    const searchButton = page.locator('button').filter({ hasText: /search|check availability/i }).first();
    await searchButton.click();

    // Step 4: Verify results page
    await page.waitForURL(/\/booking\/results/);
    await expect(page.locator('h2, h1')).toContainText(/available|room|results/i);

    // Wait for rooms to load
    await page.waitForSelector('[data-testid="room-card"], .room-card, [class*="room"]', { timeout: 10000 });

    // Step 5: Select first available room
    const selectRoomButton = page.locator('button').filter({ hasText: /select|book|choose/i }).first();
    await expect(selectRoomButton).toBeVisible();
    await selectRoomButton.click();

    // Step 6: Fill guest information
    await page.waitForURL(/\/booking\/guest/);
    await fillGuestInformation(page);

    // Accept terms if checkbox exists
    const termsCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /terms|agree/i }).first();
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check();
    }

    // Proceed to payment
    const nextButton = page.locator('button').filter({ hasText: /next|continue|proceed/i }).first();
    await nextButton.click();

    // Step 7: Verify payment page loads
    await page.waitForURL(/\/booking\/payment/);
    
    // Check for Stripe payment form or payment elements
    const paymentForm = page.locator('form, [data-testid="payment-form"]').first();
    await expect(paymentForm).toBeVisible();

    // Verify payment summary is displayed
    await expect(page.locator('text=/total|amount|pay/i')).toBeVisible();
    
    // Test ends here as we don't want to actually process payments
    console.log('✅ Complete booking flow test passed - reached payment page');
  });

  test('Booking flow with validation errors', async ({ page }) => {
    await page.goto('/booking');

    // Try to search without required fields
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();

    // Should either show validation errors or not proceed
    // Check if we're still on booking page (didn't navigate)
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/booking');

    // Fill partial information and test validation
    await fillBookingDates(page);
    await searchButton.click();

    // Should still require hotel selection
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/booking');
  });

  test('Mobile booking flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/booking');

    // Mobile-specific checks
    await expect(page.locator('.booking-mobile-header, [class*="mobile"]')).toBeVisible();

    // Fill mobile form
    await fillBookingDates(page);
    await selectHotel(page, TEST_HOTELS[0].name);

    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();

    // Check mobile results page
    if (page.url().includes('/results')) {
      // Look for mobile-optimized elements
      const mobileElements = page.locator('.mobile-sticky-bottom, [class*="mobile"]');
      if (await mobileElements.count() > 0) {
        await expect(mobileElements.first()).toBeVisible();
      }
    }
  });

  test('Booking session persistence', async ({ page }) => {
    await page.goto('/booking');

    // Fill form
    await fillBookingDates(page);
    await selectHotel(page, TEST_HOTELS[0].name);

    // Reload page
    await page.reload();

    // Check if data persists (if implemented)
    const hotelInput = page.locator('input, select').filter({ hasText: /hotel/i }).first();
    if (await hotelInput.count() > 0) {
      const value = await hotelInput.inputValue();
      // Data persistence is optional, so we just log the result
      console.log('Session persistence test - Hotel value after reload:', value);
    }
  });

  test('Booking flow error handling', async ({ page }) => {
    // Mock network error
    await page.route('**/api/booking/availability', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Server error' })
      });
    });

    await page.goto('/booking');
    await fillBookingDates(page);
    await selectHotel(page, TEST_HOTELS[0].name);

    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();

    // Should show error message
    await page.waitForSelector('text=/error|failed|unavailable/i', { timeout: 10000 });
    await expect(page.locator('text=/error|failed|unavailable/i')).toBeVisible();
  });

  test('Rate display consistency', async ({ page }) => {
    await page.goto('/booking');
    await fillBookingDates(page);
    await selectHotel(page, TEST_HOTELS[0].name);

    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();

    if (page.url().includes('/results')) {
      // Wait for results to load
      await page.waitForSelector('text=/\\$|USD|price/i', { timeout: 10000 });

      // Check that prices are displayed consistently
      const priceElements = page.locator('text=/\\$[0-9]+/');
      const priceCount = await priceElements.count();

      if (priceCount > 0) {
        // Verify all prices follow same format
        for (let i = 0; i < Math.min(priceCount, 3); i++) {
          const priceText = await priceElements.nth(i).textContent();
          expect(priceText).toMatch(/\\$[0-9,]+/);
        }
      }
    }
  });

  test('Booking flow accessibility', async ({ page }) => {
    await page.goto('/booking');

    // Check for proper form labels
    const formInputs = page.locator('input[type="date"], input[type="email"], select');
    const inputCount = await formInputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = formInputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have either id with label, aria-label, or placeholder
      const hasAccessibleLabel = id || ariaLabel || placeholder;
      expect(hasAccessibleLabel).toBeTruthy();
    }

    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();
  });

  test('Currency handling', async ({ page }) => {
    await page.goto('/booking');

    // Look for currency selector
    const currencySelector = page.locator('select, button').filter({ hasText: /currency|USD|EUR/i }).first();
    
    if (await currencySelector.count() > 0) {
      await currencySelector.click();
      
      // Try to select different currency
      const eurOption = page.locator('option, text').filter({ hasText: /EUR/i }).first();
      if (await eurOption.count() > 0) {
        await eurOption.click();
        
        // Continue with booking flow to see if currency is maintained
        await fillBookingDates(page);
        await selectHotel(page, TEST_HOTELS[0].name);
        
        const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
        await searchButton.click();
        
        // Check if EUR is displayed in results
        if (page.url().includes('/results')) {
          await page.waitForTimeout(2000);
          // Look for EUR symbol or currency indicator
          const hasEurPrices = page.locator('text=/EUR|€/');
          console.log('Currency test - EUR prices found:', await hasEurPrices.count());
        }
      }
    }
  });

  test('Back button navigation', async ({ page }) => {
    await page.goto('/booking');
    await fillBookingDates(page);
    await selectHotel(page, TEST_HOTELS[0].name);

    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();

    if (page.url().includes('/results')) {
      // Go back using browser back button
      await page.goBack();
      await page.waitForTimeout(1000);
      
      // Should be back on booking page
      expect(page.url()).toContain('/booking');
      
      // Check if form data is preserved
      const dateInputs = page.locator('input[type="date"]');
      if (await dateInputs.count() >= 2) {
        const checkInValue = await dateInputs.first().inputValue();
        expect(checkInValue).toBeTruthy();
      }
    }
  });

  test('Multiple hotel comparison', async ({ page }) => {
    for (const hotel of TEST_HOTELS) {
      await page.goto('/booking');
      await fillBookingDates(page);
      await selectHotel(page, hotel.name);

      const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
      await searchButton.click();

      if (page.url().includes('/results')) {
        // Verify hotel name is displayed correctly
        await expect(page.locator(`text=${hotel.name}`)).toBeVisible();
        
        // Check that results are specific to this hotel
        await page.waitForTimeout(1000);
      }
    }
  });
});

test.describe('Performance and Load Tests', () => {
  test('Page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Booking page load time: ${loadTime}ms`);
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('Search response time', async ({ page }) => {
    await page.goto('/booking');
    await fillBookingDates(page);
    await selectHotel(page, TEST_HOTELS[0].name);

    const startTime = Date.now();
    
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();
    
    // Wait for results or error
    await Promise.race([
      page.waitForURL(/\/booking\/results/),
      page.waitForSelector('text=/error|failed/i', { timeout: 10000 })
    ]);
    
    const responseTime = Date.now() - startTime;
    console.log(`Search response time: ${responseTime}ms`);
    
    // Should respond within 10 seconds
    expect(responseTime).toBeLessThan(10000);
  });
});

test.describe('Edge Cases and Error Scenarios', () => {
  test('Invalid date combinations', async ({ page }) => {
    await page.goto('/booking');

    // Try past dates
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0];

    await page.fill('input[type="date"]:first-child', pastDate);

    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();

    // Should show validation error or not allow past dates
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/booking');
  });

  test('API timeout handling', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/booking/availability', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, availableRooms: [] })
      });
    });

    await page.goto('/booking');
    await fillBookingDates(page);
    await selectHotel(page, TEST_HOTELS[0].name);

    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();

    // Should show loading state or timeout error within reasonable time
    await page.waitForSelector('text=/loading|searching|error/i', { timeout: 15000 });
  });

  test('No rooms available scenario', async ({ page }) => {
    // Mock no availability response
    await page.route('**/api/booking/availability', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          success: true, 
          availableRooms: [],
          message: 'No rooms available for selected dates'
        })
      });
    });

    await page.goto('/booking');
    await fillBookingDates(page);
    await selectHotel(page, TEST_HOTELS[0].name);

    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();

    // Should show no availability message
    await page.waitForSelector('text=/no rooms|unavailable|sold out/i', { timeout: 10000 });
    await expect(page.locator('text=/no rooms|unavailable|sold out/i')).toBeVisible();
  });
});