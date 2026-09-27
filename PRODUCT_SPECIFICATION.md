# PRODUCT SPECIFICATION: REUSABLE FREELANCE RESTAURANT WEBSITE PRODUCT

> **Document Version**: 1.0.0  
> **Lifecycle Phase**: Milestone 1 — Product Design (M1.1)  
> **Product Name**: Commercial Restaurant Web Template (Codename: *Spice Haven Product Core*)  
> **Status**: Approved Baseline Specification  

---

## 1. Product Overview

The **Commercial Restaurant Web Template** is a high-performance, single-page, white-label website product designed for freelance web developers to sell, customize, and deliver to independent restaurant owners, fine dining establishments, bistros, upscale cafes, and cloud kitchens.

Unlike generic WordPress themes or bloated website builder templates, this product is built on a **zero-dependency vanilla web architecture** (semantic HTML5, modern CSS3 custom properties, modular vanilla ES6+ JavaScript). It delivers instant load times, dark cinematic luxury visual design, full mobile responsiveness, and a **centralized single-file configuration model** (`restaurant.config.js`) that allows a freelancer to re-brand and deploy a complete client website in under 2 hours without modifying core HTML structure.

---

## 2. Problem Statement & Market Opportunity

### The Business Problem
Independent restaurant operators face a painful dilemma in web presence:
1. **Generic, Bloated Builders**: Platforms like Wix, Squarespace, or multi-plugin WordPress themes carry heavy JavaScript payloads, load slowly on cellular networks, and look identical to mass-market templates, eroding the perceived prestige of dining establishments.
2. **Exorbitant Commission Fees**: Third-party aggregators (UberEats, DoorDash, OpenTable) take 15% to 30% on every order or booking, diminishing restaurant operating margins.
3. **High Maintenance & Fragility**: Traditional custom web setups require developer assistance for trivial tasks like updating prices, adding seasonal dishes, or changing operating hours, frequently leading to broken layouts or out-of-date information.

### The Product Solution
This product provides a turn-key, premium digital flagship that:
- Elevates brand perception through curated luxury typography, dark cinematic atmosphere, and glassmorphic micro-interactions.
- Facilitates direct client engagement via integrated table booking pass generation, inquiry routing, and takeout order staging.
- Empowers the freelance developer to perform client onboarding and updates rapidly through a single configuration file.
- Incurs **zero ongoing server or database hosting costs** on static edge CDNs (Surge, Vercel, Netlify, Cloudflare Pages, GitHub Pages).

---

## 3. Target Client & Target Users

### Target Client Profile (The Buyer)
The primary buyer is the **Independent Hospitality Owner or Operator**:
- **Primary Archetype**: Upscale / Fine Dining Restaurant Owner, Executive Chef, or General Manager.
- **Secondary Archetypes**: Artisanal Cafes, Modern Bistros, Craft Cocktail Lounges, Boutique Bakeries, and Cloud Kitchen Operators.
- **Client Characteristics**:
  - Values premium presentation and culinary craftsmanship over mass-market fast-casual templates.
  - Wants a digital flagship that reflects their physical dining ambiance.
  - Lacks technical expertise and demands a simple, headache-free handover.
  - Seeks to increase direct bookings and inquiries while reducing third-party platform reliance.

### Target End Users (The Diners)
1. **The Prospective Guest (Discovery)**: Browsing on mobile devices; wants to quickly view the menu, verify pricing, check dietary options (vegan, gluten-free), and inspect interior ambiance.
2. **The Table Booker (Conversion)**: Looking to reserve a table for a date night, business dinner, or family gathering with immediate confirmation.
3. **The Takeout Customer (Direct Ordering)**: Looking to review dishes, customize quantities, apply promotions, and review order totals.
4. **The Event Planner (Inquiry)**: Seeking private dining halls, capacity details, and concierge contact channels.

---

## 4. Product Goals

1. **Brand Elevation**: Present a visual aesthetic that commands premium menu pricing and builds guest anticipation.
2. **Conversion Velocity**: Enable guests to view the menu, select items, or request a table in under 60 seconds from initial page load.
3. **Frictionless Customization**: Allow a freelance developer to swap restaurant name, logo, colors, dishes, prices, hours, and photos via one configuration file in under 120 minutes.
4. **Zero-Maintenance Delivery**: Eliminate backend server crashes, database connection timeouts, and plugin security vulnerabilities by utilizing static edge architecture.

---

## 5. Core User Journeys

### Journey A: The Dining Guest Journey
```
Guest Lands on Homepage
  │
  ├──> 1. Hero Impression: Absorbs brand elegance, accolades, ambiance
  │
  ├──> 2. Menu Exploration: Filters category (e.g. Mains) -> Toggles dietary badge (e.g. Vegan) -> Views pairing notes
  │
  ├──> 3. Ordering Intent: Clicks 'Add to Order' -> Cart drawer slides out -> Adjusts quantity -> Enters promo code -> Reviews totals
  │
  ├──> 4. Table Booking: Clicks 'Reserve a Table' -> Selects date, time slot, dining area, guest count -> Submits form -> Receives instant boarding pass
  │
  └──> 5. Visit Logistics: Checks service hours badge ("Open Tonight"), phone number, and physical address in footer
```

### Journey B: The Freelance Developer / Business Owner Workflow
```
Freelance Client Onboarding
  │
  ├──> 1. Intake: Collects client logo, color palette, menu items, prices, high-res photos, and operating hours
  │
  ├──> 2. Configuration: Opens `js/restaurant.config.js` and updates the JSON-like data structure
  │
  ├──> 3. Validation: Runs `npm run build` to verify syntax and asset integrity
  │
  ├──> 4. Preview & Review: Previews on `http://localhost:3000` with client
  │
  └──> 5. Edge Deployment: Deploys to Surge/Vercel/Netlify with custom domain DNS mapping in under 5 minutes
```

---

## 6. Functional Requirements

### FR-1: Header & Navigation
- **FR-1.1**: Sticky navigation bar with backdrop-filter blur glassmorphism that persists on scroll.
- **FR-1.2**: Smooth-scrolling anchor links navigating to `#menu`, `#story`, `#gallery`, `#reservation`, and `#contact`.
- **FR-1.3**: Active cart trigger button displaying live item count badge.
- **FR-1.4**: Mobile hamburger toggle opening a full-height slide-in drawer with backdrop dismiss overlay.

### FR-2: Hero Section
- **FR-2.1**: High-resolution ambient background with subtle Ken Burns zoom animation.
- **FR-2.2**: Prominent brand name, category eyebrow, and editorial tagline.
- **FR-2.3**: Dual call-to-action buttons (*"Explore Menu"* anchoring to `#menu`, *"Reserve a Table"* anchoring to `#reservation`).
- **FR-2.4**: Accolades ticker displaying dining credentials (e.g., Michelin guide mention, rating, sommelier recognition).

### FR-3: Story & Chef Spotlight
- **FR-3.1**: Narrative layout highlighting executive chef philosophy and farm-to-table sourcing guarantees.
- **FR-3.2**: High-resolution chef portrait and artisanal kitchen imagery.

### FR-4: Dynamic Menu Catalog
- **FR-4.1**: Category tabs (*Starters, Mains, Biryani, Breads, Desserts, Cocktails*) dynamically rendered from configuration.
- **FR-4.2**: Dietary filter pills (*Chef's Special, Vegan, Gluten-Free*) for instantaneous client-side filtering.
- **FR-4.3**: Real-time debounce search filtering by dish name or ingredient keywords.
- **FR-4.4**: Dish cards rendering price, calorie badge, culinary description, sommelier wine pairing notes, and *"Add to Order"* button.

### FR-5: Off-Canvas Cart & Checkout Drawer
- **FR-5.1**: Slide-out drawer displaying itemized order list, unit prices, and line-item totals.
- **FR-5.2**: Quantity increment/decrement steppers with auto-removal on zero.
- **FR-5.3**: Promotional discount validation engine (e.g. `SAVOR15` for 15% discount).
- **FR-5.4**: Subtotal, promotional deduction, sales tax calculation (8.25%), and total calculation.
- **FR-5.5**: 3-step checkout simulation (*Cart Review -> Dining Mode -> Payment Method*) with unique order ticket generation (`SH-XXXXXX`).

### FR-6: Dining Sanctuaries / Spaces Showcase
- **FR-6.1**: Visual card showcase displaying distinct dining halls (*Grand Dining Room, Wine Cellar, Chef's Table, Starlit Terrace*) with capacity and ambiance descriptions.

### FR-7: Table Reservation Engine
- **FR-7.1**: Guest counter stepper (+/- controls, bounds 1 to 12 guests).
- **FR-7.2**: Interactive dining area selection cards.
- **FR-7.3**: Date selector preventing past dates.
- **FR-7.4**: Time slot selection pills with dynamic active states.
- **FR-7.5**: Validation for guest name, email, and phone number.
- **FR-7.6**: Instant generation of a styled digital dining boarding pass (`RES-XXXXXX`) with party details and in-place reset button (*"Book Another Reservation"*).

### FR-8: Visual Gallery & Lightbox Modal
- **FR-8.1**: Filterable photo gallery displaying high-resolution culinary and interior imagery.
- **FR-8.2**: Click-to-enlarge modal lightbox overlay with image caption and counter.
- **FR-8.3**: Full keyboard accessibility: `Escape` to close, `ArrowLeft` / `ArrowRight` to navigate images.

### FR-9: Testimonials & Critical Accolades
- **FR-9.1**: Auto-rotating testimonial slider with 5-star rating stars, critic quotes, reviewer names, publications, and avatars.
- **FR-9.2**: Interactive dot indicator buttons for manual review selection.

### FR-10: Location, Hours & Concierge Contact
- **FR-10.1**: Real-time service status badge (*"Service In Session • Open Tonight"* or *"Closed"* based on schedule).
- **FR-10.2**: Weekly schedule table listing lunch, dinner, and lounge hours.
- **FR-10.3**: Direct contact links (click-to-call phone, click-to-email, directions map link).
- **FR-10.4**: Private dining inquiry form with client-side validation and toast confirmation feedback.

### FR-11: Footer
- **FR-11.1**: Restaurant identity, address, phone, social media icon links, and copyright statement.
- **FR-11.2**: Quick navigation links and custom 404 page link.

### FR-12: Ambient Audio Synthesizer (Optional Experience)
- **FR-12.1**: Bottom-left audio toggle utilizing the native Web Audio API (zero external audio files).
- **FR-12.2**: Animated sound equalizer bars reflecting playing status.

---

## 7. Non-Functional Requirements

| Category | Requirement | Specification & Verification Method |
| :--- | :--- | :--- |
| **Performance** | Instant page load | Zero runtime bundle overhead; total page assets under 300KB (excluding CDN images). First Contentful Paint < 1.0s. |
| **Responsiveness** | Fluid cross-device layout | Supports 320px (iPhone SE) to 1440px+ screens. **Zero horizontal overflow / scrolling** on all viewports. |
| **Accessibility** | WCAG 2.1 AA Standards | Contrast ratio >= 4.5:1 on body text (`#B8B8C8` over dark); visible dual-ring gold focus indicator (`--focus-ring`); ARIA modal dialog tags; descriptive image alt tags. |
| **Maintainability** | Single-file configuration | 100% of business details isolated in `js/restaurant.config.js`. Semantic separation of CSS (`design-system`, `main`, `components`, `sections`, `animations`). |
| **Security** | Zero server attack surface | Static hosting model eliminates SQL injection, server exploits, and stored credentials. Content Security Policy and security headers configured in `vercel.json` and `netlify.toml`. |
| **SEO & Discoverability**| Search engine indexing | Schema.org `Restaurant` JSON-LD structured data; OpenGraph & Twitter cards; crawlable `robots.txt` and `sitemap.xml`. |
| **Offline / Print** | Dining pass printability | Dedicated `@media print` stylesheets formatting reservation tickets and order receipts cleanly for paper print or PDF export. |

---

## 8. Product Customization Model

To make this template a high-margin freelance product, customization is divided into three distinct tiers:

```
┌────────────────────────────────────────────────────────┐
│ TIER 1: Easy Content Customization                     │
│ (Zero code modifications — editing `restaurant.config.js`)│
└────────────────────────────────────────────────────────┘
  │ • Restaurant name, tagline, and history
  │ • Contact info (phone, email, physical address)
  │ • Operating hours & service days
  │ • 15+ menu dishes, categories, prices, pairings, calories
  │ • Gallery photo URLs & captions
  │ • Dining spaces (names, descriptions, capacities)
  │ • Critic reviews, reviewer names, and publication logos
  │ • Social media profile URLs

┌────────────────────────────────────────────────────────┐
│ TIER 2: Design Customization                           │
│ (CSS Custom Properties editing in `design-system.css`)  │
└────────────────────────────────────────────────────────┘
  │ • Primary accent hue (e.g. Gold `#E5A93C` -> Emerald `#10B981` -> Ruby `#E11D48`)
  │ • Background obsidian tones & elevation depths
  │ • Typography pairing (Google Fonts imports in `index.html`)
  │ • Border radii and glassmorphism blur intensity

┌────────────────────────────────────────────────────────┐
│ TIER 3: Backend / Development Integrations             │
│ (Custom freelance scope requiring backend services)    │
└────────────────────────────────────────────────────────┘
  │ • Live Payment Gateway: Stripe Checkout, Square, or Razorpay API
  │ • Persistent Table Booking: OpenTable, Resy, or PostgreSQL/Supabase database
  │ • Automated Notifications: Twilio SMS or SendGrid booking confirmation emails
  │ • Marketing Automation: Mailchimp or Klaviyo webhook integration for newsletter
```

---

## 9. MVP Scope vs. Future Roadmap (Feature Prioritization)

Features are categorized using industry-standard product prioritization principles based on commercial client readiness and technical stability:

| Priority Level | Features Included | Rationale |
| :--- | :--- | :--- |
| **MUST HAVE** *(Core Baseline)* | • Sticky Glass Navigation<br>• Hero with Dual CTAs<br>• Dynamic Menu with Category Tabs<br>• Table Reservation Form with Instant Pass<br>• Location, Hours & Service Status<br>• Full Mobile Responsiveness (Zero Overflow)<br>• Single-File Configuration (`restaurant.config.js`) | Essential for any operational restaurant website. Without these, a client cannot present their food, receive reservations, or share basic dining logistics. |
| **SHOULD HAVE** *(Competitive Edge)* | • Off-Canvas Cart & Checkout Simulation<br>• Dietary Filter Chips (Vegan, Gluten-Free)<br>• Sommelier Wine Pairing Notes<br>• Filterable Gallery with Lightbox Modal<br>• Testimonials Carousel<br>• Print Stylesheets for Dining Passes<br>• Schema.org SEO Structured Data | Differentiates the website from cheap DIY site builders. Provides the upscale polish and interaction density expected in fine dining. |
| **NICE TO HAVE** *(Delight Factors)* | • Real-time Menu Text Search with Debounce<br>• Web Audio Ambient Lounge Synthesizer<br>• Live Operating Status Clock calculation<br>• Ken Burns Hero Animation Effect<br>• Animated Counter Ticker for Accolades | Enhances user engagement and visual memorability without impacting accessibility or performance. |
| **FUTURE / OPTIONAL** *(M2+ Expansions)* | • Multi-Language Support (i18n)<br>• Multi-Currency Currency Switcher (USD, EUR, GBP, INR)<br>• Live Stripe/Square Checkout Webhooks<br>• Headless CMS Integration (Sanity / Strapi)<br>• Guest Booking SMS Notifications | Value-add services that can be upsold to clients seeking complex multi-location or e-commerce capabilities in later roadmap milestones. |

---

## 10. Current Implementation Limitations & Transparent Boundaries

For client demo and freelance sales honesty, the following architectural boundaries are formally documented:
1. **Client-Side Mock Checkout**: The cart drawer generates realistic order tickets (`SH-XXXXXX`) with subtotal, discount, and tax calculations, but does not debit real credit cards. Live merchant processing requires server-side Stripe/Square credentials.
2. **In-Memory Table Bookings**: The table booking system generates immediate digital passes (`RES-XXXXXX`) and updates DOM state with an in-place reset, but does not synchronize with external calendar APIs (OpenTable/Resy).
3. **Inquiry Forms**: Submissions trigger client-side format validation and visual toast confirmations, but do not transmit outbound SMTP emails without a serverless form handler (Formspree, Netlify Forms, or EmailJS).
4. **Third-Party CDN Asset Dependency**: Photography and fonts rely on Unsplash and Google Fonts CDNs. In an air-gapped intranet environment, local assets must be bundled.

---

## 11. Product Success Criteria

The freelance restaurant website product is deemed successful when:
1. **Client Setup Time**: A new client website can be customized and deployed in **under 120 minutes**.
2. **Speed Index**: Global First Contentful Paint (FCP) is under **1.0 second** across mobile and desktop.
3. **Responsive Stability**: Zero horizontal scrolling across all mobile device screen widths (tested 320px to 480px).
4. **Zero Hosting Cost**: The client's static digital flagship can be hosted for **$0/month** on standard tier edge CDNs with custom SSL.
5. **Zero Maintenance Overhead**: Zero software updates, zero database maintenance, and zero server crashes.
