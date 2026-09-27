/**
 * SPICE HAVEN - VISUAL GALLERY & LIGHTBOX MODULE
 */

const GalleryModule = {
  activeCategory: 'all',
  currentIndex: 0,
  items: [],

  init() {
    if (!window.RestaurantConfig?.gallery) return;
    this.items = window.RestaurantConfig.gallery;
    this.renderCategoryFilter();
    this.renderGalleryGrid();
    this.setupLightbox();
  },

  renderCategoryFilter() {
    const container = document.getElementById('galleryCategoryTabs');
    if (!container) return;

    const categories = [
      { id: 'all', label: 'All Visuals' },
      { id: 'dishes', label: 'Signature Dishes' },
      { id: 'ambiance', label: 'Interior & Ambiance' },
      { id: 'kitchen', label: 'Culinary Craft' },
      { id: 'drinks', label: 'Mixology & Bar' }
    ];

    container.innerHTML = categories.map(cat => `
      <button class="category-tab-btn ${cat.id === this.activeCategory ? 'active' : ''}" data-cat="${cat.id}">
        ${cat.label}
      </button>
    `).join('');

    container.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-cat');
        this.renderGalleryGrid();
      });
    });
  },

  renderGalleryGrid() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const filtered = this.items.filter(item => 
      this.activeCategory === 'all' || item.category === this.activeCategory
    );

    grid.innerHTML = filtered.map((item, idx) => `
      <div class="gallery-item menu-item-fade" data-index="${idx}">
        <img src="${item.image}" alt="${item.title}" loading="lazy" />
        <div class="gallery-item-overlay">
          <span class="gallery-item-tag">${item.categoryLabel}</span>
          <h4 class="gallery-item-title">${item.title}</h4>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.gallery-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        this.openLightbox(idx, filtered);
      });
    });
  },

  setupLightbox() {
    const modal = document.getElementById('lightboxModal');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeLightbox());
    if (prevBtn) prevBtn.addEventListener('click', () => this.navigateLightbox(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.navigateLightbox(1));

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeLightbox();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!modal?.classList.contains('open')) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
      if (e.key === 'ArrowRight') this.navigateLightbox(1);
    });
  },

  activeFilteredList: [],

  openLightbox(index, filteredList) {
    this.activeFilteredList = filteredList || this.items;
    this.currentIndex = index;

    const modal = document.getElementById('lightboxModal');
    if (!modal) return;

    this.updateLightboxContent();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  navigateLightbox(direction) {
    if (!this.activeFilteredList.length) return;
    this.currentIndex = (this.currentIndex + direction + this.activeFilteredList.length) % this.activeFilteredList.length;
    this.updateLightboxContent();
  },

  updateLightboxContent() {
    const currentItem = this.activeFilteredList[this.currentIndex];
    if (!currentItem) return;

    const img = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');

    if (img) {
      img.src = currentItem.image;
      img.alt = currentItem.title;
    }

    if (caption) {
      caption.innerHTML = `
        <h4 style="font-family: var(--font-serif); font-size: 1.25rem; color: #FFF; margin-bottom: 4px;">${currentItem.title}</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">${currentItem.description}</p>
      `;
    }
  }
};

window.GalleryModule = GalleryModule;
