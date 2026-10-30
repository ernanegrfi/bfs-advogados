(() => {
  'use strict';

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const running = new Set();

  function play(element, frames, options) {
    if (preference.matches || !element || !element.animate) return null;
    const animation = element.animate(frames, options);
    running.add(animation);
    animation.finished.then(
      () => running.delete(animation),
      () => running.delete(animation)
    );
    return animation;
  }

  // ══════════════════════════════════════════════════════
  // 1. ÁREAS DE ATUAÇÃO (ACCORDION SUAVE & FÍSICA DE MOLA)
  // ══════════════════════════════════════════════════════
  const panels = new Map();

  function setPanel(button, open) {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;

    const previous = panels.get(panel);
    const startHeight = panel.hidden ? 0 : panel.getBoundingClientRect().height;
    const startOpacity = panel.hidden ? 0 : Number(getComputedStyle(panel).opacity);
    const startPadding = panel.hidden ? 0 : parseFloat(getComputedStyle(panel).paddingBottom);

    if (previous) {
      previous.cancel();
      panels.delete(panel);
    }

    button.setAttribute('aria-expanded', String(open));
    const sign = button.querySelector('.area-sign');
    if (sign) {
      sign.textContent = open ? '−' : '+';
    }

    panel.inert = !open;
    if (!open && panel.contains(document.activeElement)) {
      button.focus({ preventScroll: true });
    }

    panel.hidden = false;
    panel.classList.remove('is-moving');

    const endHeight = panel.getBoundingClientRect().height;
    const endPadding = parseFloat(getComputedStyle(panel).paddingBottom);

    function settle() {
      panel.hidden = !open;
      panel.classList.remove('is-moving');
    }

    if (preference.matches || !panel.animate || (!open && startHeight === 0)) {
      settle();
      return;
    }

    panel.classList.add('is-moving');
    const animation = play(
      panel,
      [
        {
          height: `${startHeight}px`,
          opacity: startOpacity,
          paddingBottom: `${startPadding}px`,
          transform: open ? 'translateY(-6px)' : 'translateY(0)'
        },
        {
          height: open ? `${endHeight}px` : '0px',
          opacity: open ? 1 : 0,
          paddingBottom: open ? `${endPadding}px` : '0px',
          transform: open ? 'translateY(0)' : 'translateY(-6px)'
        }
      ],
      {
        duration: mobile.matches ? 300 : 420,
        easing: 'cubic-bezier(.22,.61,.36,1)'
      }
    );

    panels.set(panel, animation);
    animation.finished.then(
      () => {
        if (panels.get(panel) === animation) {
          panels.delete(panel);
          settle();
        }
      },
      () => {}
    );
  }

  document.querySelectorAll('.area-toggle').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) panel.inert = button.getAttribute('aria-expanded') !== 'true';

    button.addEventListener('click', () => {
      const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
      document.querySelectorAll('.area-toggle').forEach(other => {
        const open = other === button && shouldOpen;
        if ((other.getAttribute('aria-expanded') === 'true') !== open) {
          setPanel(other, open);
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════
  // 2. ENTRADA CINEMATOGRÁFICA DO HERO (STAGGER FADE-UP)
  // ══════════════════════════════════════════════════════
  if (!preference.matches) {
    const heroEntries = document.querySelectorAll(
      '.hero .eyebrow, .hero-title > span, .hero-description, .hero-bottom'
    );
    heroEntries.forEach((element, index) => {
      play(
        element,
        [
          { opacity: 0, transform: `translateY(${mobile.matches ? 10 : 18}px)` },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        {
          duration: mobile.matches ? 460 : 700,
          delay: 80 + index * 90,
          easing: 'cubic-bezier(.16, 1, .3, 1)',
          fill: 'backwards'
        }
      );
    });

    const watermark = document.querySelector('.hero-watermark');
    if (watermark) {
      play(
        watermark,
        [{ opacity: 0, transform: 'scale(0.97)' }, { opacity: getComputedStyle(watermark).opacity || 0.6, transform: 'scale(1)' }],
        { duration: 1200, delay: 200, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' }
      );
    }
  }

  // ══════════════════════════════════════════════════════
  // 3. PARALLAX SUTIL E FLUIDO NO SCROLL (DESKTOP)
  // ══════════════════════════════════════════════════════
  if (!preference.matches && !mobile.matches) {
    let ticking = false;
    const watermark = document.querySelector('.hero-watermark');
    const contactArt = document.querySelector('.contact-art');

    function onScrollParallax() {
      const scrollY = window.scrollY;

      if (watermark && scrollY < window.innerHeight * 1.5) {
        watermark.style.transform = `translate3d(0, ${scrollY * 0.12}px, 0)`;
      }

      if (contactArt) {
        const rect = contactArt.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const delta = (window.innerHeight - rect.top) * 0.05;
          contactArt.style.transform = `translate3d(0, ${delta}px, 0)`;
        }
      }

      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(onScrollParallax);
        }
      },
      { passive: true }
    );
  }

  // ══════════════════════════════════════════════════════
  // 4. INTERSECTION OBSERVERS (LINHAS SVG & SEÇÕES)
  // ══════════════════════════════════════════════════════
  const observers = [];

  function onceVisible(element, action, threshold = 0.12) {
    if (preference.matches || !('IntersectionObserver' in window) || !element) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          action();
          observer.disconnect();
        }
      },
      { threshold }
    );
    observers.push(observer);
    observer.observe(element);
  }

  // Desenho progressivo das linhas SVG (strokeDashoffset)
  document.querySelectorAll('.motion-line-art').forEach(svg => {
    if (preference.matches) return;
    const paths = [...svg.querySelectorAll('path')];
    paths.forEach(path => {
      path.style.strokeDasharray = '1';
      path.style.strokeDashoffset = '1';
    });
    const target = svg.closest('section') || svg;
    if (!('IntersectionObserver' in window)) {
      paths.forEach(path => {
        path.style.strokeDasharray = '';
        path.style.strokeDashoffset = '';
      });
      return;
    }
    onceVisible(target, () => {
      paths.forEach((path, index) => {
        path.style.strokeDashoffset = '0';
        play(
          path,
          [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }],
          {
            duration: mobile.matches ? 950 : 1850,
            delay: Math.min(index * 90, 500),
            easing: 'cubic-bezier(.16, 1, .3, 1)',
            fill: 'backwards'
          }
        );
      });
    });
  });

  // Reveal da foto da Sede com expansão elegante
  const sede = document.querySelector('.sede-photo');
  if (sede) {
    onceVisible(sede, () => {
      play(
        sede,
        [
          { opacity: 0.2, clipPath: 'inset(0 6% 0 0)', transform: 'scale(0.985)' },
          { opacity: 1, clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' }
        ],
        {
          duration: mobile.matches ? 500 : 850,
          easing: 'cubic-bezier(.16, 1, .3, 1)'
        }
      );
    });
  }

  // Reveal em cascata (stagger) dos cards da Equipe
  const teamGrid = document.querySelector('.team-grid');
  if (teamGrid && !preference.matches) {
    const profiles = teamGrid.querySelectorAll('.profile');
    onceVisible(teamGrid, () => {
      profiles.forEach((card, index) => {
        play(
          card,
          [
            { opacity: 0, transform: 'translateY(22px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          {
            duration: mobile.matches ? 400 : 650,
            delay: index * 95,
            easing: 'cubic-bezier(.16, 1, .3, 1)',
            fill: 'backwards'
          }
        );
      });
    }, 0.08);
  }

  // ══════════════════════════════════════════════════════
  // 5. MODAL DE PERFIL: ENTRADA E SAÍDA FLUIDAS
  // ══════════════════════════════════════════════════════
  const dialog = document.querySelector('#profile-dialog');
  if (dialog) {
    // Interceptação suave de fechamento do modal
    let isClosing = false;
    const nativeClose = dialog.close.bind(dialog);

    function closeDialogSmoothly() {
      if (!dialog.open || isClosing) return;
      if (preference.matches) {
        nativeClose();
        return;
      }
      isClosing = true;
      const anim = play(
        dialog,
        [
          { opacity: 1, transform: 'translateY(0) scale(1)' },
          { opacity: 0, transform: 'translateY(12px) scale(.985)' }
        ],
        { duration: 220, easing: 'cubic-bezier(.22,.61,.36,1)' }
      );
      if (anim) {
        anim.finished.then(
          () => {
            nativeClose();
            isClosing = false;
          },
          () => {
            nativeClose();
            isClosing = false;
          }
        );
      } else {
        nativeClose();
        isClosing = false;
      }
    }

    // Abertura observada por MutationObserver
    new MutationObserver(records => {
      if (dialog.open && records.some(r => r.attributeName === 'open') && !isClosing) {
        play(
          dialog,
          [
            { opacity: 0, transform: 'translateY(16px) scale(.98)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' }
          ],
          { duration: 320, easing: 'cubic-bezier(.16, 1, .3, 1)' }
        );
      }
    }).observe(dialog, { attributes: true, attributeFilter: ['open'] });

    // Substitui click listener no botão de fechar
    const closeBtn = dialog.querySelector('.dialog-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', e => {
        e.stopImmediatePropagation();
        closeDialogSmoothly();
      }, true);
    }

    // Clique fora do modal fecha com animação
    dialog.addEventListener('click', e => {
      if (e.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
          e.stopImmediatePropagation();
          closeDialogSmoothly();
        }
      }
    }, true);

    // Botão de contato dentro do modal
    const profileContact = document.querySelector('#profile-contact');
    if (profileContact) {
      profileContact.addEventListener('click', () => {
        closeDialogSmoothly();
      }, true);
    }

    // Tecla ESC fecha com animação
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && dialog.open) {
        e.preventDefault();
        closeDialogSmoothly();
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // 6. OBSERVAÇÃO DE MUDANÇA EM PREFERS-REDUCED-MOTION
  // ══════════════════════════════════════════════════════
  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    running.forEach(animation => animation.finish());
    observers.forEach(observer => observer.disconnect());
    document.querySelectorAll('.motion-line-art path').forEach(path => {
      path.style.strokeDashoffset = '0';
    });
  });
})();
