import { test, expect, Page } from '@playwright/test';

test.describe('SEO and Schema Validation Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Homepage meta tags and basic SEO', async () => {
    await page.goto('/');
    
    // Check title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(60);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content');
    const description = await metaDescription.getAttribute('content');
    expect(description?.length).toBeGreaterThan(50);
    expect(description?.length).toBeLessThan(160);
    
    // Check canonical URL
    const canonical = page.locator('link[rel="canonical"]');
    if (await canonical.count() > 0) {
      await expect(canonical).toHaveAttribute('href');
    }
    
    // Check viewport meta
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
    
    // Check robots meta
    const robots = page.locator('meta[name="robots"]');
    if (await robots.count() > 0) {
      const robotsContent = await robots.getAttribute('content');
      expect(robotsContent).toMatch(/(index|noindex)/);
    }
  });

  test('Hotel page structured data validation', async () => {
    await page.goto('/hotels');
    
    // Look for JSON-LD structured data
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const scriptCount = await jsonLdScripts.count();
    
    if (scriptCount > 0) {
      for (let i = 0; i < scriptCount; i++) {
        const script = jsonLdScripts.nth(i);
        const content = await script.textContent();
        
        // Validate JSON structure
        let jsonData;
        try {
          jsonData = JSON.parse(content || '');
        } catch (e) {
          throw new Error(`Invalid JSON-LD at index ${i}: ${e}`);
        }
        
        // Check for Hotel schema
        if (jsonData['@type'] === 'Hotel' || jsonData['@type'] === 'LodgingBusiness') {
          expect(jsonData).toHaveProperty('@context', 'https://schema.org');
          expect(jsonData).toHaveProperty('name');
          expect(jsonData).toHaveProperty('address');
          expect(jsonData).toHaveProperty('telephone');
          
          // Validate address structure
          if (jsonData.address) {
            expect(jsonData.address).toHaveProperty('streetAddress');
            expect(jsonData.address).toHaveProperty('addressLocality');
            expect(jsonData.address).toHaveProperty('addressCountry');
          }
          
          // Check for required hotel properties
          if (jsonData.starRating) {
            expect(jsonData.starRating).toHaveProperty('ratingValue');
          }
        }
        
        // Check for Offer schema
        if (jsonData['@type'] === 'Offer') {
          expect(jsonData).toHaveProperty('price');
          expect(jsonData).toHaveProperty('priceCurrency');
          expect(jsonData).toHaveProperty('availability');
          expect(jsonData).toHaveProperty('validThrough');
        }
      }
    } else {
      console.log('No JSON-LD structured data found');
    }
  });

  test('Booking page offer schema validation', async () => {
    await page.goto('/booking/results');
    
    // Wait for dynamic content to load
    await page.waitForTimeout(2000);
    
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const scriptCount = await jsonLdScripts.count();
    
    if (scriptCount > 0) {
      for (let i = 0; i < scriptCount; i++) {
        const script = jsonLdScripts.nth(i);
        const content = await script.textContent();
        
        let jsonData;
        try {
          jsonData = JSON.parse(content || '');
        } catch (e) {
          continue; // Skip invalid JSON
        }
        
        // Validate Offer schema for room bookings
        if (jsonData['@type'] === 'Offer') {
          expect(jsonData).toHaveProperty('price');
          expect(jsonData).toHaveProperty('priceCurrency');
          expect(jsonData.priceCurrency).toMatch(/^[A-Z]{3}$/); // ISO currency code
          expect(parseFloat(jsonData.price)).toBeGreaterThan(0);
          
          // Check availability
          expect(jsonData).toHaveProperty('availability');
          expect(jsonData.availability).toMatch(/InStock|OutOfStock|LimitedAvailability/);
          
          // Check seller information
          if (jsonData.seller) {
            expect(jsonData.seller).toHaveProperty('name');
          }
        }
        
        // Validate Product schema for rooms
        if (jsonData['@type'] === 'Product' || jsonData['@type'] === 'Room') {
          expect(jsonData).toHaveProperty('name');
          expect(jsonData).toHaveProperty('description');
          
          if (jsonData.offers) {
            expect(jsonData.offers).toHaveProperty('price');
            expect(jsonData.offers).toHaveProperty('priceCurrency');
          }
        }
      }
    }
  });

  test('Hreflang tags for multilingual support', async () => {
    await page.goto('/');
    
    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const hreflangCount = await hreflangLinks.count();
    
    if (hreflangCount > 0) {
      const languages = new Set();
      
      for (let i = 0; i < hreflangCount; i++) {
        const link = hreflangLinks.nth(i);
        const hreflang = await link.getAttribute('hreflang');
        const href = await link.getAttribute('href');
        
        expect(hreflang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // Valid language code
        expect(href).toMatch(/^https?:\/\//); // Valid URL
        
        languages.add(hreflang);
      }
      
      // Check for expected languages
      const expectedLanguages = ['en', 'he', 'ar'];
      expectedLanguages.forEach(lang => {
        if (languages.has(lang)) {
          console.log(`Found hreflang for ${lang}`);
        }
      });
    } else {
      console.log('No hreflang tags found - multilingual SEO not implemented');
    }
  });

  test('Sitemap accessibility and structure', async () => {
    // Check if sitemap exists
    const sitemapResponse = await page.request.get('/sitemap.xml');
    
    if (sitemapResponse.ok()) {
      const sitemapContent = await sitemapResponse.text();
      
      // Basic XML validation
      expect(sitemapContent).toContain('<?xml');
      expect(sitemapContent).toContain('<urlset');
      expect(sitemapContent).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
      
      // Check for essential URLs
      expect(sitemapContent).toContain('<url>');
      expect(sitemapContent).toContain('<loc>');
      
      // Should contain key pages
      const expectedPages = [
        'localhost:3000/',
        'localhost:3000/hotels',
        'localhost:3000/booking',
        'localhost:3000/about',
        'localhost:3000/contact'
      ];
      
      expectedPages.forEach(page => {
        if (sitemapContent.includes(page)) {
          console.log(`Sitemap contains ${page}`);
        }
      });
    } else {
      console.log('Sitemap not found at /sitemap.xml');
    }
  });

  test('Robots.txt validation', async () => {
    const robotsResponse = await page.request.get('/robots.txt');
    
    if (robotsResponse.ok()) {
      const robotsContent = await robotsResponse.text();
      
      // Check basic structure
      expect(robotsContent).toMatch(/User-agent:/i);
      
      // Should specify sitemap location
      if (robotsContent.includes('Sitemap:')) {
        expect(robotsContent).toMatch(/Sitemap:\s*https?:\/\//);
      }
      
      // Check for reasonable directives
      const lines = robotsContent.split('\n');
      lines.forEach(line => {
        if (line.startsWith('Disallow:')) {
          console.log(`Found disallow directive: ${line}`);
        }
        if (line.startsWith('Allow:')) {
          console.log(`Found allow directive: ${line}`);
        }
      });
    } else {
      console.log('Robots.txt not found');
    }
  });

  test('Open Graph tags validation', async () => {
    await page.goto('/');
    
    // Check essential Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    if (await ogTitle.count() > 0) {
      await expect(ogTitle).toHaveAttribute('content');
      const title = await ogTitle.getAttribute('content');
      expect(title?.length).toBeGreaterThan(10);
    }
    
    const ogDescription = page.locator('meta[property="og:description"]');
    if (await ogDescription.count() > 0) {
      await expect(ogDescription).toHaveAttribute('content');
    }
    
    const ogImage = page.locator('meta[property="og:image"]');
    if (await ogImage.count() > 0) {
      const imageUrl = await ogImage.getAttribute('content');
      expect(imageUrl).toMatch(/\.(jpg|jpeg|png|webp)$/i);
    }
    
    const ogUrl = page.locator('meta[property="og:url"]');
    if (await ogUrl.count() > 0) {
      const url = await ogUrl.getAttribute('content');
      expect(url).toMatch(/^https?:\/\//);
    }
    
    const ogType = page.locator('meta[property="og:type"]');
    if (await ogType.count() > 0) {
      const type = await ogType.getAttribute('content');
      expect(['website', 'article', 'product']).toContain(type);
    }
  });

  test('Twitter Card tags validation', async () => {
    await page.goto('/');
    
    const twitterCard = page.locator('meta[name="twitter:card"]');
    if (await twitterCard.count() > 0) {
      const cardType = await twitterCard.getAttribute('content');
      expect(['summary', 'summary_large_image', 'app', 'player']).toContain(cardType);
      
      // Check for required tags based on card type
      const twitterTitle = page.locator('meta[name="twitter:title"]');
      if (await twitterTitle.count() > 0) {
        await expect(twitterTitle).toHaveAttribute('content');
      }
      
      const twitterDescription = page.locator('meta[name="twitter:description"]');
      if (await twitterDescription.count() > 0) {
        await expect(twitterDescription).toHaveAttribute('content');
      }
      
      if (cardType === 'summary_large_image') {
        const twitterImage = page.locator('meta[name="twitter:image"]');
        if (await twitterImage.count() > 0) {
          const imageUrl = await twitterImage.getAttribute('content');
          expect(imageUrl).toMatch(/\.(jpg|jpeg|png|webp)$/i);
        }
      }
    }
  });
});