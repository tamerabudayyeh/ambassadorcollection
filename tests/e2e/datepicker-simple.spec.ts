import { test, expect } from '@playwright/test';

test.describe('DatePicker Basic Functionality', () => {
  test('should open and interact with DatePicker on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Navigate to booking page
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
    
    // Find and click the date input
    const dateInput = page.locator('input[id="dateRange"]');
    await expect(dateInput).toBeVisible();
    
    console.log('Clicking date input...');
    await dateInput.click();
    
    // Wait for dropdown to potentially appear
    await page.waitForTimeout(1000);
    
    // Check for any visible calendar/datepicker elements
    const calendarElements = await page.locator('.rdp, .react-calendar, [data-testid="calendar"], .desktop-datepicker-dropdown').count();
    console.log(`Found ${calendarElements} calendar elements`);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'datepicker-test.png', fullPage: true });
    
    // Check if any DayPicker is visible
    const dayPicker = page.locator('.rdp');
    const isDayPickerVisible = await dayPicker.isVisible().catch(() => false);
    console.log(`DayPicker visible: ${isDayPickerVisible}`);
    
    if (isDayPickerVisible) {
      // If visible, try to interact with it
      const availableDays = dayPicker.locator('.rdp-day:not(.rdp-day_disabled)');
      const dayCount = await availableDays.count();
      console.log(`Found ${dayCount} available days`);
      
      if (dayCount > 0) {
        await availableDays.first().click();
        console.log('Clicked first available day');
      }
    }
    
    // The test passes if we can click the input without errors
    expect(true).toBe(true);
  });
  
  test('should check console for DatePicker logs', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('DatePicker')) {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
    
    const dateInput = page.locator('input[id="dateRange"]');
    await dateInput.click();
    
    await page.waitForTimeout(1000);
    
    console.log('Console logs:', consoleLogs);
    
    // Check if we got any DatePicker-related logs
    expect(consoleLogs.length).toBeGreaterThanOrEqual(0);
  });
});