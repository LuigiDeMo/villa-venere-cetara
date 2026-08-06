(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frameNumbers = [1, 4, 7, 10, 7, 4, 1];

  document.querySelectorAll('[data-vv-assistant]').forEach((widget) => {
    const panel = widget.querySelector('.vv-assistant-panel');
    const bubble = widget.querySelector('.vv-assistant-bubble');
    const mascot = widget.querySelector('.vv-assistant-mascot');
    const launcher = widget.querySelector('.vv-assistant-launcher');
    const frames = [...widget.querySelectorAll('.vv-assistant-frame')];
    const animation = widget.dataset.vvAnimation;
    const context = widget.dataset.vvContext;
    let frameIndex = 0;
    let activeLayer = 0;
    let timer;

    const frameUrl = (number) => `/assets/mascot/animations-v2/${animation}/venere-${animation}-${String(number).padStart(2, '0')}.webp`;
    const setOpen = (open) => {
      widget.classList.toggle('is-open', open);
      panel.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', String(!open));
      mascot.setAttribute('aria-expanded', String(open));
      launcher.setAttribute('aria-expanded', String(open));
      if (open) {
        bubble.classList.remove('is-visible');
        window.setTimeout(() => panel.querySelector('[data-vv-close]')?.focus(), 30);
      }
    };

    widget.querySelectorAll('[data-vv-open]').forEach((control) => control.addEventListener('click', () => setOpen(true)));
    widget.querySelector('[data-vv-close]')?.addEventListener('click', () => setOpen(false));

    if (!reducedMotion && frames.length === 2) {
      frameNumbers.forEach((number) => { const image = new Image(); image.src = frameUrl(number); });
      timer = window.setInterval(() => {
        frameIndex = (frameIndex + 1) % frameNumbers.length;
        const nextLayer = activeLayer === 0 ? 1 : 0;
        frames[nextLayer].src = frameUrl(frameNumbers[frameIndex]);
        frames[nextLayer].classList.add('is-visible');
        frames[activeLayer].classList.remove('is-visible');
        activeLayer = nextLayer;
      }, context === 'guides' ? 850 : 720);
    }

    const alreadySeen = sessionStorage.getItem(`vv-assistant-${context}`);
    if (!alreadySeen) {
      window.setTimeout(() => {
        bubble.classList.add('is-visible');
        sessionStorage.setItem(`vv-assistant-${context}`, '1');
      }, 900);
    window.setTimeout(() => bubble.classList.remove('is-visible'), 7600);
    }

    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
    document.addEventListener('click', (event) => { if (!widget.contains(event.target)) setOpen(false); });
    window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true });
  });
})();
