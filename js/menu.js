/**
 * SPICE HAVEN - PREMIUM INTERACTIVE MENU CATALOG & SEARCH/FILTER ENGINE
 * Task 14: Smart Menu Search, Multi-Faceted Filtering & Curated Sorting
 * 
 * Features:
 *  - Real-time search across dish names, descriptions, courses, and tags
 *  - Clear search trigger with instant reset
 *  - Multi-dimensional Category tabs (Starters, Mains, Seafood, Desserts, Favorites, etc.)
 *  - Authentic Dietary filters (All, Pure Veg, Non-Veg, Seafood, Chef's Special, Gluten-Free, Vegan)
 *  - Exact Price range filters (Under ₹2,000, ₹2,000–₹4,000, Above ₹4,000)
 *  - Curated Sorting (Chef's Recommended, Price: Low to High, Price: High to Low, Alphabetical A-Z)
 *  - Removable active filter badges & 1-click "Clear Filters"
 *  - Exact "No dishes found." empty state + "Clear Filters" button
 *  - Full integration with Cart, Favorites, and Chef Animations
 */

const MenuModule = {
  activeCategory: 'all',
  activeDietary: 'all',
  activePriceRange: 'all',
  activeSort: 'recommended',
  searchQuery: '',

  init() {
    this.renderCategoryTabs();
    this.setupFilters();
    this.renderMenuItems();
  },

  renderCategoryTabs() {
    const container = document.getElementById('menuCategoryTabs');
    if (!container || !window.RestaurantConfig) return;

    const categories = window.RestaurantConfig.menuCategories || [];

    let html = `
      <div class="category-tabs-track" role="tablist" aria-label="Menu Culinary Categories">
    `;

    categories.forEach(cat => {
      const isActive = this.activeCategory === cat.id;
      html += `
        <button 
          class="category-tab-btn ${isActive ? 'active' : ''}" 
          data-category="${cat.id}"
          role="tab"
          aria-selected="${isActive ? 'true' : 'false'}"
          aria-label="Filter menu by ${cat.name}"
        >
          <span class="cat-name">${cat.name}</span>
          ${cat.badge ? `<span class="cat-badge">${cat.badge}</span>` : ''}
        </button>
      `;
    });

    // Append Favorites Tab
    const isFavActive = this.activeCategory === 'favorites';
    html += `
      <button 
        class="category-tab-btn fav-tab-btn ${isFavActive ? 'active' : ''}" 
        data-category="favorites"
        role="tab"
        aria-selected="${isFavActive ? 'true' : 'false'}"
        aria-label="Filter menu by your favorited dishes"
      >
        <span class="cat-name">❤️ Favorites</span>
      </button>
    `;

    html += `</div>`;
    container.innerHTML = html;

    // Attach click events
    container.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category');
        this.selectCategory(catId);
      });
    });
  },

  selectCategory(catId) {
    this.activeCategory = catId;
    const container = document.getElementById('menuCategoryTabs');
    if (container) {
      container.querySelectorAll('.category-tab-btn').forEach(b => {
        const match = b.getAttribute('data-category') === catId;
        b.classList.toggle('active', match);
        b.setAttribute('aria-selected', match ? 'true' : 'false');
      });
    }

    this.renderMenuItems();

    // Smooth scroll active tab into view horizontally on mobile
    const activeBtn = container?.querySelector(`.category-tab-btn[data-category="${catId}"]`);
    if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  },

  setupFilters() {
    // Dietary filter chips
    const dietaryChips = document.querySelectorAll('.dietary-filter-chip');
    dietaryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const dietVal = chip.getAttribute('data-dietary') || 'all';
        this.setDietary(dietVal);
      });
    });

    // Real-time search input
    const searchInput = document.getElementById('menuSearchInput');
    const clearBtn = document.getElementById('menuSearchClearBtn');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.searchQuery = searchInput.value.trim().toLowerCase();
        if (clearBtn) {
          clearBtn.style.display = this.searchQuery ? 'flex' : 'none';
        }
        this.renderMenuItems();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearSearch();
      });
    }

    // Price range selector
    const priceSelect = document.getElementById('menuPriceSelect');
    if (priceSelect) {
      priceSelect.addEventListener('change', (e) => {
        this.activePriceRange = e.target.value;
        this.renderMenuItems();
      });
    }

    // Sort order selector
    const sortSelect = document.getElementById('menuSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.activeSort = e.target.value;
        this.renderMenuItems();
      });
    }
  },

  setDietary(dietVal) {
    this.activeDietary = dietVal;
    const dietaryChips = document.querySelectorAll('.dietary-filter-chip');
    dietaryChips.forEach(c => {
      c.classList.toggle('active', (c.getAttribute('data-dietary') || 'all').toLowerCase() === dietVal.toLowerCase());
    });
    this.renderMenuItems();
  },

  setPriceRange(rangeVal) {
    this.activePriceRange = rangeVal;
    const priceSelect = document.getElementById('menuPriceSelect');
    if (priceSelect) priceSelect.value = rangeVal;
    this.renderMenuItems();
  },

  setSort(sortVal) {
    this.activeSort = sortVal;
    const sortSelect = document.getElementById('menuSortSelect');
    if (sortSelect) sortSelect.value = sortVal;
    this.renderMenuItems();
  },

  clearSearch() {
    this.searchQuery = '';
    const searchInput = document.getElementById('menuSearchInput');
    const clearBtn = document.getElementById('menuSearchClearBtn');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    if (clearBtn) clearBtn.style.display = 'none';
    this.renderMenuItems();
  },

  resetAllFilters() {
    this.activeCategory = 'all';
    this.activeDietary = 'all';
    this.activePriceRange = 'all';
    this.activeSort = 'recommended';
    this.searchQuery = '';

    // Reset Search DOM
    const searchInput = document.getElementById('menuSearchInput');
    const clearBtn = document.getElementById('menuSearchClearBtn');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';

    // Reset Category Tabs DOM
    const container = document.getElementById('menuCategoryTabs');
    if (container) {
      container.querySelectorAll('.category-tab-btn').forEach(b => {
        const isAll = b.getAttribute('data-category') === 'all';
        b.classList.toggle('active', isAll);
        b.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
    }

    // Reset Dietary DOM
    const dietaryChips = document.querySelectorAll('.dietary-filter-chip');
    dietaryChips.forEach(c => {
      c.classList.toggle('active', (c.getAttribute('data-dietary') || 'all') === 'all');
    });

    // Reset Price & Sort DOM
    const priceSelect = document.getElementById('menuPriceSelect');
    if (priceSelect) priceSelect.value = 'all';
    const sortSelect = document.getElementById('menuSortSelect');
    if (sortSelect) sortSelect.value = 'recommended';

    this.renderMenuItems();
  },

  getFavoritesModule() {
    if (typeof window !== 'undefined' && window.FavoritesModule) return window.FavoritesModule;
    if (typeof FavoritesModule !== 'undefined') return FavoritesModule;
    return null;
  },

  getRestaurantConfig() {
    if (typeof window !== 'undefined' && window.RestaurantConfig) return window.RestaurantConfig;
    if (typeof RestaurantConfig !== 'undefined') return RestaurantConfig;
    return null;
  },

  getCartModule() {
    if (typeof window !== 'undefined' && window.CartModule) return window.CartModule;
    if (typeof CartModule !== 'undefined') return CartModule;
    return null;
  },

  matchesCategory(item, catId) {
    if (!catId || catId === 'all') return true;
    const lowerCat = catId.toLowerCase();

    switch (lowerCat) {
      case 'starters':
        return item.course === 'starters' || item.categoryId === 'starters';

      case 'soups':
        return item.course === 'soups' || item.categoryId === 'soups' ||
               (item.tags && item.tags.some(t => t.toLowerCase() === 'soup')) ||
               item.name.toLowerCase().includes('velouté') || item.name.toLowerCase().includes('bisque');

      case 'mains':
      case 'main course':
        return item.course === 'mains' || item.categoryId === 'mains' ||
               item.categoryId === 'grills' || item.categoryId === 'tasting';

      case 'vegetarian':
      case 'veg':
        return item.isVeg === true || (item.tags && item.tags.some(t => 
          t.toLowerCase().includes('veg') || t.toLowerCase().includes('vegan')
        ));

      case 'non-vegetarian':
      case 'non-veg':
        if (item.isVeg === true) return false;
        if (item.tags && item.tags.some(t => t.toLowerCase() === 'vegetarian' || t.toLowerCase() === 'vegan')) return false;
        return true;

      case 'seafood':
        return item.isSeafood === true || (item.tags && item.tags.some(t => 
          t.toLowerCase().includes('seafood') || t.toLowerCase().includes('wild caught')
        ));

      case 'specialities':
      case 'spice haven specialities':
      case 'tasting':
        return item.isSpecial === true || item.categoryId === 'tasting' || (item.tags && item.tags.some(t => 
          t.toLowerCase().includes('special') || t.toLowerCase().includes('signature') || t.toLowerCase().includes('award')
        ));

      case 'favorites':
      case 'fav': {
        const favMod = this.getFavoritesModule();
        return favMod ? favMod.isFavorite(item.id) : false;
      }

      case 'desserts':
        return item.course === 'desserts' || item.categoryId === 'desserts';

      case 'beverages':
      case 'cellar':
        return item.course === 'beverages' || item.categoryId === 'cellar';

      default:
        return item.categoryId === catId || item.course === catId;
    }
  },

  matchesDietary(item, dietId) {
    if (!dietId || dietId === 'all') return true;
    const d = dietId.toLowerCase();

    if (d === 'veg' || d === 'vegetarian') {
      return item.isVeg === true || (item.tags && item.tags.some(t => t.toLowerCase().includes('veg')));
    }
    if (d === 'non-veg' || d === 'non-vegetarian') {
      return !item.isVeg && !(item.tags && item.tags.some(t => t.toLowerCase() === 'vegetarian' || t.toLowerCase() === 'vegan'));
    }
    if (d === 'seafood') {
      return item.isSeafood === true || (item.tags && item.tags.some(t => t.toLowerCase().includes('seafood')));
    }
    if (d === 'special' || d === "chef's special" || d === 'signature') {
      return item.isSpecial === true || (item.tags && item.tags.some(t => t.toLowerCase().includes('special') || t.toLowerCase().includes('signature')));
    }
    if (d === 'gluten-free') {
      return item.tags && item.tags.some(t => t.toLowerCase().includes('gluten'));
    }
    if (d === 'vegan') {
      return item.tags && item.tags.some(t => t.toLowerCase().includes('vegan') || t.toLowerCase().includes('plant'));
    }

    return item.tags && item.tags.some(t => t.toLowerCase().includes(d));
  },

  matchesPrice(item, priceRange) {
    if (!priceRange || priceRange === 'all') return true;
    const price = Number(item.price) || 0;

    switch (priceRange) {
      case 'under-2000':
        return price < 2000;
      case '2000-4000':
        return price >= 2000 && price <= 4000;
      case 'above-4000':
        return price > 4000;
      default:
        return true;
    }
  },

  matchesSearch(item, query) {
    if (!query) return true;
    const q = query.trim().toLowerCase();

    const nameMatch = (item.name || '').toLowerCase().includes(q);
    const descMatch = (item.description || '').toLowerCase().includes(q);
    const categoryMatch = (item.categoryId || '').toLowerCase().includes(q) || (item.course || '').toLowerCase().includes(q);
    const pairingMatch = (item.pairing || '').toLowerCase().includes(q);
    const tagsMatch = item.tags && item.tags.some(t => t.toLowerCase().includes(q));

    return nameMatch || descMatch || categoryMatch || pairingMatch || tagsMatch;
  },

  sortItems(itemsList, sortType) {
    const list = [...itemsList];
    switch (sortType) {
      case 'price-asc':
        return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case 'price-desc':
        return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      case 'name-asc':
        return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'recommended':
      default:
        return list; // Preserves curated degustation order
    }
  },

  filterAndSortItems(customCriteria) {
    const config = this.getRestaurantConfig();
    const rawItems = config?.menuItems || [];

    const category = customCriteria && customCriteria.category !== undefined ? customCriteria.category : this.activeCategory;
    const dietary = customCriteria && customCriteria.dietary !== undefined ? customCriteria.dietary : this.activeDietary;
    const priceRange = customCriteria && customCriteria.priceRange !== undefined ? customCriteria.priceRange : this.activePriceRange;
    const searchQuery = customCriteria && customCriteria.searchQuery !== undefined ? customCriteria.searchQuery : this.searchQuery;
    const sortBy = customCriteria && customCriteria.sortBy !== undefined ? customCriteria.sortBy : this.activeSort;

    const filtered = rawItems.filter(item => {
      return this.matchesCategory(item, category) &&
             this.matchesDietary(item, dietary) &&
             this.matchesPrice(item, priceRange) &&
             this.matchesSearch(item, searchQuery);
    });

    return this.sortItems(filtered, sortBy);
  },

  getItemCartQty(itemId) {
    const cartMod = this.getCartModule();
    if (!cartMod || !Array.isArray(cartMod.items)) return 0;
    const cartItem = cartMod.items.find(i => i.id === itemId);
    return cartItem ? (cartItem.qty || 0) : 0;
  },

  renderOrderAction(itemId, dishName) {
    const qty = this.getItemCartQty(itemId);
    const safeName = String(dishName || 'dish').replace(/"/g, '&quot;');

    if (qty > 0) {
      return `
        <div class="menu-card-qty-control" data-item-id="${itemId}" role="group" aria-label="Order quantity for ${safeName}">
          <button 
            type="button" 
            class="menu-qty-btn menu-qty-minus" 
            onclick="MenuModule.handleCardUpdateQty('${itemId}', -1)"
            aria-label="Decrease quantity of ${safeName}"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <span class="menu-qty-display" aria-live="polite">${qty} in Order</span>
          <button 
            type="button" 
            class="menu-qty-btn menu-qty-plus" 
            onclick="MenuModule.handleCardUpdateQty('${itemId}', 1)"
            aria-label="Increase quantity of ${safeName}"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      `;
    }

    return `
      <button 
        type="button" 
        class="add-to-cart-btn" 
        data-item-id="${itemId}"
        onclick="MenuModule.handleCardAddToCart('${itemId}', this)"
        aria-label="Add ${safeName} to order"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <span>Add to Order</span>
      </button>
    `;
  },

  handleCardAddToCart(itemId, buttonEl) {
    if (window.CartModule && typeof window.CartModule.handleAddToCart === 'function') {
      window.CartModule.handleAddToCart(itemId, buttonEl);
      this.syncCardQuantities();
    }
  },

  handleCardUpdateQty(itemId, delta) {
    if (window.CartModule && typeof window.CartModule.updateQty === 'function') {
      window.CartModule.updateQty(itemId, delta);
      this.syncCardQuantities();
    }
  },

  syncCardQuantities() {
    const cardNodes = document.querySelectorAll('.menu-card[data-id]');
    if (!cardNodes.length) return;

    cardNodes.forEach(card => {
      const itemId = card.getAttribute('data-id');
      const actionContainer = card.querySelector('.menu-card-action-slot');
      if (actionContainer) {
        const dishName = card.querySelector('.menu-card-title')?.textContent || 'dish';
        actionContainer.innerHTML = this.renderOrderAction(itemId, dishName);
      }
    });
  },

  /**
   * Render active filter badges row allowing patrons to dismiss individual filters
   */
  renderActiveFilterBadges() {
    const container = document.getElementById('menuActiveFilterBadges');
    if (!container) return;

    const badges = [];

    if (this.searchQuery) {
      badges.push(`
        <span class="active-filter-badge">
          Search: "${this.escapeHtml(this.searchQuery)}"
          <button type="button" onclick="MenuModule.clearSearch()" aria-label="Remove search filter">&times;</button>
        </span>
      `);
    }

    if (this.activeCategory !== 'all') {
      const catObj = (window.RestaurantConfig?.menuCategories || []).find(c => c.id === this.activeCategory);
      const catName = this.activeCategory === 'favorites' ? 'Favorites' : (catObj ? catObj.name : this.activeCategory);
      badges.push(`
        <span class="active-filter-badge">
          Category: ${this.escapeHtml(catName)}
          <button type="button" onclick="MenuModule.selectCategory('all')" aria-label="Remove category filter">&times;</button>
        </span>
      `);
    }

    if (this.activeDietary !== 'all') {
      badges.push(`
        <span class="active-filter-badge">
          Dietary: ${this.escapeHtml(this.activeDietary)}
          <button type="button" onclick="MenuModule.setDietary('all')" aria-label="Remove dietary filter">&times;</button>
        </span>
      `);
    }

    if (this.activePriceRange !== 'all') {
      const priceLabels = {
        'under-2000': 'Under ₹2,000',
        '2000-4000': '₹2,000 – ₹4,000',
        'above-4000': 'Above ₹4,000'
      };
      badges.push(`
        <span class="active-filter-badge">
          Price: ${priceLabels[this.activePriceRange] || this.activePriceRange}
          <button type="button" onclick="MenuModule.setPriceRange('all')" aria-label="Remove price filter">&times;</button>
        </span>
      `);
    }

    if (this.activeSort !== 'recommended') {
      const sortLabels = {
        'price-asc': 'Price: Low to High',
        'price-desc': 'Price: High to Low',
        'name-asc': 'Alphabetical: A-Z'
      };
      badges.push(`
        <span class="active-filter-badge">
          Sort: ${sortLabels[this.activeSort] || this.activeSort}
          <button type="button" onclick="MenuModule.setSort('recommended')" aria-label="Reset sort">&times;</button>
        </span>
      `);
    }

    if (badges.length > 0) {
      container.innerHTML = `
        <div class="active-filters-track">
          <span class="active-filters-label">Active Filters:</span>
          ${badges.join('')}
          <button type="button" class="btn-clear-all-filters" onclick="MenuModule.resetAllFilters()">
            Clear All
          </button>
        </div>
      `;
      container.style.display = 'block';
    } else {
      container.innerHTML = '';
      container.style.display = 'none';
    }
  },

  /**
   * 5. No Results State
   * Requirement 5: "No dishes found." + "Clear Filters" button
   */
  renderNoResultsHtml() {
    return `
      <div class="menu-empty-state profile-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <div class="empty-state-icon">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h4 class="empty-state-title" style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--text-light); margin-bottom: 8px;">No dishes found.</h4>
        <p class="empty-state-subtitle" style="font-size: 0.92rem; color: var(--text-muted); max-width: 440px; margin: 0 auto 24px auto; line-height: 1.6;">
          No culinary creations matched your current search and filter combination. Adjust your criteria or reset filters to explore our full degustation menu.
        </p>
        <button type="button" class="btn btn-primary-gold gold-shimmer" onclick="MenuModule.resetAllFilters()">
          Clear Filters
        </button>
      </div>
    `;
  },

  renderMenuItems() {
    const container = document.getElementById('menuGrid');
    if (!container || !window.RestaurantConfig) return;

    const items = this.filterAndSortItems();
    const formatPrice = window.formatCurrency || ((val) => `₹${Math.round(val).toLocaleString('en-IN')}`);

    this.renderActiveFilterBadges();

    // Results Counter
    const countEl = document.getElementById('menuResultsCount');
    if (countEl) {
      countEl.textContent = `${items.length} ${items.length === 1 ? 'Creation' : 'Creations'}`;
    }

    if (items.length === 0) {
      if (this.activeCategory === 'favorites' && !this.searchQuery && this.activeDietary === 'all' && this.activePriceRange === 'all') {
        container.innerHTML = `
          <div class="menu-empty-state profile-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <div class="empty-state-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h4 class="empty-state-title" style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--text-light); margin-bottom: 8px;">Your favorite flavors will appear here.</h4>
            <p class="empty-state-subtitle" style="font-size: 0.92rem; color: var(--text-muted); max-width: 440px; margin: 0 auto 24px auto; line-height: 1.6;">
              Tap the heart icon on any culinary masterpiece to curate your personalized selection of favorites.
            </p>
            <button type="button" class="btn btn-primary-gold gold-shimmer" onclick="MenuModule.selectCategory('all')">
              Explore Menu →
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = this.renderNoResultsHtml();
      return;
    }

    container.innerHTML = items.map(item => {
      const isFav = window.FavoritesModule ? window.FavoritesModule.isFavorite(item.id) : false;

      // Tags HTML
      const tagHtml = (item.tags || []).map(tag => {
        let tagClass = 'diet-tag';
        if (tag.includes("Special") || tag.includes("Signature") || tag.includes("Award")) tagClass += ' special';
        if (tag.includes("Vegan") || tag.includes("Vegetarian")) tagClass += ' vegan';
        return `<span class="${tagClass}">${tag}</span>`;
      }).join('');

      // Vegetarian / Non-Vegetarian fine dining indicator
      const isPureVeg = item.isVeg === true;
      const vegIndicatorHtml = isPureVeg ? `
        <div class="culinary-indicator veg" title="Pure Vegetarian" aria-label="Pure Vegetarian">
          <span class="indicator-symbol"></span>
          <span class="indicator-text">VEG</span>
        </div>
      ` : `
        <div class="culinary-indicator non-veg" title="Non-Vegetarian" aria-label="Non-Vegetarian">
          <span class="indicator-symbol"></span>
          <span class="indicator-text">NON-VEG</span>
        </div>
      `;

      return `
        <article class="menu-card menu-item-fade" data-id="${item.id}">
          <div class="menu-card-media">
            <img 
              src="${item.image}" 
              alt="${item.name} - Artisanal Gastronomic Preparation" 
              class="menu-card-img food-zoom" 
              loading="lazy" 
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';"
            />
            <div class="menu-card-media-overlay"></div>

            <!-- Favorite Heart Toggle Button -->
            <button 
              type="button" 
              class="menu-card-fav-btn ${isFav ? 'active' : ''}" 
              data-item-id="${item.id}"
              onclick="FavoritesModule.toggle('${item.id}', this, event)"
              aria-label="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
              title="${isFav ? 'Favorited' : 'Add to Favorites'}"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            
            <!-- Veg / Non-Veg Indicator Badge -->
            <div class="menu-card-culinary-badge">
              ${vegIndicatorHtml}
            </div>

            <!-- Dietary Tag Chips -->
            <div class="menu-card-badge-container">
              ${tagHtml}
            </div>

            ${item.calories ? `<span class="menu-card-calories">${item.calories} kcal</span>` : ''}
          </div>

          <div class="menu-card-body">
            <div class="menu-card-header">
              <h3 class="menu-card-title">${item.name}</h3>
              <div class="menu-card-price">${formatPrice(item.price)}</div>
            </div>

            <p class="menu-card-desc">${item.description}</p>

            ${item.pairing ? `
              <div class="menu-card-pairing">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; vertical-align:-2px; margin-right:5px;">
                  <path d="M8 22h8M12 11v11M19 3v4a7 7 0 0 1-14 0V3z"></path>
                </svg>
                ${item.pairing}
              </div>
            ` : ''}

            <div class="menu-card-footer">
              <span class="menu-card-artisanal-label">
                Artisanal Preparation
              </span>
              <div class="menu-card-action-slot">
                ${this.renderOrderAction(item.id, item.name)}
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

if (typeof window !== 'undefined') {
  window.MenuModule = MenuModule;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuModule;
}
