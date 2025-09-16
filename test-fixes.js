/**
 * Test the date picker fixes
 */

const puppeteer = require('puppeteer');

async function testDatePickerFixes() {
    console.log('🧪 Testing Date Picker Fixes...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1440, height: 900 },
        devtools: false
    });
    
    const page = await browser.newPage();
    
    // Listen to console logs from the page
    page.on('console', (msg) => {
        if (msg.text().includes('DatePicker')) {
            console.log(`🖥️  Page Console: ${msg.text()}`);
        }
    });
    
    try {
        console.log('📍 Opening booking page...');
        await page.goto('http://localhost:3002/booking', { waitUntil: 'networkidle2' });
        
        console.log('🔍 Looking for date picker...');
        await page.waitForSelector('[data-testid="date-range-picker"]', { timeout: 5000 });
        
        console.log('✅ Date picker found!');
        
        // Check initial state
        const initialDropdown = await page.$('[data-testid="desktop-datepicker-dropdown"]');
        console.log(`📋 Initial state - Dropdown visible: ${initialDropdown ? 'YES' : 'NO'}`);
        
        // Click the input
        console.log('👆 Clicking date picker input...');
        await page.click('#dateRange');
        
        // Wait a bit for the dropdown to appear
        await page.waitForTimeout(1000);
        
        // Check if dropdown appeared
        const dropdownAfterClick = await page.$('[data-testid="desktop-datepicker-dropdown"]');
        console.log(`📋 After click - Dropdown visible: ${dropdownAfterClick ? 'YES' : 'NO'}`);
        
        if (dropdownAfterClick) {
            console.log('🎉 SUCCESS! Desktop date picker opens on click!');
            
            // Test date selection
            console.log('🔍 Testing date selection...');
            const firstSelectableDay = await page.$('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)');
            
            if (firstSelectableDay) {
                await firstSelectableDay.click();
                await page.waitForTimeout(500);
                
                const inputValue = await page.$eval('#dateRange', el => el.value);
                console.log(`📅 Input value after selection: ${inputValue}`);
                
                if (inputValue && inputValue !== 'Select dates') {
                    console.log('✅ Date selection works!');
                } else {
                    console.log('❌ Date selection failed');
                }
            }
        } else {
            console.log('❌ FAILED: Desktop date picker still not opening');
            
            // Debug information
            const debugInfo = await page.evaluate(() => {
                const container = document.querySelector('[data-testid="date-range-picker"]');
                const input = document.querySelector('#dateRange');
                
                return {
                    containerExists: !!container,
                    inputExists: !!input,
                    inputValue: input ? input.value : null,
                    windowWidth: window.innerWidth,
                    allDropdowns: Array.from(document.querySelectorAll('[class*="dropdown"]')).map(el => ({
                        className: el.className,
                        isVisible: el.offsetHeight > 0 && el.offsetWidth > 0
                    }))
                };
            });
            
            console.log('🐛 Debug Info:', JSON.stringify(debugInfo, null, 2));
        }
        
        // Test mobile preservation
        console.log('📱 Testing mobile preservation...');
        await page.setViewport({ width: 375, height: 667 });
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForTimeout(1000);
        
        await page.click('#dateRange');
        await page.waitForTimeout(500);
        
        const mobileOverlay = await page.$('.fixed.inset-0.bg-white');
        const desktopDropdownOnMobile = await page.$('[data-testid="desktop-datepicker-dropdown"]');
        
        if (mobileOverlay && !desktopDropdownOnMobile) {
            console.log('✅ Mobile functionality preserved');
        } else {
            console.log('⚠️  Mobile functionality may be affected');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        console.log('\n🏁 Test complete. Keeping browser open for manual inspection...');
        console.log('Press Ctrl+C when done reviewing.');
        
        // Keep the browser open for manual review
        await new Promise(resolve => {
            process.on('SIGINT', () => {
                browser.close();
                resolve();
                process.exit(0);
            });
        });
    }
}

testDatePickerFixes().catch(console.error);