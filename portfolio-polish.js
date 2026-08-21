/* Portfolio final polish — content hierarchy and readability layer */
(() => {
  'use strict';

  const onReady = (callback) => {
    const start = () => window.requestAnimationFrame(() => window.requestAnimationFrame(callback));
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  };

  onReady(() => {
    const hero = document.querySelector('#hero');
    const projects = document.querySelector('#projects');
    if (!hero || !projects) return;

    const isHll = window.location.pathname.includes('kim-seonil-portfolio_HLL');
    const content = isHll
      ? {
          role: '콘텐츠를 빠르게 만들고, 반응을 데이터로 검증해 채널 성장으로 연결합니다.',
          primaryHref: '#why-studio',
          primaryLabel: '지원 이유와 90일 계획 보기 →',
          scanGuide: '대표 사례 5건 · 직접 제작 / 성장 / 확장의 근거를 먼저 보세요.',
        }
      : {
          role: '고객 행동과 데이터를 바탕으로 그로스 실행과 마케팅 운영 구조를 설계합니다.',
          primaryHref: '#projects',
          primaryLabel: '대표 사례 4개 보기 →',
          scanGuide: '대표 사례 4건 · 문제 / 바꾼 것 / 결과를 먼저 보세요.',
        };

    document.documentElement.classList.add('portfolio-polished');

    const heading = hero.querySelector('h1');
    if (heading && !hero.querySelector('.portfolio-role-line')) {
      const role = document.createElement('p');
      role.className = 'portfolio-role-line';
      role.textContent = content.role;
      heading.insertAdjacentElement('afterend', role);
    }

    const primaryCta = hero.querySelector(`a[href="${content.primaryHref}"]`);
    if (primaryCta) {
      primaryCta.textContent = content.primaryLabel;
      primaryCta.classList.add('portfolio-primary-cta');
    }

    hero.querySelectorAll('a').forEach((link) => {
      if (link !== primaryCta) link.classList.add('portfolio-secondary-cta');
    });

    const projectHeading = projects.querySelector('h2');
    if (projectHeading && !projects.querySelector('.portfolio-scan-guide')) {
      const guide = document.createElement('p');
      guide.className = 'portfolio-scan-guide';
      guide.textContent = content.scanGuide;
      projectHeading.insertAdjacentElement('beforebegin', guide);
    }

    const brandSummary = document.querySelector('#impact .sr-only');
    const brandStrip = brandSummary?.parentElement;
    if (brandStrip) {
      brandStrip.classList.add('portfolio-brand-strip');
      brandStrip.querySelectorAll('*').forEach((item) => {
        item.style.animationPlayState = 'paused';
      });
    }
  });
})();
