import { test, expect, Page } from '@playwright/test';

test.describe('Broken Links and Assets Verification', () => {
  let page: Page;
  const brokenLinks: string[] = [];
  const brokenImages: string[] = [];
  const slowResources: { url: string; time: number }[] = [];

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Monitor all responses for broken resources
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      if (status >= 400) {
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          brokenImages.push(`${status} - ${url}`);
        } else {
          brokenLinks.push(`${status} - ${url}`);
        }
      }
    });
  });

  test.afterEach(async () => {
    await page.close();
    
    // Report findings
    if (brokenLinks.length > 0) {
      console.log('Broken Links Found:', brokenLinks);
    }
    if (brokenImages.length > 0) {
      console.log('Broken Images Found:', brokenImages);
    }
    if (slowResources.length > 0) {
      console.log('Slow Resources (>3s):', slowResources);
    }
  });

  test('Homepage links verification', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all links on the page
    const links = await page.locator('a[href]').all();
    const linkUrls = new Set<string>();
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        linkUrls.add(href);
      }
    }
    
    console.log(`Found ${linkUrls.size} unique links on homepage`);
    
    // Test internal links
    for (const url of linkUrls) {
      if (url.startsWith('/') || url.includes('localhost:3000')) {
        try {
          const startTime = Date.now();
          const response = await page.request.get(url);
          const loadTime = Date.now() - startTime;
          
          if (loadTime > 3000) {
            slowResources.push({ url, time: loadTime });
          }
          
          expect(response.status()).toBeLessThan(400);
        } catch (error) {
          brokenLinks.push(`ERROR - ${url}: ${error}`);
        }
      }
    }
    
    expect(brokenLinks.filter(link => link.includes('localhost:3000'))).toEqual([]);
  });

  test('Navigation menu links', async () => {
    await page.goto('/');
    
    // Find navigation menu
    const navMenu = page.locator('nav, [role="navigation"]').first();
    if (await navMenu.isVisible()) {
      const navLinks = await navMenu.locator('a[href]').all();
      
      for (const link of navLinks) {
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        if (href && href.startsWith('/')) {
          console.log(`Testing nav link: ${text?.trim()} -> ${href}`);
          
          try {
            const response = await page.request.get(href);
            expect(response.status()).toBeLessThan(400);
          } catch (error) {
            brokenLinks.push(`NAV LINK ERROR - ${href}: ${error}`);
          }
        }
      }
    }
  });

  test('Footer links verification', async () => {
    await page.goto('/');
    
    // Find footer
    const footer = page.locator('footer').first();
    if (await footer.isVisible()) {
      const footerLinks = await footer.locator('a[href]').all();
      
      for (const link of footerLinks) {
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        if (href && href.startsWith('/')) {
          console.log(`Testing footer link: ${text?.trim()} -> ${href}`);
          
          try {
            const response = await page.request.get(href);
            expect(response.status()).toBeLessThan(400);
          } catch (error) {
            brokenLinks.push(`FOOTER LINK ERROR - ${href}: ${error}`);
          }
        }
      }
    }
  });

  test('Images loading verification', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = await page.locator('img[src]').all();
    console.log(`Found ${images.length} images on homepage`);
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      
      if (src && !src.startsWith('data:')) {
        // Check if image loads
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);
        
        if (naturalWidth === 0 || naturalHeight === 0) {
          brokenImages.push(`FAILED TO LOAD - ${src}`);
        }
        
        // Check alt text
        if (!alt) {
          console.log(`Image missing alt text: ${src}`);
        }
      }
    }
    
    expect(brokenImages).toEqual([]);
  });

  test('Hotel pages links verification', async () => {
    await page.goto('/hotels');
    await page.waitForLoadState('networkidle');
    
    // Get hotel detail page links
    const hotelLinks = await page.locator('a[href*="/hotels/"]').all();
    const hotelUrls = new Set<string>();
    
    for (const link of hotelLinks) {
      const href = await link.getAttribute('href');
      if (href) {
        hotelUrls.add(href);
      }
    }
    
    // Test each hotel page
    for (const url of hotelUrls) {
      try {
        const response = await page.request.get(url);
        expect(response.status()).toBeLessThan(400);
        console.log(`Hotel page OK: ${url}`);
      } catch (error) {
        brokenLinks.push(`HOTEL PAGE ERROR - ${url}: ${error}`);
      }
    }
  });

  test('Booking flow pages accessibility', async () => {
    const bookingPages = [
      '/booking',
      '/booking/results',
      '/booking/guest-info',
      '/booking/payment',
      '/booking/confirmation',
      '/manage-booking'
    ];
    
    for (const pageUrl of bookingPages) {
      try {
        const response = await page.request.get(pageUrl);
        const status = response.status();
        
        console.log(`${pageUrl}: ${status}`);
        
        // 404 is acceptable for some dynamic pages, but 500 errors are not
        if (status >= 500) {
          brokenLinks.push(`SERVER ERROR - ${pageUrl}: ${status}`);
        }
      } catch (error) {
        brokenLinks.push(`BOOKING PAGE ERROR - ${pageUrl}: ${error}`);
      }
    }
  });

  test('API endpoints verification', async () => {
    const apiEndpoints = [
      '/api/booking/availability',
      '/api/booking/create',
      '/api/booking/lookup',
      '/api/hotels'
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        // Test with GET request (some endpoints may require POST)
        const response = await page.request.get(endpoint);
        const status = response.status();
        
        console.log(`API ${endpoint}: ${status}`);
        
        // API endpoints might return 405 (Method Not Allowed) for GET on POST endpoints
        // But should not return 500 server errors
        if (status >= 500) {
          brokenLinks.push(`API ERROR - ${endpoint}: ${status}`);
        }
      } catch (error) {
        brokenLinks.push(`API ENDPOINT ERROR - ${endpoint}: ${error}`);
      }
    }
  });

  test('External resource loading', async () => {
    await page.goto('/');
    
    const externalResources: { url: string; status: number; type: string }[] = [];
    
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      // Check for external resources (CDNs, fonts, etc.)
      if (!url.includes('localhost:3000') && !url.startsWith('data:')) {
        const type = response.headers()['content-type'] || 'unknown';
        externalResources.push({ url, status, type });
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    console.log('External resources loaded:');
    externalResources.forEach(resource => {
      console.log(`  ${resource.status} - ${resource.type} - ${resource.url}`);
      
      if (resource.status >= 400) {
        brokenLinks.push(`EXTERNAL RESOURCE ERROR - ${resource.url}: ${resource.status}`);
      }
    });
  });

  test('Sitemap links verification', async () => {
    try {
      const sitemapResponse = await page.request.get('/sitemap.xml');
      
      if (sitemapResponse.ok()) {
        const sitemapContent = await sitemapResponse.text();
        
        // Extract URLs from sitemap
        const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
        
        if (urlMatches) {
          console.log(`Found ${urlMatches.length} URLs in sitemap`);
          
          for (const match of urlMatches.slice(0, 10)) { // Test first 10 URLs
            const url = match.replace(/<\/?loc>/g, '');
            
            try {
              const response = await page.request.get(url);
              expect(response.status()).toBeLessThan(400);
            } catch (error) {
              brokenLinks.push(`SITEMAP URL ERROR - ${url}: ${error}`);
            }
          }
        }
      }
    } catch (error) {
      console.log('Sitemap not accessible or not found');
    }
  });

  test('Resource size optimization check', async () => {
    const largeResources: { url: string; size: number; type: string }[] = [];
    
    page.on('response', async response => {
      const url = response.url();
      const contentLength = response.headers()['content-length'];
      const contentType = response.headers()['content-type'] || '';
      
      if (contentLength) {
        const size = parseInt(contentLength);
        
        // Flag large resources
        if (size > 1024 * 1024) { // > 1MB
          largeResources.push({
            url: url.split('?')[0], // Remove query params
            size,
            type: contentType
          });
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    if (largeResources.length > 0) {
      console.log('Large resources detected (>1MB):');
      largeResources.forEach(resource => {
        console.log(`  ${Math.round(resource.size / 1024 / 1024)}MB - ${resource.type} - ${resource.url}`);
      });
    }
  });
});