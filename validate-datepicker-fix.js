#!/usr/bin/env node

/**
 * Desktop Date Picker Validation Script
 * Validates that the fixes implemented for desktop date picker functionality are working
 * This script checks the component code for the specific fixes mentioned in the test report
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Desktop Date Picker Fixes...\n');

// Read the DateRangePicker component
const datePickerPath = path.join(__dirname, 'components/booking/DateRangePicker.tsx');

if (!fs.existsSync(datePickerPath)) {
  console.error('❌ DateRangePicker.tsx not found at expected path');
  process.exit(1);
}

const datePickerContent = fs.readFileSync(datePickerPath, 'utf8');

console.log('📁 Reading DateRangePicker component...\n');

// Validation checks based on the test report fixes

const validations = {
  'Fix 1: Conditional Focus Blur': {
    description: 'Check if onFocus only blurs on mobile (window.innerWidth < 768)',
    pattern: /onFocus=\{[^}]*window\.innerWidth\s*<\s*768[^}]*\}/s,
    found: false
  },
  
  'Fix 2: Improved Click Handler': {
    description: 'Check if handleInputClick uses stopPropagation() but not preventDefault()',
    pattern: /handleInputClick[^}]*e\.stopPropagation\(\)[^}]*(?!.*e\.preventDefault\(\))/s,
    found: false
  },
  
  'Fix 3: Explicit CSS Visibility': {
    description: 'Check if desktop dropdown has explicit visibility styles',
    pattern: /style=\{[^}]*visibility:\s*['"']visible['"'][^}]*\}/s,
    found: false
  },
  
  'Fix 4: Test Identifiers': {
    description: 'Check if data-testid attributes are present',
    pattern: /data-testid=["']desktop-datepicker-dropdown["']/,
    found: false
  }
};

// Perform validations
console.log('🔧 Performing validation checks:\n');

Object.keys(validations).forEach(fixName => {
  const validation = validations[fixName];
  validation.found = validation.pattern.test(datePickerContent);
  
  const status = validation.found ? '✅' : '❌';
  console.log(`${status} ${fixName}`);
  console.log(`   ${validation.description}`);
  console.log(`   Found: ${validation.found ? 'YES' : 'NO'}\n`);
});

// Additional specific code checks
console.log('🔍 Detailed Code Analysis:\n');

// Check for conditional focus blur
const focusBlurMatch = datePickerContent.match(/onFocus=\{[^}]*\}/s);
if (focusBlurMatch) {
  console.log('📋 Focus Event Handler:');
  console.log(focusBlurMatch[0].replace(/\s+/g, ' '));
  
  if (focusBlurMatch[0].includes('window.innerWidth < 768')) {
    console.log('✅ Conditional mobile blur is implemented\n');
  } else {
    console.log('❌ Conditional mobile blur is NOT implemented\n');
  }
}

// Check for click handler
const clickHandlerMatch = datePickerContent.match(/const handleInputClick = useCallback\([^}]+\}, \[[^\]]*\]\);/s);
if (clickHandlerMatch) {
  console.log('📋 Click Handler:');
  console.log(clickHandlerMatch[0].substring(0, 200) + '...');
  
  const clickHandler = clickHandlerMatch[0];
  if (clickHandler.includes('stopPropagation') && !clickHandler.includes('preventDefault')) {
    console.log('✅ Click handler uses stopPropagation without preventDefault\n');
  } else if (clickHandler.includes('preventDefault')) {
    console.log('❌ Click handler still uses preventDefault\n');
  } else {
    console.log('❌ Click handler does not use stopPropagation\n');
  }
}

// Check for desktop dropdown styles
const desktopDropdownMatch = datePickerContent.match(/desktop-datepicker-dropdown[^>]*style=\{[^}]*\}/s);
if (desktopDropdownMatch) {
  console.log('📋 Desktop Dropdown Styles:');
  console.log(desktopDropdownMatch[0]);
  
  if (desktopDropdownMatch[0].includes('visibility:') && desktopDropdownMatch[0].includes('opacity:')) {
    console.log('✅ Explicit visibility styles are present\n');
  } else {
    console.log('❌ Explicit visibility styles are missing\n');
  }
}

// Summary
const passedValidations = Object.values(validations).filter(v => v.found).length;
const totalValidations = Object.keys(validations).length;

console.log('📊 VALIDATION SUMMARY:\n');
console.log(`Passed: ${passedValidations}/${totalValidations} validations`);

if (passedValidations === totalValidations) {
  console.log('🎉 All fixes have been successfully implemented!');
  console.log('   The desktop date picker should now be functional.');
  console.log('   Manual testing is recommended to confirm behavior.');
} else {
  console.log(`⚠️  ${totalValidations - passedValidations} validation(s) failed.`);
  console.log('   Some fixes may not be properly implemented.');
  console.log('   Review the component code and implement missing fixes.');
}

console.log('\n🔗 Next Steps:');
console.log('1. Run the development server: npm run dev');
console.log('2. Open http://localhost:3000/booking in a desktop browser');
console.log('3. Click on "Select dates" input field');
console.log('4. Verify the date picker dropdown opens properly');
console.log('5. Test date selection functionality');

process.exit(passedValidations === totalValidations ? 0 : 1);