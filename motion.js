/* Kim Seonil portfolio motion layer — no framework or external animation dependency */
(() => {
  'use strict';

  const ready = (callback) => {
    const start = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(callback);
      });
    };

    if (document.readyState === 'complete') {
      start();
    } else {
      window.addEventListener('load', start, { once: true });
    }
  };

  ready(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const main = document.querySelector('main');
    const header = document.querySelector('.site-header');

    document.documentElement.classList.add('motion-runtime');

    let progress = document.querySelector('[data-testid="scroll-progress"]');
    if (!progress) {
      progress = document.createElement('div');
      progress.className = 'motion-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progress);
    }

    let ticking = false;
    const updateFrame = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const value = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      progress.style.transform = `scaleX(${value})`;
      document.documentElement.style.setProperty('--motion-progress', value.toFixed(4));
      header?.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateFrame);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateFrame();

    if (reduceMotion || !main) {
      return;
    }

    const hero = document.querySelector('#hero');
    if (hero) {
      const heroItems = [...hero.querySelectorAll('p, a, img')];
      heroItems.forEach((item, index) => {
        item.classList.add('motion-hero-item');
        item.style.animationDelay = `${140 + index * 55}ms`;
      });
    }

    const sections = [...main.querySelectorAll(':scope > section:not(#hero)')];
    const revealTargets = sections
      .map((section) => section.firstElementChild)
      .filter(Boolean);

    const reveal = (target) => target.classList.add('motion-in');
    revealTargets.forEach((target) => target.classList.add('motion-reveal'));

    const countTargets = [...main.querySelectorAll('#impact .figure, #impact .tnum')]
      .filter((element) => element.children.length === 0)
      .filter((element) => {
        const numbers = element.textContent.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) || [];
        return numbers.length >= 1 && numbers.length <= 2;
      });

    const animateNumber = (element) => {
      if (element.dataset.motionCounted === 'true') return;

      const original = element.textContent.trim();
      const matches = [...original.matchAll(/\d+(?:,\d{3})*(?:\.\d+)?/g)];
      if (!matches.length || matches.length > 2) return;

      const values = matches.map((match) => ({
        index: match.index,
        raw: match[0],
        target: Number(match[0].replaceAll(',', '')),
        decimals: (match[0].split('.')[1] || '').length,
        minIntegerDigits: Math.max(1, match[0].split('.')[0].replaceAll(',', '').length),
        grouped: match[0].includes(','),
      }));
      if (values.some((value) => !Number.isFinite(value.target) || value.target <= 0)) return;

      element.dataset.motionCounted = 'true';
      element.classList.add('motion-counted');
      element.setAttribute('aria-label', original);

      const duration = Math.min(1120, Math.max(600, 460 + Math.max(...values.map((value) => value.target)) / 2));
      const start = performance.now();

      const formatValue = (value, current) => {
        const rounded = value.decimals ? current : Math.round(current);
        const formatted = rounded.toLocaleString('ko-KR', {
          minimumFractionDigits: value.decimals,
          maximumFractionDigits: value.decimals,
          useGrouping: value.grouped,
        });
        const [integer, fraction] = formatted.split('.');
        const padded = integer.padStart(value.minIntegerDigits, '0');
        return fraction === undefined ? padded : `${padded}.${fraction}`;
      };

      const render = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        let cursor = 0;
        let output = '';
        values.forEach((value) => {
          output += original.slice(cursor, value.index);
          output += formatValue(value, value.target * eased);
          cursor = value.index + value.raw.length;
        });
        element.textContent = output + original.slice(cursor);
        if (progress < 1) {
          window.requestAnimationFrame(render);
        } else {
          element.textContent = original;
        }
      };

      window.requestAnimationFrame(render);
    };

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach(reveal);
      countTargets.forEach(animateNumber);
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

      revealTargets.forEach((target) => observer.observe(target));

      const countObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateNumber(entry.target);
          countObserver.unobserve(entry.target);
        });
      }, { threshold: 0.45 });

      countTargets.forEach((target) => countObserver.observe(target));
    }

    [...main.querySelectorAll('a[href*="#"], a[href*="/projects/"], a[href*="/resume/"]')]
      .forEach((link) => link.classList.add('motion-link'));

    if (!finePointer) return;

    const cards = [...main.querySelectorAll('#impact article, #projects article')];
    cards.forEach((card) => {
      card.classList.add('motion-card');
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--motion-x', `${(x * 5).toFixed(2)}px`);
        card.style.setProperty('--motion-y', `${(y * 5).toFixed(2)}px`);
      }, { passive: true });
      card.addEventListener('pointerenter', () => card.classList.add('is-hovered'));
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-hovered');
        card.style.setProperty('--motion-x', '0px');
        card.style.setProperty('--motion-y', '0px');
      });
    });
  });
})();
