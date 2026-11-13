/**
 * Hire Us "Our Story" typing animation.
 * One steady per-character speed (42-58 ms) from first word to last, one quick
 * correction, and two brief "want to quit" hesitations at the end. When done,
 * the two .sf-story-key phrases get a gold underline sweep (CSS in services.html).
 * The finished copy is always the original markup (never rebuilt from a string).
 * Reduced motion shows the finished copy at once. A Replay button appears after
 * the animation completes.
 */
(function () {
  var SELECTOR = '.sf-our-story-text';
  var el = document.querySelector(SELECTOR);
  if (!el) return;

  var finalHTML = el.innerHTML;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var run = 0;          // run token: a newer run cancels an older one
  var started = false;
  var replayBtn = null;

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function ensureReplay() {
    if (replayBtn) return replayBtn;
    replayBtn = document.createElement('button');
    replayBtn.type = 'button';
    replayBtn.className = 'sf-typing-replay';
    replayBtn.textContent = 'Replay';
    replayBtn.setAttribute('aria-label', 'Replay the typing animation');
    replayBtn.hidden = true;
    replayBtn.addEventListener('click', function () { play(); });
    el.insertAdjacentElement('afterend', replayBtn);
    return replayBtn;
  }

  function showFinal() {
    el.innerHTML = finalHTML;
    el.classList.remove('is-pending');
    el.classList.add('typing-complete');
    el.style.minHeight = '';
    // Next frame, so the gold underline sweeps in instead of appearing.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('is-revealed'); });
    });
  }

  async function play() {
    var me = ++run;
    var btn = ensureReplay();
    btn.hidden = true;

    // Hold the finished height so the page below never jumps while typing.
    el.style.minHeight = el.offsetHeight + 'px';
    el.classList.remove('typing-complete', 'is-pending', 'is-revealed');

    var text = '';
    function draw() { el.textContent = text; }
    function alive() { return me === run; }

    async function type(str, lo, hi, typoRate) {
      for (var i = 0; i < str.length; i++) {
        if (!alive()) return false;
        text += str[i];
        draw();
        await wait(rand(lo, hi));
        // quick, rare slip: wrong key, then fixed almost at once
        if (typoRate && Math.random() < typoRate && i < str.length - 1 && /[a-z]/.test(str[i + 1])) {
          text += String.fromCharCode(97 + Math.floor(Math.random() * 26));
          draw();
          await wait(90);
          text = text.slice(0, -1);
          draw();
          await wait(60);
        }
      }
      return alive();
    }

    async function back(n, per) {
      for (var i = 0; i < n; i++) {
        if (!alive()) return false;
        text = text.slice(0, -1);
        draw();
        await wait(per);
      }
      return alive();
    }

    el.textContent = '';
    await wait(250);

    if (!(await type('Being a creative is understanding your life will be ', 42, 58, 0.04))) return;

    // wrong word, rapid correction
    if (!(await type('insane', 45, 65))) return;
    await wait(260);
    if (!(await back(6, 30))) return;
    if (!(await type('crazy', 45, 65))) return;

    // Same speed as the opening line, all the way through.
    var body = '. But crazy, and the chaos it brings, is what helps us make better art and develop deeper connections. ' +
      'Crazy to try new things. Crazy to go at it as independent artists (just make it!). ' +
      'Crazy to try to maintain friends, family, and your even crazier colleagues (does that make us normal?). ' +
      'But we do it, man, with what we have and all we have. And in the end, we learn our crazy is ';
    if (!(await type(body, 42, 58, 0.02))) return;

    // hesitation 1: "just..." then back off the dots
    if (!(await type('just', 42, 58))) return;
    if (!(await type('...', 140, 160))) return;
    await wait(650);
    if (!(await back(3, 32))) return;

    // hesitation 2: "beautiful..." then bail
    if (!(await type(' beautiful', 42, 58))) return;
    if (!(await type('...', 140, 160))) return;
    await wait(700);
    if (!(await back(13, 24))) return;

    if (!(await type(' beauty in progress.', 42, 58))) return;
    await wait(250);
    if (!alive()) return;

    showFinal();
    btn.hidden = false;
  }

  function init() {
    if (reduced.matches) { showFinal(); return; }
    // Keep the copy hidden (but space reserved) until it starts, so it never flashes.
    el.classList.add('is-pending');
    var go = function () {
      if (started) return;
      started = true;
      play();
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); }
      }, { threshold: 0.3 });
      io.observe(el);
    } else {
      go();
    }
  }

  reduced.addEventListener('change', function () {
    if (reduced.matches) { run++; showFinal(); if (replayBtn) replayBtn.hidden = true; }
  });

  init();
})();
