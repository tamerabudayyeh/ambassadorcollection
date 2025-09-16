/**
 * Simple test runner for desktop date picker functionality
 * Tests the critical issue: Date picker works on mobile but NOT on desktop browsers
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotDir = '/tmp/date-picker-test-screenshots';
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testDatePickerDesktop() {
    console.log('🧪 Starting Desktop Date Picker Test Suite');
    console.log('=========================================\n');
    
    let browser;
    let testResults = [];
    
    try {
        // Launch browser with desktop configuration
        browser = await puppeteer.launch({
            headless: false, // Keep visible for debugging
            devtools: false,
            defaultViewport: { width: 1440, height: 900 },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        
        // Enable console logging
        const consoleMessages = [];
        page.on('console', (msg) => {
            consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
        });
        
        const errors = [];
        page.on('pageerror', (error) => {
            errors.push(error.message);
        });
        
        console.log('📍 Navigating to booking page...');
        await page.goto('http://localhost:3002/booking', { 
            waitUntil: 'networkidle2',
            timeout: 10000
        });
        
        // Test 1: Page loads successfully
        console.log('✅ Test 1: Page loaded successfully');
        testResults.push({ test: 'Page Load', status: 'PASS', details: 'Booking page loaded successfully' });
        
        // Test 2: Date picker input exists
        console.log('🔍 Test 2: Looking for date picker input...');
        
        const dateInput = await page.$('#dateRange');
        if (!dateInput) {
            console.log('❌ Date picker input not found');
            testResults.push({ test: 'Input Exists', status: 'FAIL', details: 'Date picker input (#dateRange) not found' });
            return;
        }
        
        console.log('✅ Test 2: Date picker input found');
        testResults.push({ test: 'Input Exists', status: 'PASS', details: 'Date picker input (#dateRange) found' });
        
        // Take screenshot of initial state
        await page.screenshot({ 
            path: `${screenshotDir}/01-initial-state.png`,
            fullPage: false
        });
        
        // Test 3: Input is clickable and has correct attributes
        console.log('🔍 Test 3: Checking input attributes...');
        
        const inputAttributes = await page.evaluate(() => {
            const input = document.querySelector('#dateRange');
            return {
                readonly: input.readOnly,
                cursor: window.getComputedStyle(input).cursor,
                ariaExpanded: input.getAttribute('aria-expanded'),
                ariaHaspopup: input.getAttribute('aria-haspopup'),
                placeholder: input.placeholder,
                value: input.value
            };
        });
        
        console.log('Input attributes:', inputAttributes);
        
        if (inputAttributes.cursor === 'pointer' || inputAttributes.readonly) {
            console.log('✅ Test 3: Input has correct clickable attributes');
            testResults.push({ test: 'Input Attributes', status: 'PASS', details: 'Input is readonly with pointer cursor' });
        } else {
            console.log('❌ Test 3: Input may not be properly configured for clicking');
            testResults.push({ test: 'Input Attributes', status: 'WARNING', details: 'Input cursor is not pointer' });
        }
        
        // Test 4: Click on input to open date picker
        console.log('🔍 Test 4: Attempting to click date picker input...');
        
        // Check if dropdown is initially closed
        let dropdown = await page.$('.desktop-datepicker-dropdown');
        if (dropdown) {
            console.log('⚠️ Warning: Date picker dropdown already visible before click');
        }
        
        // Click the input
        await dateInput.click();
        console.log('👆 Clicked on date picker input');
        
        // Wait for dropdown to appear
        await page.waitForTimeout(1000);
        
        // Take screenshot after click
        await page.screenshot({ 
            path: `${screenshotDir}/02-after-click.png`,
            fullPage: false
        });
        
        // Check if dropdown appeared
        dropdown = await page.$('.desktop-datepicker-dropdown');
        
        if (dropdown) {
            console.log('✅ Test 4: Date picker dropdown appeared after click!');
            testResults.push({ test: 'Click Opens Dropdown', status: 'PASS', details: 'Desktop dropdown opened successfully' });
            
            // Test 5: Check dropdown visibility and structure
            console.log('🔍 Test 5: Checking dropdown visibility and structure...');
            
            const dropdownInfo = await page.evaluate(() => {
                const dropdown = document.querySelector('.desktop-datepicker-dropdown');
                if (!dropdown) return null;
                
                const styles = window.getComputedStyle(dropdown);
                const rect = dropdown.getBoundingClientRect();
                
                return {
                    display: styles.display,
                    visibility: styles.visibility,
                    opacity: styles.opacity,
                    zIndex: styles.zIndex,
                    width: rect.width,
                    height: rect.height,
                    isVisible: rect.width > 0 && rect.height > 0 && styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0'
                };
            });
            
            console.log('Dropdown visibility info:', dropdownInfo);
            
            if (dropdownInfo && dropdownInfo.isVisible) {
                console.log('✅ Test 5: Dropdown is visually visible');
                testResults.push({ test: 'Dropdown Visibility', status: 'PASS', details: `Dropdown is visible with size ${dropdownInfo.width}x${dropdownInfo.height}` });
            } else {
                console.log('❌ Test 5: Dropdown exists in DOM but not visually visible');
                testResults.push({ test: 'Dropdown Visibility', status: 'FAIL', details: 'Dropdown exists but is not visually visible' });
            }
            
            // Test 6: Check calendar structure
            console.log('🔍 Test 6: Checking calendar structure...');
            
            const calendarStructure = await page.evaluate(() => {
                const calendar = document.querySelector('.desktop-datepicker-dropdown .rdp');
                if (!calendar) return null;
                
                const monthLabel = calendar.querySelector('.rdp-caption_label');
                const navButtons = calendar.querySelectorAll('.rdp-nav_button');
                const days = calendar.querySelectorAll('.rdp-day');
                const selectableDays = calendar.querySelectorAll('.rdp-day:not(.rdp-day_disabled)');
                
                return {
                    hasCalendar: !!calendar,
                    hasMonthLabel: !!monthLabel,
                    monthText: monthLabel ? monthLabel.textContent : null,
                    navButtonCount: navButtons.length,
                    totalDays: days.length,
                    selectableDays: selectableDays.length
                };
            });
            
            console.log('Calendar structure:', calendarStructure);
            
            if (calendarStructure && calendarStructure.hasCalendar && calendarStructure.selectableDays > 0) {
                console.log('✅ Test 6: Calendar structure is correct');
                testResults.push({ test: 'Calendar Structure', status: 'PASS', details: `Calendar has ${calendarStructure.selectableDays} selectable days` });
                
                // Test 7: Try to select a date
                console.log('🔍 Test 7: Attempting to select a date...');
                
                const selectableDay = await page.$('.desktop-datepicker-dropdown .rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)');
                if (selectableDay) {
                    await selectableDay.click();
                    console.log('👆 Clicked on a selectable day');
                    
                    await page.waitForTimeout(500);
                    
                    // Check if date was selected
                    const inputValueAfter = await page.$eval('#dateRange', el => el.value);
                    console.log('Input value after date selection:', inputValueAfter);
                    
                    if (inputValueAfter && inputValueAfter !== 'Select dates' && inputValueAfter.includes('Select checkout')) {
                        console.log('✅ Test 7: Date selection successful');
                        testResults.push({ test: 'Date Selection', status: 'PASS', details: `Selected date: ${inputValueAfter}` });
                        
                        // Take screenshot after selection
                        await page.screenshot({ 
                            path: `${screenshotDir}/03-after-date-selection.png`,
                            fullPage: false
                        });
                        
                    } else {
                        console.log('❌ Test 7: Date selection failed');
                        testResults.push({ test: 'Date Selection', status: 'FAIL', details: 'Input value did not change after clicking date' });
                    }
                } else {
                    console.log('❌ Test 7: No selectable days found');
                    testResults.push({ test: 'Date Selection', status: 'FAIL', details: 'No selectable days found in calendar' });
                }
            } else {
                console.log('❌ Test 6: Calendar structure is incomplete');
                testResults.push({ test: 'Calendar Structure', status: 'FAIL', details: 'Calendar missing required elements' });
            }
            
        } else {
            console.log('❌ Test 4: Date picker dropdown DID NOT appear after click');
            testResults.push({ test: 'Click Opens Dropdown', status: 'FAIL', details: 'Desktop dropdown did not open after clicking input' });
            
            // Debug: Check what happened
            console.log('🔍 Debugging: Checking page state after click...');
            
            const debugInfo = await page.evaluate(() => {
                const input = document.querySelector('#dateRange');
                const container = document.querySelector('.date-picker-container');
                const allDropdowns = document.querySelectorAll('[class*="dropdown"], [class*="datepicker"]');
                
                return {
                    inputExists: !!input,
                    containerExists: !!container,
                    inputValue: input ? input.value : null,
                    ariaExpanded: input ? input.getAttribute('aria-expanded') : null,
                    allDropdownClasses: Array.from(allDropdowns).map(el => el.className),
                    consoleErrors: window.console ? 'Check console for errors' : 'No console access'
                };
            });
            
            console.log('Debug info:', debugInfo);
            console.log('Console messages:', consoleMessages.slice(-10)); // Last 10 messages
            console.log('JavaScript errors:', errors);
        }
        
        // Test 8: Test mobile functionality (preservation test)
        console.log('🔍 Test 8: Testing mobile functionality preservation...');
        
        await page.setViewport({ width: 375, height: 667 });
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForTimeout(1000);
        
        const mobileInput = await page.$('#dateRange');
        if (mobileInput) {
            await mobileInput.click();
            await page.waitForTimeout(500);
            
            const mobileOverlay = await page.$('.fixed.inset-0.bg-white');
            const desktopDropdownOnMobile = await page.$('.desktop-datepicker-dropdown');
            
            if (mobileOverlay && !desktopDropdownOnMobile) {
                console.log('✅ Test 8: Mobile functionality preserved');
                testResults.push({ test: 'Mobile Preservation', status: 'PASS', details: 'Mobile shows overlay, not desktop dropdown' });
            } else {
                console.log('❌ Test 8: Mobile functionality may be broken');
                testResults.push({ test: 'Mobile Preservation', status: 'FAIL', details: 'Mobile does not show correct UI' });
            }
            
            // Take mobile screenshot
            await page.screenshot({ 
                path: `${screenshotDir}/04-mobile-state.png`,
                fullPage: false
            });
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        testResults.push({ test: 'Test Execution', status: 'ERROR', details: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Generate test report
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    
    const passCount = testResults.filter(r => r.status === 'PASS').length;
    const failCount = testResults.filter(r => r.status === 'FAIL').length;
    const warnCount = testResults.filter(r => r.status === 'WARNING').length;
    const errorCount = testResults.filter(r => r.status === 'ERROR').length;
    
    testResults.forEach((result, index) => {
        const statusEmoji = {
            'PASS': '✅',
            'FAIL': '❌',
            'WARNING': '⚠️',
            'ERROR': '💥'
        }[result.status];
        
        console.log(`${statusEmoji} ${result.test}: ${result.status}`);
        console.log(`   Details: ${result.details}`);
    });
    
    console.log(`\nSummary: ${passCount} passed, ${failCount} failed, ${warnCount} warnings, ${errorCount} errors`);
    console.log(`Screenshots saved to: ${screenshotDir}`);
    
    // Write detailed report
    const report = {
        timestamp: new Date().toISOString(),
        summary: { passed: passCount, failed: failCount, warnings: warnCount, errors: errorCount },
        tests: testResults,
        screenshots: [
            `${screenshotDir}/01-initial-state.png`,
            `${screenshotDir}/02-after-click.png`,
            `${screenshotDir}/03-after-date-selection.png`,
            `${screenshotDir}/04-mobile-state.png`
        ]
    };
    
    fs.writeFileSync('/tmp/date-picker-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📝 Detailed report saved to: /tmp/date-picker-test-report.json');
    
    return report;
}

// Run the test
if (require.main === module) {
    testDatePickerDesktop()
        .then((report) => {
            const criticalIssue = report.tests.find(t => t.test === 'Click Opens Dropdown');
            if (criticalIssue && criticalIssue.status === 'FAIL') {
                console.log('\n🚨 CRITICAL ISSUE CONFIRMED: Date picker does not open on desktop!');
                process.exit(1);
            } else if (criticalIssue && criticalIssue.status === 'PASS') {
                console.log('\n🎉 Desktop date picker is working correctly!');
                process.exit(0);
            }
        })
        .catch((error) => {
            console.error('Test runner failed:', error);
            process.exit(1);
        });
}

module.exports = { testDatePickerDesktop };