/**
 * Desktop Date Picker Functionality Test
 * Critical issue: Date picker works on mobile but NOT on desktop browsers
 * This test verifies desktop browser compatibility and user interaction
 */

const puppeteer = require('puppeteer');
const { expect } = require('chai');

describe('Desktop Date Picker Functionality', function() {
  this.timeout(30000); // 30 second timeout for all tests
  
  let browser;
  let page;
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  
  // Test configuration for different browsers
  const browsers = [
    { name: 'Chrome', headless: false },
    { name: 'Firefox', headless: false, product: 'firefox' },
  ];
  
  // Desktop viewport configurations
  const desktopViewports = [
    { width: 1920, height: 1080, name: '1920x1080' },
    { width: 1440, height: 900, name: '1440x900' },
    { width: 1366, height: 768, name: '1366x768' },
    { width: 1024, height: 768, name: '1024x768' },
  ];

  beforeEach(async function() {
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    page = await browser.newPage();
    
    // Set default desktop viewport
    await page.setViewport({ width: 1440, height: 900 });
    
    // Enable console logging
    page.on('console', (msg) => {
      console.log(`Console [${msg.type()}]:`, msg.text());
    });
    
    // Log network errors
    page.on('requestfailed', (request) => {
      console.log(`Request failed: ${request.url()} - ${request.failure().errorText}`);
    });
    
    // Navigate to booking page
    await page.goto(`${BASE_URL}/booking`, { 
      waitUntil: 'networkidle2',
      timeout: 15000
    });
    
    // Wait for page to be fully loaded
    await page.waitForSelector('[data-testid="date-range-picker"], .date-picker-container', { 
      timeout: 10000 
    });
  });

  afterEach(async function() {
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  });

  describe('Desktop Date Picker Opening Tests', function() {
    
    it('should open date picker when input is clicked on desktop', async function() {
      console.log('Testing date picker opening on desktop...');
      
      // Find the date picker input using multiple selector strategies
      let dateInput;
      try {
        // Try data-testid first
        dateInput = await page.$('[data-testid="date-range-picker"] input');
        if (!dateInput) {
          // Try by ID
          dateInput = await page.$('#dateRange');
        }
        if (!dateInput) {
          // Try by class
          dateInput = await page.$('.date-picker-container input');
        }
        if (!dateInput) {
          // Try by placeholder
          dateInput = await page.$('input[placeholder="Select dates"]');
        }
      } catch (error) {
        console.error('Error finding date input:', error);
      }
      
      expect(dateInput, 'Date picker input should exist').to.not.be.null;
      
      // Take screenshot before click
      await page.screenshot({ 
        path: '/tmp/date-picker-before-click.png',
        fullPage: false
      });
      
      // Check if date picker dropdown is initially closed
      const dropdownBefore = await page.$('.desktop-datepicker-dropdown');
      expect(dropdownBefore, 'Date picker should be closed initially').to.be.null;
      
      // Click on the input to open date picker
      console.log('Clicking date picker input...');
      await dateInput.click();
      
      // Wait for dropdown to appear
      await page.waitForTimeout(500);
      
      // Take screenshot after click
      await page.screenshot({ 
        path: '/tmp/date-picker-after-click.png',
        fullPage: false
      });
      
      // Check if date picker dropdown is now visible
      const dropdownAfter = await page.$('.desktop-datepicker-dropdown');
      expect(dropdownAfter, 'Date picker dropdown should be visible after click').to.not.be.null;
      
      // Verify the dropdown is actually visible (not just present in DOM)
      const isVisible = await page.evaluate(() => {
        const dropdown = document.querySelector('.desktop-datepicker-dropdown');
        if (!dropdown) return false;
        
        const styles = window.getComputedStyle(dropdown);
        return styles.display !== 'none' && 
               styles.visibility !== 'hidden' && 
               styles.opacity !== '0' &&
               dropdown.offsetHeight > 0 &&
               dropdown.offsetWidth > 0;
      });
      
      expect(isVisible, 'Date picker dropdown should be visually visible').to.be.true;
      
      console.log('✅ Date picker successfully opens on desktop click');
    });

    it('should display calendar with correct structure', async function() {
      // Open the date picker
      const dateInput = await page.$('#dateRange');
      await dateInput.click();
      await page.waitForTimeout(500);
      
      // Check for calendar structure
      const calendar = await page.$('.desktop-datepicker-dropdown .rdp');
      expect(calendar, 'Calendar should be present').to.not.be.null;
      
      // Check for month navigation
      const navButtons = await page.$$('.rdp-nav_button');
      expect(navButtons.length, 'Should have navigation buttons').to.be.at.least(2);
      
      // Check for day cells
      const dayCells = await page.$$('.rdp-day');
      expect(dayCells.length, 'Should have day cells').to.be.greaterThan(0);
      
      // Check for current month display
      const monthLabel = await page.$('.rdp-caption_label');
      expect(monthLabel, 'Should display current month').to.not.be.null;
      
      console.log('✅ Calendar structure is correct');
    });

    desktopViewports.forEach(viewport => {
      it(`should work at ${viewport.name} resolution`, async function() {
        await page.setViewport(viewport);
        await page.reload({ waitUntil: 'networkidle2' });
        
        // Wait for layout to stabilize
        await page.waitForTimeout(1000);
        
        const dateInput = await page.$('#dateRange');
        expect(dateInput, `Date input should exist at ${viewport.name}`).to.not.be.null;
        
        await dateInput.click();
        await page.waitForTimeout(500);
        
        const dropdown = await page.$('.desktop-datepicker-dropdown');
        expect(dropdown, `Dropdown should open at ${viewport.name}`).to.not.be.null;
        
        // Take screenshot at this resolution
        await page.screenshot({ 
          path: `/tmp/date-picker-${viewport.name}.png`,
          fullPage: false
        });
        
        console.log(`✅ Date picker works at ${viewport.name}`);
      });
    });

  });

  describe('Date Selection Functionality', function() {
    
    beforeEach(async function() {
      // Open date picker for each test
      const dateInput = await page.$('#dateRange');
      await dateInput.click();
      await page.waitForTimeout(500);
    });

    it('should allow selecting check-in date', async function() {
      // Find a selectable day (not disabled, not in the past)
      const selectableDay = await page.$('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)');
      expect(selectableDay, 'Should have selectable days').to.not.be.null;
      
      // Click on the day
      await selectableDay.click();
      await page.waitForTimeout(300);
      
      // Check if day is selected
      const selectedDay = await page.$('.rdp-day_selected');
      expect(selectedDay, 'Day should be selected').to.not.be.null;
      
      // Check if input displays the selected date
      const inputValue = await page.$eval('#dateRange', el => el.value);
      expect(inputValue, 'Input should show selected date').to.not.equal('Select dates');
      expect(inputValue, 'Input should contain checkout prompt').to.include('Select checkout');
      
      console.log(`✅ Check-in date selected successfully: ${inputValue}`);
    });

    it('should allow selecting check-out date after check-in', async function() {
      // Select check-in date first
      const firstDay = await page.$('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)');
      await firstDay.click();
      await page.waitForTimeout(300);
      
      // Select check-out date (next available day)
      const days = await page.$$('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)');
      if (days.length > 1) {
        await days[1].click();
        await page.waitForTimeout(300);
        
        // Check if range is selected
        const rangeStart = await page.$('.rdp-day_range_start');
        const rangeEnd = await page.$('.rdp-day_range_end');
        
        expect(rangeStart, 'Should have range start').to.not.be.null;
        expect(rangeEnd, 'Should have range end').to.not.be.null;
        
        // Check input value shows both dates
        const inputValue = await page.$eval('#dateRange', el => el.value);
        expect(inputValue, 'Input should show date range').to.include(' - ');
        expect(inputValue, 'Input should not contain "Select"').to.not.include('Select');
        
        console.log(`✅ Date range selected successfully: ${inputValue}`);
      }
    });

    it('should close date picker after selecting date range', async function() {
      // Select date range
      const days = await page.$$('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)');
      await days[0].click();
      await page.waitForTimeout(300);
      await days[1].click();
      await page.waitForTimeout(500);
      
      // Check if dropdown is closed
      const dropdown = await page.$('.desktop-datepicker-dropdown');
      expect(dropdown, 'Date picker should close after range selection').to.be.null;
      
      console.log('✅ Date picker closes automatically after selection');
    });

  });

  describe('Keyboard and Accessibility Tests', function() {
    
    it('should be accessible via keyboard navigation', async function() {
      // Focus on date input
      await page.focus('#dateRange');
      
      // Press Enter to open
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      const dropdown = await page.$('.desktop-datepicker-dropdown');
      expect(dropdown, 'Date picker should open with Enter key').to.not.be.null;
      
      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      const dropdownAfterEscape = await page.$('.desktop-datepicker-dropdown');
      expect(dropdownAfterEscape, 'Date picker should close with Escape key').to.be.null;
      
      console.log('✅ Keyboard navigation works correctly');
    });

    it('should have proper ARIA attributes', async function() {
      const dateInput = await page.$('#dateRange');
      
      // Check ARIA attributes
      const ariaExpanded = await page.$eval('#dateRange', el => el.getAttribute('aria-expanded'));
      const ariaHaspopup = await page.$eval('#dateRange', el => el.getAttribute('aria-haspopup'));
      const ariaLabel = await page.$eval('#dateRange', el => el.getAttribute('aria-label'));
      
      expect(ariaHaspopup, 'Should have aria-haspopup').to.equal('dialog');
      expect(ariaLabel, 'Should have aria-label').to.include('dates');
      expect(ariaExpanded, 'Should have aria-expanded').to.equal('false');
      
      // Click to open and check aria-expanded changes
      await dateInput.click();
      await page.waitForTimeout(300);
      
      const ariaExpandedOpen = await page.$eval('#dateRange', el => el.getAttribute('aria-expanded'));
      expect(ariaExpandedOpen, 'aria-expanded should be true when open').to.equal('true');
      
      console.log('✅ ARIA attributes are properly set');
    });

  });

  describe('Error Handling and Edge Cases', function() {
    
    it('should handle clicks outside to close date picker', async function() {
      // Open date picker
      const dateInput = await page.$('#dateRange');
      await dateInput.click();
      await page.waitForTimeout(500);
      
      // Verify it's open
      let dropdown = await page.$('.desktop-datepicker-dropdown');
      expect(dropdown, 'Date picker should be open').to.not.be.null;
      
      // Click outside
      await page.click('body', { offset: { x: 100, y: 100 } });
      await page.waitForTimeout(500);
      
      // Verify it's closed
      dropdown = await page.$('.desktop-datepicker-dropdown');
      expect(dropdown, 'Date picker should close when clicking outside').to.be.null;
      
      console.log('✅ Click outside closes date picker correctly');
    });

    it('should disable past dates', async function() {
      const dateInput = await page.$('#dateRange');
      await dateInput.click();
      await page.waitForTimeout(500);
      
      // Check for disabled days
      const disabledDays = await page.$$('.rdp-day_disabled');
      expect(disabledDays.length, 'Should have disabled days for past dates').to.be.greaterThan(0);
      
      // Try to click a disabled day
      if (disabledDays.length > 0) {
        await disabledDays[0].click();
        await page.waitForTimeout(300);
        
        // Input should still show "Select dates"
        const inputValue = await page.$eval('#dateRange', el => el.value);
        expect(inputValue, 'Should not select disabled dates').to.equal('Select dates');
      }
      
      console.log('✅ Past dates are properly disabled');
    });

    it('should handle console errors gracefully', async function() {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      
      // Perform various interactions
      const dateInput = await page.$('#dateRange');
      await dateInput.click();
      await page.waitForTimeout(500);
      
      const days = await page.$$('.rdp-day:not(.rdp-day_disabled)');
      if (days.length > 0) {
        await days[0].click();
        await page.waitForTimeout(300);
      }
      
      // Close by clicking outside
      await page.click('body');
      await page.waitForTimeout(500);
      
      expect(errors.length, 'Should not have JavaScript errors').to.equal(0);
      
      if (errors.length > 0) {
        console.log('❌ JavaScript errors found:', errors);
      } else {
        console.log('✅ No JavaScript errors during interaction');
      }
    });

  });

  describe('Mobile Functionality Preservation', function() {
    
    it('should still work on mobile viewports', async function() {
      // Switch to mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.reload({ waitUntil: 'networkidle2' });
      
      const dateInput = await page.$('#dateRange');
      await dateInput.click();
      await page.waitForTimeout(500);
      
      // On mobile, should show full-screen overlay
      const mobileOverlay = await page.$('.fixed.inset-0.z-\\[9999\\].bg-white');
      expect(mobileOverlay, 'Mobile should show full-screen overlay').to.not.be.null;
      
      // Should not show desktop dropdown on mobile
      const desktopDropdown = await page.$('.desktop-datepicker-dropdown');
      expect(desktopDropdown, 'Should not show desktop dropdown on mobile').to.be.null;
      
      console.log('✅ Mobile functionality is preserved');
    });

  });

  describe('Performance and Visual Tests', function() {
    
    it('should render date picker within acceptable time', async function() {
      const startTime = Date.now();
      
      const dateInput = await page.$('#dateRange');
      await dateInput.click();
      
      // Wait for dropdown to appear
      await page.waitForSelector('.desktop-datepicker-dropdown', { timeout: 2000 });
      
      const renderTime = Date.now() - startTime;
      expect(renderTime, 'Date picker should render within 2 seconds').to.be.lessThan(2000);
      
      console.log(`✅ Date picker rendered in ${renderTime}ms`);
    });

    it('should take screenshots for visual regression testing', async function() {
      // Take screenshot of closed state
      await page.screenshot({ 
        path: '/tmp/date-picker-closed-state.png',
        clip: { x: 0, y: 0, width: 800, height: 400 }
      });
      
      // Open date picker and take screenshot
      const dateInput = await page.$('#dateRange');
      await dateInput.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: '/tmp/date-picker-open-state.png',
        clip: { x: 0, y: 0, width: 800, height: 600 }
      });
      
      // Select a date and take screenshot
      const selectableDay = await page.$('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)');
      if (selectableDay) {
        await selectableDay.click();
        await page.waitForTimeout(300);
        
        await page.screenshot({ 
          path: '/tmp/date-picker-selected-state.png',
          clip: { x: 0, y: 0, width: 800, height: 600 }
        });
      }
      
      console.log('✅ Screenshots captured for visual testing');
    });

  });

});