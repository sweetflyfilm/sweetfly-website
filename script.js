/* ============================================================
   SWEET FLYPAPER — SHARED JAVASCRIPT
   Runs on every page. Loads nav + footer, scroll reveal, Tally,
   and the global Booking Splash Card.
   ============================================================ */
 
async function loadGlobals() {
  const [navData, footerData] = await Promise.all([
    fetch('/nav.html').then(r => r.text()),
    fetch('/footer.html').then(r => r.text())
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

function initSplashCard() {
  // If they already closed it this session, don't show it again
  if (sessionStorage.getItem('sf_splash_dismissed') === 'true') return;

  // Don't show the splash card if they are already on the booking page
  if (window.location.pathname.includes('booking.html')) return;

  const splashHTML = `
    <div class="sf-splash-card" id="sfSplashCard">
      <button class="sf-splash-close" onclick="closeSplashCard()"><i class="fa-solid fa-xmark"></i></button>
      <div class="sf-splash-content">
        <h4>Save by booking directly with us.</h4>
        <a href="/booking.html" class="sf-btn">Book Now</a>
      </div>
    </div>
  `;

  // Inject into the wrapper so it inherits base fonts properly
  const wrapper = document.getElementById('sf-embed') || document.body;
  wrapper.insertAdjacentHTML('beforeend', splashHTML);

  // Wait 5 seconds before sliding it in
  setTimeout(() => {
    const card = document.getElementById('sfSplashCard');
    if (card) {
      card.classList.add('show');
      
      // Auto-close the card after 12 seconds of being on screen
      setTimeout(() => {
        closeSplashCard();
      }, 12000);
    }
  }, 5000);
}

// Global function to close the card
window.closeSplashCard = function() {
  const card = document.getElementById('sfSplashCard');
  if (card) {
    card.classList.remove('show');
    sessionStorage.setItem('sf_splash_dismissed', 'true');
  }
}
 
loadGlobals().then(() => {
  initScrollReveal();
  initSplashCard();
});
