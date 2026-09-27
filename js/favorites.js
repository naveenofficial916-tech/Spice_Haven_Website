/**
 * SPICE HAVEN FINE DINING — FAVORITES & PERSONALIZED DISCOVERY ENGINE
 * Task 13: Customer Favorites, Order Again & Personalized Menu Navigation
 * 
 * Features:
 *  - Elegant heart toggle on every menu card with smooth micro-animation
 *  - Persistent storage in localStorage ('spicehaven_favorites') and backend POST /api/customer/favorites
 *  - Scoped to authenticated/active customer profile without exposing data to other patrons
 *  - Dedicated "My Favorites" area with photo, name, description, price, and Add to Order CTA
 *  - Exact required empty state: "Your favorite flavors will appear here." + "Explore Menu" CTA
 *  - Personalized Discovery based strictly on genuine data:
 *      * My Favorites (saved items)
 *      * Order Again (distinct dishes from verified past orders)
 *      * Recently Viewed (dishes inspected during browsing session)
 *  - 1-Click "❤️ Favorites" menu filter category integration
 */

const FavoritesModule = {
  favoritesKey: 'spicehaven_favorites',
  recentlyViewedKey: 'spicehaven_recently_viewed',

  init() {
    this.syncFromBackend();
    this.setupListeners();
  },

  /**
   * Get list of favorited item IDs
   */
  getFavorites() {
    try {
      const saved = localStorage.getItem(this.favoritesKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Error reading local favorites:", e);
    }
    return [];
  },

  /**
   * Check if a specific item is favorited
   */
  isFavorite(itemId) {
    if (!itemId) return false;
    const favs = this.getFavorites();
    return favs.includes(String(itemId));
  },

  /**
   * Toggle favorite state for a given item ID
   */
  async toggle(itemId, buttonEl, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!itemId) return;
    const strId = String(itemId);
    let favs = this.getFavorites();
    const isFav = favs.includes(strId);
    let newFavState = false;

    if (isFav) {
      favs = favs.filter(id => id !== strId);
      newFavState = false;
    } else {
      favs.push(strId);
      newFavState = true;
    }

    // Persist locally
    try {
      localStorage.setItem(this.favoritesKey, JSON.stringify(favs));
    } catch (e) {
      console.warn("Error saving favorites locally:", e);
    }

    // Micro-animation & visual state update on the triggered button
    if (buttonEl) {
      buttonEl.classList.toggle('active', newFavState);
      buttonEl.setAttribute('aria-label', newFavState ? 'Remove from favorites' : 'Save to favorites');
      buttonEl.setAttribute('title', newFavState ? 'Favorited' : 'Add to Favorites');
      
      const svg = buttonEl.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', newFavState ? 'currentColor' : 'none');
      }

      // Add bounce pop animation
      buttonEl.classList.add('fav-pop');
      setTimeout(() => buttonEl.classList.remove('fav-pop'), 400);
    }

    // Synchronize all buttons in DOM with this item ID
    this.syncButtonStates(strId, newFavState);

    // Sync to backend if customer profile has an email
    this.syncToBackend(strId, newFavState ? 'add' : 'remove', favs);

    // Toast notification
    const itemObj = this.getMenuItem(strId);
    const itemName = itemObj ? itemObj.name : 'Creation';
    if (window.showToast) {
      if (newFavState) {
        window.showToast(`❤️ Added "${itemName}" to Connoisseur Favorites!`, 'success');
      } else {
        window.showToast(`Removed "${itemName}" from Favorites.`, 'info');
      }
    }

    // If Menu is currently displaying the favorites filter, re-render
    if (window.MenuModule && window.MenuModule.activeCategory === 'favorites') {
      window.MenuModule.renderMenuItems();
    }

    // If Profile Account Modal is showing favorites tab, re-render
    if (window.ProfileModule && window.ProfileModule.activeTab === 'favorites') {
      window.ProfileModule.render();
    }
  },

  syncButtonStates(itemId, isFav) {
    const matchingBtns = document.querySelectorAll(`.menu-card-fav-btn[data-item-id="${itemId}"]`);
    matchingBtns.forEach(btn => {
      btn.classList.toggle('active', isFav);
      btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Save to favorites');
      btn.setAttribute('title', isFav ? 'Favorited' : 'Add to Favorites');
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
      }
    });
  },

  async syncToBackend(itemId, action, fullList) {
    const profile = window.ProfileModule?.getProfile?.() || {};
    const email = profile.email;
    if (!email) return;

    try {
      await fetch('/api/customer/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, itemId, action, favorites: fullList })
      });
    } catch (e) {
      // Offline fallback silently stored in localStorage
    }
  },

  async syncFromBackend() {
    const profile = window.ProfileModule?.getProfile?.() || {};
    const email = profile.email;
    if (!email) return;

    try {
      const res = await fetch(`/api/customer/favorites?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.favorites)) {
        // Merge with local favorites
        const local = this.getFavorites();
        const merged = [...new Set([...local, ...data.favorites])];
        localStorage.setItem(this.favoritesKey, JSON.stringify(merged));
      }
    } catch (e) {}
  },

  getMenuItem(itemId) {
    const items = window.RestaurantConfig?.menuItems || [];
    return items.find(i => i.id === itemId) || null;
  },

  getFavoriteItems() {
    const favIds = this.getFavorites();
    const items = window.RestaurantConfig?.menuItems || [];
    return items.filter(i => favIds.includes(i.id));
  },

  /**
   * Personalized Discovery: Dishes from real past orders
   */
  getOrderAgainItems() {
    try {
      const orders = JSON.parse(localStorage.getItem('spicehaven_orders') || localStorage.getItem('vestic_orders') || '[]');
      if (!Array.isArray(orders) || orders.length === 0) return [];

      const orderedItemIds = new Map();
      orders.forEach(order => {
        const prods = Array.isArray(order.products) ? order.products : (Array.isArray(order.items) ? order.items : []);
        prods.forEach(p => {
          if (p.id) {
            orderedItemIds.set(p.id, (orderedItemIds.get(p.id) || 0) + (p.qty || 1));
          }
        });
      });

      const menuItems = window.RestaurantConfig?.menuItems || [];
      const orderAgainList = [];

      for (const [id, count] of orderedItemIds.entries()) {
        const item = menuItems.find(m => m.id === id);
        if (item) {
          orderAgainList.push({ ...item, orderCount: count });
        }
      }

      // Sort by order frequency
      orderAgainList.sort((a, b) => b.orderCount - a.orderCount);
      return orderAgainList;
    } catch (e) {
      console.warn("Error reading order history for reorder:", e);
      return [];
    }
  },

  /**
   * Track recently viewed item in session
   */
  trackView(itemId) {
    if (!itemId) return;
    try {
      let recents = JSON.parse(sessionStorage.getItem(this.recentlyViewedKey) || '[]');
      recents = recents.filter(id => id !== itemId);
      recents.unshift(itemId);
      if (recents.length > 8) recents = recents.slice(0, 8);
      sessionStorage.setItem(this.recentlyViewedKey, JSON.stringify(recents));
    } catch (e) {}
  },

  getRecentlyViewedItems() {
    try {
      const recents = JSON.parse(sessionStorage.getItem(this.recentlyViewedKey) || '[]');
      const menuItems = window.RestaurantConfig?.menuItems || [];
      return recents.map(id => menuItems.find(m => m.id === id)).filter(Boolean);
    } catch (e) {
      return [];
    }
  },

  /**
   * Render HTML for the Favorites & Personalized Menu section inside Account Modal
   */
  renderFavoritesSectionHtml() {
    const favoriteItems = this.getFavoriteItems();
    const orderAgainItems = this.getOrderAgainItems();
    const recentItems = this.getRecentlyViewedItems();
    const formatPrice = window.formatCurrency || ((val) => `₹${Math.round(val).toLocaleString('en-IN')}`);

    return `
      <div class="favorites-section-wrapper fade-in-section">
        <!-- 1. FAVORITES HEADER & LIST -->
        <div class="profile-card-header">
          <div>
            <h4 class="profile-card-title">My Connoisseur Favorites</h4>
            <p class="profile-card-subtitle">Your personally cherished gastronomy dishes for effortless reordering.</p>
          </div>
          <span class="profile-counter-tag">${favoriteItems.length} ${favoriteItems.length === 1 ? 'Dish' : 'Dishes'} Favorited</span>
        </div>

        ${favoriteItems.length === 0 ? this.renderEmptyStateHtml() : `
          <div class="personalized-dish-grid">
            ${favoriteItems.map(item => this.renderPersonalizedCardHtml(item, 'favorite')).join('')}
          </div>
        `}

        <!-- 2. ORDER AGAIN (REAL ORDER HISTORY) -->
        ${orderAgainItems.length > 0 ? `
          <div class="personalized-subgroup" style="margin-top: 36px; padding-top: 28px; border-top: 1px solid var(--border-subtle);">
            <div class="profile-card-header" style="margin-bottom: 16px;">
              <div>
                <h4 class="profile-card-title" style="font-size: 1.2rem;">Order Again</h4>
                <p class="profile-card-subtitle">Artisanal selections from your verified dining orders.</p>
              </div>
              <span class="profile-counter-tag" style="color: #4ADE80;">From Past Orders</span>
            </div>
            <div class="personalized-dish-grid">
              ${orderAgainItems.map(item => this.renderPersonalizedCardHtml(item, 'reorder')).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 3. RECENTLY VIEWED -->
        ${recentItems.length > 0 ? `
          <div class="personalized-subgroup" style="margin-top: 36px; padding-top: 28px; border-top: 1px solid var(--border-subtle);">
            <div class="profile-card-header" style="margin-bottom: 16px;">
              <div>
                <h4 class="profile-card-title" style="font-size: 1.2rem;">Recently Explored Creations</h4>
                <p class="profile-card-subtitle">Dishes you recently inspected during your culinary visit.</p>
              </div>
            </div>
            <div class="personalized-dish-grid">
              ${recentItems.map(item => this.renderPersonalizedCardHtml(item, 'recent')).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Render individual personalized food card
   */
  renderPersonalizedCardHtml(item, context = 'favorite') {
    const isFav = this.isFavorite(item.id);
    const formatPrice = window.formatCurrency || ((val) => `₹${Math.round(val).toLocaleString('en-IN')}`);
    const safeName = this.escapeHtml(item.name);

    return `
      <div class="personalized-food-card" data-id="${item.id}">
        <div class="personalized-card-img-wrap">
          <img 
            src="${item.image}" 
            alt="${safeName}" 
            class="personalized-card-img" 
            loading="lazy" 
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';"
          />
          <button 
            type="button" 
            class="menu-card-fav-btn ${isFav ? 'active' : ''}" 
            data-item-id="${item.id}"
            onclick="FavoritesModule.toggle('${item.id}', this, event)"
            aria-label="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
            title="${isFav ? 'Favorited' : 'Add to Favorites'}"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          ${item.orderCount ? `<span class="reorder-count-badge">Ordered ${item.orderCount}×</span>` : ''}
        </div>

        <div class="personalized-card-body">
          <div class="personalized-card-top">
            <h5 class="personalized-card-title">${safeName}</h5>
            <span class="personalized-card-price">${formatPrice(item.price)}</span>
          </div>

          <p class="personalized-card-desc">${this.escapeHtml(item.description)}</p>

          <div class="personalized-card-actions">
            <button 
              type="button" 
              class="btn btn-primary-gold btn-sm gold-shimmer" 
              onclick="FavoritesModule.handleAddToCart('${item.id}', this)"
              style="width: 100%; justify-content: center;"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Add to Order
            </button>
          </div>
        </div>
      </div>
    `;
  },

  handleAddToCart(itemId, buttonEl) {
    if (window.CartModule && typeof window.CartModule.handleAddToCart === 'function') {
      window.CartModule.handleAddToCart(itemId, buttonEl);
      if (window.MenuModule && typeof window.MenuModule.syncCardQuantities === 'function') {
        window.MenuModule.syncCardQuantities();
      }
    }
  },

  /**
   * 2. Empty state for Favorites
   * Requirement 2: Exact text "Your favorite flavors will appear here." + "Explore Menu" button
   */
  renderEmptyStateHtml() {
    return `
      <div class="profile-empty-state fade-in-section">
        <div class="empty-state-icon">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <h4 class="empty-state-title">Your favorite flavors will appear here.</h4>
        <p class="empty-state-subtitle">
          Save your most cherished Spice Haven dishes by clicking the heart icon on any menu card for rapid discovery and reordering.
        </p>
        <button type="button" class="btn btn-primary-gold gold-shimmer" onclick="FavoritesModule.exploreMenu()">
          Explore Menu →
        </button>
      </div>
    `;
  },

  exploreMenu() {
    if (window.ProfileModule && typeof window.ProfileModule.close === 'function') {
      window.ProfileModule.close();
    }
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = 'menu';
    }
    if (window.MenuModule && typeof window.MenuModule.selectCategory === 'function') {
      window.MenuModule.selectCategory('all');
    }
  },

  setupListeners() {
    // Listen for menu item clicks to track recently viewed
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.menu-card[data-id]');
      if (card) {
        const id = card.getAttribute('data-id');
        this.trackView(id);
      }
    });
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

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    FavoritesModule.init();
  });
}

// Global & CommonJS exports
if (typeof window !== 'undefined') {
  window.FavoritesModule = FavoritesModule;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FavoritesModule;
}
