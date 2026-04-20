/**
 * tools-drawer.js — Injects two widgets on every page:
 *   1. A tools dropdown button in the top nav bar
 *   2. A floating mini Pomodoro timer (synced via BroadcastChannel + localStorage)
 */
(function () {
  /* ── 1. TOOLS DROPDOWN ─────────────────────────────── */
  const TOOLS = [
    { href: 'pomodoro.html', icon: '⏱️', label: 'Pomodoro Timer' },
    { href: 'goals.html',    icon: '🎯', label: 'Goal Tracker' },
    { href: 'journal.html',  icon: '🧠', label: 'Recall Journal' },
    { href: 'planner.html',  icon: '📅', label: 'Study Planner' },
    { href: 'habits.html',   icon: '✅', label: 'Habit Tracker' },
    { href: 'notes.html',    icon: '📝', label: 'Cornell Notes' },
    { href: 'compare.html',  icon: '📊', label: 'Pre/Post Compare' },
    { href: 'help.html',     icon: '❓', label: 'Help & Guide' }
  ];

  const currentPage = location.pathname.split('/').pop();

  function injectToolsButton() {
    // Find the top nav bar (first <nav> inside a flex-center div)
    const navBars = document.querySelectorAll('nav.flex.gap-3');
    const topNav = Array.from(navBars).find(n => {
      const parent = n.parentElement;
      return parent && parent.classList.contains('flex') &&
        (parent.classList.contains('justify-center') || parent.style.justifyContent === 'center');
    });
    if (!topNav) return;

    // Build the wrapper
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;display:inline-flex';

    // Toggle button
    const btn = document.createElement('button');
    btn.className = 'fp-bubble-circle';
    btn.title = 'Study Tools';
    btn.setAttribute('aria-label', 'Study Tools');
    btn.innerHTML = '<span style="font-size:18px;line-height:1">🧰</span>';
    wrapper.appendChild(btn);

    // Dropdown panel
    const panel = document.createElement('div');
    panel.style.cssText =
      'display:none;position:fixed;z-index:99999;' +
      'min-width:210px;background:var(--white);border:1px solid var(--border-color);' +
      'border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.15);padding:6px 0;' +
      'animation:fpToolsFadeIn .15s ease';
    TOOLS.forEach(t => {
      const a = document.createElement('a');
      a.href = t.href;
      const isActive = t.href === currentPage;
      a.style.cssText =
        'display:flex;align-items:center;gap:10px;padding:8px 16px;font-size:14px;' +
        'text-decoration:none;transition:background .12s;color:var(--text-primary);' +
        (isActive ? 'background:color-mix(in srgb,var(--primary-color) 10%,transparent);font-weight:600' : '');
      a.innerHTML = `<span style="font-size:18px;width:24px;text-align:center">${t.icon}</span>` +
        `<span>${t.label}</span>`;
      a.addEventListener('mouseenter', () => { if (!isActive) a.style.background = 'var(--background-color)'; });
      a.addEventListener('mouseleave', () => { if (!isActive) a.style.background = ''; });
      panel.appendChild(a);
    });
    wrapper.appendChild(panel);

    // Toggle behavior
    let open = false;
    function show() {
      const r = btn.getBoundingClientRect();
      panel.style.top = (r.bottom + 8) + 'px';
      panel.style.left = Math.max(8, r.right - 210) + 'px';
      open = true;
      panel.style.display = 'block';
    }
    function hide() { open = false; panel.style.display = 'none'; }
    btn.addEventListener('click', e => { e.stopPropagation(); open ? hide() : show(); });
    document.addEventListener('click', e => { if (open && !wrapper.contains(e.target)) hide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) hide(); });

    // Append panel to body so it escapes any stacking context
    document.body.appendChild(panel);
    topNav.appendChild(wrapper);
  }

  // Inject animation keyframes
  const style = document.createElement('style');
  style.textContent =
    '@keyframes fpToolsFadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}' +
    '@keyframes fpMiniPulse{0%,100%{box-shadow:0 2px 12px rgba(0,0,0,.12)}50%{box-shadow:0 2px 18px rgba(0,0,0,.22)}}' +
    '.fp-mini-timer{position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;align-items:center;gap:8px;' +
    'background:var(--white,#fff);border:1px solid var(--border-color,#e5e7eb);border-radius:16px;padding:8px 14px 8px 10px;' +
    'box-shadow:0 2px 12px rgba(0,0,0,.12);font-family:"Lexend",sans-serif;transition:transform .15s,opacity .15s;user-select:none}' +
    '.fp-mini-timer:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.18)}' +
    '.fp-mini-timer.fp-mini-running{animation:fpMiniPulse 2s ease infinite}' +
    '.fp-mini-timer .fp-mini-ring{width:32px;height:32px;flex-shrink:0}' +
    '.fp-mini-timer .fp-mini-time{font-size:16px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--text-primary,#111)}' +
    '.fp-mini-timer .fp-mini-label{font-size:10px;color:var(--text-secondary,#60748a);text-transform:uppercase;letter-spacing:.5px}' +
    '.fp-mini-timer .fp-mini-controls{display:none;gap:4px;margin-left:4px}' +
    '.fp-mini-timer:hover .fp-mini-controls{display:flex}' +
    '.fp-mini-timer .fp-mini-btn{border:none;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:600;cursor:pointer;' +
    'font-family:"Lexend",sans-serif;transition:background .12s,transform .1s;white-space:nowrap}' +
    '.fp-mini-timer .fp-mini-btn:hover{transform:scale(1.05)}' +
    '.fp-mini-timer .fp-mini-btn.fp-mini-short{background:#22c55e22;color:#22c55e}' +
    '.fp-mini-timer .fp-mini-btn.fp-mini-short:hover{background:#22c55e33}' +
    '.fp-mini-timer .fp-mini-btn.fp-mini-long{background:#a855f722;color:#a855f7}' +
    '.fp-mini-timer .fp-mini-btn.fp-mini-long:hover{background:#a855f733}' +
    '.fp-mini-timer .fp-mini-btn.fp-mini-stop{background:#ef444422;color:#ef4444}' +
    '.fp-mini-timer .fp-mini-btn.fp-mini-stop:hover{background:#ef444433}' +
    '.fp-mini-timer .fp-mini-btn.fp-mini-resume{background:color-mix(in srgb,var(--primary-color,#0d78f2) 12%,transparent);color:var(--primary-color,#0d78f2)}' +
    '.fp-mini-timer .fp-mini-btn.fp-mini-resume:hover{background:color-mix(in srgb,var(--primary-color,#0d78f2) 22%,transparent)}' +
    '.fp-mini-timer.fp-mini-hidden{transform:translateY(80px);opacity:0;pointer-events:none}';
  document.head.appendChild(style);

  /* ── 2. FLOATING POMODORO MINI-TIMER ─────────────── */
  const POMO_STATE_KEY = 'fpPomodoroLive';
  const POMO_CHANNEL = 'fpPomodoro';
  const isPomoPage = currentPage === 'pomodoro.html';
  let bc;
  try { bc = new BroadcastChannel(POMO_CHANNEL); } catch { bc = null; }

  // State shape: { mode, remaining, total, running, ts }
  // ts = Date.now() when this snapshot was taken (for drift compensation)

  function readState() {
    try { return JSON.parse(localStorage.getItem(POMO_STATE_KEY)); } catch { return null; }
  }

  function writeState(state) {
    const payload = { ...state, ts: Date.now() };
    localStorage.setItem(POMO_STATE_KEY, JSON.stringify(payload));
    if (bc) bc.postMessage(payload);
  }

  function clearState() {
    localStorage.removeItem(POMO_STATE_KEY);
    if (bc) bc.postMessage(null);
  }

  /* --- Pomodoro page: broadcast state changes --- */
  if (isPomoPage) {
    // Patch the pomodoro page's timer to broadcast state via a MutationObserver on the display
    let broadcasting = false;
    function broadcastCurrentState() {
      if (broadcasting) return;
      broadcasting = true;
      requestAnimationFrame(() => { broadcasting = false; });
      const displayEl = document.getElementById('timerDisplay');
      const labelEl = document.getElementById('timerLabel');
      if (!displayEl) return;
      const parts = displayEl.textContent.split(':').map(Number);
      const remaining = (parts[0] || 0) * 60 + (parts[1] || 0);
      // Detect mode from label or button states
      let mode = 'work';
      const modeButtons = document.querySelectorAll('[data-mode]');
      modeButtons.forEach(b => { if (b.classList.contains('fp-bubble-primary') || b.dataset.active === 'true') mode = b.dataset.mode; });
      // Alternative: check the label text
      if (labelEl) {
        const lt = labelEl.textContent.toLowerCase();
        if (lt.includes('short')) mode = 'short';
        else if (lt.includes('long')) mode = 'long';
        else mode = 'work';
      }
      const totalMap = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
      const total = totalMap[mode] || 25 * 60;
      // Detect running
      const startBtn = document.getElementById('btnStart');
      const running = startBtn && (startBtn.textContent.trim() === 'Pause' || startBtn.textContent.trim() === 'Resume' && false);
      const isRunning = startBtn ? startBtn.textContent.trim() === 'Pause' : false;

      writeState({ mode, remaining, total, running: isRunning, savedFocus: window.__fpSavedFocus || null });
    }

    // Observe display text changes
    const watchDisplay = () => {
      const el = document.getElementById('timerDisplay');
      if (!el) { setTimeout(watchDisplay, 200); return; }
      const obs = new MutationObserver(broadcastCurrentState);
      obs.observe(el, { childList: true, characterData: true, subtree: true });
      // Also broadcast on button clicks
      document.addEventListener('click', () => setTimeout(broadcastCurrentState, 50));
      broadcastCurrentState();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchDisplay);
    else watchDisplay();
    // Clean up when leaving
    window.addEventListener('beforeunload', () => {
      const s = readState();
      if (s && !s.running) clearState();
    });
    // Don't show floating timer on Pomodoro page itself
  }

  /* --- All other pages: show floating mini-timer --- */
  if (!isPomoPage) {
    let miniEl = null;
    let miniRing = null;
    let miniTime = null;
    let miniLabel = null;
    let syncInterval = null;

    function buildMiniTimer() {
      miniEl = document.createElement('div');
      miniEl.className = 'fp-mini-timer fp-mini-hidden';
      miniEl.innerHTML =
        '<svg class="fp-mini-ring" viewBox="0 0 36 36">' +
        '<circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-color,#e5e7eb)" stroke-width="3"/>' +
        '<circle class="fp-mini-arc" cx="18" cy="18" r="15" fill="none" stroke="var(--primary-color,#0d78f2)" ' +
        'stroke-width="3" stroke-linecap="round" stroke-dasharray="94.25" stroke-dashoffset="0" ' +
        'transform="rotate(-90 18 18)"/></svg>' +
        '<div><div class="fp-mini-time">--:--</div><div class="fp-mini-label">Timer</div></div>' +
        '<div class="fp-mini-controls">' +
        '<button class="fp-mini-btn fp-mini-short" title="Short Break (5 min)">☕ Short</button>' +
        '<button class="fp-mini-btn fp-mini-long" title="Long Break (15 min)">🛋️ Long</button>' +
        '<button class="fp-mini-btn fp-mini-resume" title="Resume Focus" style="display:none">▶ Resume</button>' +
        '<button class="fp-mini-btn fp-mini-stop" title="Stop Timer">⏹ Stop</button>' +
        '</div>';
      document.body.appendChild(miniEl);

      miniRing = miniEl.querySelector('.fp-mini-arc');
      miniTime = miniEl.querySelector('.fp-mini-time');
      miniLabel = miniEl.querySelector('.fp-mini-label');

      // Short break button
      miniEl.querySelector('.fp-mini-short').addEventListener('click', e => {
        e.stopPropagation();
        const cur = readState();
        let savedFocus = cur?.savedFocus || null;
        if (cur && cur.mode === 'work' && cur.remaining > 0) {
          const drift = (cur.running && cur.ts) ? Math.floor((Date.now() - cur.ts) / 1000) : 0;
          savedFocus = Math.max(1, cur.remaining - drift);
        }
        writeState({ mode: 'short', remaining: 5 * 60, total: 5 * 60, running: true, savedFocus });
      });
      // Long break button
      miniEl.querySelector('.fp-mini-long').addEventListener('click', e => {
        e.stopPropagation();
        const cur = readState();
        let savedFocus = cur?.savedFocus || null;
        if (cur && cur.mode === 'work' && cur.remaining > 0) {
          const drift = (cur.running && cur.ts) ? Math.floor((Date.now() - cur.ts) / 1000) : 0;
          savedFocus = Math.max(1, cur.remaining - drift);
        }
        writeState({ mode: 'long', remaining: 15 * 60, total: 15 * 60, running: true, savedFocus });
      });
      // Resume focus button
      miniEl.querySelector('.fp-mini-resume').addEventListener('click', e => {
        e.stopPropagation();
        const cur = readState();
        if (cur && cur.savedFocus) {
          writeState({ mode: 'work', remaining: cur.savedFocus, total: 25 * 60, running: true, savedFocus: null });
        }
      });
      // Stop button
      miniEl.querySelector('.fp-mini-stop').addEventListener('click', e => {
        e.stopPropagation();
        clearState();
        updateMini(null);
      });
    }

    function updateMini(state) {
      if (!miniEl) buildMiniTimer();
      if (!state) {
        miniEl.classList.add('fp-mini-hidden');
        return;
      }
      // Compensate for time drift if running
      let remaining = state.remaining;
      if (state.running && state.ts) {
        const elapsed = Math.floor((Date.now() - state.ts) / 1000);
        remaining = Math.max(0, state.remaining - elapsed);
      }

      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      miniTime.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');

      const modeLabels = { work: 'Focus', short: 'Short Break', long: 'Long Break' };
      miniLabel.textContent = modeLabels[state.mode] || 'Timer';

      const progress = 1 - remaining / (state.total || 1);
      const CIRC = 2 * Math.PI * 15; // ~94.25
      miniRing.setAttribute('stroke-dashoffset', (CIRC * (1 - progress)).toFixed(2));

      // Color the ring based on mode
      const colors = { work: 'var(--primary-color,#0d78f2)', short: '#22c55e', long: '#a855f7' };
      miniRing.setAttribute('stroke', colors[state.mode] || 'var(--primary-color,#0d78f2)');

      // Toggle controls: show break buttons during work, resume during breaks
      const onBreak = state.mode === 'short' || state.mode === 'long';
      const hasSaved = !!state.savedFocus;
      const shortBtn = miniEl.querySelector('.fp-mini-short');
      const longBtn = miniEl.querySelector('.fp-mini-long');
      const resumeBtn = miniEl.querySelector('.fp-mini-resume');
      if (shortBtn) shortBtn.style.display = onBreak ? 'none' : '';
      if (longBtn) longBtn.style.display = onBreak ? 'none' : '';
      if (resumeBtn) resumeBtn.style.display = (onBreak && hasSaved) ? '' : 'none';

      miniEl.classList.toggle('fp-mini-running', !!state.running);
      miniEl.classList.remove('fp-mini-hidden');
    }

    function pollState() {
      const s = readState();
      if (s) {
        // If running, compensate and check if expired
        if (s.running && s.ts) {
          const elapsed = Math.floor((Date.now() - s.ts) / 1000);
          if (s.remaining - elapsed <= 0) {
            // Break expired with saved focus — auto-resume
            if (s.mode !== 'work' && s.savedFocus) {
              writeState({ mode: 'work', remaining: s.savedFocus, total: 25 * 60, running: true, savedFocus: null });
              updateMini(readState());
              return;
            }
            clearState();
            updateMini(null);
            return;
          }
        }
        updateMini(s);
      } else {
        updateMini(null);
      }
    }

    // Listen for broadcasts from the Pomodoro page
    if (bc) {
      bc.onmessage = e => {
        if (e.data === null) updateMini(null);
        else updateMini(e.data);
      };
    }

    // Also poll every second for drift compensation when running
    syncInterval = setInterval(pollState, 1000);

    // Initial check
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pollState);
    else pollState();
  }

  /* ── Init ───────────────────────────────────── */
  function init() { injectToolsButton(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
