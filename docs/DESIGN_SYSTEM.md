# Design System & Visual Specification: Reusable Restaurant Website Product

> **Document Version**: 1.0.0  
> **Lifecycle Phase**: Milestone 1 — Product Design (M1.3)  
> **Design Theme**: Dark Cinematic Luxury Dining  
> **Source of Truth**: [`PRODUCT_SPECIFICATION.md`](file:///c:/Users/navee/OneDrive/Desktop/Website%20development/PRODUCT_SPECIFICATION.md) & [`docs/INFORMATION_ARCHITECTURE.md`](file:///c:/Users/navee/OneDrive/Desktop/Website%20development/docs/INFORMATION_ARCHITECTURE.md)  

---

## 1. Visual Design Principles

1. **Atmospheric Elegance Over Flat Utility**: Deep layered obsidian darkness (`#08080A` to `#1B1B22`) contrasted with warm Champagne Gold (`#E5A93C`), creating an ambiance of high-end culinary prestige.
2. **Harmonious Editorial Typography**: Balanced serif titles (*Playfair Display* & *Cormorant Garamond*) paired with a modern geometric sans-serif (*Plus Jakarta Sans*) for clarity, readability, and rhythm.
3. **Subtle Tactile Micro-Interactions**: Smooth cubic-bezier transitions (`0.16, 1, 0.3, 1`), glowing gold hover elevations, and responsive spring badges that reward diner exploration without distraction.
4. **Accessible Inclusivity**: Visible dual-ring focus outlines (`--focus-ring`), contrast compliance exceeding WCAG 2.1 AA (`#B8B8C8` over dark surfaces), and touch targets of at least 44×44px.
5. **Config-Driven Decoupling**: Centralized CSS custom property tokens that allow a freelance developer to swap the primary brand hue or typeface family across the entire site by editing single token definitions.

---

## 2. Color System

### Base Color Palette

| Token Name | Hex / RGBA Value | Usage / Semantic Role | Contrast Ratio vs Surface |
| :--- | :--- | :--- | :---: |
| **`--color-primary`** | `#E5A93C` (Champagne Gold) | Primary brand accent, primary CTA background, active tab indicators, price tags | 7.8:1 (vs `#08080A`) |
| **`--color-primary-hover`** | `#F3BF59` (Luminous Gold) | Primary CTA hover state, text link active hover | 9.9:1 (vs `#08080A`) |
| **`--color-primary-active`** | `#C99026` (Deep Bronze Gold) | Button click/pressed state, active tab border | 5.8:1 (vs `#08080A`) |
| **`--color-primary-subtle`**| `rgba(229, 169, 60, 0.12)` | Badge background fills, selected card highlight, pill hover | Ambient fill |
| **`--color-primary-glow`** | `rgba(229, 169, 60, 0.28)` | Radial ambient glows, box-shadow ambient halos | Visual effect |
| **`--bg-deep`** | `#08080A` (Deep Obsidian) | Page background, root canvas, scrollbar track | Canvas base |
| **`--bg-dark`** | `#0D0D11` (Charcoal Tint) | Alternate section backgrounds (Story, Reservation) | Canvas variant |
| **`--bg-surface`** | `#141419` (Elevated Charcoal) | Card surfaces, modal sheets, menu items, table cards | Surface base |
| **`--bg-surface-elevated`**| `#1B1B22` (High Elevation) | Hovered card state, dropdown menus, cart item rows | Surface hover |
| **`--bg-glass`** | `rgba(16, 16, 21, 0.78)` | Sticky header bar, modal overlay backdrop | Glassmorphism |
| **`--bg-glass-heavy`** | `rgba(12, 12, 16, 0.92)` | Collapsed sticky header on scroll, drawer background | Glassmorphism |

### Functional & Semantic Colors

| Functional Role | Color / Token | Hex Value | Usage Example |
| :--- | :--- | :--- | :--- |
| **Heading Text** | `--text-light` | `#FBF8F2` (Warm Silk White) | `<h1>`, `<h2>`, `<h3>` section titles |
| **Primary Text** | `--text-cream` | `#F0EAE1` (Soft Cream) | Dish titles, lead paragraphs, card titles |
| **Muted Text** | `--text-muted` | `#B8B8C8` (Muted Slate Lilac) | Body copy, descriptions, helper notes |
| **Dimmed Text** | `--text-dim` | `#7A7A8C` (Deep Slate Gray) | Inactive labels, copyright, timestamp info |
| **Accent Text** | `--text-accent` | `#E5A93C` (Gold) | Eyebrow badges, price numbers, star icons |
| **Border Subtle** | `--border-subtle` | `rgba(255, 255, 255, 0.09)` | Card outlines, divider rules, subtle separators |
| **Border Medium** | `--border-medium` | `rgba(255, 255, 255, 0.16)` | Input borders, interactive button borders |
| **Border Accent** | `--border-gold` | `rgba(229, 169, 60, 0.35)` | Active tab borders, highlighted card rims |
| **Success** | `--color-success` | `#22C55E` (Emerald Green) | Table pass confirmation, live status open badge |
| **Warning** | `--color-warning` | `#F59E0B` (Amber) | High demand time slots, holiday notices |
| **Error** | `--color-error` | `#EF4444` (Coral Red) | Form validation errors, invalid voucher alerts |

---

## 3. Typography System

### Font Families
- **Display Serif (`--font-serif`)**: `'Playfair Display', 'Cormorant Garamond', Georgia, serif`
- **Body Sans-Serif (`--font-sans`)**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace Code (`--font-mono`)**: `'JetBrains Mono', monospace` (used for ticket reference IDs, timestamps)

### Typography Hierarchy Scale

| Element / Style | Font Family | Size (Fluid Clamp) | Weight | Line Height | Letter Spacing | Responsive Behavior |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **H1 (Hero Title)** | Serif | `clamp(2.3rem, 5.5vw, 4.2rem)` | 500 / 600 | 1.15 | -0.02em | Scales down to 36.8px on mobile |
| **H2 (Section Heading)** | Serif | `clamp(1.85rem, 3.6vw, 2.8rem)` | 500 | 1.22 | -0.01em | Scales down to 29.6px on mobile |
| **H3 (Card / Subsection)**| Serif | `clamp(1.25rem, 2.2vw, 1.65rem)` | 600 | 1.30 | 0.00em | Scales down to 20px on mobile |
| **H4 (Dish / Modal Title)**| Serif | `1.15rem` (18.4px) | 600 | 1.35 | 0.01em | Fixed readability size |
| **Lead Paragraph** | Sans | `1.125rem` (18px) | 400 | 1.70 | 0.01em | 1.05rem on mobile viewports |
| **Body Copy (`p`)** | Sans | `1.000rem` (16px) | 400 | 1.65 | 0.01em | Fixed comfortable reading size |
| **Small / Helper Text** | Sans | `0.850rem` (13.6px) | 400 | 1.50 | 0.02em | Secondary metadata, wine pairings |
| **Eyebrow / Category Tag**| Sans | `0.800rem` (12.8px) | 700 | 1.00 | 0.20em | All-caps uppercase with gold line |
| **Button Text** | Sans | `0.880rem` (14px) | 600 | 1.00 | 0.12em | All-caps, prominent letter spacing |
| **Navigation Link** | Sans | `0.880rem` (14px) | 500 | 1.00 | 0.12em | All-caps with animated gold underline |
| **Form Label** | Sans | `0.850rem` (13.6px) | 600 | 1.20 | 0.05em | All-caps, positioned above input |
| **Ticket Reference ID** | Mono | `0.950rem` (15.2px) | 700 | 1.00 | 0.15em | Monospace digits with gold accent |

---

## 4. Spacing & Elevation Scale

### Spacing Tokens

| Token Name | Rem Value | Pixel Value | Typical Application |
| :--- | :--- | :--- | :--- |
| **`--space-xs`** | `0.25rem` | 4px | Inline icon gap, badge padding horizontal |
| **`--space-sm`** | `0.50rem` | 8px | Button inline icon spacing, input padding vertical |
| **`--space-md`** | `1.00rem` | 16px | Card internal padding, form input spacing |
| **`--space-lg`** | `1.50rem` | 24px | Container gutter padding, grid gap, card padding |
| **`--space-xl`** | `2.00rem` | 32px | Header navigation link gaps, subsection spacing |
| **`--space-2xl`** | `3.00rem` | 48px | Section header bottom margin, modal padding |
| **`--space-3xl`** | `4.00rem` | 64px | Component block separation, drawer spacing |
| **`--space-4xl`** | `6.00rem` | 96px | Section top and bottom padding on desktop |

### Border Radii Tokens

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| **`--radius-xs`** | `3px` | Subtle accents, small status badges |
| **`--radius-sm`** | `6px` | Buttons, form inputs, time pills, brand crest |
| **`--radius-md`** | `12px` | Food cards, dining sanctuary cards, modal dialogs |
| **`--radius-lg`** | `18px` | Cart drawer sheet, testimonial cards |
| **`--radius-pill`** | `9999px` | Category tabs, dietary chips, cart counter badge |

### Elevation & Shadow Tokens

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| **`--shadow-sm`** | `0 2px 8px rgba(0, 0, 0, 0.4)` | Subtitle badges, button idle state |
| **`--shadow-md`** | `0 8px 24px rgba(0, 0, 0, 0.55)` | Food cards, dining room cards on idle |
| **`--shadow-lg`** | `0 16px 40px rgba(0, 0, 0, 0.75)` | Hovered food cards, modal dialog sheets |
| **`--shadow-gold`** | `0 8px 25px rgba(229, 169, 60, 0.2)` | Primary gold button idle glow |
| **`--shadow-gold-hover`**| `0 12px 35px rgba(229, 169, 60, 0.4)` | Primary gold button hovered state |

---

## 5. Component System Specification

### 1. Header & Navigation (`.site-header`)
- **Purpose**: Persistent orientation, section anchor navigation, cart access.
- **Variants**: Default expanded (`padding: 24px 0`), Scrolled glassmorphic (`padding: 14px 0; backdrop-filter: blur(28px); border-bottom: 1px solid var(--border-subtle)`).
- **Responsive**: Full links on desktop (1024px+); collapses into hamburger toggle (`#nav-toggle`) opening full-height slide-in drawer on mobile.

### 2. Buttons (`.btn`)
- **Variants**:
  - `.btn-primary-gold`: Metallic champagne gold gradient background, dark typography, gold ambient drop shadow.
  - `.btn-outline-gold`: Transparent background, 1px gold border, gold text; inverts on hover.
  - `.btn-secondary`: Subtle surface background (`#1B1B22`), light text, white subtle border.
- **States**: Default, Hover (`translateY(-2px)`), Active (`scale(0.98)`), Focus-Visible (`var(--focus-ring)`), Disabled (`opacity: 0.4; pointer-events: none`).

### 3. Food & Menu Card (`.menu-card`)
- **Purpose**: Present culinary item with image, title, dietary badges, description, sommelier pairing, price, and order CTA.
- **Structure**:
  - Image container with aspect ratio `16:10`, overflow hidden, smooth zoom on hover (`scale(1.06)`).
  - Floating dietary badge pill (*Vegan, Chef's Special, Gluten-Free*) in top-left.
  - Dish title in Cormorant/Playfair serif + Price tag in Champagne Gold.
  - Sommelier wine pairing footnote in muted italic.
  - "Add to Order" action button.
- **Responsive**: 3-column grid on desktop, 2-column on tablet, **1-column full-width on mobile** (`minmax(min(100%, 340px), 1fr)`).

### 4. Form Fields & Controls (`.form-group`)
- **Components**: `.form-input`, `.form-select`, `.form-textarea`.
- **Styling**: Surface background (`#141419`), 1px subtle border (`--border-medium`), gold focus ring, light cream text, placeholder in `--text-dim`.
- **States**:
  - Idle: Subtle white border (`0.16` opacity).
  - Hover: Border brightens to `0.30` opacity.
  - Focus: Gold focus ring (`0 0 0 2px #08080A, 0 0 0 4px #E5A93C`).
  - Invalid: Border turns Coral Red (`#EF4444`) with descriptive error label.

### 5. Reservation Boarding Pass (`#reservation-pass`)
- **Purpose**: Digital confirmation voucher rendered after successful booking submission.
- **Structure**: Golden ticket perimeter styling (`border: 1px solid var(--border-gold)`), perforated notch detailing, party size badge, booking reference number in monospace font, in-place reset button.
- **Print**: Styled for paper print or PDF export with `@media print` rules.

### 6. Modal Lightbox (`#gallery-lightbox`)
- **Purpose**: Fullscreen distraction-free photo inspection.
- **Structure**: High-opacity dark backdrop (`rgba(6, 6, 8, 0.95)`), centered high-resolution image container, image caption bar, photo index counter (`X / 6`), close (`×`), previous (`‹`), and next (`›`) controls.
- **Interaction**: Dismisses on `Escape` key or backdrop tap; navigates on `ArrowLeft` / `ArrowRight`.

---

## 6. Interaction States Matrix

| Component | Idle (Default) | Hover | Focus-Visible | Active (Click) | Disabled |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Button** | Gold gradient, gold shadow | Light gold gradient, `translateY(-2px)`, deep shadow | Dual-ring focus outline (`--focus-ring`) | `scale(0.98)` | `opacity: 0.4`, cursor not-allowed |
| **Outline Button** | Transparent, 1px gold border | Gold background, dark text | Dual-ring focus outline (`--focus-ring`) | `scale(0.98)` | `opacity: 0.4` |
| **Nav Link** | Muted text, underline 0% width | Light text, underline 100% width | Dual-ring focus outline | Color gold | Muted opacity |
| **Menu Card** | Surface bg, subtle border | Elevates `translateY(-4px)`, shadow-lg | Dual-ring outline | Card intact | N/A |
| **Form Input** | Surface bg, medium border | Border lightens | Dual-ring gold focus ring | Border gold | Greyed out |
| **Filter Tab Pill** | Surface bg, muted text | Accent text, gold rim | Focus-visible ring | Active state: Gold bg, dark text | N/A |

---

## 7. Responsive Design Rules

| Breakpoint Range | Viewport Category | Layout & Spatial Rules |
| :--- | :--- | :--- |
| **>= 1200px** | **Desktop Large** | Container max 1320px; 3-column menu grid; 4-column sanctuaries grid; side-by-side story & contact layouts; section padding `96px 0`. |
| **1024px – 1199px**| **Desktop Standard**| Container max 1000px; 3-column menu grid; horizontal navigation links intact; section padding `80px 0`. |
| **768px – 1023px** | **Tablet** | 2-column menu grid; stacked story columns; 2-column gallery; section padding `64px 0`. |
| **481px – 767px**  | **Mobile Wide** | 1-column menu cards; hamburger drawer navigation; stacked reservation inputs; section padding `56px 0`. |
| **320px – 480px**  | **Mobile Compact** | Full-width cards (`minmax(min(100%, 340px), 1fr)`); **zero horizontal overflow**; category tabs swipeable; touch targets >= 44px; section padding `48px 0`. |

---

## 8. Accessibility Requirements (WCAG 2.1 AA)

1. **Color Contrast**:
   - Primary text (`#FBF8F2`) on deep obsidian (`#08080A`): **18.2:1** (Exceeds AAA).
   - Muted secondary text (`#B8B8C8`) on elevated surface (`#141419`): **7.4:1** (Exceeds AA).
   - Gold accent (`#E5A93C`) on dark surface: **7.8:1** (Exceeds AA).
2. **Keyboard Navigation**:
   - Full keyboard accessibility with `Tab` and `Shift+Tab`.
   - Clear dual-ring focus indicator (`0 0 0 2px #08080A, 0 0 0 4px #E5A93C`) on every focusable element.
   - `Escape` dismisses modals (cart drawer, gallery lightbox, mobile nav).
3. **Screen Reader Semantics**:
   - Modals tagged with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
   - Interactive buttons expose `aria-expanded` and `aria-controls`.
   - Descriptive culinary alt tags on all dynamically generated dish cards.

---

## 9. Reusable Design Tokens Catalog

```css
:root {
  /* Brand Hue Tokens (Client White-Label Preset) */
  --color-primary: #E5A93C;
  --color-primary-hover: #F3BF59;
  --color-primary-active: #C99026;
  --color-primary-subtle: rgba(229, 169, 60, 0.12);
  --color-primary-glow: rgba(229, 169, 60, 0.28);
  --color-primary-border: rgba(229, 169, 60, 0.38);

  /* Obsidian Canvas & Surface Tokens */
  --bg-deep: #08080A;
  --bg-dark: #0D0D11;
  --bg-surface: #141419;
  --bg-surface-elevated: #1B1B22;
  --bg-surface-hover: #22222B;
  --bg-glass: rgba(16, 16, 21, 0.78);
  --bg-glass-heavy: rgba(12, 12, 16, 0.92);

  /* Typography Colors */
  --text-light: #FBF8F2;
  --text-cream: #F0EAE1;
  --text-muted: #B8B8C8;
  --text-dim: #7A7A8C;
  --text-accent: #E5A93C;

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.09);
  --border-medium: rgba(255, 255, 255, 0.16);
  --border-gold: rgba(229, 169, 60, 0.35);
  --border-gold-strong: rgba(229, 169, 60, 0.75);

  /* Focus & a11y */
  --focus-ring: 0 0 0 2px var(--bg-deep), 0 0 0 4px var(--color-primary);

  /* Typography Families */
  --font-serif: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Elevation Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.55);
  --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.75);
  --shadow-gold: 0 8px 25px rgba(229, 169, 60, 0.2);
  --shadow-gold-hover: 0 12px 35px rgba(229, 169, 60, 0.35);

  /* Spacing Scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;

  /* Border Radii */
  --radius-xs: 3px;
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-pill: 9999px;

  /* Transitions */
  --transition-fast: 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-normal: 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-slow: 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 10. Current Implementation vs. Design System Standard

| Area | Current Implementation State | Standardized Rule | Required Future Change |
| :--- | :--- | :--- | :--- |
| **Color Tokens** | 100% defined in `css/design-system.css` and injected dynamically via `restaurant.config.js` | All components must consume `--color-primary`, `--bg-surface`, etc. | None. Fully aligned. |
| **Typography Scale** | Fluid clamp expressions on H1, H2, H3 in `css/main.css` | All headings use fluid clamp scaling to avoid abrupt breakpoint jumps | None. Fully aligned. |
| **Focus Visibility** | Dual-ring outline defined in `--focus-ring` applied to `:focus-visible` | Every interactive button, link, and input exhibits dual-ring focus | None. Fully aligned. |
| **Menu Grid Responsiveness** | `.menu-grid` utilizes `minmax(min(100%, 340px), 1fr)` | Single-column reflow on screens < 480px with zero horizontal scrollbar | None. Fully aligned. |
| **Theme Presets** | Default is Champagne Gold & Obsidian | Provide pre-configured presets for Emerald & Brass, Ruby & Charcoal | Candidate for M1.4 white-label kit. |
| **Print Styling** | Dedicated `@media print` rules for reservation boarding passes and order tickets | Printable passes with dark backgrounds suppressed for paper economy | None. Fully aligned. |
