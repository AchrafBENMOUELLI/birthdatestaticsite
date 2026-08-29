/* ══════════════════════════════════════════════════════════════
   Operation: Nouha's Birthday 🎂🐾  —  script.js
   Vanilla JS. No frameworks, no build tools.
   Editable content is marked with {{LIKE_THIS}}.  Find & tweak freely!
   ══════════════════════════════════════════════════════════════ */
'use strict';

/* ═══════════════ 1. MINI HELPERS ═══════════════ */
function $(id) { return document.getElementById(id); }
function show(el) { if (el) { el.classList.remove('hidden'); el.removeAttribute('hidden'); } }
function hide(el) { if (el) { el.classList.add('hidden'); el.setAttribute('hidden', ''); } }
function rnd(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ═══════════════ 2. EDITABLE CONTENT ═══════════════
   ↓↓↓ CHANGE ANYTHING YOU WANT BELOW ↓↓↓ */

/* {{GATE_PASSWORD}} — the password (case-insensitive, spaces ignored around it) */
const PASSWORD = 'termetbeja';

/* {{GATE_TAUNTS}} — messages shown when she gets the password wrong */
const GATE_TAUNTS = [
  'Hiss! Try again, human. 😾',
  'The cats are not impressed. 🐈‍⬛',
  'Wrong. The cats judge you. 👁️',
  'Nope. The whiskers have spoken. 🐱',
  'ERROR: password incorrect-ness detected. 🙀'
];

/* {{WHACK_TARGET}} — how many gentle bonks finish the whack-a-cat game */
const WHACKS_NEEDED = 10;

/* {{DODGES}} — how many times the OK button / gift escape before being catchable */
const OK_DODGES   = 3;
const GIFT_DODGES = 5;

/* {{QUIZ_QUESTIONS}} — the 3 questions.
   Options are [a, b, c, d]; 'correct' is the index (0=a, 1=b, 2=c, 3=d). */
const QUIZ = [
  {
    q: 'What was the first interaction between us?',
    options: [
      'Salam alaykom',
      'YA MR ANGLAIS !!',
      'enta menhou ?'
    ],
    correct: 1,
    praise: 'YA MR ANGLAIS !! 😂🐾',
    roast:  'Wrong! The cats hiss at your memory 😾'
  },
  {
    q: 'What is our best word to use?',
    options: [
      'stupid',
      'bruh',
      'Nigga'
    ],
    correct: 2,
    praise: 'Correct. Truly our word 😂',
    roast:  'HUGE miss. The cats are cringing in second-hand embarrassment. 😾😾'
  },
  {
    q: 'What is the most used word when speaking to me?',
    options: [
      'bara zamer',
      'gay',
      'Si nigga',
      'all of the above'
    ],
    correct: 3,
    praise: 'All of the above. You know us too well.(wlh la te7chem!) 👑🐾',
    roast:  'Even the cats know this one. Shameful. Absolutely shameful. 😼'
  }
];

/* {{FINAL_MESSAGE}} is in index.html — search for it there. */

/* ═══════════════ 3. ASSET PATHS ─────────────── */
/* Memory-match photos (order = caption index in CAPTIONS below) */
const MEMORY_PAIRS = [
  { src: 'public/meandyoucrazy.jpg',           caption: 'both of us being fully, certified crazy 🤪' },
  { src: 'public/meandyoueating.jpeg',         caption: 'the eating phase (affectionate) — mission: food 🍽️' },
  { src: 'public/meyouandalaaphoto.jpeg',      caption: 'the duo in their natural habitat: you + Alaa ' },
  { src: 'public/pizzatimephoto.jpeg',         caption: 'PIZZA TIME — a sacred, non-negotiable ritual 🍕' },
  { src: 'public/filmphoto.jpeg',              caption: 'main character energy, straight off the film roll 🎞️' }
];

/* Final-reveal slideshow (tests-show montage) */
const PHOTOS = {
  memory: MEMORY_PAIRS.map(function (p) { return p.src; }),
  slideshow: [
    'public/aurafarmingbilliard.jpeg',
    'public/crazyyou.jpg',
    'public/obsessionfilmlookalikeactress.jpg',
    'public/jumpscarephoto.jpeg',
    'public/meandyoucrazy.jpg',
    'public/meandyoueating.jpeg',
    'public/meyouandalaaphoto.jpeg',
    'public/pizzatimephoto.jpeg',
    'public/filmphoto.jpeg'
  ]
};

/* {{CAPTION_1}} … {{CAPTION_N}} — captions shown when each memory pair is
   matched. Edit freely; each caption pairs with MEMORY_PAIRS above. */
const CAPTIONS = MEMORY_PAIRS.map(function (p) { return p.caption; });

const SOUNDS = {
  meow:    'public/sounds/meow.mp3',
  hiss:    'public/sounds/cathissing.mp3',        // cat-hissing sound she added
  airhorn: 'public/sounds/faahjumpscarenosie.mp3',// the "faah!" jumpscare noise
  purr:    'public/sounds/purr.mp3',
  ding:    'public/sounds/ding.mp3'
};

/* ═══════════════ 4. SOUND (mobile-safe) ═══════════════
   Mobile browsers block audio until the first tap. We "unlock" on the very
   first interaction (Scene 1's first tap), then every sound works afterwards. */
let audioUnlocked = false;
const audioCache = {};

function getAudio(name) {
  if (!audioCache[name]) {
    const a = new Audio(SOUNDS[name]);
    a.preload = 'auto';
    audioCache[name] = a;
  }
  return audioCache[name];
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  // Unlock the Web Audio context too (belt & suspenders)
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.connect(ctx.destination); src.start(0);
      if (ctx.state === 'suspended') ctx.resume();
    }
  } catch (e) { /* ignore */ }
  // Prime every sound element within the user gesture so timer-triggered
  // sounds (like the jumpscare airhorn) work later on iOS.
  Object.keys(SOUNDS).forEach(function (n) {
    const a = getAudio(n);
    const p = a.play();
    if (p && p.then) { p.then(function () { a.pause(); try { a.currentTime = 0; } catch (e) {} }); }
  });
}

/* playSound(name) — gracefully ignores missing files. Safe everywhere. */
function playSound(name) {
  if (!SOUNDS[name]) return;
  const a = getAudio(name);
  try { a.currentTime = 0; } catch (e) {}
  const p = a.play();
  if (p && p.catch) p.catch(function () {});
}

function stopSound(name) {
  const a = audioCache[name];
  if (a) { a.pause(); try { a.currentTime = 0; } catch (e) {} }
}

/* First tap anywhere = unlock audio for the session (per the brief,
   the very first sound happens on Scene 1's first interaction). */
document.addEventListener('pointerdown', unlockAudio, { once: true });
document.addEventListener('touchstart', unlockAudio, { once: true });

/* ═══════════════ 5. TAP FX — little paw bursts 🐾 ═══════════════ */
document.addEventListener('pointerdown', function (e) {
  const p = document.createElement('div');
  p.className = 'burst-paw';
  p.textContent = '🐾';
  p.style.left = e.clientX + 'px';
  p.style.top = e.clientY + 'px';
  $('burst-layer').appendChild(p);
  setTimeout(function () { p.remove(); }, 600);
});

/* ═══════════════ 6. CONFETTI ═══════════════ */
const CONF_COLORS = ['#ff5a7a', '#ffd34d', '#35d0ba', '#8b5cf6', '#ff9f43', '#5ad1ff'];

function burstConfetti(x, y, count, paws) {
  count = count || 60; paws = !!paws;
  const layer = $('confetti-layer');
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    const isPaw = paws && Math.random() < 0.45;
    c.className = isPaw ? 'confetti confetti-paw' : 'confetti';
    if (isPaw) {
      c.textContent = pick(['🐾', '🐾', '🐱', '🎉']);
    } else {
      c.style.background = pick(CONF_COLORS);
    }
    const ang = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 180;
    c.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    c.style.setProperty('--dy', (Math.sin(ang) * dist - 70) + 'px');
    c.style.setProperty('--rot', rnd(-360, 360) + 'deg');
    c.style.left = x + 'px';
    c.style.top = y + 'px';
    c.style.animationDuration = rnd(0.7, 1.4) + 's';
    layer.appendChild(c);
    setTimeout(function () { c.remove(); }, 1700);
  }
}

/* Endless rain of confetti + cat paws (used on the final reveal) */
function startRain() {
  stopRain();
  const layer = $('confetti-layer');
  for (let i = 0; i < 34; i++) {
    const c = document.createElement('div');
    const isPaw = i < 14;
    c.className = isPaw ? 'rain rain-paw' : 'rain';
    if (isPaw) { c.textContent = '🐾'; } else { c.style.background = pick(CONF_COLORS); }
    c.style.left = rnd(0, 100) + '%';
    c.style.animationDuration = rnd(3.5, 7.5) + 's';
    c.style.animationDelay = rnd(0, 4) + 's';
    layer.appendChild(c);
  }
}
function stopRain() { $('confetti-layer').innerHTML = ''; }

/* ═══════════════ 7. SCENE ROUTER ═══════════════
   Each scene = one <section>. We hide/show them and run per-scene logic. */
let curScene = null;

function goTo(id) {
  cleanupScene(curScene);
  document.querySelectorAll('.scene').forEach(function (s) { s.classList.remove('active'); });
  const el = $('scene-' + id);
  el.classList.add('active');
  curScene = id;
  enterScene(id, el);
}

function enterScene(id) {
  // Wait a tick so layout/dimensions are ready (needed by the dodgers).
  setTimeout(function () {
    if (curScene !== id) return;
    if (id === 'gate') startTypewriter();
    if (id === 'error') setupErrorScene();
    if (id === 'whack') startWhack();
    if (id === 'catch') startCatch();
    if (id === 'quiz') renderQuizQuestion(0);
    if (id === 'reveal') startReveal();
  }, 80);
}

function cleanupScene(id) {
  if (id === 'whack') stopWhack();
  if (id === 'catch') destroyCatch();
  if (id === 'error') { if (okDodger) { okDodger.destroy(); okDodger = null; } hide($('error-ok')); }
  if (id === 'gate') clearTypewriter();
  if (id === 'reveal') { stopRain(); $('curtain-left').classList.remove('open-left'); $('curtain-right').classList.remove('open-right'); }
}

/* ═══════════════ 8. THE DODGING BUTTON (shared prank) ═══════════════
   Desktop : flees the mouse cursor (only when actually hovered, with a
             cooldown between escapes — so it must be chased, and never
             burns all its escapes from one aimless mouse wiggle).
   Mobile  : teleports away on every tap near it.
   After `minDodges` escapes it calmly lets itself be caught. */
const DODGE_COOLDOWN = 380; // ms between escapes on desktop

function makeDodger(btn, area, minDodges, opts) {
  opts = opts || {};
  let dodges = 0;
  let fired = false;
  let lastDodge = 0;
  const isTouch = 'ontouchstart' in window;
  const hasPointer = 'PointerEvent' in window;

  function place(vx, vy) {
    if (btn.style.position !== 'absolute') {
      btn.style.position = 'absolute';
      btn.style.top = '0';
      btn.style.left = '0';
    }
    const ar = area.getBoundingClientRect();
    const bw = btn.offsetWidth || 110;
    const bh = btn.offsetHeight || 56;
    const m = 14;
    // Coordinates are viewport-based; convert to scene-local offsets.
    const maxX = Math.max(m, ar.width - bw - m);
    const maxY = Math.max(m, ar.height - bh - m);
    const hasXY = typeof vx === 'number' && isFinite(vx) && typeof vy === 'number' && isFinite(vy);
    // No coordinates? Flee to a random spot (that's what a dodge IS).
    const x = hasXY
      ? Math.max(m, Math.min(vx - ar.left - bw / 2, maxX))
      : m + Math.random() * Math.max(0, maxX - m);
    const y = hasXY
      ? Math.max(m, Math.min(vy - ar.top - bh / 2, maxY))
      : m + Math.random() * Math.max(0, maxY - m);
    btn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  }

  function distanceToBtn(cx, cy) {
    const r = btn.getBoundingClientRect();
    const hx = r.left + r.width / 2, hy = r.top + r.height / 2;
    return Math.hypot(cx - hx, cy - hy);
  }

  function cursorOverBtn(cx, cy) {
    const r = btn.getBoundingClientRect();
    const pad = Math.max(10, r.width / 4);
    return cx >= r.left - pad && cx <= r.right + pad && cy >= r.top - pad && cy <= r.bottom + pad;
  }

  function tryCatch() {
    if (fired) return;
    fired = true;
    btn.style.pointerEvents = 'none';
    if (opts.onCaught) opts.onCaught();
  }

  function maybeDodge() {
    if (fired) return;
    if (dodges >= minDodges) return;
    const now = Date.now();
    if (now - lastDodge < DODGE_COOLDOWN) return; // no machine-gun fleeing
    lastDodge = now;
    dodges++;
    place();
    if (opts.onDodge) opts.onDodge(dodges);
  }

  function onDown(e) {
    if (fired) return;
    const cxp = e.clientX != null ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
    const cyp = e.clientY != null ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
    if (cxp == null) return;
    const hit = e.target === btn || btn.contains(e.target);
    const near = hit || distanceToBtn(cxp, cyp) < 110;
    if (!near) return;
    if (e.cancelable) e.preventDefault();
    if (dodges >= minDodges) { tryCatch(); return; }
    maybeDodge();
  }

  function onMove(e) {
    if (fired || dodges >= minDodges) return;
    if (cursorOverBtn(e.clientX, e.clientY)) maybeDodge();
  }

  function onClick() {
    if (fired) return;
    if (dodges >= minDodges) tryCatch();
    else if (opts.doubleDodge) opts.doubleDodge();
  }

  // Kick off at the centre of its area (or the requested spot) so she can see it.
  const r0 = area.getBoundingClientRect();
  const initX = (opts.init && typeof opts.init.x === 'number') ? opts.init.x : r0.left + r0.width / 2;
  const initY = (opts.init && typeof opts.init.y === 'number') ? opts.init.y : r0.top + r0.height / 2;
  place(initX, initY);

  if (hasPointer) { area.addEventListener('pointerdown', onDown); btn.addEventListener('click', onClick); }
  else {
    area.addEventListener('touchstart', onDown, { passive: false });
    area.addEventListener('mousedown', onDown);
    btn.addEventListener('click', onClick);
  }
  if (!isTouch) window.addEventListener('mousemove', onMove);

  return {
    get dodges() { return dodges; },
    destroy: function () {
      if (hasPointer) { area.removeEventListener('pointerdown', onDown); }
      else { area.removeEventListener('touchstart', onDown); area.removeEventListener('mousedown', onDown); }
      btn.removeEventListener('click', onClick);
      window.removeEventListener('mousemove', onMove);
    }
  };
}

/* ═══════════════ 9. SCENE 1 — THE GATE ═══════════════ */
const GATE_TEXT = 'Access restricted. State the password, human. 🐾';
let twTimer = null;
let tauntIdx = 0;
let gateGlitched = false;

function startTypewriter() {
  clearTypewriter();
  const out = $('typewriter-text');
  out.textContent = '';
  let i = 0;
  twTimer = setInterval(function () {
    i++;
    out.textContent = GATE_TEXT.slice(0, i);
    if (i >= GATE_TEXT.length) clearInterval(twTimer);
  }, 45);
}
function clearTypewriter() { if (twTimer) { clearInterval(twTimer); twTimer = null; } }

$('gate-form').addEventListener('submit', function (e) {
  e.preventDefault();
  unlockAudio(); // first interaction = audio unlock (gate is scene 1)
  const val = $('gate-input').value.trim().toLowerCase();
  if (val === PASSWORD) {
    playSound('ding');
    runGateGlitch();
  } else {
    playSound('hiss');
    const form = $('gate-form');
    form.classList.remove('shaking');
    void form.offsetWidth; // restart the shake animation
    form.classList.add('shaking');
    $('gate-error').textContent = GATE_TAUNTS[tauntIdx % GATE_TAUNTS.length];
    tauntIdx++;
  }
});

function runGateGlitch() {
  if (gateGlitched) return;
  gateGlitched = true;
  const scene = $('scene-gate');
  scene.classList.add('glitching');
  $('glitch-overlay').classList.add('on');
  setTimeout(function () {
    scene.classList.remove('glitching');
    $('glitch-overlay').classList.remove('on');
    goTo('error');
  }, 900);
}

/* ═══════════════ 10. SCENE 2 — FAKE ERROR + GLASS CRACK ═══════════════ */
let okDodger = null;
let crackDone = false;

function setupErrorScene() {
  if (okDodger) { okDodger.destroy(); okDodger = null; }
  const okBtn = $('error-ok');
  hide(okBtn); // hidden until it's been placed — no stray flash at the top-left
  // Spawn the dodging OK a beat AFTER the modal's pop-in animation finishes,
  // so it is never caught inside (and hidden by) the modal's own animation.
  setTimeout(function () {
    if (curScene !== 'error') return;
    show(okBtn);
    const modal = $('error-modal');
    const m = modal ? modal.getBoundingClientRect() : null;
    okDodger = makeDodger(okBtn, $('scene-error'), OK_DODGES, {
      init: m ? { x: m.left + m.width / 2, y: m.bottom - 44 } : null,
      onCaught: function () { runCrack(); }
    });
  }, 420);
}

function runCrack() {
  if (crackDone) return;
  crackDone = true;
  const gb = $('glass-broken');
  show(gb);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { gb.classList.add('active'); });
  });
  setTimeout(function () {
    hide(gb);
    gb.classList.remove('active');
    goTo('whack');
  }, 900);
}

/* ═══════════════ 11. SCENE 3 — WHACK-A-CAT ═══════════════ */
const whackGrid = $('whack-grid');
const CAT_FACES = ['😺', '😸', '😹'];
let whackTimers = [];
let whacks = 0;
let gameOver = false;
let jumpscareShown = false;

const SHOUTS = ['Faster, human! 🌀', 'You call that a bonk? 🐾', 'Mrow! 😼', 'Getting there… 🐈', 'The cats are watching 👀'];

function whackLater(fn, ms) {
  const t = setTimeout(fn, ms);
  whackTimers.push(t);
  return t;
}
function clearWhackTimers() {
  whackTimers.forEach(clearTimeout);
  whackTimers = [];
}

function startWhack() {
  stopWhack();
  whacks = 0;
  gameOver = false;
  jumpscareShown = false;
  $('whack-count').textContent = '0';
  hide($('whack-done'));
  whackGrid.querySelectorAll('.cat').forEach(function (c) {
    c.classList.remove('up', 'bonked', 'cool');
    c.textContent = pick(CAT_FACES);
  });
  // The jump-scare now fires the MOMENT she finishes bonking (guaranteed).
  armSpawns();
}

function stopWhack() {
  clearWhackTimers();
  document.getElementById('jumpscare') && hide($('jumpscare'));
  const sc = $('scene-whack');
  sc.classList.remove('screen-shake');
  const cap = $('jumpscare-caption');
  cap.classList.remove('show');
  const jsPhoto = $('jumpscare-photo');
  jsPhoto.classList.remove('pop');
}

function armSpawns(ms) {
  whackLater(function () {
    if (curScene !== 'whack' || gameOver) return;
    popOne();
    armSpawns(rnd(600, 1500));
  }, ms !== undefined ? ms : rnd(700, 1300));
}

function popOne() {
  const cats = Array.from(whackGrid.querySelectorAll('.cat'));
  const free = cats.filter(function (c) { return !c.classList.contains('up') && !c.classList.contains('cool'); });
  if (!free.length) return;
  const c = pick(free);
  c.classList.add('up');
  c.textContent = pick(CAT_FACES);
  // Auto duck down after a random time.
  const t = setTimeout(function () {
    if (curScene === 'whack' && !gameOver) {
      c.classList.remove('up');
      c.classList.add('cool');
      setTimeout(function () { c.classList.remove('cool'); }, 900);
    }
  }, rnd(700, 1400));
  whackTimers.push(t);
}

whackGrid.addEventListener('click', function (e) {
  if (gameOver) return;
  const cat = e.target.closest('.cat');
  if (!cat || !cat.classList.contains('up')) return;
  bonkCat(cat);
});

function bonkCat(cat) {
  whacks++;
  $('whack-count').textContent = String(whacks);
  cat.classList.remove('up');
  cat.classList.add('bonked', 'cool');
  cat.textContent = '😲';
  playSound('meow');
  if (whacks % 3 === 0) { $('whack-msg').textContent = pick(SHOUTS); }
  setTimeout(function () {
    cat.textContent = pick(CAT_FACES);
    cat.classList.remove('bonked');
    setTimeout(function () { cat.classList.remove('cool'); }, 700);
  }, 450);
  if (whacks >= WHACKS_NEEDED) {
    triggerJumpscare();           // scare her first…
    whackLater(endWhack, 2800);   // …then reveal the "done" panel 2.8s later
  }
}

function endWhack() {
  gameOver = true;
  clearWhackTimers();
  show($('whack-done'));
}

$('whack-continue').addEventListener('click', function () {
  playSound('ding');
  goTo('catch');
});

function triggerJumpscare() {
  if (gameOver || jumpscareShown || curScene !== 'whack') return;
  jumpscareShown = true;
  playSound('airhorn');
  const sc = $('scene-whack');
  sc.classList.remove('screen-shake');
  void sc.offsetWidth;
  sc.classList.add('screen-shake');
  show($('jumpscare'));
  requestAnimationFrame(function () { $('jumpscare-photo').classList.add('pop'); });
  whackLater(function () { $('jumpscare-caption').classList.add('show'); }, 650);
  whackLater(function () {
    hide($('jumpscare'));
    $('jumpscare-photo').classList.remove('pop');
    $('jumpscare-caption').classList.remove('show');
    sc.classList.remove('screen-shake');
  }, 2600);
}

/* ═══════════════ 12. SCENE 4 — CATCH THE GIFT ═══════════════ */
let giftDodger = null;
let giftCaught = false;

function startCatch() {
  destroyCatch();
  giftCaught = false;
  let escapes = 0;
  $('catch-counter').textContent = 'Escapes: 0 / ' + GIFT_DODGES;
  const gift = $('gift');
  gift.classList.remove('caught');

  giftDodger = makeDodger(gift, $('catch-area'), GIFT_DODGES, {
    onDodge: function (n) {
      escapes = n;
      $('catch-counter').textContent = 'Escapes: ' + Math.min(escapes, GIFT_DODGES) + ' / ' + GIFT_DODGES;
      if (n >= GIFT_DODGES) $('catch-hint').textContent = 'It stopped! Quick, grab it! 🎉';
    },
    onCaught: function () { catchGift(); }
  });
}

function destroyCatch() {
  if (giftDodger) { giftDodger.destroy(); giftDodger = null; }
}

function catchGift() {
  if (giftCaught) return;
  giftCaught = true;
  const gift = $('gift');
  const box = gift.getBoundingClientRect();
  gift.classList.add('caught');
  playSound('meow');
  burstConfetti(box.left + box.width / 2, box.top + box.height / 2, 50, true);
  $('catch-hint').textContent = 'Caught it! 🎉';
  setTimeout(function () { goTo('memory'); }, 950);
}

/* ═══════════════ 13. SCENE 5 — MEMORY MATCH ═══════════════ */
let flipped = [];
let lockFlip = false;
let matchedCount = 0;

function buildMemory() {
  const grid = $('memory-grid');
  const n = PHOTOS.memory.length;
  const deck = [];
  for (let i = 0; i < n; i++) {
    deck.push({ pair: i, src: PHOTOS.memory[i] });
    deck.push({ pair: i, src: PHOTOS.memory[i] });
  }
  // Fisher–Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = deck[i]; deck[i] = deck[j]; deck[j] = t;
  }
  grid.innerHTML = deck.map(function (d, idx) {
    return '<button type="button" class="mem-card" data-pair="' + d.pair + '" data-src="' + d.src + '">' +
      '<span class="mem-card-inner">' +
        '<span class="mem-face mem-card-back">🐾</span>' +
        '<span class="mem-face mem-card-front"><img src="' + d.src + '" alt="Memory photo" loading="lazy"></span>' +
      '</span></button>';
  }).join('');
}

$('memory-grid').addEventListener('click', function (e) {
  const card = e.target.closest('.mem-card');
  if (!card || lockFlip) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  flipped.push(card);
  if (flipped.length === 2) {
    lockFlip = true;
    const [a, b] = flipped;
    if (a.dataset.pair === b.dataset.pair) {
      matchPair(a, b);
    } else {
      setTimeout(function () {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        flipped = [];
        lockFlip = false;
      }, 900);
    }
  }
});

function matchPair(a, b) {
  a.classList.add('matched');
  b.classList.add('matched');
  matchedCount++;
  const cap = CAPTIONS[parseInt(a.dataset.pair, 10)] || '';
  const line = document.createElement('div');
  line.className = 'caption-line';
  line.textContent = '🐾 ' + cap;
  $('memory-caption').appendChild(line);
  playSound('purr');
  setTimeout(function () { flipped = []; lockFlip = false; }, 350);
  if (matchedCount >= PHOTOS.memory.length) { endMemory(); }
}

function endMemory() {
  setTimeout(function () {
    const gridR = $('memory-grid').getBoundingClientRect();
    burstConfetti(gridR.left + gridR.width / 2, gridR.top + gridR.height / 2, 70, true);
    playSound('purr');
    show($('memory-done'));
  }, 600);
}

$('memory-continue').addEventListener('click', function () {
  playSound('ding');
  goTo('quiz');
});

/* ═══════════════ 14. SCENE 6 — THE QUIZ ═══════════════ */
let quizIdx = 0;
let quizAnswered = false;

function renderQuizProgress() {
  const prog = $('quiz-progress');
  prog.innerHTML = '';
  for (let i = 0; i < QUIZ.length; i++) {
    const s = document.createElement('span');
    s.className = 'pq' + (i < quizIdx ? ' done' : (i === quizIdx ? ' cur' : ''));
    s.textContent = '🐾';
    prog.appendChild(s);
  }
}

function renderQuizQuestion(idx) {
  quizIdx = idx;
  quizAnswered = false;
  const Q = QUIZ[idx];
  $('quiz-question').textContent = Q.q;
  $('quiz-feedback').textContent = '';
  $('quiz-feedback').className = 'quiz-feedback';
  hide($('quiz-continue'));
  renderQuizProgress();
  const opts = $('quiz-options');
  opts.innerHTML = '';
  Q.options.forEach(function (opt, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'quiz-option';
    b.textContent = opt;
    b.dataset.idx = String(i);
    opts.appendChild(b);
  });
}

$('quiz-options').addEventListener('click', function (e) {
  const btn = e.target.closest('.quiz-option');
  if (!btn || quizAnswered) return;
  quizAnswered = true;
  const Q = QUIZ[quizIdx];
  const chosen = parseInt(btn.dataset.idx, 10);
  const fb = $('quiz-feedback');

  // Lock the options & reveal the outcome.
  $('quiz-options').querySelectorAll('.quiz-option').forEach(function (o) {
    o.disabled = true;
    const ix = parseInt(o.dataset.idx, 10);
    if (ix === Q.correct) o.classList.add('correct');
    if (ix === chosen && chosen !== Q.correct) o.classList.add('wrong');
  });

  if (chosen === Q.correct) {
    playSound('purr');
    fb.className = 'quiz-feedback good';
    fb.textContent = '✅ ' + Q.praise;
  } else {
    // Sassy roast, then show the correct answer and let her continue anyway.
    playSound('hiss');
    fb.className = 'quiz-feedback bad';
    fb.textContent = Q.roast;
  }

  show($('quiz-continue'));
});

$('quiz-continue').addEventListener('click', function () {
  if (quizIdx + 1 < QUIZ.length) {
    renderQuizQuestion(quizIdx + 1);
  } else {
    playSound('ding');
    goTo('reveal');
  }
});

/* ═══════════════ 15. SCENE 7 — FINAL REVEAL ═══════════════ */
let revealStarted = false;
let ssIdx = 0;
let ssTimer = null;
let ssSwipeMoved = false;
let ssTouchX = 0;
let ssTouchY = 0;

function buildTitle() {
  const el = $('reveal-title');
  const text = "Happy Birthday Nouha!";
  el.innerHTML = text.split('').map(function (ch, i) {
    const isSpace = ch === ' ';
    return '<span class="letter" style="animation-delay:' + (i * 55) + 'ms">' + (isSpace ? '&nbsp;' : ch) + '</span>';
  }).join('');
  el.classList.add('play');
}

function buildSlideshow() {
  $('slideshow-track').innerHTML = PHOTOS.slideshow.map(function (src, i) {
    return '<div class="slide"><img src="' + src + '" alt="Memory ' + (i + 1) + '" loading="lazy" draggable="false"></div>';
  }).join('');
  const dots = $('slideshow-dots');
  dots.innerHTML = PHOTOS.slideshow.map(function (_, i) {
    return '<button type="button" class="ss-dot" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"></button>';
  }).join('');
  sizeSlidesSS();
}

/* Measure the visible width and translate by pixels — robust on every device. */
function slideshowWidth() { return $('slideshow').clientWidth; }

function applySlideTransform() {
  $('slideshow-track').style.transform = 'translateX(' + (-ssIdx * slideshowWidth()) + 'px)';
}

function sizeSlidesSS() {
  const w = slideshowWidth() || 320;
  const track = $('slideshow-track');
  track.style.width = (w * PHOTOS.slideshow.length) + 'px';
  [].forEach.call(track.children, function (s) { s.style.width = w + 'px'; });
  applySlideTransform();
}

window.addEventListener('resize', function () { if (curScene === 'reveal') sizeSlidesSS(); });

function showSlide(i) {
  ssIdx = (i + PHOTOS.slideshow.length) % PHOTOS.slideshow.length;
  applySlideTransform();
  $('slideshow-dots').querySelectorAll('.ss-dot').forEach(function (d, j) {
    d.classList.toggle('active', j === ssIdx);
  });
}

function ssNext() { showSlide(ssIdx + 1); resetSS(); }
function ssPrev() { showSlide(ssIdx - 1); resetSS(); }

function resetSS() {
  if (ssTimer) { clearInterval(ssTimer); ssTimer = null; }
  ssTimer = setInterval(function () { showSlide(ssIdx + 1); }, 3500);
}

function startReveal() {
  if (revealStarted) { resetSS(); return; }
  revealStarted = true;
  buildTitle();
  buildSlideshow();
  showSlide(0);

  // Curtains part + content + confetti in sequence.
  requestAnimationFrame(function () {
    setTimeout(function () {
      $('curtain-left').classList.add('open-left');
      $('curtain-right').classList.add('open-right');
    }, 60);
    setTimeout(function () {
      $('reveal-content').classList.add('visible');
      playSound('ding');
    }, 420);
    setTimeout(function () {
      const r = $('reveal-title').getBoundingClientRect();
      startRain();
      burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 70, true);
    }, 900);
  });
  resetSS();
}

/* Slideshow controls (arrows on desktop, tap/swipe on mobile) */
$('ss-next').addEventListener('click', function (e) { e.stopPropagation(); ssNext(); });
$('ss-prev').addEventListener('click', function (e) { e.stopPropagation(); ssPrev(); });
$('slideshow-dots').addEventListener('click', function (e) {
  const dot = e.target.closest('.ss-dot');
  if (!dot) return;
  e.stopPropagation();
  showSlide(parseInt(dot.dataset.i, 10));
  resetSS();
});
$('slideshow').addEventListener('click', function (e) {
  if (e.target.closest('.ss-arrow') || e.target.closest('.ss-dot')) return;
  if (ssSwipeMoved) { ssSwipeMoved = false; return; } // it was a swipe
  ssNext();
});
$('slideshow').addEventListener('touchstart', function (e) { ssTouchX = e.touches[0].clientX; ssTouchY = e.touches[0].clientY; ssSwipeMoved = false; }, { passive: true });
$('slideshow').addEventListener('touchend', function (e) {
  const dx = e.changedTouches[0].clientX - ssTouchX;
  const dy = e.changedTouches[0].clientY - ssTouchY;
  if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
    ssSwipeMoved = true;
    if (dx < 0) ssNext(); else ssPrev();
  }
}, { passive: true });

/* ═══════════════ 16. BOOT ═══════════════ */
buildMemory();        // memory cards once (they never flip the wrong way twice)
startTypewriter();    // gate typewriter on load
curScene = 'gate';
