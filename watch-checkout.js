/* Watch-the-movie checkout for individual project pages.
   Two choices: pay $5 or more (Sweet Flypaper of Film donates 20% to Cine Fe),
   or just leave an email. Either way the visitor gets a personal watch link by
   email from /api/watch-access; the link is never shown on the page.
   No payment processor is wired yet: a "pay" choice is recorded and the
   payment link follows by email. */
(function () {
  var ENDPOINT = 'https://os.sweetflyfilm.org/api/watch-access';
  var MIN = 5, MAX = 500, PERCENT = 20, CHARITY = 'Cine Fe';
  var slugMatch = location.pathname.match(/\/(?:watch|projects)\/([^\/]+)/);
  var film = slugMatch ? slugMatch[1] : '';

  var btn = document.querySelector('[data-watch-movie]');
  if (!btn) return;
  var h1 = document.querySelector('.project-hero h1');
  var title = h1 ? h1.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : document.title;

  var css = '' +
    '#wc-back{box-sizing:border-box;position:fixed;inset:var(--wc-top,0px) 0 auto;height:var(--wc-height,100dvh);background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;z-index:20000;padding:max(1rem,env(safe-area-inset-top)) max(1rem,env(safe-area-inset-right)) max(1rem,env(safe-area-inset-bottom)) max(1rem,env(safe-area-inset-left));overflow:hidden}' +
    '#wc-back.open{display:flex}' +
    '#wc{box-sizing:border-box;background:#141414;border:1px solid #27272a;border-radius:4px;max-width:480px;width:100%;min-height:0;max-height:100%;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:1.5rem;color:#fff;font-family:Geist,system-ui,sans-serif}' +
    '#wc:focus{outline:none}' +
    '#wc h2{font-size:1.4rem;margin:0 0 .25rem}' +
    '#wc .wc-sub{color:#94a3b8;font-size:.9rem;margin:0 0 1rem}' +
    '#wc .wc-opt{display:flex;gap:.75rem;align-items:flex-start;border:1px solid #27272a;border-radius:4px;padding:.9rem;margin-bottom:.6rem;cursor:pointer;min-height:56px}' +
    '#wc .wc-opt.on{border-color:#D4AF37;background:#1b1a14}' +
    '#wc .wc-opt input{flex-shrink:0;margin-top:.25rem;accent-color:#D4AF37;width:20px;height:20px}' +
    '#wc .wc-opt b{display:block;font-size:1rem}' +
    '#wc .wc-opt span{color:#94a3b8;font-size:.85rem}' +
    '#wc label.wc-l{display:block;font-family:"Geist Mono",monospace;font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;margin:1rem 0 .35rem}' +
    '#wc input[type=email]{width:100%;box-sizing:border-box;background:#0a0a0a;border:1px solid #27272a;border-radius:2px;color:#fff;padding:.85rem;font-size:1rem}' +
    '#wc input[type=email]:focus{outline:none;border-color:#D4AF37}' +
    '#wc .wc-err{color:#f0a0a0;font-size:.85rem;min-height:1.2em;margin:.4rem 0 0}' +
    '#wc .wc-row{display:flex;gap:.6rem;margin-top:1rem}' +
    '#wc .wc-go{flex:1;min-width:0;min-height:48px;padding:.75rem;background:#e9d49a;color:#0a0a0a;border:0;border-radius:2px;font-family:"Geist Mono",monospace;font-size:.85rem;text-transform:uppercase;cursor:pointer;font-weight:600}' +
    '#wc .wc-x{min-height:48px;padding:0 1rem;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:2px;cursor:pointer;font-family:"Geist Mono",monospace;font-size:.85rem;text-transform:uppercase}' +
    '#wc .wc-amt{display:flex;align-items:center;gap:.5rem;margin-top:.6rem}' +
    '#wc .wc-amt label{font-family:"Geist Mono",monospace;font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8}' +
    '#wc .wc-amt input{width:5.5rem;box-sizing:border-box;background:#0a0a0a;border:1px solid #27272a;border-radius:2px;color:#fff;padding:.6rem;font-size:1rem;font-family:"Geist Mono",monospace}' +
    '#wc .wc-amt input:focus{outline:none;border-color:#D4AF37}' +
    '#wc .wc-go:disabled{opacity:.6;cursor:default}' +
    '#wc .wc-note{color:#94a3b8;font-size:.78rem;margin-top:.9rem}' +
    '#wc .wc-done{text-align:center;padding:1rem 0}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var back = document.createElement('div');
  back.id = 'wc-back';
  back.innerHTML =
    '<div id="wc" role="dialog" aria-modal="true" aria-labelledby="wc-t" tabindex="-1">' +
    '<form id="wc-form" novalidate>' +
    '<h2 id="wc-t"></h2><p class="wc-sub">Choose how you want to watch.</p>' +
    '<label class="wc-opt on"><input type="radio" name="wc-mode" value="pay" checked>' +
    '<div><b>Pay $' + MIN + ' or more</b><span>Sweet Flypaper of Film donates ' + PERCENT + '% of what you pay to ' + CHARITY + ', a Colorado nonprofit for filmmakers.</span>' +
    '<div class="wc-amt"><label for="wc-amount">Amount $</label><input id="wc-amount" type="number" inputmode="numeric" min="' + MIN + '" max="' + MAX + '" step="1" value="' + MIN + '"></div></div></label>' +
    '<label class="wc-opt"><input type="radio" name="wc-mode" value="email">' +
    '<div><b>Just my email</b><span>No payment. We email you your personal link to watch the movie.</span></div></label>' +
    '<label class="wc-l" for="wc-email">Email address</label>' +
    '<input id="wc-email" type="email" autocomplete="email" placeholder="you@example.com" inputmode="email">' +
    '<p class="wc-err" id="wc-err" role="alert"></p>' +
    '<div class="wc-row"><button type="button" class="wc-x" id="wc-cancel">Cancel</button>' +
    '<button type="submit" class="wc-go" id="wc-go"></button></div>' +
    '<p class="wc-note" id="wc-note"></p>' +
    '</form></div>';
  document.body.appendChild(back);

  var form = back.querySelector('#wc-form');
  var go = back.querySelector('#wc-go');
  back.querySelector('#wc-t').textContent = 'Watch ' + title;

  var amountInput = form.querySelector('#wc-amount');
  var note = form.querySelector('#wc-note');
  function mode() { return form.querySelector('input[name=wc-mode]:checked').value; }
  // Whole dollars only, MIN to MAX; anything else reads as invalid (null).
  function amount() {
    var v = Number(amountInput.value);
    return Number.isInteger(v) && v >= MIN && v <= MAX ? v : null;
  }
  function money(n) { return '$' + (Math.round(n * 100) % 100 ? n.toFixed(2) : String(Math.round(n))); }
  function donation(n) { return Math.floor(n * PERCENT) / 100; }
  function sync() {
    form.querySelectorAll('.wc-opt').forEach(function (o) {
      o.classList.toggle('on', o.querySelector('input[type=radio]').checked);
    });
    var a = amount();
    if (mode() === 'pay') {
      go.textContent = a === null ? 'Pay $' + MIN + ' or more' : 'Pay ' + money(a) + ' \u00b7 We donate ' + money(donation(a));
      note.textContent = 'You pay securely on Stripe. All sales are final; there are no refunds. We email your personal link as soon as the payment clears.';
    } else {
      go.textContent = 'Email me my link';
      note.textContent = 'We email your personal link to watch. It is yours, so please do not share it.';
    }
  }
  form.addEventListener('change', sync);
  form.addEventListener('input', sync);
  // Typing an amount means they want to pay.
  amountInput.addEventListener('focus', function () {
    form.querySelector('input[value=pay]').checked = true;
    sync();
  });
  sync();

  var opener = null;
  var previousOverflow = '';
  var dialog = back.querySelector('#wc');
  function fitViewport() {
    var viewport = window.visualViewport;
    back.style.setProperty('--wc-height', (viewport ? viewport.height : window.innerHeight) + 'px');
    back.style.setProperty('--wc-top', (viewport ? viewport.offsetTop : 0) + 'px');
  }
  function open() {
    opener = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    fitViewport();
    back.classList.add('open');
    dialog.scrollTop = 0;
    // Focus the dialog, so the keyboard opens only when the visitor taps email.
    dialog.focus({ preventScroll: true });
  }
  function close() {
    if (!back.classList.contains('open')) return;
    back.classList.remove('open');
    document.body.style.overflow = previousOverflow;
    if (opener) opener.focus({ preventScroll: true });
  }
  window.addEventListener('resize', fitViewport);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitViewport);
    window.visualViewport.addEventListener('scroll', fitViewport);
  }
  back.querySelector('#wc-cancel').addEventListener('click', close);
  back.addEventListener('click', function (e) { if (e.target === back) close(); });
  document.addEventListener('keydown', function (e) {
    if (!back.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key !== 'Tab') return;
    var controls = Array.from(dialog.querySelectorAll('input,button')).filter(function (el) {
      return !el.disabled && (el.type !== 'radio' || el.checked);
    });
    var first = controls[0], last = controls[controls.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // Replaces the form with a short message and a Close button.
  function showDone(heading, text) {
    dialog.innerHTML = '<div class="wc-done"><h2>' + heading + '</h2><p class="wc-sub">' + text +
      '</p><button type="button" class="wc-x" id="wc-close2">Close</button></div>';
    dialog.setAttribute('aria-label', heading);
    dialog.removeAttribute('aria-labelledby');
    dialog.querySelector('#wc-close2').addEventListener('click', close);
    dialog.focus({ preventScroll: true });
  }

  var live = document.createElement('button');
  live.type = 'button';
  live.className = btn.className;
  live.innerHTML = 'Watch the Movie <i class="fa-solid fa-play" style="font-size:0.75rem;"></i>';
  live.addEventListener('click', open);
  btn.replaceWith(live);

  // A personal link (?t=TOKEN) opens the watch screen over this page. It shares
  // the endpoint and the pay box, so "unlock the extras" is the same checkout.
  window.sfWatch = { endpoint: ENDPOINT, film: film, title: title, openPay: open, min: MIN };
  var tokenMatch = location.search.match(/[?&]t=([0-9a-f]{64})\b/);
  if (tokenMatch && film) {
    var viewerScript = document.createElement('script');
    viewerScript.src = '/watch-viewer.js?v=20261101';
    viewerScript.defer = true;
    document.head.appendChild(viewerScript);
  }

  // Back from Stripe: tell them where their link is, then clean the address bar.
  if (/[?&]paid=1\b/.test(location.search)) {
    open();
    showDone('Thank you', 'Your payment went through. We are emailing your personal link to watch ' + title + '. Check your inbox (and spam) in a minute or two.');
    try { history.replaceState(null, '', location.pathname); } catch (x) { /* ignore */ }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.querySelector('#wc-email').value.trim();
    var err = form.querySelector('#wc-err');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Enter a valid email address.'; return; }
    var m = mode();
    var a = amount();
    if (m === 'pay' && a === null) {
      err.textContent = 'Choose a whole-dollar amount from $' + MIN + ' to $' + MAX + '.';
      return;
    }
    if (!film) { err.textContent = 'This film is not available to watch yet.'; return; }
    err.textContent = '';

    go.disabled = true;
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ film: film, email: email, mode: m, amount: m === 'pay' ? a : 0 })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok && d.ok, error: d.error, checkoutUrl: d.checkoutUrl }; });
    }).then(function (r) {
      // Paying: Stripe's page takes over; they come back to ?paid=1.
      if (r.ok && r.checkoutUrl && /^https:\/\/checkout\.stripe\.com\//.test(r.checkoutUrl)) {
        go.textContent = 'Opening Stripe…';
        location.href = r.checkoutUrl;
        return;
      }
      if (r.ok) {
        var safe = email.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        showDone('Check your email', 'We sent your personal link to ' + safe + '. It is yours to watch ' + title + ' when the movie is ready.');
        return;
      }
      go.disabled = false;
      err.textContent = r.error || 'Could not send. Try again.';
    }, function () {
      go.disabled = false;
      err.textContent = 'Could not send. Check your connection and try again.';
    });
  });
})();
