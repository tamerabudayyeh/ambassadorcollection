import { test, expect } from '@playwright/test';

test.describe('DatePicker Desktop Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
  });

  test('should open date picker on desktop when input is clicked', async ({ page }) => {
    // Use desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Find the date range input
    const dateInput = page.locator('input[id="dateRange"]');
    await expect(dateInput).toBeVisible();
    
    // Click the input to open the date picker
    await dateInput.click();
    
    // Wait a moment for the dropdown to appear
    await page.waitForTimeout(500);
    
    // Check if the desktop dropdown is visible
    const desktopDropdown = page.locator('.hidden.md\\:block .rdp');
    await expect(desktopDropdown).toBeVisible();
    
    // Verify the calendar is interactive
    const todayButton = desktopDropdown.locator('.rdp-day_today').first();
    if (await todayButton.isVisible()) {
      await todayButton.click();
      // Should still be open for range selection
      await expect(desktopDropdown).toBeVisible();
    }
  });

  test('should allow date selection on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const dateInput = page.locator('input[id="dateRange"]');
    await dateInput.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(500);
    
    const dropdown = page.locator('.hidden.md\\:block .rdp');
    await expect(dropdown).toBeVisible();
    
    // Select first available date (not disabled)
    const availableDays = dropdown.locator('.rdp-day:not(.rdp-day_disabled)');
    const firstDay = availableDays.first();
    await firstDay.click();
    
    // Select second date for range
    const secondDay = availableDays.nth(5); // Select a few days later
    await secondDay.click();
    
    // Dropdown should close after selecting range
    await page.waitForTimeout(500);
    await expect(dropdown).not.toBeVisible();
    
    // Input should show selected dates
    const inputValue = await dateInput.inputValue();
    expect(inputValue).not.toBe('Select dates');
    expect(inputValue).toContain('-'); // Should contain date range separator
  });

  test('should close date picker when clicking outside', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const dateInput = page.locator('input[id="dateRange"]');
    await dateInput.click();
    
    await page.waitForTimeout(500);
    
    const dropdown = page.locator('.hidden.md\\:block .rdp');
    await expect(dropdown).toBeVisible();
    
    // Click somewhere else on the page
    await page.locator('h1').click();
    
    await page.waitForTimeout(500);
    await expect(dropdown).not.toBeVisible();
  });

  test('should work with Close button', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const dateInput = page.locator('input[id="dateRange"]');
    await dateInput.click();
    
    await page.waitForTimeout(500);
    
    const dropdown = page.locator('.hidden.md\\:block');
    await expect(dropdown).toBeVisible();
    
    // Click the Close button
    const closeButton = dropdown.locator('button:has-text("Close")');
    await closeButton.click();
    
    await page.waitForTimeout(500);
    await expect(dropdown).not.toBeVisible();
  });

  test('should work with Clear button', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const dateInput = page.locator('input[id="dateRange"]');
    await dateInput.click();
    
    await page.waitForTimeout(500);
    
    const dropdown = page.locator('.hidden.md\\:block .rdp');
    
    // Select a date first
    const availableDays = dropdown.locator('.rdp-day:not(.rdp-day_disabled)');
    await availableDays.first().click();
    
    // Click Clear button
    const clearButton = page.locator('.hidden.md\\:block button:has-text("Clear")');
    await clearButton.click();
    
    // Input should be reset
    const inputValue = await dateInput.inputValue();
    expect(inputValue).toBe('Select dates');
  });
});

test.describe('DatePicker Debug Page', () => {
  test('debug page should load and function correctly', async ({ page }) => {
    await page.goto('/debug/datepicker');
    await page.waitForLoadState('networkidle');
    
    const debugInput = page.locator('input[id="debugDateRange"]');
    await expect(debugInput).toBeVisible();
    
    // Click the debug input
    await debugInput.click();
    
    // Check if debug info is being logged
    const debugPanel = page.locator('.bg-gray-100');
    await expect(debugPanel).toBeVisible();
    
    // Should show debug information
    const debugText = await debugPanel.textContent();
    expect(debugText).toContain('Debug Information');
  });
});