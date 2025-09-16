# 🎯 How to Access Your NEW CMS Content

## 📋 Quick Start

1. **Open Terminal** and navigate to the studio folder:
```bash
cd /Users/tamer/Documents/Zeina_Colab/NewAmbCollWebsite/project/studio
```

2. **Start Sanity Studio**:
```bash
npm run dev
```
(Press 'n' if asked about upgrading versions)

3. **Open Browser**: Go to `http://localhost:3333`

## ✅ What You'll See in the CMS

You should now see **5 content types** in the left sidebar:

### 1. **Hotels** 🏨
- All hotel details (name, description, location)
- Main image and gallery
- Rooms with images and pricing
- Amenities and services
- Contact information
- Social media links
- SEO settings

### 2. **Pages** 📄
- Create a "Home" page with:
  - Hero title
  - Hero subtitle
  - Hero background image
  - Call-to-action button
  - Page content
  - SEO settings

### 3. **Site Settings** ⚙️
- Company contact info (phone, email, address)
- Social media links (Facebook, Instagram, Twitter, LinkedIn)
- Footer copyright text
- Footer links
- Analytics IDs
- Default SEO settings

### 4. **Testimonials** 💬
- Guest name
- Role/title
- Review content
- Rating (1-5 stars)
- Guest photo
- Associated hotel
- Featured status (shows on homepage)

### 5. **Services** 🎯
- Service title
- Description
- Icon selection
- Display order
- Featured status

## 📝 How to Add Content

### To Update Homepage Hero:
1. Click **Pages** → **Create new Page**
2. Set Page Type to "Home"
3. Fill in Hero Section:
   - Title: "Most Welcoming Place"
   - Subtitle: "Discover Authentic Hospitality in the Holy Land"
   - Upload a hero image
   - Set CTA text and link
4. Click **Publish**

### To Add Site Settings:
1. Click **Site Settings** → **Create new Site Settings**
2. Fill in:
   - Contact email, phone, address
   - Social media URLs
   - Footer copyright text
3. Click **Publish**

### To Add Testimonials:
1. Click **Testimonials** → **Create new Testimonial**
2. Fill in guest details
3. Check "Featured" to show on homepage
4. Click **Publish**

### To Add Services:
1. Click **Services** → **Create new Service**
2. Add title and description
3. Set icon name (Heart, Coffee, Users, Wifi, Car, Shield)
4. Check "Featured" to show on homepage
5. Click **Publish**

## 🔄 Content Will Update Automatically!

Once you publish content in the CMS, it will automatically appear on your website. The site fetches data from Sanity on each page load.

## ⚠️ Important Notes

- **First Time**: You need to create initial documents for each type
- **Fallbacks**: If no CMS content exists, the site shows default content
- **Images**: All images are optimized automatically through Sanity's CDN
- **Real-time**: Changes appear immediately after publishing

## 🆘 Troubleshooting

If you don't see the new content types:

1. **Restart the studio**:
```bash
# Press Ctrl+C to stop
npm run dev
```

2. **Clear browser cache** and refresh

3. **Check the schemas are loaded**:
   - Look for 5 content types in the left sidebar
   - Hotels, Pages, Site Settings, Testimonials, Services

## 🎉 You're All Set!

You can now edit **EVERYTHING** on your website through the CMS:
- ✅ All photos (hero, hotels, galleries, testimonials)
- ✅ All text content
- ✅ Contact information
- ✅ Social media links
- ✅ SEO settings
- ✅ Services and amenities

No coding required!