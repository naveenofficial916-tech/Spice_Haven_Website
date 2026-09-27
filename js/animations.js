/**
 * SPICE HAVEN - SCROLL REVEALS, ACCENT ANIMATIONS & SOUND AMBIENCE
 */

const AppAnimations = {
  init() {
    this.setupCurtainEntrance();
    this.setupChefPerformance();
    this.setupScrollHeader();
    this.setupIntersectionReveals();
    this.setupAccoladeCounters();
    this.setupAmbientAudio();
  },

  // 0.1 True Animated Chef Performance Orchestrator
  setupChefPerformance() {
    const chefLeft = document.getElementById('chefPerformanceLeft');
    const chefRight = document.getElementById('chefPerformanceRight');
    if (!chefLeft && !chefRight) return;

    // Check prefers-reduced-motion
    const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      if (chefLeft) chefLeft.classList.add('reduced-motion');
      if (chefRight) chefRight.classList.add('reduced-motion');
      return;
    }

    // Interactive ambient responsiveness: subtle speed shift on station hover
    if (chefLeft) {
      chefLeft.addEventListener('mouseenter', () => {
        const pan = chefLeft.querySelector('.chef-left-pan');
        if (pan) pan.style.animationDuration = '2.0s';
      });
      chefLeft.addEventListener('mouseleave', () => {
        const pan = chefLeft.querySelector('.chef-left-pan');
        if (pan) pan.style.animationDuration = '';
      });
    }

    if (chefRight) {
      chefRight.addEventListener('mouseenter', () => {
        const arm = chefRight.querySelector('.chef-garnish-upperarm');
        if (arm) arm.style.animationDuration = '2.4s';
      });
      chefRight.addEventListener('mouseleave', () => {
        const arm = chefRight.querySelector('.chef-garnish-upperarm');
        if (arm) arm.style.animationDuration = '';
      });
    }
  },

  // 0. Cinematic Red Velvet Curtain Entrance
  setupCurtainEntrance() {
    const curtain = document.getElementById('curtainEntrance');
    const enterBtn = document.getElementById('curtainEnterBtn');
    if (!curtain) return;

    // Ensure clean state on load
    try {
      sessionStorage.removeItem('spicehaven_entered');
    } catch (e) {}

    // Accessibility check: prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      curtain.style.display = 'none';
      return;
    }

    // Force display flex and lock body scrolling during curtain presentation
    curtain.style.display = 'flex';
    curtain.classList.remove('curtain-opened', 'opening');
    curtain.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    let hasTriggered = false;
    const triggerEntrance = () => {
      if (hasTriggered) return;
      hasTriggered = true;

      // 1. Add revealing class to body to initiate subtle hero scale/fade
      document.body.classList.add('curtain-revealing');

      // 2. Animate curtains opening
      curtain.classList.add('opening');

      // 3. Unlock body scroll
      document.body.style.overflow = '';

      // 4. Complete transition and hide from DOM accessibility tree
      setTimeout(() => {
        curtain.classList.add('curtain-opened');
        curtain.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('curtain-revealing');
        setTimeout(() => {
          curtain.style.display = 'none';
        }, 500);
      }, 1900);
    };

    if (enterBtn) {
      enterBtn.onclick = (e) => {
        e.stopPropagation();
        triggerEntrance();
      };
    }

    // Clicking anywhere on curtain also opens it
    curtain.onclick = (e) => {
      triggerEntrance();
    };

    // Support keyboard Enter or Space
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !hasTriggered && curtain.style.display !== 'none') {
        triggerEntrance();
      }
    });
  },

  // Allows user to re-trigger the cinematic entrance anytime from the footer
  replayCurtain() {
    const curtain = document.getElementById('curtainEntrance');
    if (!curtain) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    curtain.style.display = 'flex';
    curtain.setAttribute('aria-hidden', 'false');
    curtain.classList.remove('curtain-opened', 'opening');
    document.body.style.overflow = 'hidden';

    const enterBtn = document.getElementById('curtainEnterBtn');
    let hasTriggered = false;
    const trigger = (e) => {
      if (e) e.stopPropagation();
      if (hasTriggered) return;
      hasTriggered = true;
      document.body.classList.add('curtain-revealing');
      curtain.classList.add('opening');
      document.body.style.overflow = '';
      setTimeout(() => {
        curtain.classList.add('curtain-opened');
        curtain.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('curtain-revealing');
        setTimeout(() => {
          curtain.style.display = 'none';
        }, 500);
      }, 1900);
    };

    if (enterBtn) {
      enterBtn.onclick = trigger;
      enterBtn.focus();
    }
    curtain.onclick = trigger;
  },

  // 1. Sticky Header scroll effect
  setupScrollHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  },

  // 2. Intersection Observer for purposeful scroll reveals
  setupIntersectionReveals() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-fade');
    if (!reveals.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.12
      });

      reveals.forEach(el => observer.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('revealed'));
    }
  },

  // 3. Accolade Numbers Counter Animation
  setupAccoladeCounters() {
    const counters = document.querySelectorAll('.accolade-num-val');
    if (!counters.length) return;

    const runCounter = (el) => {
      const target = parseFloat(el.getAttribute('data-target') || '0');
      const isDecimal = target % 1 !== 0;
      const duration = 1600;
      const startTime = performance.now();

      const updateCount = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        const current = target * easeOutQuad;

        el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = isDecimal ? target.toFixed(1) : target;
        }
      };

      requestAnimationFrame(updateCount);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(c => observer.observe(c));
    } else {
      counters.forEach(c => runCounter(c));
    }
  },

  // 4. Subtle Web Audio API Ambient Lounge Sound (Fine Dining Atmosphere)
  setupAmbientAudio() {
    const audioWidget = document.getElementById('audioAmbienceWidget');
    if (!audioWidget) return;

    let audioCtx = null;
    let isPlaying = false;
    let osc1, osc2, gainNode;

    const toggleAudio = () => {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        // Create warm, relaxing harmonic drone simulating a discreet luxury lounge acoustic
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.connect(audioCtx.destination);

        osc1 = audioCtx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(146.83, audioCtx.currentTime); // D3 chord root

        osc2 = audioCtx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(220.00, audioCtx.currentTime); // A3 harmonic fifth

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, audioCtx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);

        osc1.start();
        osc2.start();
        isPlaying = true;
        audioWidget.classList.add('playing');
        audioWidget.querySelector('.audio-label').textContent = 'Lounge Ambiance: ON';
      } else if (isPlaying) {
        audioCtx.suspend();
        isPlaying = false;
        audioWidget.classList.remove('playing');
        audioWidget.querySelector('.audio-label').textContent = 'Sound Ambiance';
      } else {
        audioCtx.resume();
        isPlaying = true;
        audioWidget.classList.add('playing');
        audioWidget.querySelector('.audio-label').textContent = 'Lounge Ambiance: ON';
      }
    };

    audioWidget.addEventListener('click', toggleAudio);
  },

  // 5. Flying particle to cart animation
  flyToCart(originEl) {
    const cartBtn = document.getElementById('cartTriggerBtn');
    if (!originEl || !cartBtn) return;

    const startRect = originEl.getBoundingClientRect();
    const endRect = cartBtn.getBoundingClientRect();

    const particle = document.createElement('div');
    particle.className = 'flying-food-particle';
    particle.style.left = `${startRect.left + startRect.width / 2}px`;
    particle.style.top = `${startRect.top + startRect.height / 2}px`;
    document.body.appendChild(particle);

    // Trigger curve transition
    requestAnimationFrame(() => {
      particle.style.left = `${endRect.left + endRect.width / 2}px`;
      particle.style.top = `${endRect.top + endRect.height / 2}px`;
      particle.style.transform = 'scale(0.35)';
      particle.style.opacity = '0.3';
    });

    setTimeout(() => {
      particle.remove();
      const badge = document.getElementById('cartBadge');
      if (badge) {
        badge.classList.add('bump');
        setTimeout(() => badge.classList.remove('bump'), 300);
      }
    }, 650);
  }
};

window.AppAnimations = AppAnimations;
