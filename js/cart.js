/**
 * SPICE HAVEN - LUXURY CART, OFF-CANVAS DRAWER & CHECKOUT ENGINE
 */

const CartModule = {
  items: [], // [{ id, name, price, image, qty }]
  appliedPromo: null,
  tipPercent: 0.10, // 10% default hospitality gratuity

  init() {
    this.loadFromStorage();
    this.setupEventListeners();
    this.renderCartUI();
  },

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('spicehaven_cart');
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch (e) {
      this.items = [];
    }
  },

  saveToStorage() {
    try {
      localStorage.setItem('spicehaven_cart', JSON.stringify(this.items));
    } catch (e) {}
  },

  setupEventListeners() {
    // Drawer open/close
    const trigger = document.getElementById('cartTriggerBtn');
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    const closeBtn = document.getElementById('cartCloseBtn');
    const checkoutBtn = document.getElementById('cartCheckoutBtn');

    if (trigger) trigger.addEventListener('click', () => this.openDrawer());
    if (overlay) overlay.addEventListener('click', () => this.closeDrawer());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());

    // Checkout modal triggers
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) {
          this.showToast("Your order is empty. Please select a dish first.");
          return;
        }
        this.closeDrawer();
        this.openCheckoutModal();
      });
    }

    // Modal Close
    const modalClose = document.getElementById('checkoutModalClose');
    const modalBackdrop = document.getElementById('checkoutModal');
    if (modalClose) modalClose.addEventListener('click', () => this.closeCheckoutModal());
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) this.closeCheckoutModal();
      });
    }

    // Promo code apply
    const promoBtn = document.getElementById('applyPromoBtn');
    const promoInput = document.getElementById('cartPromoInput');
    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        this.applyPromoCode(promoInput.value.trim().toUpperCase());
      });
    }
    // Save initial step 2 markup for reuse
    const step2El = document.getElementById('checkoutStep2');
    if (step2El) this.initialStep2Html = step2El.innerHTML;
  },

  openDrawer() {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.getElementById('cartTriggerBtn')?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  },

  closeDrawer() {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.getElementById('cartTriggerBtn')?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  },

  handleAddToCart(itemId, buttonEl) {
    if (!window.RestaurantConfig) return;

    const dish = window.RestaurantConfig.menuItems.find(i => i.id === itemId);
    if (!dish) return;

    const existing = this.items.find(i => i.id === itemId);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        qty: 1
      });
    }

    this.saveToStorage();
    this.renderCartUI();

    // Trigger visual feedback
    if (buttonEl) {
      buttonEl.classList.add('added');
      const originalHtml = buttonEl.innerHTML;
      buttonEl.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Added
      `;
      setTimeout(() => {
        buttonEl.classList.remove('added');
        buttonEl.innerHTML = originalHtml;
      }, 1400);

      if (window.AppAnimations) {
        window.AppAnimations.flyToCart(buttonEl);
      }
    }

    this.showToast(`Added ${dish.name} to your order.`);
  },

  updateQty(itemId, delta) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      this.items = this.items.filter(i => i.id !== itemId);
    }

    // Invalidate cached orderId so new amount gets fresh orderId & fresh QR
    this.currentOrderId = null;

    this.saveToStorage();
    this.renderCartUI();

    // If UPI modal is open, refresh dynamic QR immediately
    const upiModal = document.getElementById('upiPaymentModal');
    if (upiModal && upiModal.classList.contains('open')) {
      if (this.items.length === 0) {
        this.closeUpiModal();
      } else {
        this.renderUpiModalContent();
      }
    }
  },

  removeItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    const itemName = item ? item.name : 'Item';
    this.items = this.items.filter(i => i.id !== itemId);
    this.currentOrderId = null;
    this.saveToStorage();
    this.renderCartUI();

    const upiModal = document.getElementById('upiPaymentModal');
    if (upiModal && upiModal.classList.contains('open')) {
      if (this.items.length === 0) {
        this.closeUpiModal();
      } else {
        this.renderUpiModalContent();
      }
    }

    this.showToast(`Removed ${itemName} from order.`);
  },

  formatPrice(amount) {
    if (window.formatCurrency) {
      return window.formatCurrency(amount);
    }
    if (window.RestaurantConfig?.formatCurrency) {
      return window.RestaurantConfig.formatCurrency(amount);
    }
    const num = typeof amount === 'number' ? amount : Number(amount) || 0;
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  },

  applyPromoCode(code) {
    const promos = window.RestaurantConfig?.commerce?.promotions || [];
    const promo = promos.find(p => p.code === code);

    if (!promo) {
      this.showToast("Invalid promotion code. Try SAVOR15 for 15% off.", "error");
      return;
    }

    const subtotal = this.calcSubtotal();
    if (subtotal < promo.minOrder) {
      this.showToast(`Code requires a minimum order of ${this.formatPrice(promo.minOrder)}.`, "error");
      return;
    }

    this.appliedPromo = promo;
    this.currentOrderId = null;
    this.renderCartUI();

    const upiModal = document.getElementById('upiPaymentModal');
    if (upiModal && upiModal.classList.contains('open')) {
      this.renderUpiModalContent();
    }

    this.showToast(`Code ${code} applied! Enjoy ${promo.discountPercent}% off.`);
  },

  calcSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  renderCartUI() {
    const listEl = document.getElementById('cartItemsList');
    const badgeEl = document.getElementById('cartBadge');
    const subtotalEl = document.getElementById('cartSubtotal');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');
    const discountRow = document.getElementById('cartDiscountRow');
    const discountEl = document.getElementById('cartDiscount');

    const totalQty = this.items.reduce((acc, item) => acc + item.qty, 0);
    if (badgeEl) badgeEl.textContent = totalQty;

    if (!listEl) return;

    if (this.items.length === 0) {
      listEl.innerHTML = `
        <div class="cart-empty-state">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(229, 169, 60, 0.08); border: 1px solid var(--border-gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h4 style="font-family: var(--font-serif); font-size: 1.35rem; color: var(--text-light); margin-bottom: 6px;">Your table is waiting.</h4>
          <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 260px; margin: 0 auto 16px auto; line-height: 1.5;">
            Explore our curated culinary collection and select your fine dining creations.
          </p>
          <button type="button" class="btn btn-primary-gold btn-sm gold-shimmer" onclick="CartModule.exploreMenu()">
            Explore Menu &rarr;
          </button>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = this.formatPrice(0);
      if (taxEl) taxEl.textContent = this.formatPrice(0);
      if (totalEl) totalEl.textContent = this.formatPrice(0);
      if (discountRow) discountRow.style.display = 'none';

      const checkoutBtn = document.getElementById('cartCheckoutBtn');
      if (checkoutBtn) {
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.pointerEvents = 'none';
      }
      return;
    }

    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.style.opacity = '1';
      checkoutBtn.style.pointerEvents = 'auto';
    }

    listEl.innerHTML = this.items.map(item => `
      <div class="cart-item-row" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" />
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-pricing-meta" style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">${this.formatPrice(item.price)} each</span>
            <span style="color: var(--text-dim); font-size: 0.75rem;">•</span>
            <strong style="color: var(--color-primary); font-family: var(--font-serif); font-size: 0.95rem;">${this.formatPrice(item.price * item.qty)}</strong>
          </div>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button type="button" class="qty-btn" onclick="CartModule.updateQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
              <span class="qty-value">${item.qty}</span>
              <button type="button" class="qty-btn" onclick="CartModule.updateQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="cart-remove-btn" onclick="CartModule.removeItem('${item.id}')">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    const subtotal = this.calcSubtotal();
    let discountAmount = 0;
    if (this.appliedPromo) {
      discountAmount = Math.round((subtotal * this.appliedPromo.discountPercent) / 100);
      if (discountRow && discountEl) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-${this.formatPrice(discountAmount)}`;
      }
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }

    const taxRate = window.RestaurantConfig?.commerce?.taxRate || 0.05;
    const taxable = Math.max(0, subtotal - discountAmount);
    const tax = Math.round(taxable * taxRate);
    const total = taxable + tax;

    if (subtotalEl) subtotalEl.textContent = this.formatPrice(subtotal);
    if (taxEl) taxEl.textContent = this.formatPrice(tax);
    if (totalEl) totalEl.textContent = this.formatPrice(total);

    // Sync menu card inline quantity controls in real time
    if (window.MenuModule && typeof window.MenuModule.syncCardQuantities === 'function') {
      window.MenuModule.syncCardQuantities();
    }
  },

  exploreMenu() {
    this.closeDrawer();
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  },

  // -------------------------------------------------------------
  // CHECKOUT MODAL & SIMULATION
  // -------------------------------------------------------------
  openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    this.goToStep(1);
    this.renderCheckoutSummary();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  goToStep(stepNum) {
    if (stepNum === 2 && this.initialStep2Html) {
      const step2 = document.getElementById('checkoutStep2');
      if (step2) step2.innerHTML = this.initialStep2Html;
    }
    document.querySelectorAll('.checkout-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`checkoutStep${stepNum}`)?.classList.add('active');
  },

  renderCheckoutSummary() {
    const summaryContainer = document.getElementById('checkoutOrderReview');
    if (!summaryContainer) return;

    const subtotal = this.calcSubtotal();
    const discount = this.appliedPromo ? Math.round((subtotal * this.appliedPromo.discountPercent) / 100) : 0;
    const tax = Math.round(Math.max(0, subtotal - discount) * (window.RestaurantConfig?.commerce?.taxRate || 0.05));
    const total = (subtotal - discount) + tax;

    summaryContainer.innerHTML = `
      <div style="background: var(--bg-surface); padding: 18px 20px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 20px;">
        <div style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--text-light); margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span>Review Selected Dishes</span>
          <span style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-primary); font-family: var(--font-sans);">${this.items.reduce((a,b)=>a+b.qty,0)} Items Total</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; max-height: 180px; overflow-y: auto; padding-right: 4px;">
          ${this.items.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; padding: 4px 0;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--color-primary); font-weight: 700; min-width: 22px;">${item.qty}×</span>
                <span style="color: var(--text-light); font-weight: 500;">${item.name}</span>
                <span style="color: var(--text-dim); font-size: 0.76rem;">(@ ${this.formatPrice(item.price)})</span>
              </div>
              <strong style="color: var(--text-light); font-family: var(--font-mono); font-size: 0.88rem;">${this.formatPrice(item.price * item.qty)}</strong>
            </div>
          `).join('')}
        </div>

        <div style="border-top: 1px dashed var(--border-subtle); padding-top: 10px; display: flex; flex-direction: column; gap: 6px;">
          <div style="display:flex; justify-content:space-between; font-size:0.86rem; color: var(--text-muted);">
            <span>Culinary Subtotal:</span>
            <span>${this.formatPrice(subtotal)}</span>
          </div>
          ${discount > 0 ? `
          <div style="display:flex; justify-content:space-between; font-size:0.86rem; color: var(--color-primary);">
            <span>Promotional Privilege (${this.appliedPromo.code}):</span>
            <span>-${this.formatPrice(discount)}</span>
          </div>` : ''}
          <div style="display:flex; justify-content:space-between; font-size:0.86rem; color: var(--text-muted);">
            <span>Taxes & Kitchen Service (5% GST):</span>
            <span>${this.formatPrice(tax)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:1px solid var(--border-subtle); font-weight:700; color:var(--text-light); font-size:1.1rem; font-family:var(--font-serif);">
            <span>Total Payable:</span>
            <span style="color:var(--color-primary);">${this.formatPrice(total)}</span>
          </div>
        </div>
      </div>
    `;
  },

  handleProceedToPayment() {
    const errContainer = document.getElementById('checkoutErrorAlert');
    if (errContainer) {
      errContainer.style.display = 'none';
      errContainer.innerHTML = '';
    }

    const nameInput = document.getElementById('checkoutCustomerName');
    const emailInput = document.getElementById('checkoutCustomerEmail');
    const phoneInput = document.getElementById('checkoutCustomerPhone');

    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const phone = (phoneInput?.value || '').trim();

    if (!name || name.length < 2) {
      this.showCheckoutError("Please provide your full name (minimum 2 characters).");
      if (nameInput) nameInput.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      this.showCheckoutError("Please provide a valid email address for your order confirmation.");
      if (emailInput) emailInput.focus();
      return;
    }

    if (!phone || phone.length < 6) {
      this.showCheckoutError("Please provide a valid direct phone number for order coordination.");
      if (phoneInput) phoneInput.focus();
      return;
    }

    this.goToStep(2);
  },

  showCheckoutError(msg) {
    const errContainer = document.getElementById('checkoutErrorAlert');
    if (errContainer) {
      errContainer.className = 'form-error-alert';
      errContainer.style.display = 'flex';
      errContainer.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${msg}</span>
      `;
      errContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      this.showToast(msg, "error");
    }
  },

  /**
   * RAZORPAY STANDARD CHECKOUT INTEGRATION
   * Handles:
   * 1. Calling POST /api/create-razorpay-order
   * 2. Opening official Razorpay Checkout SDK
   * 3. Verifying HMAC signature on backend via POST /api/verify-razorpay-payment
   * 4. Marking order as "Paid / Razorpay Verified" only after server confirmation
   */
  async handleRazorpayCheckout() {
    if (this.items.length === 0) {
      this.showToast("Your culinary order is empty. Please select dishes first.", "error");
      return;
    }

    const step2 = document.getElementById('checkoutStep2');
    if (step2 && !this.initialStep2Html) {
      this.initialStep2Html = step2.innerHTML;
    }

    const custName = document.getElementById('checkoutCustomerName')?.value.trim() || "Valued Connoisseur";
    const custPhone = document.getElementById('checkoutCustomerPhone')?.value.trim() || "Not specified";
    const diningMode = document.querySelector('input[name="diningMode"]:checked')?.value || "Dine-In Pre-Order";

    // Show secure connecting UI
    if (step2) {
      step2.innerHTML = `
        <div style="text-align:center; padding: 40px 20px;">
          <div class="payment-spinner" style="margin: 0 auto 20px auto;"></div>
          <h3 style="font-family: var(--font-serif); margin-bottom: 8px;">Connecting to Razorpay...</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Generating encrypted gateway order</p>
        </div>
      `;
    }

    try {
      // 1. Call Backend to Create Razorpay Order
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: this.items,
          customerName: custName,
          customerPhone: custPhone,
          diningMode: diningMode,
          promoCode: this.appliedPromo ? this.appliedPromo.code : null
        })
      });

      const orderData = await response.json();

      if (!response.ok || !orderData.success || !orderData.order_id) {
        if (step2 && this.initialStep2Html) step2.innerHTML = this.initialStep2Html;
        this.showToast(orderData.error || "Unable to initiate Razorpay payment. Please try again.", "error");
        return;
      }

      // Check if developer sandbox mode is triggered (with placeholder keys)
      if (orderData.isSandboxMode && (!orderData.key_id || orderData.key_id.includes('placeholder'))) {
        if (step2) {
          step2.innerHTML = `
            <div style="padding: 10px 0;">
              <div style="background: rgba(229,169,60,0.12); border: 1px solid var(--border-gold); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 16px;">
                <div style="display:flex; align-items:center; gap: 8px; margin-bottom: 8px;">
                  <span class="diet-tag special">Razorpay Order Created</span>
                  <strong style="font-family: var(--font-mono); color: var(--color-primary); font-size: 0.9rem;">#${orderData.order_id}</strong>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-light); margin: 0 0 10px 0; line-height: 1.4;">
                  Verified Order Amount: <strong>${this.formatPrice(orderData.amount / 100)}</strong>
                </p>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0 0 14px 0;">
                  (Razorpay credentials in <code>.env</code> are in test sandbox mode. Click below to simulate checkout and verify server cryptographic HMAC-SHA256 signature).
                </p>
                <button type="button" class="btn btn-primary-gold btn-block btn-sm" id="btnSimulateRzpVerify">
                  Simulate Payment & Verify Signature &rarr;
                </button>
              </div>
              <button type="button" class="btn btn-subtle btn-sm" onclick="CartModule.goToStep(2)">
                &larr; Choose Another Payment Method
              </button>
            </div>
          `;
          const simBtn = document.getElementById('btnSimulateRzpVerify');
          if (simBtn) {
            simBtn.onclick = () => {
              const mockPaymentId = 'pay_mock_' + Date.now();
              const mockSig = 'mock_valid_signature_' + orderData.order_id;
              this.verifyRazorpayPayment({
                razorpay_order_id: orderData.order_id,
                razorpay_payment_id: mockPaymentId,
                razorpay_signature: mockSig
              }, orderData.order_id, {
                custName,
                custPhone,
                diningMode,
                totalAmount: orderData.amount / 100
              });
            };
          }
        }
        return;
      }

      // 2. Open Standard Razorpay Checkout Modal
      if (typeof window.Razorpay !== 'function') {
        if (step2 && this.initialStep2Html) step2.innerHTML = this.initialStep2Html;
        this.showToast("Razorpay SDK is loading. Please check your network or try again.", "error");
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: window.RestaurantConfig?.brand?.name || "Spice Haven",
        description: `Order Ticket #${orderData.order_id}`,
        image: "assets/favicon.svg",
        order_id: orderData.order_id,
        prefill: {
          name: custName,
          contact: custPhone
        },
        theme: {
          color: "#E5A93C",
          backdrop_color: "#09090B"
        },
        handler: (paymentResponse) => {
          // STRICT RULE: Do not mark as paid here! Call backend verification!
          this.verifyRazorpayPayment(paymentResponse, orderData.order_id, {
            custName,
            custPhone,
            diningMode,
            totalAmount: orderData.amount / 100
          });
        },
        modal: {
          ondismiss: () => {
            this.renderPaymentFailure(
              "Payment Window Closed",
              "The Razorpay payment window was dismissed before completing authorization. Your selected dishes remain safely preserved in your cart."
            );
            this.showToast("Payment window closed.", "info");
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', (failureResponse) => {
        const reason = failureResponse.error?.description || "Transaction was declined by the bank.";
        this.renderPaymentFailure(
          "Payment Authorization Declined",
          `Razorpay reported: ${reason}. Your culinary order is preserved. You may retry or select another payment option.`
        );
        this.showToast(`Payment Declined: ${reason}`, "error");
      });

      rzpInstance.open();

    } catch (err) {
      console.error('[Razorpay Checkout Error]:', err);
      this.renderPaymentFailure(
        "Payment Communication Error",
        "A network interruption occurred while connecting to the payment server. Your cart items are intact. Please retry."
      );
      this.showToast("Network error communicating with payment server.", "error");
    }
  },

  async verifyRazorpayPayment(paymentResponse, expectedOrderId, orderMeta) {
    const step2 = document.getElementById('checkoutStep2');
    if (step2) {
      step2.innerHTML = `
        <div style="text-align:center; padding: 40px 20px;">
          <div class="payment-spinner" style="margin: 0 auto 20px auto;"></div>
          <h3 style="font-family: var(--font-serif); margin-bottom: 8px;">Verifying Signature...</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Validating cryptographic HMAC-SHA256 signature with bank server</p>
        </div>
      `;
    }

    try {
      // Send credentials to backend for HMAC verification
      const verifyResp = await fetch('/api/verify-razorpay-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature
        })
      });

      const verifyData = await verifyResp.json();

      if (!verifyResp.ok || !verifyData.success || !verifyData.verified) {
        this.renderPaymentFailure(
          "Signature Verification Failed",
          verifyData.error || "The bank payment signature could not be verified by the restaurant server. No charge was confirmed."
        );
        this.showToast(verifyData.error || "Payment signature verification failed.", "error");
        return;
      }

      // Successful verification: Mark paid and complete order
      this.completeRazorpayOrder(paymentResponse, orderMeta);

    } catch (err) {
      console.error('[verifyRazorpayPayment Error]:', err);
      this.renderPaymentFailure(
        "Verification Server Interruption",
        "We could not reach the verification service to finalize your receipt. Please contact our concierge."
      );
      this.showToast("Error verifying payment signature with server.", "error");
    }
  },

  renderPaymentFailure(title, explanation) {
    const step2 = document.getElementById('checkoutStep2');
    if (!step2) return;

    step2.innerHTML = `
      <div style="text-align: center; padding: 24px 10px;" class="reservation-pass-enter">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); border: 2px solid #EF4444; color: #EF4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; box-shadow: 0 0 25px rgba(239, 68, 68, 0.35);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>

        <span class="section-tag" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.4);">Order Not Completed</span>
        <h3 style="font-size: 1.6rem; font-family: var(--font-serif); margin: 8px 0 12px 0; color: var(--text-light);">
          ${title || 'Payment Was Not Completed'}
        </h3>
        <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 20px auto; font-size: 0.9rem; line-height: 1.5;">
          ${explanation || 'Your transaction was not completed. No charges were captured, and your cart items remain preserved.'}
        </p>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px 18px; max-width: 440px; margin: 0 auto 24px auto; text-align: left; font-size: 0.85rem; color: var(--text-muted);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Preserved Dishes:</span>
            <strong style="color: var(--text-light);">${this.items.reduce((a,b)=>a+b.qty,0)} Items in Cart</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Cart Total:</span>
            <strong style="color: var(--color-primary);">${this.formatPrice(this.calcSubtotal() + Math.round(this.calcSubtotal() * 0.05))}</strong>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary-gold btn-sm gold-shimmer" onclick="CartModule.retryPayment()">
            ↻ Retry Payment
          </button>
          <button type="button" class="btn btn-outline-gold btn-sm" onclick="CartModule.returnToCart()">
            ← Edit Order / Cart
          </button>
          <button type="button" class="btn btn-subtle btn-sm" onclick="CartModule.continueBrowsing()">
            Explore Menu
          </button>
        </div>
      </div>
    `;
  },

  retryPayment() {
    this.goToStep(2);
  },

  returnToCart() {
    this.closeCheckoutModal();
    this.openDrawer();
  },

  completeRazorpayOrder(paymentResponse, orderMeta) {
    const orderRef = "SH-" + Math.floor(100000 + Math.random() * 900000);
    const subtotal = this.calcSubtotal();
    const discount = this.appliedPromo ? Math.round((subtotal * this.appliedPromo.discountPercent) / 100) : 0;
    const tax = Math.round(Math.max(0, subtotal - discount) * (window.RestaurantConfig?.commerce?.taxRate || 0.05));
    const total = (subtotal - discount) + tax;
    const purchasedProducts = [...this.items];

    const orderRecord = {
      orderId: orderRef,
      razorpayOrderId: paymentResponse.razorpay_order_id,
      razorpayPaymentId: paymentResponse.razorpay_payment_id,
      transactionRef: paymentResponse.razorpay_payment_id,
      products: purchasedProducts.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        lineTotal: i.price * i.qty
      })),
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      totalAmount: total,
      currency: "INR",
      currencySymbol: "₹",
      paymentMethod: "Razorpay Standard Checkout",
      paymentStatus: "Paid / Razorpay Verified",
      isPaid: true,
      verificationStatus: "Cryptographically Verified (HMAC-SHA256)",
      customerName: orderMeta.custName,
      customerPhone: orderMeta.custPhone,
      diningMode: orderMeta.diningMode,
      submittedAt: new Date().toISOString()
    };

    // Save to persistent storage
    try {
      const orders = JSON.parse(localStorage.getItem('spicehaven_orders') || '[]');
      orders.unshift(orderRecord);
      localStorage.setItem('spicehaven_orders', JSON.stringify(orders));
      localStorage.setItem('vestic_orders', JSON.stringify(orders));
      if (window.ProfileModule && typeof window.ProfileModule.syncFromOrder === 'function') {
        window.ProfileModule.syncFromOrder(orderRecord);
      }
    } catch (e) {
      console.warn("Unable to save order history:", e);
    }

    this.goToStep(3);
    const step3 = document.getElementById('checkoutStep3');
    if (step3) {
      step3.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <div class="success-checkmark" style="background: rgba(34, 197, 94, 0.15); border: 2px solid #22C55E; color: #22C55E; margin: 0 auto 16px auto;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <span class="section-tag" style="color: #22C55E;">Paid / Razorpay Verified</span>
          <h3 style="font-size: 1.8rem; margin: 8px 0 12px 0;">Payment Authorized & Verified</h3>
          <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 24px auto;">
            Thank you, <strong>${orderMeta.custName}</strong>. Your transaction has been cryptographically confirmed by Razorpay.
          </p>

          <div style="background: var(--bg-surface); border: 1px dashed var(--border-gold); border-radius: var(--radius-md); padding: 24px; max-width: 480px; margin: 0 auto 28px auto; text-align: left;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem;">
              <span style="color:var(--text-muted);">Order Reference:</span>
              <strong style="color:var(--color-primary); font-family:var(--font-mono);">${orderRef}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem;">
              <span style="color:var(--text-muted);">Razorpay Payment ID:</span>
              <strong style="color:var(--text-light); font-family:var(--font-mono); font-size:0.82rem;">${paymentResponse.razorpay_payment_id}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem;">
              <span style="color:var(--text-muted);">Dining Mode:</span>
              <span>${orderMeta.diningMode}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem;">
              <span style="color:var(--text-muted);">Payment Status:</span>
              <span style="color:#4ADE80; font-weight:600;">Paid / Razorpay Verified</span>
            </div>

            <div style="margin-top: 12px; border-top: 1px dashed var(--border-subtle); padding-top: 10px;">
              <span style="color:var(--text-muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 8px;">Ordered Items (${purchasedProducts.reduce((a,b)=>a+b.qty,0)}):</span>
              ${purchasedProducts.map(p => `
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-light); margin-bottom:4px;">
                  <span><strong style="color:var(--color-primary);">${p.qty}×</strong> ${p.name}</span>
                  <span style="font-family:var(--font-mono); color:var(--text-muted);">${this.formatPrice(p.price * p.qty)}</span>
                </div>
              `).join('')}
            </div>

            <div style="display:flex; justify-content:space-between; padding-top:10px; margin-top: 10px; border-top:1px solid var(--border-subtle); font-size:1rem; font-weight:700;">
              <span>Amount Paid:</span>
              <span style="color:var(--color-primary);">${this.formatPrice(total)}</span>
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline-gold btn-sm" onclick="CartModule.continueBrowsing()">Continue Browsing</button>
            <button type="button" class="btn btn-primary-gold btn-sm gold-shimmer" onclick="CartModule.returnHome()">Return Home</button>
            <button type="button" class="btn btn-subtle btn-sm" onclick="StatusTrackerModule.open('order', '${orderRef}')">Track Status</button>
            <button type="button" class="btn btn-subtle btn-sm" onclick="window.print()">Print Receipt</button>
          </div>
        </div>
      `;
    }

    // Clear cart
    this.items = [];
    this.appliedPromo = null;
    this.saveToStorage();
    this.renderCartUI();
    this.showToast("Payment verified! Order confirmed.", "info");
  },

  handleSimulatePayment(method) {
    const step2 = document.getElementById('checkoutStep2');
    if (!step2) return;

    // Show processing animation
    step2.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <div class="payment-spinner"></div>
        <h3 style="font-family: var(--font-serif); margin-bottom: 8px;">Authenticating Transaction...</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Connecting to high-security payment gateway</p>
      </div>
    `;

    setTimeout(() => {
      this.completeOrder(method);
    }, 1800);
  },

  completeOrder(paymentMethod) {
    const orderRef = "SH-" + Math.floor(100000 + Math.random() * 900000);
    const custName = document.getElementById('checkoutCustomerName')?.value || "Valued Connoisseur";
    const diningMode = document.querySelector('input[name="diningMode"]:checked')?.value || "Dine-In Pre-Order";

    const subtotal = this.calcSubtotal();
    const discount = this.appliedPromo ? Math.round((subtotal * this.appliedPromo.discountPercent) / 100) : 0;
    const tax = Math.round(Math.max(0, subtotal - discount) * (window.RestaurantConfig?.commerce?.taxRate || 0.05));
    const total = (subtotal - discount) + tax;
    const purchasedProducts = [...this.items];

    this.goToStep(3);
    const step3 = document.getElementById('checkoutStep3');
    if (step3) {
      step3.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <div class="success-checkmark">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <span class="section-tag">Order Confirmed</span>
          <h3 style="font-size: 1.8rem; margin: 8px 0 12px 0;">We Are Preparing Your Feast</h3>
          <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 24px auto;">
            Thank you, <strong>${custName}</strong>. Master Chef Julian Vance and our hearth team have received your order ticket.
          </p>

          <div style="background: var(--bg-surface); border: 1px dashed var(--border-gold); border-radius: var(--radius-md); padding: 24px; max-width: 480px; margin: 0 auto 28px auto; text-align: left;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem;">
              <span style="color:var(--text-muted);">Order Reference:</span>
              <strong style="color:var(--color-primary); font-family:var(--font-mono);">${orderRef}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem;">
              <span style="color:var(--text-muted);">Dining Mode:</span>
              <span>${diningMode}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem;">
              <span style="color:var(--text-muted);">Payment Status:</span>
              <span style="color:#81C784;">Verified (${paymentMethod})</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem;">
              <span style="color:var(--text-muted);">Estimated Prep:</span>
              <span>25 - 35 Minutes</span>
            </div>

            <div style="margin-top: 12px; border-top: 1px dashed var(--border-subtle); padding-top: 10px;">
              <span style="color:var(--text-muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 8px;">Ordered Items (${purchasedProducts.reduce((a,b)=>a+b.qty,0)}):</span>
              ${purchasedProducts.map(p => `
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-light); margin-bottom:4px;">
                  <span><strong style="color:var(--color-primary);">${p.qty}×</strong> ${p.name}</span>
                  <span style="font-family:var(--font-mono); color:var(--text-muted);">${this.formatPrice(p.price * p.qty)}</span>
                </div>
              `).join('')}
            </div>

            <div style="display:flex; justify-content:space-between; padding-top:10px; margin-top: 10px; border-top:1px solid var(--border-subtle); font-size:1rem; font-weight:700;">
              <span>Amount Paid:</span>
              <span style="color:var(--color-primary);">${this.formatPrice(total)}</span>
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline-gold btn-sm" onclick="CartModule.continueBrowsing()">Continue Browsing</button>
            <button type="button" class="btn btn-primary-gold btn-sm gold-shimmer" onclick="CartModule.returnHome()">Return Home</button>
            <button type="button" class="btn btn-subtle btn-sm" onclick="StatusTrackerModule.open('order', '${orderRef}')">Track Status</button>
            <button type="button" class="btn btn-subtle btn-sm" onclick="window.print()">Print Receipt</button>
          </div>
        </div>
      `;
    }

    // Clear cart
    this.items = [];
    this.appliedPromo = null;
    this.saveToStorage();
    this.renderCartUI();
  },

  continueBrowsing() {
    this.closeCheckoutModal();
    if (typeof this.closeUpiModal === 'function') this.closeUpiModal();
    this.goToStep(1);
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  },

  returnHome() {
    this.closeCheckoutModal();
    if (typeof this.closeUpiModal === 'function') this.closeUpiModal();
    this.goToStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  finishAndReset() {
    this.closeCheckoutModal();
    this.goToStep(1);
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span style="font-size: 0.9rem;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // -------------------------------------------------------------
  // UPI INSTANT PAYMENT ENGINE & DYNAMIC QR (NPCI COMPLIANT)
  // -------------------------------------------------------------
  currentOrderId: null,
  currentUpiUri: null,
  currentUpiTab: 'dynamic',
  isSubmittingOrder: false,

  openUpiModal() {
    if (this.items.length === 0) {
      this.showToast("Your culinary order is empty. Please select dishes first.", "error");
      return;
    }

    // Close checkout modal if open
    this.closeCheckoutModal();

    // Generate fresh order reference for this payment session
    if (!this.currentOrderId) {
      this.currentOrderId = "SH-" + Math.floor(100000 + Math.random() * 900000);
    }

    this.renderUpiModalContent();

    const upiModal = document.getElementById('upiPaymentModal');
    if (upiModal) {
      upiModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  /**
   * Pre-Generation Strong Validation (Requirement 9)
   * Validates UPI ID presence, VPA format, payee name, and positive cart total.
   */
  validateUpiParams(upiConfig, total) {
    const errors = [];
    if (!upiConfig || typeof upiConfig !== 'object' || upiConfig.enabled === false) {
      return { isValid: false, errors: ["UPI payment is temporarily unavailable. Please try another payment method."] };
    }

    const upiId = (upiConfig.upiId || '').trim();
    if (!upiId) {
      errors.push("UPI payment is temporarily unavailable. Please try another payment method.");
    } else {
      // NPCI standard VPA format: username@handle
      const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!vpaRegex.test(upiId)) {
        errors.push("UPI payment is temporarily unavailable. Please try another payment method.");
      }
    }

    const merchantName = (upiConfig.merchantName || '').trim();
    if (!merchantName) {
      errors.push("UPI payment is temporarily unavailable. Please try another payment method.");
    }

    const numTotal = Number(total);
    if (isNaN(numTotal) || numTotal <= 0) {
      errors.push("Cart payable total must be greater than ₹0.00.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Build NPCI-Compliant UPI Payment URI (Requirements 2, 3, 4)
   * Standard format: upi://pay?pa=YOUR_UPI_ID&pn=YOUR_PAYEE_NAME&am=CART_TOTAL&cu=INR
   * Parameters are ordered strictly so Google Pay and other apps resolve the banking entity.
   */
  buildUpiUri(upiId, payeeName, amount) {
    const cleanUpiId = (upiId || '').trim();
    const cleanPayeeName = (payeeName || '').trim();
    const formattedAmount = (Number(amount) || 0).toFixed(2);
    return `upi://pay?pa=${cleanUpiId}&pn=${encodeURIComponent(cleanPayeeName)}&am=${formattedAmount}&cu=INR`;
  },

  renderUpiModalContent() {
    const upiConfig = window.RestaurantConfig?.commerce?.upiPayment || {
      enabled: true,
      merchantName: "Naveen",
      businessName: "Spice Haven Dining",
      upiId: "naveenofficial916@okaxis",
      currency: "INR",
      currencySymbol: "₹"
    };

    const subtotal = this.calcSubtotal();
    const discount = this.appliedPromo ? Math.round((subtotal * this.appliedPromo.discountPercent) / 100) : 0;
    const taxRate = window.RestaurantConfig?.commerce?.taxRate || 0.05;
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * taxRate);
    const total = taxable + tax;

    // Update Order Reference display
    const orderRefEl = document.getElementById('upiOrderRef');
    if (orderRefEl) orderRefEl.textContent = `#${this.currentOrderId}`;

    // Customer metadata from checkout form
    const custName = document.getElementById('checkoutCustomerName')?.value.trim() || "Valued Connoisseur";
    const custPhone = document.getElementById('checkoutCustomerPhone')?.value.trim() || "Not specified";
    const diningMode = document.querySelector('input[name="diningMode"]:checked')?.value || "Dine-In Service";

    const diningEl = document.getElementById('upiDiningModeText');
    const nameEl = document.getElementById('upiCustomerNameText');
    const phoneEl = document.getElementById('upiCustomerPhoneText');
    if (diningEl) diningEl.textContent = diningMode;
    if (nameEl) nameEl.textContent = custName;
    if (phoneEl) phoneEl.textContent = custPhone;

    // Mini itemized list
    const itemsListEl = document.getElementById('upiMiniItemsList');
    if (itemsListEl) {
      itemsListEl.innerHTML = this.items.map(item => `
        <div class="upi-item-row">
          <span style="font-weight: 500; color: var(--text-light);">${item.name} <strong style="color: var(--color-primary); font-size: 0.82rem;">×${item.qty}</strong></span>
          <span style="color: var(--text-muted);">${this.formatPrice(item.price * item.qty)}</span>
        </div>
      `).join('');
    }

    // Financial breakdown
    const subtotalEl = document.getElementById('upiSubtotalText');
    const discountRow = document.getElementById('upiDiscountRow');
    const discountEl = document.getElementById('upiDiscountText');
    const taxEl = document.getElementById('upiTaxText');
    const totalEl = document.getElementById('upiTotalText');

    if (subtotalEl) subtotalEl.textContent = this.formatPrice(subtotal);
    if (discountRow && discountEl) {
      if (discount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-${this.formatPrice(discount)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }
    if (taxEl) taxEl.textContent = this.formatPrice(tax);
    if (totalEl) totalEl.textContent = this.formatPrice(total);

    // Validate parameters before rendering QR (Requirement 9)
    const validation = this.validateUpiParams(upiConfig, total);
    const directIntentBtn = document.getElementById('upiDirectIntentBtn');
    const confirmBtn = document.getElementById('upiConfirmPayBtn');
    const target = document.getElementById('upiQrTarget');
    const inrHeroEl = document.getElementById('upiInrAmountHero');
    const conversionSubEl = document.getElementById('upiConversionSub');
    const merchantDisplayEl = document.getElementById('upiMerchantDisplay');

    if (!validation.isValid) {
      if (inrHeroEl) inrHeroEl.textContent = "Unavailable";
      if (conversionSubEl) conversionSubEl.textContent = "UPI payment is temporarily unavailable. Please try another payment method.";
      if (target) {
        target.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: var(--radius-sm); padding: 18px 14px; color: #FCA5A5; text-align: center; font-size: 0.85rem;">
            <strong style="color: #EF4444; display: block; margin-bottom: 6px;">⚠️ UPI Payment Unavailable</strong>
            <p style="margin: 0 0 12px 0; color: var(--text-light); line-height: 1.4;">UPI payment is temporarily unavailable. Please try another payment method.</p>
            <button type="button" class="btn btn-outline-gold btn-sm" onclick="CartModule.backToCheckoutStep2()">
              Switch to Alternative Payment Method &rarr;
            </button>
          </div>
        `;
      }
      if (directIntentBtn) {
        directIntentBtn.removeAttribute('href');
        directIntentBtn.style.opacity = '0.5';
        directIntentBtn.style.pointerEvents = 'none';
      }
      if (confirmBtn) {
        confirmBtn.disabled = true;
      }
      return;
    }

    // Valid state: Enable controls and build URI
    if (confirmBtn) confirmBtn.disabled = false;
    if (inrHeroEl) inrHeroEl.textContent = this.formatPrice(total);
    if (conversionSubEl) {
      conversionSubEl.textContent = `Exact order total: ${this.formatPrice(total)} (dynamically encoded in QR)`;
    }
    if (merchantDisplayEl) {
      const displayName = upiConfig.businessName ? `${upiConfig.businessName} (${upiConfig.merchantName})` : upiConfig.merchantName;
      merchantDisplayEl.textContent = `${displayName} • ${upiConfig.upiId}`;
    }

    const upiUri = this.buildUpiUri(upiConfig.upiId, upiConfig.merchantName, total);
    this.currentUpiUri = upiUri;

    // Direct Mobile Intent Link
    if (directIntentBtn) {
      directIntentBtn.setAttribute('href', upiUri);
      directIntentBtn.style.opacity = '1';
      directIntentBtn.style.pointerEvents = 'auto';
    }

    // Static fallback URI for reference tab
    const staticFallbackUri = `upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}&pn=${encodeURIComponent(upiConfig.merchantName)}&cu=INR`;

    this.renderUpiQr(this.currentUpiTab === 'dynamic' ? upiUri : staticFallbackUri);

    // Reset grid display
    const gridEl = document.getElementById('upiGridContainer');
    const resultEl = document.getElementById('upiResultContainer');
    if (gridEl) gridEl.style.display = 'grid';
    if (resultEl) resultEl.style.display = 'none';
  },

  renderUpiQr(qrData) {
    const target = document.getElementById('upiQrTarget');
    if (!target) return;

    if (window.QRCode && typeof window.QRCode.toString === 'function') {
      window.QRCode.toString(qrData, {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#0D0D10',
          light: '#FFFFFF'
        }
      }, (err, svgString) => {
        if (err || !svgString) {
          console.error("QR Code generation error:", err);
          target.innerHTML = `<div style="color: #FF6B6B; font-size: 0.8rem; padding: 20px;">Unable to render QR code. Please use merchant UPI ID directly.</div>`;
        } else {
          target.innerHTML = svgString;
        }
      });
    } else {
      console.warn("QRCode library not loaded yet.");
      target.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 20px;">Loading QR generator...</div>`;
    }
  },

  switchUpiTab(mode, render = true) {
    this.currentUpiTab = mode;
    const tabDynamic = document.getElementById('tabDynamicQr');
    const tabStatic = document.getElementById('tabStaticQr');
    const inrHeroEl = document.getElementById('upiInrAmountHero');
    const conversionSubEl = document.getElementById('upiConversionSub');
    const upiConfig = window.RestaurantConfig?.commerce?.upiPayment || {
      merchantName: "Naveen",
      upiId: "naveenofficial916@okaxis"
    };

    if (mode === 'dynamic') {
      if (tabDynamic) tabDynamic.classList.add('active');
      if (tabStatic) tabStatic.classList.remove('active');
      if (render) this.renderUpiModalContent();
    } else {
      if (tabStatic) tabStatic.classList.add('active');
      if (tabDynamic) tabDynamic.classList.remove('active');
      if (inrHeroEl) inrHeroEl.textContent = "Merchant Payee QR";
      if (conversionSubEl) conversionSubEl.textContent = "Scan & manually specify your order amount in your UPI app";
      const staticUri = `upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}&pn=${encodeURIComponent(upiConfig.merchantName)}&cu=INR`;
      this.renderUpiQr(staticUri);
    }
  },

  copyUpiId() {
    const upiConfig = window.RestaurantConfig?.commerce?.upiPayment || {
      upiId: "naveenofficial916@okaxis"
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(upiConfig.upiId)
        .then(() => {
          this.showToast(`UPI ID copied: ${upiConfig.upiId}`);
        })
        .catch(() => {
          this.fallbackCopy(upiConfig.upiId);
        });
    } else {
      this.fallbackCopy(upiConfig.upiId);
    }
  },

  fallbackCopy(text) {
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      this.showToast(`UPI ID copied: ${text}`);
    } catch (e) {
      this.showToast(`UPI ID: ${text}`);
    }
    document.body.removeChild(input);
  },

  handleUpiResolutionHelp() {
    const errorEl = document.getElementById('upiUtrError');
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: var(--radius-sm); padding: 12px; margin-top: 6px;">
          <strong style="color: #EF4444; display: block; margin-bottom: 4px;">⚠️ UPI Recipient Resolution Notice</strong>
          <p style="color: var(--text-light); margin: 0 0 8px 0; font-size: 0.8rem; line-height: 1.4;">
            If your UPI app displays <em>"Could not load banking name"</em> or <em>"Add bank account"</em>, UPI payment is temporarily unavailable. Please try another payment method.
          </p>
          <button type="button" class="btn btn-outline-gold btn-xs" onclick="CartModule.backToCheckoutStep2()">
            Switch to Pay at Table / Card &rarr;
          </button>
        </div>
      `;
    }
  },

  closeUpiModal() {
    const modal = document.getElementById('upiPaymentModal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  backToCheckoutStep2() {
    this.closeUpiModal();
    this.openCheckoutModal();
    this.goToStep(2);
  },

  handleUpiSubmitted() {
    if (this.isSubmittingOrder) return;

    const utrInput = document.getElementById('upiUtrInput');
    const errorEl = document.getElementById('upiUtrError');
    const utrValue = utrInput?.value.trim() || '';

    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }

    // 1. Mandatory UTR validation
    if (!utrValue) {
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Please enter the 12-digit UPI Transaction Reference Number (UTR) from your Google Pay, PhonePe, or Paytm receipt to verify payment.';
      }
      if (utrInput) utrInput.focus();
      return;
    }

    // 2. Strict format validation: Exactly 12 numeric digits
    if (!/^\d{12}$/.test(utrValue)) {
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Invalid UTR format. Bank reference numbers must consist of exactly 12 numeric digits (e.g. 425612349876).';
      }
      if (utrInput) utrInput.focus();
      return;
    }

    // 3. Duplicate Order & Payment Prevention (Requirements 10, 11)
    let existingOrders = [];
    try {
      existingOrders = JSON.parse(localStorage.getItem('spicehaven_orders') || localStorage.getItem('vestic_orders') || '[]');
    } catch (e) {
      existingOrders = [];
    }

    const duplicateOrder = existingOrders.find(o => o.transactionRef === utrValue);
    if (duplicateOrder) {
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = `Duplicate Payment Reference: UTR ${utrValue} has already been verified for Order #${duplicateOrder.orderId}. Duplicate submissions are prohibited.`;
      }
      return;
    }

    // Check if current order ID was already completed
    if (existingOrders.some(o => o.orderId === this.currentOrderId && o.isPaid)) {
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = `Order #${this.currentOrderId} has already been registered and confirmed.`;
      }
      return;
    }

    const upiConfig = window.RestaurantConfig?.commerce?.upiPayment || {
      merchantName: "Naveen",
      upiId: "naveenofficial916@okaxis"
    };

    const subtotal = this.calcSubtotal();
    const discount = this.appliedPromo ? Math.round((subtotal * this.appliedPromo.discountPercent) / 100) : 0;
    const tax = Math.round(Math.max(0, subtotal - discount) * (window.RestaurantConfig?.commerce?.taxRate || 0.05));
    const totalAmount = (subtotal - discount) + tax;

    const custName = document.getElementById('checkoutCustomerName')?.value.trim() || "Valued Connoisseur";
    const custPhone = document.getElementById('checkoutCustomerPhone')?.value.trim() || "Not specified";
    const diningMode = document.querySelector('input[name="diningMode"]:checked')?.value || "Dine-In Service";

    // Set submitting flag and show authentic verifying feedback
    this.isSubmittingOrder = true;
    const confirmBtn = document.getElementById('upiConfirmPayBtn');
    const btnText = document.getElementById('upiConfirmPayBtnText');
    if (confirmBtn) confirmBtn.disabled = true;
    if (btnText) btnText.innerHTML = '⏳ Logging UPI Settlement with Concierge...';

    setTimeout(() => {
      // Create unique order record: strictly Payment Initiated (NOT falsely marked Paid)
      const orderRecord = {
        orderId: this.currentOrderId || ("SH-" + Math.floor(100000 + Math.random() * 900000)),
        products: this.items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          lineTotal: i.price * i.qty
        })),
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        totalAmount: totalAmount,
        currency: "INR",
        currencySymbol: "₹",
        paymentMethod: "UPI Instant Payment (Google Pay / PhonePe / QR)",
        paymentStatus: "Payment Initiated (Awaiting Merchant Verification)",
        isPaid: false,
        verificationStatus: "Pending Bank Statement Reconciliation",
        transactionRef: utrValue,
        merchantUpiId: upiConfig.upiId,
        payeeName: upiConfig.merchantName,
        customerName: custName,
        customerPhone: custPhone,
        diningMode: diningMode,
        submittedAt: new Date().toISOString(),
        createdTimestamp: new Date().toISOString()
      };

      // Save order in persistent order history (store in both keys for compatibility)
      try {
        const orders = JSON.parse(localStorage.getItem('spicehaven_orders') || '[]');
        orders.unshift(orderRecord);
        localStorage.setItem('spicehaven_orders', JSON.stringify(orders));
        localStorage.setItem('vestic_orders', JSON.stringify(orders));
        if (window.ProfileModule && typeof window.ProfileModule.syncFromOrder === 'function') {
          window.ProfileModule.syncFromOrder(orderRecord);
        }
      } catch (e) {
        console.warn("Unable to save order history:", e);
      }

      // Render confirmation ticket in UPI modal
      this.renderUpiSuccessResult(orderRecord, custName, diningMode, utrValue);

      // Clear cart and reset
      this.items = [];
      this.appliedPromo = null;
      this.currentOrderId = null;
      this.isSubmittingOrder = false;
      this.saveToStorage();
      this.renderCartUI();
      if (confirmBtn) confirmBtn.disabled = false;
      if (btnText) btnText.textContent = 'Verify & Confirm Payment →';
    }, 1000);
  },

  renderUpiSuccessResult(orderRecord, custName, diningMode, utrValue) {
    const gridEl = document.getElementById('upiGridContainer');
    const resultEl = document.getElementById('upiResultContainer');

    if (gridEl) gridEl.style.display = 'none';
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div style="text-align: center; padding: 20px 10px;">
          <div class="success-checkmark" style="background: rgba(245, 158, 11, 0.15); border: 2px solid #FBBF24; color: #FBBF24; margin: 0 auto 16px auto;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>

          <span class="section-tag" style="color: #FBBF24;">Payment Initiated</span>
          <h3 style="font-size: 1.8rem; margin: 8px 0 12px 0; font-family: var(--font-serif); color: var(--text-light);">
            Order Transmitted to Kitchen
          </h3>
          <p style="color: var(--text-muted); max-width: 520px; margin: 0 auto 24px auto; font-size: 0.92rem; line-height: 1.5;">
            Thank you, <strong>${custName}</strong>. Your UPI transaction reference (#${utrValue}) has been logged. Order status remains PENDING until the merchant reconciles the transaction with their bank statement.
          </p>

          <div style="background: var(--bg-surface); border: 1px dashed var(--border-gold); border-radius: var(--radius-md); padding: 24px; max-width: 500px; margin: 0 auto 24px auto; text-align: left;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.88rem;">
              <span style="color:var(--text-muted);">Order Ticket Reference:</span>
              <strong style="color:var(--color-primary); font-family:var(--font-mono); font-size:1rem;">#${orderRecord.orderId}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.88rem;">
              <span style="color:var(--text-muted);">Dining Mode:</span>
              <span>${diningMode}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.88rem;">
              <span style="color:var(--text-muted);">Payment Method:</span>
              <span>UPI QR (Google Pay / PhonePe / Paytm)</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.88rem;">
              <span style="color:var(--text-muted);">Payee UPI ID:</span>
              <span style="font-family:var(--font-mono); color:var(--text-light);">${orderRecord.merchantUpiId}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.88rem;">
              <span style="color:var(--text-muted);">Bank UTR Reference:</span>
              <span style="font-family:var(--font-mono); color:var(--color-primary); font-weight: 700;">${utrValue}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.88rem;">
              <span style="color:var(--text-muted);">Payment Status:</span>
              <span class="upi-status-badge pending">Payment Initiated (Awaiting Settlement)</span>
            </div>
            <div style="margin-top: 12px; border-top: 1px dashed var(--border-subtle); padding-top: 10px;">
              <span style="color:var(--text-muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 8px;">Ordered Items (${orderRecord.products.reduce((a,b)=>a+b.qty,0)}):</span>
              ${orderRecord.products.map(p => `
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-light); margin-bottom:4px;">
                  <span><strong style="color:var(--color-primary);">${p.qty}×</strong> ${p.name}</span>
                  <span style="font-family:var(--font-mono); color:var(--text-muted);">${this.formatPrice(p.lineTotal || (p.price * p.qty))}</span>
                </div>
              `).join('')}
            </div>

            <div style="display:flex; justify-content:space-between; padding-top:12px; margin-top: 10px; border-top:1px solid var(--border-subtle); font-size:1.05rem; font-weight:700;">
              <span>Amount Logged:</span>
              <span style="color:var(--color-primary);">${this.formatPrice(orderRecord.totalAmount)}</span>
            </div>
          </div>

          <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-sm); padding: 12px 16px; max-width: 500px; margin: 0 auto 24px auto; text-align: left; font-size: 0.8rem; color: var(--text-muted); line-height: 1.45;">
            ⚠️ <strong>Verification Policy:</strong> Payment has been initiated with UTR #${utrValue}. Our concierge reconciles all incoming UTR transactions against our merchant bank statement prior to final course service.
          </div>

          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline-gold btn-sm" onclick="CartModule.continueBrowsing()">
              Continue Browsing
            </button>
            <button type="button" class="btn btn-primary-gold btn-sm gold-shimmer" onclick="CartModule.returnHome()">
              Return Home
            </button>
            <button type="button" class="btn btn-subtle btn-sm btn-print-target" onclick="window.print()">
              🖨️ Print Ticket
            </button>
          </div>
        </div>
      `;
    }
  },

  finishAndResetUpi() {
    this.closeUpiModal();
    const gridEl = document.getElementById('upiGridContainer');
    const resultEl = document.getElementById('upiResultContainer');
    if (gridEl) gridEl.style.display = 'grid';
    if (resultEl) {
      resultEl.style.display = 'none';
      resultEl.innerHTML = '';
    }
  }
};

window.CartModule = CartModule;
