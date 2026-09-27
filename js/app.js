/**
 * SPICE HAVEN - MAIN APPLICATION BOOTSTRAP & BRAND ORCHESTRATOR
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  currentTestimonialIndex: 0,
  testimonialInterval: null,

  init() {
    this.injectThemeTokens();
    this.populateBrandContent();
    this.setupTestimonialCarousel();
    this.setupOperatingHours();
    this.setupMobileMenu();
    this.setupForms();

    // Initialize submodules
    if (window.AppAnimations) window.AppAnimations.init();
    if (window.MenuModule) window.MenuModule.init();
    if (window.CartModule) window.CartModule.init();
    if (window.ReservationModule) window.ReservationModule.init();
    if (window.GalleryModule) window.GalleryModule.init();
  },

  // 1. Injects configured colors into :root CSS Variables
  injectThemeTokens() {
    if (!window.RestaurantConfig?.theme) return;

    const root = document.documentElement;
    const colors = window.RestaurantConfig.theme.colors;

    if (colors.primaryAccent) root.style.setProperty('--color-primary', colors.primaryAccent);
    if (colors.primaryHover) root.style.setProperty('--color-primary-hover', colors.primaryHover);
    if (colors.primarySubtle) root.style.setProperty('--color-primary-subtle', colors.primarySubtle);
    if (colors.primaryGlow) root.style.setProperty('--color-primary-glow', colors.primaryGlow);
    if (colors.bgDeep) root.style.setProperty('--bg-deep', colors.bgDeep);
    if (colors.bgSurface) root.style.setProperty('--bg-surface', colors.bgSurface);
    if (colors.bgSurfaceHover) root.style.setProperty('--bg-surface-hover', colors.bgSurfaceHover);
  },

  // 2. Populate dynamic brand data across all HTML placeholder nodes
  populateBrandContent() {
    const config = window.RestaurantConfig;
    if (!config) return;

    // Document title
    document.title = `${config.brand.name} | ${config.brand.tagline}`;

    // Brand Names & Taglines
    document.querySelectorAll('.brand-name-insert').forEach(el => el.textContent = config.brand.name);
    document.querySelectorAll('.brand-tagline-insert').forEach(el => el.textContent = config.brand.tagline);
    document.querySelectorAll('.brand-badge-insert').forEach(el => el.textContent = config.brand.badge);

    // Hero Text
    const heroPrefix = document.getElementById('heroHeadingPrefix');
    const heroEmph = document.getElementById('heroHeadingEmphasis');
    const heroSub = document.getElementById('heroSubheading');

    if (heroPrefix) heroPrefix.textContent = config.brand.heroHeadingPrefix;
    if (heroEmph) heroEmph.textContent = config.brand.heroHeadingEmphasis;
    if (heroSub) heroSub.textContent = config.brand.heroSubheading;

    // Story / Chef Section
    const storyHead = document.getElementById('storyHeading');
    const storySub = document.getElementById('storySubheading');
    const storyP1 = document.getElementById('storyText1');
    const storyP2 = document.getElementById('storyText2');
    const storyQuote = document.getElementById('storyQuote');
    const chefName = document.getElementById('chefName');
    const chefRole = document.getElementById('chefRole');

    if (storyHead) storyHead.textContent = config.brand.storyHeading;
    if (storySub) storySub.textContent = config.brand.storySubheading;
    if (storyP1) storyP1.textContent = config.brand.storyText1;
    if (storyP2) storyP2.textContent = config.brand.storyText2;
    if (storyQuote) storyQuote.textContent = `“${config.brand.storyQuote}”`;
    if (chefName) chefName.textContent = config.brand.chefName;
    if (chefRole) chefRole.textContent = `${config.brand.chefRole} • ${config.brand.chefAccolade}`;

    // Contact & Address
    document.querySelectorAll('.contact-phone-insert').forEach(el => {
      el.textContent = config.contact.phone;
      if (el.tagName === 'A') el.href = `tel:${config.contact.phone.replace(/[^0-9+]/g, '')}`;
    });

    document.querySelectorAll('.contact-email-insert').forEach(el => {
      el.textContent = config.contact.email;
      if (el.tagName === 'A') el.href = `mailto:${config.contact.email}`;
    });

    document.querySelectorAll('.contact-address-insert').forEach(el => {
      el.textContent = `${config.contact.address}, ${config.contact.city}`;
    });

    // Accolades Ticker
    const tickerContainer = document.getElementById('accoladesTicker');
    if (tickerContainer && config.accolades) {
      tickerContainer.innerHTML = config.accolades.map(acc => `
        <div class="accolade-card">
          <div class="accolade-num">
            <span class="accolade-num-val" data-target="${acc.number}">0</span><span class="accolade-num-suffix">${acc.suffix}</span>
          </div>
          <div class="accolade-label">${acc.label}</div>
        </div>
      `).join('');
    }
  },

  // 3. Operating Hours & Real-time Status Badge
  setupOperatingHours() {
    const table = document.getElementById('operatingHoursTable');
    if (!table || !window.RestaurantConfig?.contact?.schedule) return;

    const schedule = window.RestaurantConfig.contact.schedule;
    table.innerHTML = schedule.map(item => `
      <tr>
        <td>${item.days}</td>
        <td>${item.dinner}</td>
      </tr>
    `).join('');

    // Status Indicator
    const statusBadge = document.getElementById('operatingStatusBadge');
    if (statusBadge) {
      const now = new Date();
      const hour = now.getHours();
      // Simple heuristic: Open between 12-15 and 17-23
      const isOpen = (hour >= 12 && hour < 15) || (hour >= 17 && hour < 23);
      if (isOpen) {
        statusBadge.innerHTML = 'Service In Session • Open Tonight';
      } else {
        statusBadge.innerHTML = 'Reservations Open • Next Service at 5:30 PM';
      }
    }
  },

  // 4. Testimonials Carousel
  setupTestimonialCarousel() {
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('testimonialDots');
    if (!track || !window.RestaurantConfig?.testimonials) return;

    const list = window.RestaurantConfig.testimonials;

    track.innerHTML = list.map(item => `
      <div class="testimonial-slide">
        <div class="testimonial-card">
          <div class="testimonial-stars">★ ★ ★ ★ ★</div>
          <p class="testimonial-quote">“${item.quote}”</p>
          <div class="testimonial-author-wrap">
            <img src="${item.avatar}" alt="${item.author}" class="testimonial-avatar" />
            <div style="text-align: left;">
              <div class="testimonial-author-name">${item.author}</div>
              <div class="testimonial-author-role">${item.role}</div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    if (dotsContainer) {
      dotsContainer.innerHTML = list.map((_, i) => `
        <div class="testimonial-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>
      `).join('');

      dotsContainer.querySelectorAll('.testimonial-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.getAttribute('data-idx'), 10);
          this.goToTestimonial(idx);
        });
      });
    }

    // Auto rotate
    this.startTestimonialAutoplay();

    const sliderWrap = document.querySelector('.testimonials-slider-wrap');
    if (sliderWrap) {
      sliderWrap.addEventListener('mouseenter', () => clearInterval(this.testimonialInterval));
      sliderWrap.addEventListener('mouseleave', () => this.startTestimonialAutoplay());
    }
  },

  goToTestimonial(index) {
    const track = document.getElementById('testimonialTrack');
    const dots = document.querySelectorAll('.testimonial-dot');
    if (!track) return;

    this.currentTestimonialIndex = index;
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach((dot, i) => {
      if (i === index) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  },

  startTestimonialAutoplay() {
    clearInterval(this.testimonialInterval);
    const count = window.RestaurantConfig?.testimonials?.length || 3;
    this.testimonialInterval = setInterval(() => {
      this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % count;
      this.goToTestimonial(this.currentTestimonialIndex);
    }, 6000);
  },

  // 5. Mobile Navigation Menu Toggle with Backdrop Overlay
  setupMobileMenu() {
    const toggleBtn = document.getElementById('mobileNavToggle');
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    const mobileOverlay = document.getElementById('mobileNavOverlay');
    const closeBtn = document.getElementById('mobileNavClose');

    const openMenu = () => {
      mobileDrawer?.classList.add('open');
      mobileOverlay?.classList.add('open');
      toggleBtn?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileDrawer?.classList.remove('open');
      mobileOverlay?.classList.remove('open');
      toggleBtn?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

    mobileDrawer?.querySelectorAll('a, button').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  },

  // 6. Contact & Newsletter Forms
  setupForms() {
    const inquiryForm = document.getElementById('privateDiningForm');
    if (inquiryForm) {
      inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = inquiryForm.querySelector('[name="clientName"]')?.value || 'Guest';
        if (window.CartModule) {
          window.CartModule.showToast(`Thank you, ${name}. Our VIP Event Concierge will contact you within 4 hours.`);
        }
        inquiryForm.reset();
      });
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (window.CartModule) {
          window.CartModule.showToast(`Welcome to our Private Cellar Circle. Check your inbox for your invitation.`);
        }
        newsletterForm.reset();
      });
    }
  }
};

window.App = App;
