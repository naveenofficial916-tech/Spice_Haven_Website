/**
 * SPICE HAVEN - RESTAURANT CLIENT CONFIGURATION
 * ==========================================================
 * This file is the single source of truth for your entire website.
 * Customize this file for any new client (restaurant, cafe, bar, cloud kitchen)
 * to instantly re-theme, re-brand, and update all content without modifying code.
 */

const RestaurantConfig = {
  // Brand Identity
  brand: {
    name: "Spice Haven",
    tagline: "Artisanal Spice & Contemporary Gastronomy",
    badge: "Michelin Guide Selection • 2026",
    establishedYear: "2019",
    heroHeadingPrefix: "An Exquisite Symphony of",
    heroHeadingEmphasis: "Fire, Spice & Soul",
    heroSubheading:
      "Indulge in a curated sensory journey where ancient culinary heritage converges with modern culinary artistry. Every dish is a tribute to rare spices and woodfired perfection.",
    storyHeading: "Crafted with Obsession. Served with Reverence.",
    storySubheading: "A Sanctuary for the Connoisseur of Taste",
    storyText1:
      "Founded in 2019 by Master Chef Julian Vance, Spice Haven was conceived as an ode to untamed culinary craftsmanship. We scour secluded spice plantations across the Malabar coast, Kashmir valley, and Southeast Asia to source rare, single-origin botanicals.",
    storyText2:
      "Every cut of meat is dry-aged on site in Himalayan pink salt chambers. Our broths simmer patiently for 48 hours over heritage charcoal, coaxing profound depth and intoxicating aromas that linger long after the final sip.",
    storyQuote:
      "Cooking at this echelon is not merely technique; it is a sacred transfer of memory, heat, and emotion onto the plate.",
    chefName: "Julian Vance",
    chefRole: "Executive Chef & Founder",
    chefAccolade: "Recipient of Global Gastronomy Gold Ribbon & Three Stars of Excellence",
  },

  // Visual Theme Tokens (Injected automatically into CSS Variables)
  theme: {
    fontSerif: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
    fontSans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    colors: {
      primaryAccent: "#E5A93C",      // Rich Champagne Gold
      primaryHover: "#F3BF59",       // Radiant warm gold
      primarySubtle: "rgba(229, 169, 60, 0.12)",
      primaryGlow: "rgba(229, 169, 60, 0.25)",
      bgDeep: "#09090B",             // True obsidian dark background
      bgSurface: "#121216",          // Elevated card background
      bgSurfaceHover: "#18181E",     // Card hover tone
      bgGlass: "rgba(18, 18, 22, 0.82)", // Glassmorphism backdrop
      textLight: "#FBF8F2",          // Creamy luxury headline tone
      textMuted: "#A3A3B0",          // Soft neutral secondary text
      textDim: "#686875",            // Low-contrast details
      borderColor: "rgba(255, 255, 255, 0.08)",
      borderGold: "rgba(229, 169, 60, 0.35)",
    }
  },

  // Accolade Metrics (Hero Counter)
  accolades: [
    { number: "4.9", suffix: "★", label: "Gastronomic Score (2,400+ Reviews)" },
    { number: "38", suffix: "+", label: "Rare Artisanal Spices Curated" },
    { number: "100", suffix: "%", label: "Heritage Farm-to-Table Sourcing" },
    { number: "3", suffix: "x", label: "Culinary Excellence Laurels" }
  ],

  // Contact, Hours & Location
  contact: {
    phone: "+1 (555) 382-7423",
    reservationPhone: "+1 (555) 774-2300",
    email: "concierge@spicehaven-dining.com",
    address: "482 Royal Sovereign Avenue, Suite 10, Metro District",
    city: "San Francisco, CA 94107",
    googleMapsUrl: "https://maps.google.com/?q=San+Francisco+Fine+Dining",
    schedule: [
      { days: "Tuesday - Thursday", lunch: "12:00 PM - 3:00 PM", dinner: "5:30 PM - 10:30 PM" },
      { days: "Friday - Saturday", lunch: "12:00 PM - 3:30 PM", dinner: "5:00 PM - 11:30 PM" },
      { days: "Sunday", lunch: "11:30 AM - 4:00 PM (Brunch)", dinner: "5:30 PM - 10:00 PM" },
      { days: "Monday", lunch: "Closed for Sourcing", dinner: "Private Bookings Only" }
    ],
    social: {
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      tripadvisor: "https://tripadvisor.com",
      michelin: "https://guide.michelin.com"
    }
  },

  // Online Ordering & Payment Settings
  commerce: {
    currencySymbol: "₹",
    currencyCode: "INR",
    taxRate: 0.05, // 5% GST on dining service
    deliveryFee: 150,
    freeDeliveryThreshold: 3000,
    serviceChargePercent: 0.05, // 5% hospitality service
    allowDiningModes: ["Dine-In Pre-Order", "Curated Takeout", "Private Courier"],
    promotions: [
      { code: "SAVOR15", discountPercent: 15, minOrder: 2500, description: "15% off orders above ₹2,500" },
      { code: "CHEFGUEST", discountPercent: 20, minOrder: 5000, description: "20% off fine dining tasting above ₹5,000" }
    ],
    paymentMethods: [
      { id: "upi_qr", name: "UPI Instant Digital Pay (Google Pay / PhonePe / Paytm)", icon: "qr-code" },
      { id: "card", name: "Credit / Debit Card", icon: "credit-card" },
      { id: "dine_pay", name: "Pay at Table / Counter", icon: "wallet" }
    ],
    // Centralized UPI Instant Payment & Merchant Configuration
    upiPayment: {
      enabled: true,
      merchantName: "Naveen", // Payee name corresponding to bank account holder
      businessName: "Spice Haven Dining",
      upiId: "naveenofficial916@okaxis", // Centralized Merchant UPI ID / VPA
      merchantCode: "", // Left blank for personal VPAs so Google Pay does not throw 'couldn't load banking name'
      isMerchantAccount: false,
      currency: "INR",
      currencySymbol: "₹",
      conversionRate: 1, // Base menu is natively in INR
      notePrefix: "Spice Haven",
      supportApps: ["Google Pay", "PhonePe", "Paytm", "BHIM", "CRED UPI"]
    }
  },

  // Table Reservation Settings
  reservations: {
    minGuests: 1,
    maxGuests: 12,
    defaultGuests: 2,
    diningAreas: [
      { id: "main_hall", name: "The Grand Dining Hall", description: "Dramatic high ceilings, wood-fired hearth views & ambient jazz", premium: false },
      { id: "wine_cellar", name: "Sommelier's Private Cellar", description: "Surrounded by 1,200 vintage bottles with custom sommelier pairings", premium: true },
      { id: "chef_counter", name: "Chef's Omakase Counter", description: "Front-row interactive seating with Executive Chef Julian Vance", premium: true },
      { id: "terrace", name: "Starlit Glasshouse Terrace", description: "Lush botanical setting with climate-controlled starlight panoramic views", premium: false }
    ],
    timeSlots: [
      "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
      "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"
    ],
    occasions: ["Casual Dinner", "Romantic Date Night", "Anniversary Celebration", "Business Gathering", "Birthday Feast", "Food Connoisseur Tasting"]
  },

  // Menu Catalog
  menuCategories: [
    { id: "all", name: "All Creations", badge: "Complete Menu" },
    { id: "starters", name: "Starters", badge: "Small Plates" },
    { id: "soups", name: "Soups", badge: "Artisanal Broths" },
    { id: "mains", name: "Main Course", badge: "Woodfired Mains" },
    { id: "vegetarian", name: "Vegetarian", badge: "Heirloom Greens" },
    { id: "non-vegetarian", name: "Non-Vegetarian", badge: "Artisanal Cuts" },
    { id: "seafood", name: "Seafood", badge: "Ocean Fresh" },
    { id: "specialities", name: "Spice Haven Specialities", badge: "Chef's Signature" },
    { id: "desserts", name: "Desserts", badge: "Artisanal Sweets" },
    { id: "beverages", name: "Beverages", badge: "Cocktails & Cellar" }
  ],

  menuItems: [
    // Tasting / Signature
    {
      id: "sh-01",
      categoryId: "tasting",
      course: "mains",
      isVeg: false,
      isSeafood: true,
      isSpecial: true,
      name: "Truffle Saffron Black Cod",
      price: 3999,
      description: "Wild Alaskan black cod glazed in 12-year aged mirin, Kashmiri saffron emulsion, black winter truffle carpaccio, and charred scallion oil.",
      pairing: "Pair with: 2021 Domaine Leflaive Puligny-Montrachet",
      tags: ["Chef's Special", "Gluten-Free", "Wild Caught", "Seafood"],
      calories: 580,
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-02",
      categoryId: "tasting",
      course: "mains",
      isVeg: false,
      isSeafood: false,
      isSpecial: true,
      name: "Smoked A5 Miyazaki Wagyu Ribcap",
      price: 5999,
      description: "Grade A5 Wagyu seared over binchotan charcoal, bone marrow demiglace infused with tellicherry peppercorn, and smoked parsnip velvet.",
      pairing: "Pair with: 2018 Tenuta San Guido Sassicaia",
      tags: ["Signature", "Dry-Aged", "Award Winner", "Chef's Special"],
      calories: 740,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-03",
      categoryId: "tasting",
      course: "mains",
      isVeg: false,
      isSeafood: true,
      isSpecial: true,
      name: "Lobster Tail & Smoked Ghee Risotto",
      price: 4499,
      description: "Butter-poached Atlantic lobster tail, Acquerello aged carnaroli rice, clarified heritage spiced ghee, and crisp sea asparagus.",
      pairing: "Pair with: 2020 Louis Roederer Cristal Brut",
      tags: ["Chef's Special", "Seafood"],
      calories: 620,
      image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80"
    },

    // Starters & Soups
    {
      id: "sh-04",
      categoryId: "starters",
      course: "soups",
      isVeg: true,
      isSeafood: false,
      isSpecial: false,
      name: "Wild Morel & Porcini Velouté",
      price: 1999,
      description: "Foraged Oregon morel mushrooms, roasted garlic cream, cold-pressed hazelnut oil drops, and a warm thyme-brioche crisp.",
      pairing: "Pair with: Dry Amontillado Sherry",
      tags: ["Vegetarian", "Seasonal", "Soup"],
      calories: 340,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-05",
      categoryId: "starters",
      course: "starters",
      isVeg: false,
      isSeafood: true,
      isSpecial: false,
      name: "Charred Spanish Octopus Tentacle",
      price: 2499,
      description: "Tender braised & oak-grilled octopus, smoked paprika romesco sauce, fingerling potato crisps, and pickled mustard caviar.",
      pairing: "Pair with: 2022 Albariño, Rías Baixas",
      tags: ["Gluten-Free", "Guest Favorite", "Seafood"],
      calories: 410,
      image: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-06",
      categoryId: "starters",
      course: "starters",
      isVeg: true,
      isSeafood: false,
      isSpecial: false,
      name: "Burrata Pugliese with Charred Fig",
      price: 1899,
      description: "Creamy hand-tied burrata, mission figs caramelized in spiced lavender honey, aged Modena balsamic, and toasted pistachio dukkah.",
      pairing: "Pair with: Franciacorta Sparkling Rosé",
      tags: ["Vegetarian"],
      calories: 450,
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-17",
      categoryId: "starters",
      course: "starters",
      isVeg: true,
      isSeafood: false,
      isSpecial: true,
      name: "Smoked Truffle Malai Paneer",
      price: 2199,
      description: "Handmade artisanal cottage cheese, clotted Malai cream marinade, white winter truffle drops, and charred heirloom pepper coulis.",
      pairing: "Pair with: 2022 Sancerre Blanc",
      tags: ["Vegetarian", "Chef's Special", "Gluten-Free"],
      calories: 420,
      image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-16",
      categoryId: "soups",
      course: "soups",
      isVeg: false,
      isSeafood: true,
      isSpecial: true,
      name: "Kashmiri Saffron Lobster Bisque",
      price: 2299,
      description: "Slow-simmered Atlantic lobster coral broth, pure Kashmiri saffron strands, crème fraîche quenelle, and toasted brioche croutons.",
      pairing: "Pair with: 2021 Chablis Grand Cru",
      tags: ["Chef's Special", "Seafood", "Soup", "Gluten-Free"],
      calories: 380,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80"
    },

    // Mains
    {
      id: "sh-07",
      categoryId: "mains",
      course: "mains",
      isVeg: false,
      isSeafood: false,
      isSpecial: true,
      name: "Slow-Braised Heritage Lamb Shank",
      price: 3799,
      description: "Braised for 14 hours in cinnamon bark, star anise, and pomegranate reduction. Served over saffron polenta with crispy shallots.",
      pairing: "Pair with: 2019 Châteauneuf-du-Pape",
      tags: ["Signature", "Slow Cooked", "Chef's Special"],
      calories: 820,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-08",
      categoryId: "mains",
      course: "mains",
      isVeg: false,
      isSeafood: false,
      isSpecial: false,
      name: "Woodfired Duck Breast with Cherry Glaze",
      price: 3599,
      description: "Crispy skin Rohan duck breast, sour Morello cherry reduction, roasted heirloom baby beets, and green cardamom carrot puree.",
      pairing: "Pair with: 2018 Oregon Willamette Valley Pinot Noir",
      tags: ["Gluten-Free", "Chef's Special"],
      calories: 690,
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-09",
      categoryId: "mains",
      course: "mains",
      isVeg: true,
      isSeafood: false,
      isSpecial: false,
      name: "Heritage Woodfired Cauliflower Steak",
      price: 2699,
      description: "Whole roasted spice-rubbed cauliflower, tahini citrus foam, pomegranate jewels, pine nut butter, and micro mint salad.",
      pairing: "Pair with: 2021 Grüner Veltliner Reserve",
      tags: ["Vegan", "Gluten-Free", "Vegetarian"],
      calories: 380,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"
    },

    // Grills / Smoked Cuts
    {
      id: "sh-10",
      categoryId: "grills",
      course: "mains",
      isVeg: false,
      isSeafood: false,
      isSpecial: false,
      name: "Kashmiri Spiced Lamb Chops",
      price: 4199,
      description: "Single-cut lamb rack marinated in hung yogurt, raw papaya, smoked Kashmiri deggi mirch, grilled over roaring mesquite coals.",
      pairing: "Pair with: 2017 Barolo DOCG",
      tags: ["Spicy", "Charcoal Grill"],
      calories: 710,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-11",
      categoryId: "grills",
      course: "starters",
      isVeg: false,
      isSeafood: true,
      isSpecial: false,
      name: "Tiger Prawns with Malabar Curry Leaf Butter",
      price: 3299,
      description: "Jumbo ocean tiger prawns split and char-broiled with crushed green peppercorns, roasted garlic, and tempered curry leaf ghee.",
      pairing: "Pair with: Crisp Sauvignon Blanc, Marlborough",
      tags: ["Seafood", "Gluten-Free"],
      calories: 490,
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80"
    },

    // Desserts
    {
      id: "sh-12",
      categoryId: "desserts",
      course: "desserts",
      isVeg: true,
      isSeafood: false,
      isSpecial: true,
      name: "Dark Valrhona Fondant & Gold Leaf",
      price: 1699,
      description: "72% Araguani chocolate molten cake, Madagascar bourbon vanilla bean gelato, 24k edible gold leaf, and smoked sea salt caramel crisp.",
      pairing: "Pair with: 20-Year Old Tawny Port",
      tags: ["Vegetarian", "Pastry Master", "Chef's Special"],
      calories: 520,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-13",
      categoryId: "desserts",
      course: "desserts",
      isVeg: true,
      isSeafood: false,
      isSpecial: false,
      name: "Saffron Cardamom Crème Brûlée",
      price: 1599,
      description: "Silky baked custard infused with pure saffron strands and green cardamom pods, under a torch-crackled caramelized demerara crust.",
      pairing: "Pair with: Royal Tokaji 5 Puttonyos",
      tags: ["Vegetarian", "Gluten-Free"],
      calories: 430,
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=900&q=80"
    },

    // Cocktails & Cellar
    {
      id: "sh-14",
      categoryId: "cellar",
      course: "beverages",
      isVeg: true,
      isSeafood: false,
      isSpecial: true,
      name: "The Smoked Saffron Manhattan",
      price: 1899,
      description: "Small-batch rye whiskey, sweet carpano antica vermouth, house saffron bitters, presented inside a cloche of applewood smoke.",
      pairing: "Signature Cocktail",
      tags: ["Artisanal Bar", "Craft Spirit", "Chef's Special"],
      calories: 195,
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "sh-15",
      categoryId: "cellar",
      course: "beverages",
      isVeg: true,
      isSeafood: false,
      isSpecial: false,
      name: "Botanical Cardamom & Rose Highball",
      price: 1799,
      description: "Japanese artisanal gin, wild Damascus rose petal syrup, crushed cardamom seed tincture, Fever-Tree club soda, and dehydrated blood orange wheel.",
      pairing: "Signature Cocktail",
      tags: ["Refreshing", "Botanical"],
      calories: 160,
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80"
    }
  ],

  // Visual Gallery
  gallery: [
    {
      title: "Woodfired Flame Craft",
      category: "kitchen",
      categoryLabel: "Culinary Craft",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      description: "Open hearth binchotan charcoal grilling in our exhibition kitchen."
    },
    {
      title: "The Grand Obsidian Dining Room",
      category: "ambiance",
      categoryLabel: "Interior & Ambiance",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      description: "Moody, candlelit ambiance curated for memorable celebrations."
    },
    {
      title: "A5 Miyazaki Wagyu Plating",
      category: "dishes",
      categoryLabel: "Signature Dishes",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
      description: "Artistic tableside presentation of our celebrated marbled ribcap."
    },
    {
      title: "The Botanical Cocktail Lounge",
      category: "drinks",
      categoryLabel: "Mixology & Bar",
      image: "https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=1200&q=80",
      description: "Handcrafted syrups, rare botanicals, and bespoke ice spheres."
    },
    {
      title: "Private Sommelier Vault",
      category: "ambiance",
      categoryLabel: "Interior & Ambiance",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
      description: "Underground climate-monitored wine sanctuary hosting rare vintages."
    },
    {
      title: "Artisanal Dessert Geometry",
      category: "dishes",
      categoryLabel: "Signature Dishes",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
      description: "Finishing touch: hand-applied 24-karat gold leaf over single-origin chocolate."
    }
  ],

  // Guest & Critic Reviews
  testimonials: [
    {
      author: "Elena Rostova",
      role: "Senior Food Critic, Epicurean Chronicle",
      rating: 5,
      quote: "Spice Haven is a triumph. Julian Vance treats spices not as blunt seasoning, but as intricate, luminous musical chords. The Wagyu ribcap alone is worth crossing continents for.",
      date: "February 2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    {
      author: "Marcus Sterling",
      role: "Private Equity Partner & Wine Collector",
      rating: 5,
      quote: "We hosted an executive celebration in the Private Sommelier Cellar. The service was telepathic, the wine pairings were revelationary, and the room was sheer dark cinematic magnificence.",
      date: "January 2026",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    {
      author: "Sophia Chen & Liam K.",
      role: "Anniversary Guests",
      rating: 5,
      quote: "The atmosphere takes your breath away from the second you enter. Warm candle glow, faint scents of roasted cardamom, and every single plate was like a masterpiece at the MoMA.",
      date: "March 2026",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
    }
  ]
};

// Centralized Indian Rupee Currency Formatter
const inrCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

RestaurantConfig.formatCurrency = function(amount) {
  const num = typeof amount === "number" ? amount : Number(amount) || 0;
  return inrCurrencyFormatter.format(Math.round(num));
};

// Export configuration globally for browser execution and Node environments
if (typeof window !== "undefined") {
  window.RestaurantConfig = RestaurantConfig;
  window.formatCurrency = RestaurantConfig.formatCurrency;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { RestaurantConfig, formatCurrency: RestaurantConfig.formatCurrency };
}

