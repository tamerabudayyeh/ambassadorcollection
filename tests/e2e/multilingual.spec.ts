import { test, expect, Page } from '@playwright/test';

test.describe('Multilingual and RTL Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Language switching functionality', async () => {
    // Check if language selector exists
    const languageSelector = page.locator('[data-testid="language-selector"]');
    
    if (await languageSelector.isVisible()) {
      // Test English
      await languageSelector.click();
      const englishOption = page.locator('[data-testid="lang-en"]');
      if (await englishOption.isVisible()) {
        await englishOption.click();
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      }

      // Test Hebrew
      await languageSelector.click();
      const hebrewOption = page.locator('[data-testid="lang-he"]');
      if (await hebrewOption.isVisible()) {
        await hebrewOption.click();
        await expect(page.locator('html')).toHaveAttribute('lang', 'he');
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      }

      // Test Arabic
      await languageSelector.click();
      const arabicOption = page.locator('[data-testid="lang-ar"]');
      if (await arabicOption.isVisible()) {
        await arabicOption.click();
        await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      }
    } else {
      test.skip('Language selector not implemented');
    }
  });

  test('RTL layout verification for Hebrew', async () => {
    // Try to switch to Hebrew if language selector exists
    const languageSelector = page.locator('[data-testid="language-selector"]');
    
    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      const hebrewOption = page.locator('[data-testid="lang-he"]');
      if (await hebrewOption.isVisible()) {
        await hebrewOption.click();
        
        // Verify RTL styles
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        
        // Check navigation alignment
        const navigation = page.locator('nav');
        if (await navigation.isVisible()) {
          const computedStyle = await navigation.evaluate(el => getComputedStyle(el).direction);
          expect(computedStyle).toBe('rtl');
        }
        
        // Test text alignment in content areas
        const contentAreas = page.locator('[data-testid*="content"]');
        const count = await contentAreas.count();
        for (let i = 0; i < Math.min(count, 3); i++) {
          const element = contentAreas.nth(i);
          const textAlign = await element.evaluate(el => getComputedStyle(el).textAlign);
          expect(['right', 'start']).toContain(textAlign);
        }
      }
    } else {
      test.skip('Language selector not implemented');
    }
  });

  test('RTL layout verification for Arabic', async () => {
    const languageSelector = page.locator('[data-testid="language-selector"]');
    
    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      const arabicOption = page.locator('[data-testid="lang-ar"]');
      if (await arabicOption.isVisible()) {
        await arabicOption.click();
        
        // Verify RTL styles
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        
        // Check form inputs align correctly
        const inputs = page.locator('input[type="text"], input[type="email"]');
        const count = await inputs.count();
        for (let i = 0; i < Math.min(count, 3); i++) {
          const input = inputs.nth(i);
          const direction = await input.evaluate(el => getComputedStyle(el).direction);
          expect(direction).toBe('rtl');
        }
      }
    } else {
      test.skip('Language selector not implemented');
    }
  });

  test('Currency formatting in different locales', async () => {
    // Test USD (default)
    await page.goto('/booking');
    const priceElements = page.locator('[data-testid*="price"]');
    
    if (await priceElements.count() > 0) {
      const usdPrice = await priceElements.first().textContent();
      expect(usdPrice).toMatch(/\$[\d,]+/); // Should contain dollar sign
      
      // Test Hebrew locale (if implemented)
      const languageSelector = page.locator('[data-testid="language-selector"]');
      if (await languageSelector.isVisible()) {
        await languageSelector.click();
        const hebrewOption = page.locator('[data-testid="lang-he"]');
        if (await hebrewOption.isVisible()) {
          await hebrewOption.click();
          
          // Check if currency changes to ILS
          const ilsPrice = await priceElements.first().textContent();
          // Should show ILS or ₪ symbol
          expect(ilsPrice).toMatch(/(ILS|₪|שח)/);
        }
      }
    } else {
      test.skip('Price elements not found');
    }
  });

  test('VAT exemption notice for Israeli guests', async () => {
    // Switch to Hebrew if available
    const languageSelector = page.locator('[data-testid="language-selector"]');
    
    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      const hebrewOption = page.locator('[data-testid="lang-he"]');
      if (await hebrewOption.isVisible()) {
        await hebrewOption.click();
        
        // Look for VAT exemption text
        const vatNotice = page.locator('[data-testid="vat-exemption"]');
        if (await vatNotice.isVisible()) {
          const noticeText = await vatNotice.textContent();
          expect(noticeText).toMatch(/(VAT|מע"מ|ללא מע"מ)/);
        }
      }
    }
    
    // Also check on booking pages
    await page.goto('/booking/results');
    const taxInfo = page.locator('[data-testid="tax-info"]');
    if (await taxInfo.isVisible()) {
      const taxText = await taxInfo.textContent();
      // Should mention taxes or exemptions
      expect(taxText).toMatch(/(tax|VAT|excluding|including)/i);
    }
  });

  test('Multilingual content persistence across navigation', async () => {
    const languageSelector = page.locator('[data-testid="language-selector"]');
    
    if (await languageSelector.isVisible()) {
      // Switch to Hebrew
      await languageSelector.click();
      const hebrewOption = page.locator('[data-testid="lang-he"]');
      if (await hebrewOption.isVisible()) {
        await hebrewOption.click();
        
        // Navigate to different pages
        await page.goto('/hotels');
        await expect(page.locator('html')).toHaveAttribute('lang', 'he');
        
        await page.goto('/booking');
        await expect(page.locator('html')).toHaveAttribute('lang', 'he');
        
        await page.goto('/about');
        await expect(page.locator('html')).toHaveAttribute('lang', 'he');
      }
    } else {
      test.skip('Language selector not implemented');
    }
  });

  test('Form validation messages in different languages', async () => {
    await page.goto('/booking/guest-info');
    
    // Try to submit empty form
    const submitButton = page.locator('[data-testid="submit-button"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Check for English validation messages
      const errorMessages = page.locator('[data-testid="error-message"]');
      if (await errorMessages.count() > 0) {
        const englishError = await errorMessages.first().textContent();
        expect(englishError).toMatch(/required|invalid|error/i);
        
        // Switch to Hebrew and test
        const languageSelector = page.locator('[data-testid="language-selector"]');
        if (await languageSelector.isVisible()) {
          await languageSelector.click();
          const hebrewOption = page.locator('[data-testid="lang-he"]');
          if (await hebrewOption.isVisible()) {
            await hebrewOption.click();
            await submitButton.click();
            
            const hebrewError = await errorMessages.first().textContent();
            expect(hebrewError).not.toBe(englishError); // Should be different
          }
        }
      }
    }
  });
});