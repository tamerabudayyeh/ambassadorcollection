import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests with axe-core', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Homepage accessibility scan', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    // Report violations
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Homepage Accessibility Violations:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   Elements: ${violation.nodes.length}`);
        console.log('');
      });
    }
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Booking search page accessibility', async () => {
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Booking Page Accessibility Violations:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
      });
    }
    
    // Allow some violations for dynamic content but flag critical ones
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations).toEqual([]);
  });

  test('Room results page accessibility', async () => {
    await page.goto('/booking/results');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Results Page Accessibility Violations:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
      });
    }
    
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations).toEqual([]);
  });

  test('Guest information form accessibility', async () => {
    await page.goto('/booking/guest-info');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Guest Info Page Accessibility Violations:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
      });
    }
    
    // Forms should have high accessibility standards
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Manage booking page accessibility', async () => {
    await page.goto('/manage-booking');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Manage Booking Page Accessibility Violations:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
      });
    }
    
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations).toEqual([]);
  });

  test('Keyboard navigation test', async () => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through interactive elements
    const interactiveElements = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? {
          tagName: el.tagName,
          type: el.getAttribute('type'),
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          id: el.id,
          className: el.className
        } : null;
      });
      
      if (currentFocus) {
        interactiveElements.push(currentFocus);
      }
    }
    
    console.log('Keyboard navigation path:', interactiveElements);
    
    // Should be able to navigate to at least some interactive elements
    expect(interactiveElements.length).toBeGreaterThan(0);
  });

  test('Color contrast verification', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    if (contrastViolations.length > 0) {
      console.log('Color Contrast Violations:');
      contrastViolations.forEach(violation => {
        violation.nodes.forEach(node => {
          console.log(`- Element: ${node.target.join(' ')}`);
          console.log(`  Colors: ${node.any[0]?.data?.fgColor} on ${node.any[0]?.data?.bgColor}`);
          console.log(`  Contrast Ratio: ${node.any[0]?.data?.contrastRatio}`);
        });
      });
    }
    
    expect(contrastViolations).toEqual([]);
  });

  test('Screen reader compatibility', async () => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = [];
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName);
      const text = await heading.textContent();
      headingLevels.push({
        level: parseInt(tagName.charAt(1)),
        text: text?.trim() || ''
      });
    }
    
    console.log('Heading structure:', headingLevels);
    
    // Should have at least one h1
    const h1Count = headingLevels.filter(h => h.level === 1).length;
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1); // Should have only one h1
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    const imagesWithoutAlt = [];
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      
      if (!alt && src && !src.startsWith('data:')) {
        imagesWithoutAlt.push(src);
      }
    }
    
    if (imagesWithoutAlt.length > 0) {
      console.log('Images without alt text:', imagesWithoutAlt);
    }
    
    // Decorative images can have empty alt, but should have the attribute
    const imagesWithoutAltAttribute = [];
    for (const img of images) {
      const hasAltAttribute = await img.evaluate(el => el.hasAttribute('alt'));
      if (!hasAltAttribute) {
        const src = await img.getAttribute('src');
        imagesWithoutAltAttribute.push(src);
      }
    }
    
    expect(imagesWithoutAltAttribute).toEqual([]);
  });

  test('Form accessibility validation', async () => {
    await page.goto('/booking/guest-info');
    
    // Check form labels
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="tel"], select, textarea').all();
    const inputsWithoutLabels = [];
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      let hasLabel = false;
      
      // Check for associated label
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        if (label > 0) hasLabel = true;
      }
      
      // Check for aria-label or aria-labelledby
      if (ariaLabel || ariaLabelledBy) hasLabel = true;
      
      if (!hasLabel) {
        const name = await input.getAttribute('name');
        const placeholder = await input.getAttribute('placeholder');
        inputsWithoutLabels.push({ name, placeholder });
      }
    }
    
    if (inputsWithoutLabels.length > 0) {
      console.log('Form inputs without proper labels:', inputsWithoutLabels);
    }
    
    expect(inputsWithoutLabels).toEqual([]);
  });

  test('ARIA landmarks and roles', async () => {
    await page.goto('/');
    
    // Check for main landmarks
    const landmarks = await page.evaluate(() => {
      const elements = document.querySelectorAll('[role], main, nav, header, footer, aside, section');
      return Array.from(elements).map(el => ({
        tagName: el.tagName,
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        id: el.id
      }));
    });
    
    console.log('ARIA landmarks found:', landmarks);
    
    // Should have navigation landmark
    const hasNavLandmark = landmarks.some(l => 
      l.role === 'navigation' || l.tagName === 'NAV'
    );
    expect(hasNavLandmark).toBe(true);
    
    // Should have main content landmark
    const hasMainLandmark = landmarks.some(l => 
      l.role === 'main' || l.tagName === 'MAIN'
    );
    expect(hasMainLandmark).toBe(true);
  });
});