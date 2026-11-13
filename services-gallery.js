(() => {
  const gallery = document.querySelector('.services-gallery');
  if (!gallery) return;

  const slides = [...gallery.querySelectorAll('.services-slide')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let visible = true;
  let timer;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
  }

  function schedule() {
    window.clearInterval(timer);
    if (!reducedMotion.matches && visible && !document.hidden) {
      timer = window.setInterval(() => show(current + 1), 6000);
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(gallery);
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', schedule);
  schedule();
})();
