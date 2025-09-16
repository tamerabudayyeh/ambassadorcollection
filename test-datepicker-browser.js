#!/usr/bin/env node

/**
 * Browser Test for Desktop Date Picker
 * Uses Puppeteer to test the actual functionality in a browser
 */

const puppeteer = require('puppeteer');

async function testDesktopDatePicker() {
  console.log('🚀 Starting Desktop Date Picker Browser Test...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Show browser for visual confirmation
      devtools: false,
      defaultViewport: { width: 1440, height: 900 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Set desktop viewport
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log('📱 Set desktop viewport (1440x900)');
    
    // Enable console logging
    page.on('console', (msg) => {
      if (msg.text().includes('DatePicker') || msg.text().includes('isOpen')) {
        console.log(`🔍 Console: ${msg.text()}`);
      }
    });
    
    // Navigate to booking page
    console.log('🌐 Navigating to booking page...');
    await page.goto('http://localhost:3000/booking', { 
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait for date picker component to be available
    console.log('⏳ Waiting for date picker component...');
    await page.waitForSelector('[data-testid="date-range-picker"] input, #dateRange', { 
      timeout: 5000 
    });
    
    console.log('✅ Date picker component found');
    
    // Find the date picker input
    const dateInput = await page.$('#dateRange');
    if (!dateInput) {
      throw new Error('Date picker input not found');
    }
    
    console.log('✅ Date picker input located');
    
    // Check initial state - dropdown should be closed
    let dropdown = await page.$('[data-testid="desktop-datepicker-dropdown"]');
    console.log(`📋 Initial state: Dropdown ${dropdown ? 'OPEN' : 'CLOSED'} (should be closed)`);
    
    // Click on the input to open date picker
    console.log('🖱️  Clicking date picker input...');
    await dateInput.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(500);
    
    // Check if dropdown opened
    dropdown = await page.$('[data-testid="desktop-datepicker-dropdown"]');
    if (!dropdown) {
      throw new Error('Desktop date picker dropdown did not open after click');
    }
    
    console.log('✅ Date picker dropdown opened successfully');
    
    // Check if dropdown is actually visible
    const isVisible = await page.evaluate(() => {
      const dropdown = document.querySelector('[data-testid="desktop-datepicker-dropdown"]');
      if (!dropdown) return false;
      
      const styles = window.getComputedStyle(dropdown);
      return styles.display !== 'none' && 
             styles.visibility !== 'hidden' && 
             styles.opacity !== '0' &&
             dropdown.offsetHeight > 0 &&
             dropdown.offsetWidth > 0;
    });
    
    if (!isVisible) {
      throw new Error('Date picker dropdown is present but not visually visible');
    }
    
    console.log('✅ Date picker dropdown is visually visible');
    
    // Check for calendar components
    const calendar = await page.$('.rdp');
    if (!calendar) {
      throw new Error('Calendar component not found inside dropdown');
    }
    
    console.log('✅ Calendar component found');
    
    // Find selectable days
    const selectableDays = await page.$$('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)');
    console.log(`📅 Found ${selectableDays.length} selectable days`);
    
    if (selectableDays.length === 0) {
      throw new Error('No selectable days found');
    }
    
    // Click on first available day
    console.log('🗓️  Selecting check-in date...');
    await selectableDays[0].click();
    await page.waitForTimeout(300);
    
    // Check if day was selected
    const selectedDay = await page.$('.rdp-day_selected, .rdp-day_range_start');
    if (!selectedDay) {
      throw new Error('Day selection did not work');
    }
    
    console.log('✅ Check-in date selected successfully');
    
    // Check input value changed
    const inputValue = await page.$eval('#dateRange', el => el.value);
    if (inputValue === 'Select dates') {
      throw new Error('Input value did not change after date selection');
    }
    
    console.log(`📝 Input value updated: "${inputValue}"`);
    
    // Select check-out date if available
    if (selectableDays.length > 1) {
      console.log('🗓️  Selecting check-out date...');
      await selectableDays[1].click();
      await page.waitForTimeout(500);
      
      // Check if range is selected
      const rangeEnd = await page.$('.rdp-day_range_end');
      if (rangeEnd) {
        console.log('✅ Check-out date selected successfully');
        
        // Check if dropdown closed automatically
        await page.waitForTimeout(500);
        const dropdownAfterRange = await page.$('[data-testid="desktop-datepicker-dropdown"]');
        if (!dropdownAfterRange) {
          console.log('✅ Date picker closed automatically after range selection');
        } else {
          console.log('ℹ️  Date picker remained open after range selection');
        }
      }
    }
    
    // Final input value check
    const finalInputValue = await page.$eval('#dateRange', el => el.value);
    console.log(`📝 Final input value: "${finalInputValue}"`);
    
    // Take a screenshot for verification
    await page.screenshot({ 
      path: '/tmp/datepicker-test-result.png',
      fullPage: false
    });
    console.log('📸 Screenshot saved to /tmp/datepicker-test-result.png');
    
    console.log('\n🎉 Desktop Date Picker Test PASSED!');
    console.log('   All functionality is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Desktop Date Picker Test FAILED!');
    console.error(`   Error: ${error.message}`);
    
    if (page) {
      // Take screenshot of failure state
      await page.screenshot({ 
        path: '/tmp/datepicker-test-failure.png',
        fullPage: true
      });
      console.log('📸 Failure screenshot saved to /tmp/datepicker-test-failure.png');
    }
    
    process.exit(1);
    
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Run the test
testDesktopDatePicker().catch(console.error);