import { test, expect, Page } from '@playwright/test';

test.describe('Basic Performance Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Homepage performance metrics', async () => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Homepage load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
    
    // Check basic performance metrics
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
    
    // Basic performance expectations
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);
    expect(performanceMetrics.totalLoadTime).toBeLessThan(5000);
    if (performanceMetrics.firstContentfulPaint) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(3000);
    }
  });

  test('Booking page performance', async () => {
    const startTime = Date.now();
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Booking page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('Resource loading analysis', async () => {
    const resources: Array<{ url: string; size?: number; type: string; status: number }> = [];
    
    page.on('response', async response => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      const contentLength = response.headers()['content-length'];
      
      resources.push({
        url: url.split('?')[0], // Remove query params for cleaner output
        size: contentLength ? parseInt(contentLength) : undefined,
        type: contentType.split(';')[0], // Remove charset etc
        status: response.status()
      });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Analyze resources
    const images = resources.filter(r => r.type.startsWith('image/'));
    const scripts = resources.filter(r => r.type.includes('javascript'));
    const styles = resources.filter(r => r.type.includes('css'));
    const failed = resources.filter(r => r.status >= 400);
    
    console.log(`Loaded ${resources.length} resources:`);
    console.log(`- Images: ${images.length}`);
    console.log(`- Scripts: ${scripts.length}`);
    console.log(`- Stylesheets: ${styles.length}`);
    console.log(`- Failed: ${failed.length}`);
    
    // Check for large resources
    const largeResources = resources.filter(r => r.size && r.size > 1024 * 1024); // > 1MB
    if (largeResources.length > 0) {
      console.log('Large resources (>1MB):');
      largeResources.forEach(r => {
        console.log(`  ${Math.round((r.size || 0) / 1024 / 1024)}MB - ${r.url}`);
      });
    }
    
    // Should not have too many failed resources
    expect(failed.length).toBeLessThan(5);
  });
});