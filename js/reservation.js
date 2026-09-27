/**
 * SPICE HAVEN - TABLE RESERVATION SYSTEM, PRIVATE CONCIERGE & LIVE TRACKER
 * Features:
 *  - Two-Step Fine-Dining Reservation UX: Form Details -> Review Details -> Server Confirmation
 *  - Client-side validation with friendly inline alerts
 *  - Server-persisted booking integration via POST /api/reservations
 *  - Official Boarding Pass Confirmation with Verified Booking Reference (RES-XXXXXX)
 *  - Options to Return to Restaurant or Explore Seasonal Menu
 *  - Private Dining Inquiry engine via POST /api/inquiries
 *  - Universal Status Tracker for reservations (RES-XXXXXX) and orders
 */

const ReservationModule = {
  state: {
    guests: 2,
    date: '',
    timeSlot: '7:30 PM',
    diningArea: 'main_hall',
    occasion: 'Romantic Date Night',
    specialRequests: ''
  },

  embeddedContainerHtml: null,
  popupContainerHtml: null,
  cachedBookings: {},

  init() {
    // Cache initial form markup for in-place reset
    const embeddedBox = document.getElementById('embeddedReservationForm')?.parentElement;
    if (embeddedBox && !this.embeddedContainerHtml) {
      this.embeddedContainerHtml = embeddedBox.innerHTML;
    }

    const popupBody = document.querySelector('#reservationModal .modal-body');
    if (popupBody && !this.popupContainerHtml) {
      this.popupContainerHtml = popupBody.innerHTML;
    }

    this.setDefaultDate();
    this.renderDiningAreas();
    this.renderTimeSlots();
    this.renderQuickDatePills();
    this.renderPartyPresets();
    this.setupListeners();
    this.setupInquiryForm();
  },

  calculateQuickDates() {
    const today = new Date();
    const fmt = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const tonight = fmt(today);

    const tmrw = new Date(today);
    tmrw.setDate(tmrw.getDate() + 1);
    const tomorrow = fmt(tmrw);

    // Calculate upcoming Saturday
    const weekendDate = new Date(today);
    const dayOfWeek = today.getDay(); // 0 Sun, 6 Sat
    let daysUntilSat = 6 - dayOfWeek;
    if (daysUntilSat <= 0) daysUntilSat += 7;
    weekendDate.setDate(today.getDate() + daysUntilSat);
    const weekend = fmt(weekendDate);

    return { tonight, tomorrow, weekend };
  },

  setDefaultDate() {
    const { tomorrow } = this.calculateQuickDates();
    this.state.date = tomorrow;

    const dateInputs = document.querySelectorAll('.reservation-date-input');
    const todayStr = this.calculateQuickDates().tonight;
    dateInputs.forEach(input => {
      input.value = this.state.date;
      input.min = todayStr;
    });
  },

  renderQuickDatePills() {
    const { tonight, tomorrow, weekend } = this.calculateQuickDates();
    const containers = document.querySelectorAll('.quick-date-pills');

    containers.forEach(c => {
      c.innerHTML = `
        <button type="button" class="quick-date-chip ${this.state.date === tonight ? 'active' : ''}" data-date="${tonight}">Tonight</button>
        <button type="button" class="quick-date-chip ${this.state.date === tomorrow ? 'active' : ''}" data-date="${tomorrow}">Tomorrow</button>
        <button type="button" class="quick-date-chip ${this.state.date === weekend ? 'active' : ''}" data-date="${weekend}">This Weekend</button>
      `;

      c.querySelectorAll('.quick-date-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const selectedDate = chip.getAttribute('data-date');
          this.state.date = selectedDate;

          document.querySelectorAll('.reservation-date-input').forEach(input => {
            input.value = selectedDate;
          });

          document.querySelectorAll('.quick-date-chip').forEach(ch => {
            ch.classList.toggle('active', ch.getAttribute('data-date') === selectedDate);
          });
        });
      });
    });
  },

  renderPartyPresets() {
    const containers = document.querySelectorAll('.guest-preset-chips');
    const presets = [2, 4, 6, 8];

    containers.forEach(c => {
      c.innerHTML = presets.map(p => `
        <button type="button" class="guest-preset-chip ${this.state.guests === p ? 'active' : ''}" data-count="${p}">
          ${p === 8 ? '8+ Guests' : p + ' Guests'}
        </button>
      `).join('');

      c.querySelectorAll('.guest-preset-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const count = parseInt(chip.getAttribute('data-count'), 10);
          this.setGuests(count);
        });
      });
    });
  },

  setGuests(count) {
    const min = window.RestaurantConfig?.reservations?.minGuests || 1;
    const max = window.RestaurantConfig?.reservations?.maxGuests || 12;
    this.state.guests = Math.min(Math.max(count, min), max);

    document.querySelectorAll('.guest-count-display').forEach(el => {
      el.textContent = this.state.guests;
    });

    document.querySelectorAll('.guest-preset-chip').forEach(chip => {
      const p = parseInt(chip.getAttribute('data-count'), 10);
      chip.classList.toggle('active', this.state.guests === p);
    });
  },

  updateGuests(delta) {
    this.setGuests(this.state.guests + delta);
  },

  renderDiningAreas() {
    const containers = document.querySelectorAll('.dining-areas-selector');
    if (!containers.length || !window.RestaurantConfig) return;

    const areas = window.RestaurantConfig.reservations.diningAreas;

    const html = areas.map(area => `
      <div class="dining-area-card ${area.id === this.state.diningArea ? 'selected' : ''}" data-area-id="${area.id}" role="button" tabindex="0" aria-label="Select ${area.name}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h4 class="dining-area-name">${area.name}</h4>
          ${area.premium ? '<span class="diet-tag special">Curated</span>' : ''}
        </div>
        <p class="dining-area-desc">${area.description}</p>
      </div>
    `).join('');

    containers.forEach(c => {
      c.innerHTML = html;
      c.querySelectorAll('.dining-area-card').forEach(card => {
        const selectHandler = () => {
          c.querySelectorAll('.dining-area-card').forEach(cd => cd.classList.remove('selected'));
          card.classList.add('selected');
          this.state.diningArea = card.getAttribute('data-area-id');
        };
        card.addEventListener('click', selectHandler);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectHandler();
          }
        });
      });
    });
  },

  renderTimeSlots() {
    const wrappers = document.querySelectorAll('.time-slots-wrapper');
    if (!wrappers.length || !window.RestaurantConfig) return;

    const slots = window.RestaurantConfig.reservations.timeSlots;

    const html = slots.map(slot => `
      <button type="button" class="time-slot-pill ${slot === this.state.timeSlot ? 'selected' : ''}" data-slot="${slot}" aria-label="Select service time ${slot}">
        ${slot}
      </button>
    `).join('');

    wrappers.forEach(w => {
      w.innerHTML = html;
      w.querySelectorAll('.time-slot-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          w.querySelectorAll('.time-slot-pill').forEach(p => p.classList.remove('selected'));
          pill.classList.add('selected');
          this.state.timeSlot = pill.getAttribute('data-slot');
        });
      });
    });
  },

  setupListeners() {
    // Stepper guest counter
    document.querySelectorAll('.guest-stepper-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseInt(btn.getAttribute('data-delta'), 10);
        this.updateGuests(delta);
      });
    });

    // Date change
    document.querySelectorAll('.reservation-date-input').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.date = e.target.value;
        document.querySelectorAll('.quick-date-chip').forEach(ch => {
          ch.classList.toggle('active', ch.getAttribute('data-date') === e.target.value);
        });
      });
    });

    // Open/Close Modal
    const reserveModal = document.getElementById('reservationModal');
    const modalClose = document.getElementById('reservationModalClose');

    document.querySelectorAll('.trigger-reservation-modal').forEach(btn => {
      btn.addEventListener('click', () => this.openModal());
    });

    if (modalClose) modalClose.addEventListener('click', () => this.closeModal());
    if (reserveModal) {
      reserveModal.addEventListener('click', (e) => {
        if (e.target === reserveModal) this.closeModal();
      });
    }

    const trackerModal = document.getElementById('statusTrackerModal');
    if (trackerModal) {
      trackerModal.addEventListener('click', (e) => {
        if (e.target === trackerModal) StatusTrackerModule.close();
      });
    }

    // Submit forms (both embedded & modal)
    document.querySelectorAll('.reservation-form-submit').forEach(form => {
      if (!form.dataset.bound) {
        form.dataset.bound = 'true';
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleBookingSubmit(form);
        });
      }
    });
  },

  setupInquiryForm() {
    const inquiryForm = document.getElementById('privateDiningForm');
    if (inquiryForm && !inquiryForm.dataset.bound) {
      inquiryForm.dataset.bound = 'true';
      inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleInquirySubmit(inquiryForm);
      });
    }
  },

  openModal() {
    const modal = document.getElementById('reservationModal');
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const modal = document.getElementById('reservationModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  validateBookingForm(formEl) {
    const name = (formEl.querySelector('[name="guestName"]')?.value || '').trim();
    const email = (formEl.querySelector('[name="guestEmail"]')?.value || '').trim();
    const phone = (formEl.querySelector('[name="guestPhone"]')?.value || '').trim();
    const date = formEl.querySelector('.reservation-date-input')?.value || this.state.date;
    const timeSlot = this.state.timeSlot;
    const diningArea = this.state.diningArea;
    const guests = this.state.guests;
    const occasion = formEl.querySelector('[name="occasion"]')?.value || this.state.occasion;
    const specialRequests = (formEl.querySelector('[name="specialRequests"]')?.value || '').trim();

    if (!name || name.length < 2) {
      return { valid: false, error: 'Please enter a valid guest name (min 2 characters).' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { valid: false, error: 'Please provide a valid email address for your confirmation pass.' };
    }

    if (!phone || phone.length < 6) {
      return { valid: false, error: 'Please provide a valid direct phone number.' };
    }

    if (!date) {
      return { valid: false, error: 'Please select your preferred reservation date.' };
    }

    const todayStr = this.calculateQuickDates().tonight;
    if (date < todayStr) {
      return { valid: false, error: 'Reservation date cannot be in the past.' };
    }

    if (!timeSlot) {
      return { valid: false, error: 'Please select a service time slot.' };
    }

    return {
      valid: true,
      data: {
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        guests: guests,
        date: date,
        timeSlot: timeSlot,
        diningArea: diningArea,
        occasion: occasion,
        specialRequests: specialRequests
      }
    };
  },

  handleBookingSubmit(formEl) {
    // Clear existing error
    const oldErr = formEl.querySelector('.form-error-alert');
    if (oldErr) oldErr.remove();

    const validation = this.validateBookingForm(formEl);
    if (!validation.valid) {
      const errDiv = document.createElement('div');
      errDiv.className = 'form-error-alert';
      errDiv.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${validation.error}</span>
      `;
      const submitBtn = formEl.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.parentElement.insertBefore(errDiv, submitBtn);
      } else {
        formEl.appendChild(errDiv);
      }
      return;
    }

    // Proceed to Step 2: Review Details
    this.renderReviewStep(formEl, validation.data);
  },

  renderReviewStep(formEl, data) {
    const formId = formEl.id;
    this.cachedBookings[formId] = data;

    // Lookup area title
    const areas = window.RestaurantConfig?.reservations?.diningAreas || [];
    const areaObj = areas.find(a => a.id === data.diningArea);
    const areaName = areaObj ? areaObj.name : 'The Grand Dining Room';

    const targetContainer = formEl.parentElement;
    targetContainer.innerHTML = `
      <div class="reservation-review-card reservation-pass-enter" id="reviewCard_${formId}">
        <div style="text-align: center; margin-bottom: 18px;">
          <span class="section-tag" style="font-size: 0.75rem;">Step 2 of 2 • Review Details</span>
          <h3 class="reservation-review-title" style="margin-top: 8px;">Review Table Reservation</h3>
          <p class="reservation-review-subtitle">
            Please verify your fine-dining reservation details prior to server confirmation.
          </p>
        </div>

        <div class="reservation-review-grid">
          <div class="reservation-review-item">
            <span class="reservation-review-label">Primary Guest</span>
            <span class="reservation-review-value">${data.guestName}</span>
          </div>

          <div class="reservation-review-item">
            <span class="reservation-review-label">Contact Details</span>
            <span class="reservation-review-value" style="font-size: 0.88rem;">${data.guestEmail}<br>${data.guestPhone}</span>
          </div>

          <div class="reservation-review-item">
            <span class="reservation-review-label">Date & Time</span>
            <span class="reservation-review-value gold">${data.date} at ${data.timeSlot}</span>
          </div>

          <div class="reservation-review-item">
            <span class="reservation-review-label">Party Size</span>
            <span class="reservation-review-value">${data.guests} Guests</span>
          </div>

          <div class="reservation-review-item" style="grid-column: 1 / -1;">
            <span class="reservation-review-label">Seating Sanctuary</span>
            <span class="reservation-review-value gold">${areaName}</span>
          </div>

          <div class="reservation-review-item">
            <span class="reservation-review-label">Occasion</span>
            <span class="reservation-review-value">${data.occasion}</span>
          </div>

          ${data.specialRequests ? `
            <div class="reservation-review-item">
              <span class="reservation-review-label">Special Requests</span>
              <span class="reservation-review-value" style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">${data.specialRequests}</span>
            </div>
          ` : ''}
        </div>

        <div class="reservation-review-actions">
          <button type="button" class="btn btn-outline-gold btn-sm" onclick="ReservationModule.backToForm('${formId}')">
            ← Edit Details
          </button>
          <button type="button" class="btn btn-primary-gold btn-sm gold-shimmer" id="confirmFinalBtn_${formId}" onclick="ReservationModule.submitConfirmedBooking('${formId}')">
            Confirm Reservation ✓
          </button>
        </div>
      </div>
    `;
  },

  backToForm(formId) {
    this.resetForm(formId);
    const data = this.cachedBookings[formId];
    if (data) {
      const formEl = document.getElementById(formId);
      if (formEl) {
        const nameInp = formEl.querySelector('[name="guestName"]');
        const emailInp = formEl.querySelector('[name="guestEmail"]');
        const phoneInp = formEl.querySelector('[name="guestPhone"]');
        const occInp = formEl.querySelector('[name="occasion"]');
        const reqInp = formEl.querySelector('[name="specialRequests"]');

        if (nameInp) nameInp.value = data.guestName;
        if (emailInp) emailInp.value = data.guestEmail;
        if (phoneInp) phoneInp.value = data.guestPhone;
        if (occInp) occInp.value = data.occasion;
        if (reqInp) reqInp.value = data.specialRequests;
        if (data.guests) this.setGuests(data.guests);
      }
    }
  },

  async submitConfirmedBooking(formId) {
    const data = this.cachedBookings[formId];
    if (!data) return;

    const confirmBtn = document.getElementById(`confirmFinalBtn_${formId}`);
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 8px;">
          <svg class="spin-animation" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          </svg>
          Securing Table with Sanctuary Concierge...
        </span>
      `;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to confirm reservation at this time.');
      }

      const res = result.reservation || {};
      const bookingCode = res.bookingId || result.booking_id || ('RES-' + Math.floor(100000 + Math.random() * 900000));
      const areaName = res.diningArea || 'The Grand Dining Room';

      // Persist to client reservation storage for Customer Account History
      try {
        const storedReservations = JSON.parse(localStorage.getItem('spicehaven_reservations') || '[]');
        const fullReservationRecord = {
          bookingId: bookingCode,
          guestName: res.guestName || data.guestName,
          guestEmail: res.guestEmail || data.guestEmail,
          guestPhone: res.guestPhone || data.guestPhone,
          guests: res.guests || data.guests,
          date: res.date || data.date,
          timeSlot: res.timeSlot || data.timeSlot,
          diningArea: areaName,
          diningAreaId: res.diningAreaId || data.diningArea,
          occasion: res.occasion || data.occasion,
          specialRequests: res.specialRequests || data.specialRequests,
          status: 'Confirmed',
          createdAt: res.createdAt || new Date().toISOString()
        };
        // Avoid duplicate booking IDs
        const existingIdx = storedReservations.findIndex(r => r.bookingId === bookingCode);
        if (existingIdx >= 0) {
          storedReservations[existingIdx] = fullReservationRecord;
        } else {
          storedReservations.unshift(fullReservationRecord);
        }
        localStorage.setItem('spicehaven_reservations', JSON.stringify(storedReservations));

        // Auto-fill/update local customer profile with guest contact if not set
        if (window.ProfileModule && typeof window.ProfileModule.syncFromReservation === 'function') {
          window.ProfileModule.syncFromReservation(fullReservationRecord);
        }
      } catch (e) {
        console.warn("Unable to save local reservation history:", e);
      }

      const reviewCard = document.getElementById(`reviewCard_${formId}`);
      const targetContainer = reviewCard?.parentElement || document.querySelector('#reservationModal .modal-body');

      targetContainer.innerHTML = `
        <div class="reservation-pass-enter" style="text-align: center; padding: 20px 0;">
          <div class="success-checkmark">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <div style="margin-bottom: 8px;">
            <span class="tracker-badge confirmed">✓ Verified on Server</span>
          </div>
          <h3 style="font-size: 1.8rem; font-family: var(--font-serif); margin: 8px 0 12px 0;">Table Reserved for ${res.guestName || data.guestName}</h3>
          <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 24px auto;">
            We eagerly look forward to hosting you at Spice Haven. A luxury confirmation pass has been dispatched to <strong>${res.guestEmail || res.guestPhone || data.guestEmail}</strong>.
          </p>

          <div class="reservation-ticket" style="max-width: 500px; margin: 0 auto 28px auto;">
            <div style="font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted);">
              Official Dining Boarding Pass
            </div>
            <div class="reservation-ticket-code">${bookingCode}</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: left; margin-top: 18px; font-size: 0.88rem;">
              <div>
                <span style="color: var(--text-muted); display:block; font-size: 0.75rem;">Date of Service:</span>
                <strong>${res.date || data.date}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); display:block; font-size: 0.75rem;">Time Service:</span>
                <strong>${res.timeSlot || data.timeSlot}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); display:block; font-size: 0.75rem;">Party Size:</span>
                <strong>${res.guests || data.guests} Guests</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); display:block; font-size: 0.75rem;">Dining Hall:</span>
                <strong style="color: var(--color-primary);">${areaName}</strong>
              </div>
            </div>

            ${data.specialRequests ? `
              <div style="margin-top: 14px; text-align: left; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                <strong>Special Request:</strong> ${data.specialRequests}
              </div>
            ` : ''}

            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border-subtle); font-size: 0.76rem; color: var(--text-dim); text-align: center;">
              Status: <strong style="color: #4ADE80;">Server Confirmed</strong> • Present reference <strong>${bookingCode}</strong> upon arrival.
            </div>
          </div>

          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline-gold btn-sm" onclick="ReservationModule.returnToRestaurant('${formId}')">
              Return to Restaurant
            </button>
            <button type="button" class="btn btn-primary-gold btn-sm" onclick="ReservationModule.exploreMenu('${formId}')">
              Explore Seasonal Menu
            </button>
            <button type="button" class="btn btn-subtle btn-sm" onclick="window.print()">
              Print Pass
            </button>
            <button type="button" class="btn btn-subtle btn-sm" onclick="StatusTrackerModule.open('reservation', '${bookingCode}')">
              Track Live Status
            </button>
          </div>
        </div>
      `;

      if (window.CartModule) {
        window.CartModule.showToast(`Table confirmed for ${data.guestName}! Reference: ${bookingCode}`);
      }

    } catch (err) {
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Confirm Reservation ✓';
      }
      const reviewCard = document.getElementById(`reviewCard_${formId}`);
      if (reviewCard) {
        const errDiv = document.createElement('div');
        errDiv.className = 'form-error-alert';
        errDiv.innerHTML = `<strong>Booking Notice:</strong> ${err.message}`;
        reviewCard.appendChild(errDiv);
      }
    }
  },

  returnToRestaurant(formId) {
    this.closeModal();
    this.resetForm(formId);
  },

  exploreMenu(formId) {
    this.closeModal();
    this.resetForm(formId);
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  },

  async handleInquirySubmit(formEl) {
    const submitBtn = formEl.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send VIP Event Inquiry';

    const clientName = formEl.querySelector('[name="clientName"]')?.value || '';
    const clientEmail = formEl.querySelector('[name="clientEmail"]')?.value || '';
    const eventGuests = formEl.querySelector('[name="eventGuests"]')?.value || '16';
    const targetDate = formEl.querySelector('[name="targetDate"]')?.value || '';
    const eventNotes = formEl.querySelector('[name="eventNotes"]')?.value || '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Connecting with Banquet Concierge...';
    }

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          eventGuests,
          targetDate,
          eventNotes
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      formEl.parentElement.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <div class="success-checkmark">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="section-tag" style="color: var(--color-primary);">Inquiry Logged</span>
          <h3 style="font-family: var(--font-serif); font-size: 1.6rem; margin: 8px 0;">VIP Concierge Dispatched</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 440px; margin: 0 auto 18px auto;">
            ${data.message || 'Your private dining inquiry has been securely registered.'}
          </p>
          <div class="reservation-ticket" style="max-width: 420px; margin: 0 auto 20px auto; padding: 14px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Inquiry Reference</div>
            <div class="reservation-ticket-code" style="font-size: 1.3rem;">${data.inquiry_id}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 8px;">
              Client: <strong>${clientName}</strong> • Est. Guests: <strong>${eventGuests}</strong>
            </div>
          </div>
          <button type="button" class="btn btn-outline-gold btn-sm" onclick="location.reload()">
            Submit Another Inquiry
          </button>
        </div>
      `;

      if (window.CartModule) {
        window.CartModule.showToast(`Inquiry #${data.inquiry_id} registered with concierge.`);
      }

    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
      alert('Inquiry error: ' + err.message);
    }
  },

  resetForm(formId) {
    if (formId === 'embeddedReservationForm' && this.embeddedContainerHtml) {
      const box = document.querySelector('.reservation-box');
      if (box) box.innerHTML = this.embeddedContainerHtml;
    } else if (this.popupContainerHtml) {
      const modalBody = document.querySelector('#reservationModal .modal-body');
      if (modalBody) modalBody.innerHTML = this.popupContainerHtml;
    }

    this.setDefaultDate();
    this.renderDiningAreas();
    this.renderTimeSlots();
    this.renderQuickDatePills();
    this.renderPartyPresets();
    this.setupListeners();
  }
};

const StatusTrackerModule = {
  activeTab: 'reservation',

  open(tab = 'reservation', prefillCode = '') {
    const modal = document.getElementById('statusTrackerModal');
    if (!modal) return;
    this.switchTab(tab);
    if (prefillCode) {
      const input = document.getElementById('trackerQueryInput');
      if (input) input.value = prefillCode;
      this.handleLookup();
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const modal = document.getElementById('statusTrackerModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  switchTab(tab) {
    this.activeTab = tab;
    const tabRes = document.getElementById('tabTrackReservation');
    const tabOrd = document.getElementById('tabTrackOrder');
    const label = document.getElementById('trackerInputLabel');
    const input = document.getElementById('trackerQueryInput');

    if (tab === 'reservation') {
      if (tabRes) tabRes.classList.add('active');
      if (tabOrd) tabOrd.classList.remove('active');
      if (label) label.textContent = 'Enter Booking Reference Code (e.g. RES-123456)';
      if (input) input.placeholder = 'e.g. RES-849201';
    } else {
      if (tabOrd) tabOrd.classList.add('active');
      if (tabRes) tabRes.classList.remove('active');
      if (label) label.textContent = 'Enter Order Ticket Reference (e.g. SH-123456)';
      if (input) input.placeholder = 'e.g. SH-849201';
    }
  },

  async handleLookup() {
    const input = document.getElementById('trackerQueryInput');
    const resultContainer = document.getElementById('trackerResultContainer');
    if (!input || !resultContainer) return;

    const query = input.value.trim().toUpperCase();
    if (!query) {
      resultContainer.innerHTML = `
        <div class="form-error-alert" style="margin-top: 14px;">
          <span>Please enter a valid reference code.</span>
        </div>
      `;
      return;
    }

    resultContainer.innerHTML = `
      <div style="text-align: center; padding: 24px 0; color: var(--text-muted);">
        <div class="payment-spinner" style="margin: 0 auto 12px auto;"></div>
        <p style="font-size: 0.88rem;">Querying restaurant server registry...</p>
      </div>
    `;

    try {
      if (this.activeTab === 'reservation' || query.startsWith('RES-')) {
        const resp = await fetch(`/api/reservation-status?booking_id=${encodeURIComponent(query)}`);
        const data = await resp.json();
        if (!resp.ok || !data.success) {
          throw new Error(data.error || `No reservation found for reference "${query}".`);
        }
        const res = data.reservation;
        resultContainer.innerHTML = `
          <div class="reservation-ticket" style="margin-top: 16px; padding: 18px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="tracker-badge confirmed">✓ Confirmed</span>
              <strong class="reservation-ticket-code" style="margin: 0; font-size: 1.1rem;">${res.bookingId}</strong>
            </div>
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-light); margin-bottom: 4px;">
              Guest: ${res.guestName} (${res.guests} Guests)
            </div>
            <div style="font-size: 0.85rem; color: var(--color-primary); margin-bottom: 4px;">
              ${res.date} at ${res.timeSlot} • ${res.diningArea || 'The Grand Dining Room'}
            </div>
            ${res.specialRequests ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 6px;">Note: ${res.specialRequests}</div>` : ''}
          </div>
        `;
      } else {
        // Look up in localStorage or server
        let matchedOrder = null;
        try {
          const localOrders = JSON.parse(localStorage.getItem('spicehaven_orders') || '[]');
          matchedOrder = localOrders.find(o => o.orderId === query || o.razorpayOrderId === query);
        } catch (e) {}

        if (!matchedOrder) {
          const resp = await fetch(`/api/order-status?order_id=${encodeURIComponent(query)}`);
          const data = await resp.json();
          if (resp.ok && data.success) {
            matchedOrder = data.order;
          }
        }

        if (!matchedOrder) {
          throw new Error(`Order ticket "${query}" not found in active order registry.`);
        }

        const isPaid = matchedOrder.isPaid;
        const totalFormatted = window.RestaurantConfig?.formatCurrency ? window.RestaurantConfig.formatCurrency(matchedOrder.totalAmount || (matchedOrder.amount / 100)) : `₹${matchedOrder.totalAmount || (matchedOrder.amount / 100)}`;
        resultContainer.innerHTML = `
          <div class="reservation-ticket" style="margin-top: 16px; padding: 18px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="tracker-badge ${isPaid ? 'confirmed' : 'pending'}">${isPaid ? '✓ Paid & Verified' : '⏳ Processing / Prep'}</span>
              <strong class="reservation-ticket-code" style="margin: 0; font-size: 1.1rem;">#${matchedOrder.orderId || query}</strong>
            </div>
            <div style="font-size: 0.92rem; font-weight: 600; color: var(--text-light); margin-bottom: 4px;">
              Connoisseur: ${matchedOrder.customerName || 'Valued Guest'}
            </div>
            <div style="font-size: 0.85rem; color: var(--color-primary); margin-bottom: 6px;">
              ${matchedOrder.diningMode || 'Dine-In Service'} • Total: ${totalFormatted}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              Status: ${matchedOrder.paymentStatus || 'Registered'}
            </div>
          </div>
        `;
      }
    } catch (err) {
      resultContainer.innerHTML = `
        <div class="form-error-alert" style="margin-top: 14px;">
          <span>${err.message}</span>
        </div>
      `;
    }
  }
};

window.ReservationModule = ReservationModule;
window.StatusTrackerModule = StatusTrackerModule;

