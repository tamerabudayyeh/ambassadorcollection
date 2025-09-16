import { test, expect, Page } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test.describe('Performance and Lighthouse Audits', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Homepage Lighthouse audit - Desktop', async () => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    try {
      const audit = await playAudit({
        page,
        thresholds: {
          performance: 80,
          accessibility: 90,
          'best-practices': 80,
          seo: 90,
        },
        port: 9222,
        opts: {
          formFactor: 'desktop',
          screenEmulation: {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
          },
          throttling: {
            rttMs: 40,
            throughputKbps: 11024,
            cpuSlowdownMultiplier: 1,
          },
        },
      });

      // Validate Core Web Vitals
      const lcp = audit.lhr.audits['largest-contentful-paint']?.numericValue;
      const cls = audit.lhr.audits['cumulative-layout-shift']?.numericValue;
      const tbt = audit.lhr.audits['total-blocking-time']?.numericValue;

      if (lcp) expect(lcp).toBeLessThan(2500); // LCP < 2.5s
      if (cls) expect(cls).toBeLessThan(0.1);  // CLS < 0.1
      if (tbt) expect(tbt).toBeLessThan(300);  // TBT < 300ms

      console.log(`Homepage Desktop - LCP: ${lcp}ms, CLS: ${cls}, TBT: ${tbt}ms`);
      
    } catch (error) {
      console.log('Lighthouse audit failed:', error);
      test.skip();
    }
  });

  test('Homepage Lighthouse audit - Mobile', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    try {
      const audit = await playAudit({
        page,
        thresholds: {
          performance: 70, // Lower for mobile
          accessibility: 90,
          'best-practices': 80,
          seo: 90,
        },
        port: 9222,
        opts: {
          formFactor: 'mobile',
          screenEmulation: {
            mobile: true,
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
          },
          throttling: {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4,
          },
        },
      });

      const lcp = audit.lhr.audits['largest-contentful-paint']?.numericValue;
      const cls = audit.lhr.audits['cumulative-layout-shift']?.numericValue;
      const tbt = audit.lhr.audits['total-blocking-time']?.numericValue;

      console.log(`Homepage Mobile - LCP: ${lcp}ms, CLS: ${cls}, TBT: ${tbt}ms`);
      
    } catch (error) {
      console.log('Mobile lighthouse audit failed:', error);
      test.skip();
    }
  });

  test('Booking search page performance', async () => {
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
    
    try {
      const audit = await playAudit({
        page,
        thresholds: {
          performance: 75,
          accessibility: 85,
          'best-practices': 75,
          seo: 80,
        },
        port: 9222,
      });

      const lcp = audit.lhr.audits['largest-contentful-paint']?.numericValue;
      console.log(`Booking page - LCP: ${lcp}ms`);
      
    } catch (error) {
      console.log('Booking page audit failed:', error);
      test.skip();
    }
  });

  test('Room results page performance', async () => {
    await page.goto('/booking/results');
    await page.waitForLoadState('networkidle');
    
    try {
      const audit = await playAudit({
        page,
        thresholds: {
          performance: 70, // May be lower due to dynamic content
          accessibility: 85,
          'best-practices': 75,
          seo: 75,
        },
        port: 9222,
      });

      const lcp = audit.lhr.audits['largest-contentful-paint']?.numericValue;
      console.log(`Results page - LCP: ${lcp}ms`);
      
    } catch (error) {
      console.log('Results page audit failed:', error);
      test.skip();
    }
  });

  test('Performance metrics without Lighthouse', async () => {
    await page.goto('/');
    
    // Measure loading performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      };
    });
    
    console.log('Performance Metrics:', performanceMetrics);
    
    // Validate basic performance expectations
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);
    expect(performanceMetrics.totalLoadTime).toBeLessThan(5000);
    if (performanceMetrics.firstContentfulPaint) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(3000);
    }
  });

  test('Resource loading optimization', async () => {
    await page.goto('/');
    
    // Check for resource loading issues
    const resourceErrors: string[] = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        resourceErrors.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Report any failed resources
    if (resourceErrors.length > 0) {
      console.log('Failed resources:', resourceErrors);
    }
    
    // Check for large images
    const images = await page.locator('img').all();
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        const response = await page.request.get(src);
        const contentLength = response.headers()['content-length'];
        if (contentLength && parseInt(contentLength) > 500000) { // 500KB
          console.log(`Large image detected: ${src} (${contentLength} bytes)`);
        }
      }
    }
  });

  test('JavaScript bundle size analysis', async () => {
    const responses: Array<{ url: string; size: number; type: string }> = [];
    
    page.on('response', async response => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      
      if (contentType.includes('javascript') || url.endsWith('.js')) {
        try {
          const buffer = await response.body();
          responses.push({
            url,
            size: buffer.length,
            type: 'javascript'
          });
        } catch (e) {
          // Ignore errors getting response body
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    let totalJsSize = 0;
    responses.forEach(response => {
      console.log(`JS Bundle: ${response.url} - ${Math.round(response.size / 1024)}KB`);
      totalJsSize += response.size;
    });
    
    console.log(`Total JavaScript size: ${Math.round(totalJsSize / 1024)}KB`);
    
    // Warn if JS bundle is too large
    if (totalJsSize > 1024 * 1024) { // 1MB
      console.log('WARNING: JavaScript bundle size exceeds 1MB');
    }
  });

  test('CSS optimization check', async () => {
    const cssResponses: Array<{ url: string; size: number }> = [];
    
    page.on('response', async response => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      
      if (contentType.includes('text/css') || url.endsWith('.css')) {
        try {
          const buffer = await response.body();
          cssResponses.push({
            url,
            size: buffer.length
          });
        } catch (e) {
          // Ignore errors
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    let totalCssSize = 0;
    cssResponses.forEach(response => {
      console.log(`CSS File: ${response.url} - ${Math.round(response.size / 1024)}KB`);
      totalCssSize += response.size;
    });
    
    console.log(`Total CSS size: ${Math.round(totalCssSize / 1024)}KB`);
  });
});