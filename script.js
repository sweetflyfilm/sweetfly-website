/* ============================================================
   SWEET FLYPAPER — SHARED JAVASCRIPT
   Runs on every page. Loads nav + footer and scroll reveal.
   ============================================================ */
 
/* Metricool web tracking (same tag Metricool gives for "JavaScript tag") */
function loadScript(a) {
  var b = document.getElementsByTagName("head")[0], c = document.createElement("script");
  c.type = "text/javascript", c.src = "https://tracker.metricool.com/resources/be.js", c.onreadystatechange = a, c.onload = a, b.appendChild(c);
}
loadScript(function () { beTracker.t({ hash: "81671013044c72132a63d7e1235e5785" }); });

/* Contact Us (and any data-tally-open link) opens the Tally form as a popup on the
   page. Runs first in the capture phase so Tally's own handler never opens it twice.
   Without Tally loaded, the link falls back to its href. */
window.addEventListener('click', function (e) {
  var a = e.target.closest ? e.target.closest('[data-tally-open]') : null;
  if (!a || !window.Tally || typeof window.Tally.openPopup !== 'function') return;
  e.preventDefault();
  e.stopImmediatePropagation();
  var opts = {};
  if (a.dataset.tallyHideTitle === '1') opts.hideTitle = true;
  if (a.dataset.tallyEmojiText) opts.emoji = { text: a.dataset.tallyEmojiText, animation: a.dataset.tallyEmojiAnimation || 'wave' };
  window.Tally.openPopup(a.dataset.tallyOpen, opts);
}, true);

async function loadGlobals() {
  const [navData, footerData] = await Promise.all([
    fetch('/nav.html?v=20261108-discovery').then(r => r.text()),
    fetch('/footer.html?v=20261113-email').then(r => r.text())
  ]);
  
  const navPlaceholder = document.getElementById('nav-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');
  
  if (navPlaceholder) navPlaceholder.innerHTML = navData;
  if (footerPlaceholder) footerPlaceholder.innerHTML = footerData;
  
  if (window.Tally) window.Tally.loadEmbeds();
}
 
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));
}

loadGlobals().then(() => {
  initScrollReveal();
  import('/site-search.js?v=20261108-discovery').then(({ initSiteSearch }) => initSiteSearch());
});
