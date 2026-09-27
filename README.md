# Spice Haven — Premium Dark Cinematic Restaurant Website Template

> **A high-end, responsive commercial website template designed for fine dining restaurants, bistros, upscale cafes, and cloud kitchens.**

**Live Demo URL**: [https://spicehaven-restaurant.surge.sh](https://spicehaven-restaurant.surge.sh)

---

## 1. Project Overview

**Spice Haven** is a commercial-grade, multi-section restaurant website template built with semantic HTML5, modern vanilla CSS3 design systems, and modular vanilla JavaScript. Designed specifically for freelance web developers, this template enables rapid white-label customization for restaurant clients without modifying HTML markup or rebuilding code.

- **Demo Brand**: Spice Haven (Fine Dining & Contemporary Gastronomy)
- **Visual Direction**: Dark Cinematic Luxury Dining
- **Accent Scheme**: Champagne Gold (`#E5A93C`) over Obsidian Dark (`#08080A` to `#141419`)
- **Typography**: *Playfair Display* & *Cormorant Garamond* paired with *Plus Jakarta Sans*

---

## 2. Business Problem & Solution

### The Problem
Small-to-midsize restaurant owners and fine dining establishments often face:
1. **Generic, Bloated Templates**: Most WordPress or standard templates look generic, load slowly, and feel like fast-food order portals rather than luxurious dining experiences.
2. **High Platform Fees**: Third-party aggregators take 15%–30% in commission on every table or takeout order.
3. **Difficult Re-Branding**: Customizing an existing template usually requires deep code changes, breaking layouts, and expensive developer hours.

### The Solution Provided
- **Centralized Single-File Configuration (`js/restaurant.config.js`)**: All restaurant details—brand name, tagline, colors, menu items, prices, wine pairings, reservation time slots, operating hours, and payment preferences—are managed in one place.
- **Atmospheric Dark Cinematic Aesthetic**: Conveys prestige, craftsmanship, and fine dining elegance that elevates the restaurant's perceived brand value.
- **Zero Build Tool Overhead**: Runs directly in any modern browser without requiring Node.js, Webpack, or Vite build steps, simplifying client hosting and maintenance.

---

## 3. Main Features

- **Header & Navigation**: Sticky blur glassmorphism bar with scroll collapse, animated link underlines, cart counter badge, and tap-outside dismissible mobile drawer.
- **Cinematic Hero**: Ambient Ken Burns background, prominent brand eyebrow, dual CTA buttons ("Explore Menu" & "Reserve a Table"), and an animated accolades counter ticker.
- **Our Story & Chef Spotlight**: Narrative layout with chef's quote, executive chef profile, and sourcing guarantees.
- **Dynamic Menu Catalog**: 15 dishes across 6 categories with category filter tabs, dietary filter chips (*Chef's Special, Vegan, Gluten-Free*), real-time search, calorie badges, and sommelier wine pairing notes.
- **Dining Sanctuaries Showcase**: Interactive visual showcase of 4 dining halls (*Grand Dining Room, Wine Cellar, Chef's Table, Starlit Terrace*).
- **Table Reservation System**: Guest counter stepper (+/-), date restriction, dining area cards, time slot pills, and instant digital dining ticket pass generation with in-place reset.
- **Filterable Visual Gallery & Lightbox**: 6 categorized visual assets with full-screen lightbox modal, previous/next controls, and keyboard navigation (`←`, `→`, `Esc`).
- **Critiques & Testimonials**: Auto-rotating carousel with 5-star ratings, critic quotes, reviewer avatars, and dot indicators.
- **Location & Service Hours**: Live service status badge (*"Service In Session • Open Tonight"*), weekly hours breakdown, direct concierge contacts, and private dining inquiry form.
- **Off-Canvas Cart Drawer**: Slide-out cart with quantity controls, promotional code validation (e.g. `SAVOR15`), tax calculation, and 3-step checkout flow.
- **Acoustic Lounge Synthesizer**: Discreet bottom-left audio controller utilizing the Web Audio API with animated equalizer bars.

---

## 4. Technology Stack

- **Core**: Semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`)
- **Styling**: Vanilla CSS3 with CSS Custom Properties (CSS Variables), Flexbox, CSS Grid, and backdrop-filter glassmorphism
- **Scripting**: Modular Vanilla JavaScript (ES6+), zero external runtime libraries
- **Typography**: Google Fonts CDN (*Playfair Display*, *Cormorant Garamond*, *Plus Jakarta Sans*)
- **Photography**: High-resolution curated gastronomy photography via Unsplash CDN
- **Architecture**: Config-driven client hydration via `js/restaurant.config.js`

---

## 5. Project Structure

```
c:\Users\navee\OneDrive\Desktop\Website development\
├── index.html                   # Semantic HTML5 base & modal dialogs
├── css/
│   ├── design-system.css        # Theme tokens, elevations, glassmorphism, radii
│   ├── main.css                 # Base resets, typography hierarchy, accessible focus states
│   ├── components.css           # Navigation, buttons, badges, menu cards, cart drawer, modals, print styles
│   ├── sections.css             # Hero, Story, Menu, Experiences, Reservations, Gallery, Location, Footer
│   └── animations.css           # 16 purposeful animations, keyframes, scroll reveals
├── js/
│   ├── restaurant.config.js     # Single source of truth for all brand and menu content
│   ├── animations.js            # Scroll reveals, number tickers, ambient audio synthesizer
│   ├── menu.js                  # Dynamic category filtering, search, dietary tags, card renderer
│   ├── cart.js                  # Off-canvas cart, item state, promo discounts, checkout simulation
│   ├── reservation.js           # Interactive booking wizard & digital ticket pass generator
│   ├── gallery.js               # Filterable photo gallery and full-screen lightbox modal
│   └── app.js                   # Application bootstrap, DOM hydration, and testimonials
├── docs/
│   ├── case-study.md            # Freelance portfolio case study
│   └── client-pitch.md          # Sales pitch, deliverables, and live demo script
└── README.md                    # Project documentation
```

---

## 6. How to Install & Run Locally

This project requires **zero package installations** or build tools to view and run.

### Option A: Direct Browser File (Fastest)
Double-click `index.html` in your file explorer to open it directly in Chrome, Edge, Safari, or Firefox.

### Option B: Local HTTP Server
Using Python (built into Windows/macOS/Linux):
```bash
# Navigate to project directory
cd "Website development"

# Start local server on port 3000
python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

Using Node.js (npx):
```bash
npx serve . -p 3000
```

---

## 7. Responsive Design & Breakpoints

The layout has been tested across mobile, tablet, and desktop viewports:
- **Desktop (1200px – 1440px+)**: Multi-column grids, full desktop navigation, side-by-side story and location layouts.
- **Tablet (768px – 1024px)**: 2-column menu grid, 2-column experiences, stacked story columns.
- **Mobile (320px – 480px)**:
  - Constrained `.menu-grid` with `minmax(min(100%, 340px), 1fr)` ensuring **zero horizontal scrolling**.
  - Touch-friendly horizontal swipe for category tabs.
  - Full-width hero CTA buttons.
  - Mobile slide-in drawer with tap-outside dismiss backdrop.

---

## 8. Accessibility Considerations

- **Keyboard Focus Visibility**: All interactive elements (buttons, links, inputs) feature a dual-ring gold focus indicator (`--focus-ring`) when navigating via Tab.
- **Screen Reader Semantics**: Header actions expose `aria-expanded` and `aria-controls` states; dialogs include `role="dialog"` and `aria-modal="true"`.
- **Text Contrast**: Secondary and muted text tokens have been calibrated to `#B8B8C8` over dark backgrounds, exceeding WCAG AA contrast standards.
- **Descriptive Alt Text**: All dynamically generated food cards include detailed descriptive culinary `alt` tags.

---

## 9. Feature Implementation Status & Transparency

To ensure complete clarity between demo features and production services:

### Fully Implemented (Client-Ready Frontend)
- Dynamic branding and theme injection via `restaurant.config.js`
- Menu rendering, category tab switching, real-time search, and dietary badge filtering
- Off-canvas cart drawer with line items, quantity adjustments, and promo code validation
- Multi-step checkout simulation with dining mode selector and payment method cards
- Table reservation interface with guest stepper, area selection cards, time pills, and in-place reset
- Quick Date Pills (Tonight, Tomorrow, This Weekend) and Party Size Presets (2, 4, 6, 8+)
- Gallery lightbox with full keyboard navigation and captioning
- Testimonial carousel with auto-rotation and interactive dot indicators
- Acoustic lounge synthesizer using the Web Audio API
- Print styling (`@media print`) for dining passes and receipts

### Fully Implemented Production Backend Integrations
- **Payment Processing (Tasks 1–4)**: Official Razorpay Standard Checkout modal integration, server-side trusted price calculation, cryptographic HMAC-SHA256 signature verification, and raw-body webhook listener with idempotency protection.
- **Dynamic UPI QR Engine**: Client-direct contactless payment with instant SVG dynamic QR generation, NPCI URI standards compliance, and 12-digit UTR reconciliation.
- **Table Reservation & Concierge Engine (Task 5)**: Server-side table reservation API (`POST /api/reservations`), verified booking retrieval (`GET /api/reservation-status`), and VIP private dining inquiry management (`POST /api/inquiries`).
- **Universal Status Tracker (Task 5)**: Live lookup portal querying real-time server records for both table bookings (`RES-XXXXXX`) and culinary orders (`SH-XXXXXX`).

---

## 10. Future Improvements (Recommended Task 6)
- Multi-currency toggle support in configuration (`USD`, `EUR`, `GBP`, `INR`).
- Alternate color themes (Emerald & Gold, Ruby & Charcoal) configurable via a single preset string.
- Dish Item "Quick View" modal (P2-1) with high-res plating view and allergen breakdown.
- Automated SMS / Email dispatch hooks via Twilio or SendGrid.
