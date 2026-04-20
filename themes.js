(function(){
  const THEMES = {
    light: {
      '--primary-color': '#0d78f2',
      '--background-color': '#f0f2f5',
      '--text-primary': '#111418',
      '--text-secondary': '#60748a',
      '--white': '#ffffff',
  '--border-color': '#e5e7eb',
  '--surface-hover': '#f3f4f6'
    },
    dark: {
      '--primary-color': '#60a5fa',
      '--background-color': '#0b1220',
      '--text-primary': '#e5e7eb',
      '--text-secondary': '#a1a9b8',
      '--white': '#111827',
  '--border-color': '#334155',
  '--surface-hover': '#1f2937'
    },
    ocean: {
  '--primary-color': '#0369a1', /* deeper ocean blue */
  '--background-color': '#c2dceb', /* darker base */
  '--text-primary': '#0d1724',
  '--text-secondary': '#2c3e50', /* stronger contrast */
  '--white': '#edf5f8', /* panel color slightly lighter than bg */
  '--border-color': '#94c3d4',
  '--surface-hover': '#b5d6e2'
    },
    forest: {
  '--primary-color': '#166534', /* richer forest green */
  '--background-color': '#d4e9df', /* darker backdrop */
  '--text-primary': '#072616',
  '--text-secondary': '#254231',
  '--white': '#eef7f2',
  '--border-color': '#a6ccb8',
  '--surface-hover': '#c2ddcf'
    },
    halloween: {
      '--primary-color': '#ff6a00',
      '--background-color': '#0d0015',
      '--text-primary': '#f0e6ff',
      '--text-secondary': '#c89aff',
      '--white': '#1a0a2e',
      '--border-color': '#5b2d8e',
      '--surface-hover': '#2a1245'
    },
  sunset: {
  '--primary-color': '#ea580c', /* deeper orange */
  '--background-color': '#ffe7d3',
  '--text-primary': '#1a2532',
  '--text-secondary': '#4b5563',
  '--white': '#fff5ed',
  '--border-color': '#f7c8a3',
  '--surface-hover': '#ffd9ba'
    },
    christmas: {
      '--primary-color': '#c41e3a',
      '--background-color': '#0a1628',
      '--text-primary': '#e8f0f8',
      '--text-secondary': '#8bb8d0',
      '--white': '#12233a',
      '--border-color': '#1e4060',
      '--surface-hover': '#1a3050'
    },
    'high-contrast': {
      '--primary-color': '#000000',
      '--background-color': '#ffffff',
      '--text-primary': '#000000',
      '--text-secondary': '#222222',
      '--white': '#ffffff',
  '--border-color': '#000000',
  '--surface-hover': '#e5e5e5'
    },
    // Branch-exclusive themes (unlocked by user's branch selection)
    'usa': {
      '--primary-color': '#d4a017',
      '--background-color': '#0c0c0c',
      '--text-primary': '#f0e4c8',
      '--text-secondary': '#bfa85a',
      '--white': '#1a1a1a',
      '--border-color': '#3d3520',
      '--surface-hover': '#252218'
    },
    'usn': {
      '--primary-color': '#d4a843',
      '--background-color': '#001a33',
      '--text-primary': '#efe0be',
      '--text-secondary': '#c9a84e',
      '--white': '#002244',
      '--border-color': '#3a3018',
      '--surface-hover': '#0a2a4a'
    },
    'usmc': {
      '--primary-color': '#d4a843',
      '--background-color': '#1a0508',
      '--text-primary': '#f0dcc0',
      '--text-secondary': '#c9a84e',
      '--white': '#2a0a10',
      '--border-color': '#4a2a12',
      '--surface-hover': '#3a1218'
    },
    'usaf': {
      '--primary-color': '#b0c4de',
      '--background-color': '#0a1628',
      '--text-primary': '#dce8f0',
      '--text-secondary': '#6a9ec0',
      '--white': '#0f1f38',
      '--border-color': '#1e3a5f',
      '--surface-hover': '#162d4a'
    },
    // America (July 4th) seasonal theme
    'america': {
      '--primary-color': '#b22234',
      '--background-color': '#0a1628',
      '--text-primary': '#f0f0f0',
      '--text-secondary': '#7ea8d4',
      '--white': '#111d33',
      '--border-color': '#1e3a5f',
      '--surface-hover': '#162d4a'
    },
    // Chinese New Year seasonal theme
    'chinese-new-year': {
      '--primary-color': '#d4af37',
      '--background-color': '#1a0505',
      '--text-primary': '#f5e6c8',
      '--text-secondary': '#e8a040',
      '--white': '#2a0808',
      '--border-color': '#6b1515',
      '--surface-hover': '#3a0c0c'
    },
    // Special secret theme (Star Wars inspired) - only selectable when unlocked via achievements
    'star-wars': {
      '--primary-color': '#ffe81f',
      '--background-color': '#02040a',
      '--text-primary': '#ffe81f',
      '--text-secondary': '#7eb8da',
      '--white': '#0c1018',
      '--border-color': '#1a2538',
      '--surface-hover': '#131c28'
    }
  };

  // -------- Developer Mode (global) --------
  const DEV_STORAGE_KEY = 'fpDevMode';
  const DEV_DEFAULT_CODE = 'focusdev'; // simple local code; change by setting localStorage.fpDevCode
  function devIsOn(){
    try { return localStorage.getItem(DEV_STORAGE_KEY) === '1'; } catch { return false; }
  }
  function devEnable(){ try { localStorage.setItem(DEV_STORAGE_KEY, '1'); } catch {} ensureDevBadge(); alert('Developer Mode enabled'); }
  function devDisable(){ try { localStorage.removeItem(DEV_STORAGE_KEY); } catch {} removeDevBadge(); alert('Developer Mode disabled');
    // If a seasonal theme is active out-of-season, revert to system on disable
    const key = document.documentElement.getAttribute('data-theme');
    const m = new Date().getMonth();
    if(key==='halloween' && m!==9) applyThemeKey('system');
    if(key==='christmas' && m!==11) applyThemeKey('system');
    if(key==='america' && m!==6) applyThemeKey('system');
  }
  function ensureDevBadge(){
    if(!devIsOn()) return;
    let b = document.getElementById('fp-dev-badge');
    if(!b){
      b = document.createElement('div');
      b.id='fp-dev-badge';
      b.textContent='DEV';
      b.style.cssText='position:fixed;left:8px;bottom:8px;z-index:2000;background:rgba(16,185,129,0.15);color:#065f46;border:1px solid rgba(16,185,129,0.4);font:600 10px/1.2 system-ui, sans-serif;letter-spacing:.08em;padding:6px 8px;border-radius:8px;backdrop-filter:blur(4px);cursor:pointer;';
      b.title = 'Developer Mode — click to manage';
      b.addEventListener('click', showDevModal);
      document.body.appendChild(b);
    }
  }
  function removeDevBadge(){ document.getElementById('fp-dev-badge')?.remove(); }
  function showDevModal(){
    // Basic modal for enabling/disabling dev mode
    if(document.getElementById('fp-dev-modal')) return;
    const wrap=document.createElement('div');
    wrap.id='fp-dev-modal';
    wrap.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;';
    const card=document.createElement('div');
    card.style.cssText='background:var(--white);color:var(--text-primary);border:1px solid var(--border-color);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.15);padding:16px;min-width:280px;max-width:90vw;';
    const isOn=devIsOn();
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">
        <div style="font-weight:700;">Developer Mode</div>
        <button id="fpDevClose" style="font-size:18px;line-height:1;background:transparent;border:none;color:var(--text-secondary);">×</button>
      </div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px;">${isOn? 'Disable Developer Mode or keep it on for unrestricted theming and achievements debug.' : 'Enter the developer code to enable unrestricted theming and achievements debug.'}</div>
      <div ${isOn? 'style="display:none"':''}>
        <input id="fpDevCode" type="password" placeholder="Developer code" class="modern-input" style="width:100%;margin-bottom:10px;" />
        <button id="fpDevEnable" class="bg-[var(--primary-color)] text-black hover:bg-[var(--primary-color)]" style="width:100%;padding:8px 10px;border-radius:10px;font-weight:600;">Enable</button>
      </div>
      <div ${isOn? '':'style="display:none"'}>
        <button id="fpDevDisable" class="hover:bg-[var(--background-color)]" style="width:100%;padding:8px 10px;border-radius:10px;border:1px solid var(--border-color);font-weight:600;">Disable</button>
      </div>
    `;
    wrap.appendChild(card);
    document.body.appendChild(wrap);
    function close(){ wrap.remove(); }
    card.querySelector('#fpDevClose')?.addEventListener('click', close);
    wrap.addEventListener('click', (e)=>{ if(e.target===wrap) close(); });
    const enableBtn=card.querySelector('#fpDevEnable');
    if(enableBtn){ enableBtn.addEventListener('click', ()=>{
      const input = card.querySelector('#fpDevCode');
      const userCode = (input && input.value) || '';
      let ok=false; try { const stored = localStorage.getItem('fpDevCode'); ok = (userCode && stored && userCode===stored) || (!stored && userCode===DEV_DEFAULT_CODE); } catch { ok = (userCode===DEV_DEFAULT_CODE); }
      if(ok){ devEnable(); ensureDevBadge(); close(); } else { alert('Invalid developer code'); }
    }); }
    const disableBtn=card.querySelector('#fpDevDisable');
    if(disableBtn){ disableBtn.addEventListener('click', ()=>{ devDisable(); close(); }); }
  }

  const STORAGE_KEY = 'fpTheme';
  const isDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function computeSystemTheme(){
    return isDark() ? THEMES.dark : THEMES.light;
  }

  // Chinese New Year dates (lunar calendar varies each year)
  // Maps year → [month (1-indexed), day] of CNY day 1; celebration lasts 15 days
  const CNY_DATES = {
    2025:[1,29],2026:[2,17],2027:[2,6],2028:[1,26],2029:[2,13],
    2030:[2,3],2031:[1,23],2032:[2,11],2033:[1,31],2034:[2,19],
    2035:[2,8],2036:[1,28],2037:[2,15],2038:[2,4],2039:[1,24],
    2040:[2,12]
  };
  function isCNYSeason(){
    const now=new Date();
    const yr=now.getFullYear();
    const entry=CNY_DATES[yr];
    if(!entry) return false;
    const start=new Date(yr,entry[0]-1,entry[1]);
    const end=new Date(start); end.setDate(end.getDate()+15);
    // Also check a 2-day lead-in (CNY Eve)
    const eve=new Date(start); eve.setDate(eve.getDate()-2);
    return now>=eve && now<=end;
  }

  function applyVars(vars){
    const root = document.documentElement;
    Object.entries(vars).forEach(([k,v]) => root.style.setProperty(k, v));
  }

  function applyStarWarsExtras(active){
    // --- Cleanup when deactivating ---
    if(!active){
      document.getElementById('fp-sw-canvas')?.remove();
      document.getElementById('fp-sw-style')?.remove();
      document.getElementById('fp-sw-decor')?.remove();
      document.querySelectorAll('.fp-sw-header-saber').forEach(e=>e.remove());
      document.querySelectorAll('[data-sw-logo]')?.forEach(h=>{
        if(h.dataset.origHtml){ h.innerHTML=h.dataset.origHtml; delete h.dataset.origHtml; }
        h.removeAttribute('data-sw-logo');
      });
      if(window.__fpSWGlow){
        document.removeEventListener('mouseover',window.__fpSWGlow.overHandler,true);
        document.removeEventListener('mouseout',window.__fpSWGlow.outHandler,true);
        delete window.__fpSWGlow;
      }
      window.removeEventListener('resize',window.__fpSWResize||(()=>{}));
      delete window.__fpSWResize;
      if(window.__fpSWRAF) cancelAnimationFrame(window.__fpSWRAF);
      delete window.__fpSWRAF;
      return;
    }

    // --- Already active guard ---
    if(document.getElementById('fp-sw-canvas')) return;

    // ===== STYLE INJECTION =====
    if(!document.getElementById('fp-sw-style')){
      const style=document.createElement('style');
      style.id='fp-sw-style';
      style.textContent=`
        [data-theme='star-wars'] .bg-\\[var\\(--primary-color\\)\\]{color:#000 !important; font-weight:700;}
        [data-theme='star-wars'] .hover\\:bg-\\[var\\(--background-color\\)\\]:hover{background:transparent !important;}
        [data-theme='star-wars'] input, [data-theme='star-wars'] textarea, [data-theme='star-wars'] select { background: var(--white) !important; color: var(--text-primary) !important; border-color: var(--border-color) !important; }
        [data-theme='star-wars'] input::placeholder, [data-theme='star-wars'] textarea::placeholder { color: #ffe81f !important; opacity:0.6; }
        /* Lightsaber glow pulse on hover */
        @keyframes fp-sw-pulse { 0%,100% { box-shadow: 0 0 0 1px var(--sw-glow-c), 0 0 6px 2px var(--sw-glow-c), 0 0 14px 4px var(--sw-glow-c); } 50% { box-shadow: 0 0 0 1px var(--sw-glow-c), 0 0 10px 3px var(--sw-glow-c), 0 0 26px 8px var(--sw-glow-c); } }
        .fp-sw-pulse { animation: fp-sw-pulse 1.6s ease-in-out infinite; transition: box-shadow .25s linear; }
        /* Card hologram effect */
        [data-theme='star-wars'] .fp-bubble,
        [data-theme='star-wars'] .fp-section-card {
          box-shadow: 0 0 12px rgba(255,232,31,0.08), 0 0 2px rgba(126,184,218,0.12), 0 8px 24px rgba(0,0,0,0.5) !important;
          border-color: #1a2538 !important;
          position: relative;
        }
        [data-theme='star-wars'] .fp-bubble:hover,
        [data-theme='star-wars'] .fp-section-card:hover {
          box-shadow: 0 0 20px rgba(255,232,31,0.15), 0 0 6px rgba(126,184,218,0.2), 0 12px 32px rgba(0,0,0,0.6) !important;
        }
        /* Hologram scanline on cards */
        [data-theme='star-wars'] .fp-bubble::after,
        [data-theme='star-wars'] .fp-section-card::after {
          content: '';
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(126,184,218,0.015) 3px, rgba(126,184,218,0.015) 4px);
          border-radius: inherit; opacity: 0.6;
        }
        /* Star Wars logo style */
        @keyframes fp-sw-glow { 0%,100%{filter:drop-shadow(0 0 4px rgba(255,232,31,0.5));} 50%{filter:drop-shadow(0 0 10px rgba(255,232,31,0.9)) drop-shadow(0 0 20px rgba(255,232,31,0.3));} }
        [data-theme='star-wars'] .fp-sw-logo{display:inline-flex;width:30px;height:30px;vertical-align:middle;margin-right:6px;animation:fp-sw-glow 3s ease-in-out infinite;}
        [data-theme='star-wars'] .fp-sw-logo svg{width:100%;height:100%;}
        /* Ensure content sits above canvas */
        [data-theme='star-wars'] main,
        [data-theme='star-wars'] .fp-bubble,
        [data-theme='star-wars'] .fp-section-card,
        [data-theme='star-wars'] header,
        [data-theme='star-wars'] nav,
        [data-theme='star-wars'] footer,
        [data-theme='star-wars'] form,
        [data-theme='star-wars'] .container { position: relative; z-index: 2; }
      `;
      document.head.appendChild(style);
    }

    // ===== CANVAS (deep space starfield + nebulae + occasional TIE fighters) =====
    const isHomePage=/(^|\/)home\.html(\?|#|$)/.test(window.location.pathname+window.location.search);
    const canvas=document.createElement('canvas');
    canvas.id='fp-sw-canvas';
    Object.assign(canvas.style,{position:'fixed',top:'0',left:'0',width:'100%',height:'100%',zIndex:'0',pointerEvents:'none'});
    document.body.prepend(canvas);
    const ctx=canvas.getContext('2d');
    let W,H;
    function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
    resize();

    // --- Deep starfield with parallax layers ---
    const starLayers=[];
    const layerConfigs=[
      {count:200, rMin:0.2, rMax:0.8, speed:0.03, color:'rgba(180,200,255,'},  // distant dim
      {count:120, rMin:0.5, rMax:1.4, speed:0.08, color:'rgba(220,230,255,'},  // mid
      {count:60,  rMin:1.0, rMax:2.2, speed:0.18, color:'rgba(255,255,255,'}   // close bright
    ];
    layerConfigs.forEach(cfg=>{
      const layer=[];
      for(let i=0;i<cfg.count;i++){
        layer.push({
          x:Math.random()*W, y:Math.random()*H,
          r:cfg.rMin+Math.random()*(cfg.rMax-cfg.rMin),
          speed:cfg.speed*(0.7+Math.random()*0.6),
          twinkle:Math.random()*Math.PI*2,
          twinkleSpeed:0.5+Math.random()*2,
          color:cfg.color
        });
      }
      starLayers.push(layer);
    });

    function drawStarfield(t){
      starLayers.forEach(layer=>{
        layer.forEach(s=>{
          // Stars are stationary — no drift
          const a=0.3+0.7*((Math.sin(t*s.twinkleSpeed+s.twinkle)+1)/2);
          ctx.fillStyle=s.color+a+')';
          ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
          // Bright stars get a cross flare
          if(s.r>1.6 && a>0.8){
            ctx.strokeStyle=s.color+(a*0.3)+')';
            ctx.lineWidth=0.5;
            ctx.beginPath(); ctx.moveTo(s.x-s.r*3,s.y); ctx.lineTo(s.x+s.r*3,s.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(s.x,s.y-s.r*3); ctx.lineTo(s.x,s.y+s.r*3); ctx.stroke();
          }
        });
      });
    }

    // --- Nebulae (subtle colored gas clouds) ---
    const nebulae=[
      {x:0.2,y:0.3,rx:0.18,ry:0.12,color:'rgba(80,40,120,0.04)',drift:0.15},
      {x:0.7,y:0.6,rx:0.22,ry:0.14,color:'rgba(30,60,120,0.05)',drift:-0.1},
      {x:0.5,y:0.15,rx:0.15,ry:0.08,color:'rgba(120,60,40,0.03)',drift:0.08}
    ];
    function drawNebulae(t){
      nebulae.forEach(n=>{
        const cx=n.x*W+Math.sin(t*n.drift)*30;
        const cy=n.y*H+Math.cos(t*n.drift*0.7)*20;
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(n.rx*W,n.ry*H));
        g.addColorStop(0,n.color);
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g;
        ctx.beginPath(); ctx.ellipse(cx,cy,n.rx*W,n.ry*H,0,0,Math.PI*2); ctx.fill();
      });
    }

    // --- Occasional TIE Fighter silhouettes flying across ---
    const ties=[];
    function spawnTIE(){
      const fromLeft=Math.random()>0.5;
      const dir=fromLeft?1:-1;
      const speed=3+Math.random()*3.5;
      const baseAngle=fromLeft?0:Math.PI;
      const wobble=(Math.random()-0.5)*0.3;
      ties.push({
        x: fromLeft?-60:W+60,
        y: 40+Math.random()*(H*0.5),
        vx: Math.cos(baseAngle+wobble)*speed,
        vy: Math.sin(baseAngle+wobble)*speed,
        speed: speed,
        angle: baseAngle+wobble,
        targetAngle: baseAngle+wobble,
        baseAngle: baseAngle,
        size: 16+Math.random()*14,
        opacity: 0.7+Math.random()*0.25,
        dir: dir,
        lasers: [],
        lastShot: 0,
        nextTurn: 2+Math.random()*3,
        turnTimer: 0
      });
    }
    function drawTIE(t){
      ties.forEach(tie=>{
        // Smooth mid-flight direction change
        tie.turnTimer+=(1/60);
        if(tie.turnTimer>=tie.nextTurn){
          tie.turnTimer=0;
          tie.nextTurn=2+Math.random()*4;
          tie.targetAngle=tie.baseAngle+(Math.random()-0.5)*0.7;
        }
        // Lerp current angle toward target for smooth banking
        tie.angle+=(tie.targetAngle-tie.angle)*0.06;
        tie.vx=Math.cos(tie.angle)*tie.speed;
        tie.vy=Math.sin(tie.angle)*tie.speed;
        tie.x+=tie.vx;
        tie.y+=tie.vy;
        // Keep in vertical bounds with smooth bounce
        if(tie.y<20){ tie.y=20; if(tie.vy<0) tie.targetAngle=tie.baseAngle+Math.abs(tie.targetAngle-tie.baseAngle)*0.5; }
        if(tie.y>H*0.6){ tie.y=H*0.6; if(tie.vy>0) tie.targetAngle=tie.baseAngle-Math.abs(tie.targetAngle-tie.baseAngle)*0.5; }
        const s=tie.size;
        const d=tie.dir;
        const heading=Math.atan2(tie.vy,tie.vx);

        // --- Green laser bolts drawn FIRST (behind the wing) ---
        // Fire occasionally
        if(t-tie.lastShot > 3+Math.random()*3){
          tie.lastShot=t;
          const lSpeed=8;
          const cosH=Math.cos(heading), sinH=Math.sin(heading);
          tie.lasers.push({ x:tie.x+cosH*s*0.2, y:tie.y+sinH*s*0.2-s*0.15, vx:cosH*lSpeed, vy:sinH*lSpeed, born:t });
          tie.lasers.push({ x:tie.x+cosH*s*0.2, y:tie.y+sinH*s*0.2+s*0.15, vx:cosH*lSpeed, vy:sinH*lSpeed, born:t });
        }
        // Draw and advance laser bolts
        tie.lasers.forEach(l=>{
          l.x+=l.vx; l.y+=l.vy||0;
          const trailLen=40;
          const ldir=Math.atan2(l.vy||0,l.vx);
          const tdx=-Math.cos(ldir)*trailLen, tdy=-Math.sin(ldir)*trailLen;
          // Outer glow trail
          ctx.strokeStyle='rgba(0,255,68,0.15)';
          ctx.lineWidth=4;
          ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(l.x+tdx,l.y+tdy); ctx.stroke();
          // Core trail
          ctx.strokeStyle='rgba(0,255,68,0.5)';
          ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(l.x+tdx,l.y+tdy); ctx.stroke();
          // Bright tip
          ctx.strokeStyle='#aaffcc';
          ctx.lineWidth=1;
          const sdx=-Math.cos(ldir)*4, sdy=-Math.sin(ldir)*4;
          ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(l.x+sdx,l.y+sdy); ctx.stroke();
        });
        // Remove off-screen lasers (cap at 8 per fighter)
        for(let i=tie.lasers.length-1;i>=0;i--){
          const lb=tie.lasers[i];
          if(lb.x<-80||lb.x>W+80||lb.y<-80||lb.y>H+80) tie.lasers.splice(i,1);
        }
        if(tie.lasers.length>8) tie.lasers.splice(0,tie.lasers.length-8);

        // --- TIE Fighter wing drawn AFTER lasers (on top) ---
        ctx.save();
        ctx.translate(tie.x,tie.y);
        ctx.rotate(heading);
        ctx.globalAlpha=tie.opacity;

        // Hexagon vertices (regular hexagon, flat top & bottom, points on sides)
        const hw=s*0.55;
        const hh=s*0.55;
        const hex=[
          {x:-hw*0.5, y:-hh},
          {x:hw*0.5,  y:-hh},
          {x:hw,      y:0},
          {x:hw*0.5,  y:hh},
          {x:-hw*0.5, y:hh},
          {x:-hw,     y:0}
        ];
        const hubR=s*0.1;

        // Draw filled hexagon — fully opaque solid dark body
        ctx.fillStyle='#0a0e14';
        ctx.strokeStyle='#2a3a4a';
        ctx.lineWidth=1.2;
        ctx.beginPath();
        ctx.moveTo(hex[0].x,hex[0].y);
        for(let i=1;i<6;i++) ctx.lineTo(hex[i].x,hex[i].y);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Solar panel sections between spokes — solid opaque fills
        for(let i=0;i<6;i++){
          const n=(i+1)%6;
          const midX=(hex[i].x+hex[n].x)/2;
          const midY=(hex[i].y+hex[n].y)/2;
          ctx.fillStyle=(i%2===0)?'#1e2830':'#19222a';
          ctx.beginPath();
          const spokeEndIx=hex[i].x*0.82, spokeEndIy=hex[i].y*0.82;
          const spokeEndNx=hex[n].x*0.82, spokeEndNy=hex[n].y*0.82;
          ctx.moveTo(spokeEndIx,spokeEndIy);
          ctx.lineTo(hex[i].x,hex[i].y);
          ctx.lineTo(midX,midY);
          ctx.lineTo(spokeEndNx,spokeEndNy);
          ctx.closePath();
          ctx.fill();
          // Inner panel (closer to hub)
          ctx.fillStyle=(i%2===0)?'#172028':'#1c2630';
          ctx.beginPath();
          const hubEdgeIx=hex[i].x*0.18, hubEdgeIy=hex[i].y*0.18;
          const hubEdgeNx=hex[n].x*0.18, hubEdgeNy=hex[n].y*0.18;
          ctx.moveTo(hubEdgeIx,hubEdgeIy);
          ctx.lineTo(spokeEndIx,spokeEndIy);
          ctx.lineTo(spokeEndNx,spokeEndNy);
          ctx.lineTo(hubEdgeNx,hubEdgeNy);
          ctx.closePath();
          ctx.fill();

          // Solar grid lines within panels
          ctx.strokeStyle='rgba(60,75,90,0.25)';
          ctx.lineWidth=0.3;
          for(let g=0.3;g<=0.7;g+=0.2){
            const gx1=hex[i].x*g, gy1=hex[i].y*g;
            const gx2=hex[n].x*g, gy2=hex[n].y*g;
            ctx.beginPath(); ctx.moveTo(gx1,gy1); ctx.lineTo(gx2,gy2); ctx.stroke();
          }
        }

        // 6 structural spokes
        ctx.strokeStyle='#3a4a5a';
        ctx.lineWidth=1;
        for(let i=0;i<6;i++){
          ctx.beginPath();
          ctx.moveTo(hex[i].x*0.15,hex[i].y*0.15);
          ctx.lineTo(hex[i].x,hex[i].y);
          ctx.stroke();
        }

        // Central circular hub
        ctx.fillStyle='#101820';
        ctx.strokeStyle='#3a4a5a';
        ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(0,0,hubR,0,Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#181f28';
        ctx.beginPath(); ctx.arc(0,0,hubR*0.5,0,Math.PI*2); ctx.fill();

        // Hex border re-stroke
        ctx.strokeStyle='#2a3a4a';
        ctx.lineWidth=1.2;
        ctx.beginPath();
        ctx.moveTo(hex[0].x,hex[0].y);
        for(let i=1;i<6;i++) ctx.lineTo(hex[i].x,hex[i].y);
        ctx.closePath(); ctx.stroke();

        // Engine glow
        const engineGlow=ctx.createRadialGradient(-d*hw*0.3,0,0,-d*hw*0.3,0,s*0.12);
        engineGlow.addColorStop(0,'rgba(100,140,255,0.3)');
        engineGlow.addColorStop(1,'transparent');
        ctx.fillStyle=engineGlow;
        ctx.beginPath(); ctx.arc(-d*hw*0.3,0,s*0.12,0,Math.PI*2); ctx.fill();

        ctx.globalAlpha=1;
        ctx.restore();
      });
      // Remove off-screen TIEs (cap at 8)
      for(let i=ties.length-1;i>=0;i--){
        if(ties[i].x<-100||ties[i].x>W+100||ties[i].y<-100||ties[i].y>H+100) ties.splice(i,1);
      }
      while(ties.length>8) ties.shift();
    }

    // --- X-Wing fighters chasing / being chased by TIEs ---
    const xwings=[];
    function spawnXWing(){
      // Try to spawn near an existing TIE for a chase scene
      let y,dir,speed;
      if(ties.length>0 && Math.random()>0.3){
        const target=ties[Math.floor(Math.random()*ties.length)];
        dir=target.dir;
        const chasing=Math.random()>0.4;
        const offset=chasing ? -dir*(40+Math.random()*60) : dir*(40+Math.random()*60);
        y=target.y + (Math.random()-0.5)*30;
        speed=3.5+Math.random()*3;
        const baseAngle1=dir>0?0:Math.PI;
        const wobble1=(Math.random()-0.5)*0.3;
        xwings.push({
          x: chasing ? (dir>0 ? -60 : W+60) : target.x+offset,
          y: Math.max(30,Math.min(H*0.55,y)),
          vx: Math.cos(baseAngle1+wobble1)*speed,
          vy: Math.sin(baseAngle1+wobble1)*speed,
          speed: speed,
          angle: baseAngle1+wobble1,
          targetAngle: baseAngle1+wobble1,
          baseAngle: baseAngle1,
          size: 14+Math.random()*10,
          opacity: 0.75+Math.random()*0.2,
          dir: dir,
          lasers: [],
          lastShot: 0,
          foilsOpen: true,
          nextTurn: 1.5+Math.random()*2.5,
          turnTimer: 0
        });
      } else {
        const fromLeft=Math.random()>0.5;
        dir=fromLeft?1:-1;
        speed=3.5+Math.random()*3;
        const baseAngle2=fromLeft?0:Math.PI;
        const wobble2=(Math.random()-0.5)*0.3;
        xwings.push({
          x: fromLeft?-60:W+60,
          y: 40+Math.random()*(H*0.5),
          vx: Math.cos(baseAngle2+wobble2)*speed,
          vy: Math.sin(baseAngle2+wobble2)*speed,
          speed: speed,
          angle: baseAngle2+wobble2,
          targetAngle: baseAngle2+wobble2,
          baseAngle: baseAngle2,
          size: 14+Math.random()*10,
          opacity: 0.75+Math.random()*0.2,
          dir: dir,
          lasers: [],
          lastShot: 0,
          foilsOpen: true,
          nextTurn: 1.5+Math.random()*2.5,
          turnTimer: 0
        });
      }
    }
    function drawXWing(t){
      xwings.forEach(xw=>{
        // Smooth mid-flight direction change
        xw.turnTimer+=(1/60);
        if(xw.turnTimer>=xw.nextTurn){
          xw.turnTimer=0;
          xw.nextTurn=1.5+Math.random()*3.5;
          xw.targetAngle=xw.baseAngle+(Math.random()-0.5)*0.8;
        }
        // Lerp current angle toward target for smooth banking
        xw.angle+=(xw.targetAngle-xw.angle)*0.04;
        xw.vx=Math.cos(xw.angle)*xw.speed;
        xw.vy=Math.sin(xw.angle)*xw.speed;
        xw.x+=xw.vx;
        xw.y+=xw.vy;
        // Keep in vertical bounds with smooth bounce
        if(xw.y<20){ xw.y=20; if(xw.vy<0) xw.targetAngle=xw.baseAngle+Math.abs(xw.targetAngle-xw.baseAngle)*0.5; }
        if(xw.y>H*0.6){ xw.y=H*0.6; if(xw.vy>0) xw.targetAngle=xw.baseAngle-Math.abs(xw.targetAngle-xw.baseAngle)*0.5; }
        const s=xw.size;
        const d=xw.dir;
        const heading=Math.atan2(xw.vy||0,xw.vx);

        // --- Red laser bolts drawn FIRST (behind the ship) ---
        if(t-xw.lastShot > 3+Math.random()*3){
          xw.lastShot=t;
          const spread=xw.foilsOpen ? s*0.35 : s*0.08;
          const lSpeed=9;
          const cosH=Math.cos(heading), sinH=Math.sin(heading);
          xw.lasers.push({ x:xw.x+cosH*s*0.9, y:xw.y+sinH*s*0.9-spread, vx:cosH*lSpeed, vy:sinH*lSpeed });
          xw.lasers.push({ x:xw.x+cosH*s*0.9, y:xw.y+sinH*s*0.9+spread, vx:cosH*lSpeed, vy:sinH*lSpeed });
        }
        xw.lasers.forEach(l=>{
          l.x+=l.vx; l.y+=l.vy||0;
          const trailLen=35;
          const ldir=Math.atan2(l.vy||0,l.vx);
          const tdx=-Math.cos(ldir)*trailLen, tdy=-Math.sin(ldir)*trailLen;
          // Outer glow trail
          ctx.strokeStyle='rgba(255,50,50,0.15)';
          ctx.lineWidth=3.5;
          ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(l.x+tdx,l.y+tdy); ctx.stroke();
          // Core trail
          ctx.strokeStyle='rgba(255,50,50,0.5)';
          ctx.lineWidth=1.2;
          ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(l.x+tdx,l.y+tdy); ctx.stroke();
          // Bright tip
          ctx.strokeStyle='#ffaaaa';
          ctx.lineWidth=0.8;
          const sdx=-Math.cos(ldir)*3, sdy=-Math.sin(ldir)*3;
          ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(l.x+sdx,l.y+sdy); ctx.stroke();
        });
        for(let i=xw.lasers.length-1;i>=0;i--){
          const lb=xw.lasers[i];
          if(lb.x<-80||lb.x>W+80||lb.y<-80||lb.y>H+80) xw.lasers.splice(i,1);
        }
        if(xw.lasers.length>8) xw.lasers.splice(0,xw.lasers.length-8);

        // --- X-Wing body drawn ON TOP of lasers ---
        ctx.save();
        ctx.translate(xw.x,xw.y);
        // Rotate relative to flight direction; body is drawn pointing right
        const bankAngle=xw.angle-xw.baseAngle; // deviation from straight flight
        if(d<0){
          ctx.scale(-1,1);
          ctx.rotate(-bankAngle);
        } else {
          ctx.rotate(bankAngle);
        }
        ctx.globalAlpha=xw.opacity;

        // Engine exhaust glow (rear)
        const exGlow=ctx.createRadialGradient(-s*0.55,0,0,-s*0.55,0,s*0.18);
        exGlow.addColorStop(0,'rgba(255,140,60,0.5)');
        exGlow.addColorStop(0.5,'rgba(255,100,30,0.2)');
        exGlow.addColorStop(1,'transparent');
        ctx.fillStyle=exGlow;
        ctx.beginPath(); ctx.arc(-s*0.55,0,s*0.18,0,Math.PI*2); ctx.fill();

        // S-foils (wings) with laser cannon barrels
        const foilSpread=xw.foilsOpen ? s*0.22 : s*0.08;

        // Upper S-foils (2 wings)
        ctx.fillStyle='#b8b8b8';
        ctx.strokeStyle='#666';
        ctx.lineWidth=0.6;
        // Upper-top wing
        ctx.beginPath();
        ctx.moveTo(-s*0.2, -foilSpread-s*0.06);
        ctx.lineTo(s*0.15, -foilSpread-s*0.06);
        ctx.lineTo(s*0.2, -foilSpread-s*0.02);
        ctx.lineTo(s*0.2, -foilSpread+s*0.02);
        ctx.lineTo(s*0.15, -foilSpread+s*0.02);
        ctx.lineTo(-s*0.2, -foilSpread+s*0.02);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Upper-bottom wing
        ctx.beginPath();
        ctx.moveTo(-s*0.2, -foilSpread+s*0.04);
        ctx.lineTo(s*0.15, -foilSpread+s*0.04);
        ctx.lineTo(s*0.2, -foilSpread+s*0.08);
        ctx.lineTo(s*0.2, -foilSpread+s*0.12);
        ctx.lineTo(s*0.15, -foilSpread+s*0.12);
        ctx.lineTo(-s*0.2, -foilSpread+s*0.1);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Lower S-foils (mirrored)
        ctx.beginPath();
        ctx.moveTo(-s*0.2, foilSpread+s*0.06);
        ctx.lineTo(s*0.15, foilSpread+s*0.06);
        ctx.lineTo(s*0.2, foilSpread+s*0.02);
        ctx.lineTo(s*0.2, foilSpread-s*0.02);
        ctx.lineTo(s*0.15, foilSpread-s*0.02);
        ctx.lineTo(-s*0.2, foilSpread-s*0.02);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s*0.2, foilSpread-s*0.04);
        ctx.lineTo(s*0.15, foilSpread-s*0.04);
        ctx.lineTo(s*0.2, foilSpread-s*0.08);
        ctx.lineTo(s*0.2, foilSpread-s*0.12);
        ctx.lineTo(s*0.15, foilSpread-s*0.12);
        ctx.lineTo(-s*0.2, foilSpread-s*0.1);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Laser cannon barrels (side view: 1 per wing, top and bottom)
        ctx.strokeStyle='#999';
        ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(s*0.2,-foilSpread); ctx.lineTo(s*0.85,-foilSpread); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s*0.2,foilSpread); ctx.lineTo(s*0.85,foilSpread); ctx.stroke();
        // Cannon tips (red dots)
        ctx.fillStyle='#cc3333';
        [[-foilSpread],[foilSpread]].forEach(([cy])=>{
          ctx.beginPath(); ctx.arc(s*0.85,cy,1,0,Math.PI*2); ctx.fill();
        });

        // Fuselage (long narrow snub nose body)
        ctx.fillStyle='#c0c0c0';
        ctx.strokeStyle='#777';
        ctx.lineWidth=0.8;
        ctx.beginPath();
        ctx.moveTo(s*0.65, -s*0.04);  // nose taper start
        ctx.lineTo(s*0.8, 0);          // nose tip
        ctx.lineTo(s*0.65, s*0.04);
        ctx.lineTo(-s*0.15, s*0.08);   // rear body width
        ctx.lineTo(-s*0.15, -s*0.08);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Cockpit canopy (transparisteel)
        ctx.fillStyle='rgba(100,180,255,0.4)';
        ctx.strokeStyle='#6ab8e0';
        ctx.lineWidth=0.5;
        ctx.beginPath();
        ctx.moveTo(s*0.3,-s*0.04);
        ctx.lineTo(s*0.5,-s*0.025);
        ctx.lineTo(s*0.5,s*0.025);
        ctx.lineTo(s*0.3,s*0.04);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Engine cluster (rear cylindrical pods)
        ctx.fillStyle='#888';
        ctx.strokeStyle='#555';
        ctx.lineWidth=0.5;
        // Top engine pair
        ctx.beginPath();
        ctx.moveTo(-s*0.15,-s*0.07); ctx.lineTo(-s*0.45,-s*0.09);
        ctx.lineTo(-s*0.45,-s*0.03); ctx.lineTo(-s*0.15,-s*0.01);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Bottom engine pair
        ctx.beginPath();
        ctx.moveTo(-s*0.15,s*0.07); ctx.lineTo(-s*0.45,s*0.09);
        ctx.lineTo(-s*0.45,s*0.03); ctx.lineTo(-s*0.15,s*0.01);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Engine nozzle glow
        ctx.fillStyle='rgba(255,120,40,0.7)';
        ctx.beginPath(); ctx.arc(-s*0.45,-s*0.06,s*0.025,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(-s*0.45,s*0.06,s*0.025,0,Math.PI*2); ctx.fill();

        // Astromech droid (R2 dome behind cockpit)
        ctx.fillStyle='#e0e0e0';
        ctx.beginPath(); ctx.arc(s*0.22,-s*0.09,s*0.035,Math.PI,0); ctx.fill();
        ctx.fillStyle='#4488cc';
        ctx.beginPath(); ctx.arc(s*0.22,-s*0.095,s*0.02,Math.PI*1.2,Math.PI*1.8); ctx.fill();

        // Red stripe accent (Rebel insignia stripe on fuselage)
        ctx.strokeStyle='rgba(200,50,30,0.6)';
        ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(s*0.1,-s*0.065); ctx.lineTo(s*0.55,-s*0.035); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s*0.1,s*0.065); ctx.lineTo(s*0.55,s*0.035); ctx.stroke();

        ctx.globalAlpha=1;
        ctx.restore();
      });
      // Remove off-screen X-wings (cap at 6)
      for(let i=xwings.length-1;i>=0;i--){
        if(xwings[i].x<-120||xwings[i].x>W+120||xwings[i].y<-120||xwings[i].y>H+120) xwings.splice(i,1);
      }
      while(xwings.length>6) xwings.shift();
    }

    // --- Endor's Forest Moon (mostly green with some water) ---
    function drawPlanet(){
      const px=W*0.12, py=H*0.7, pr=Math.min(W,H)*0.06;

      // Atmospheric glow (green-tinted haze)
      const atmo=ctx.createRadialGradient(px,py,pr*0.85,px,py,pr*2);
      atmo.addColorStop(0,'rgba(60,140,80,0.08)');
      atmo.addColorStop(0.4,'rgba(40,100,60,0.03)');
      atmo.addColorStop(1,'transparent');
      ctx.fillStyle=atmo;
      ctx.beginPath(); ctx.arc(px,py,pr*2,0,Math.PI*2); ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.clip();

      // Forest base (deep green gradient covering most of the surface)
      const forest=ctx.createRadialGradient(px-pr*0.3,py-pr*0.25,pr*0.05,px+pr*0.1,py+pr*0.1,pr*1.1);
      forest.addColorStop(0,'#2a5a28');
      forest.addColorStop(0.3,'#1e4a1e');
      forest.addColorStop(0.6,'#164016');
      forest.addColorStop(1,'#0e2e0e');
      ctx.fillStyle=forest;
      ctx.fillRect(px-pr,py-pr,pr*2,pr*2);

      // === VARIED FOREST REGIONS (different greens for depth) ===
      // Dense old-growth forest patches (darker)
      ctx.fillStyle='#143818';
      ctx.beginPath();
      ctx.moveTo(px-pr*0.6,py-pr*0.3);
      ctx.quadraticCurveTo(px-pr*0.4,py-pr*0.5,px-pr*0.1,py-pr*0.4);
      ctx.quadraticCurveTo(px+pr*0.1,py-pr*0.3,px-pr*0.05,py-pr*0.15);
      ctx.quadraticCurveTo(px-pr*0.35,py-pr*0.1,px-pr*0.6,py-pr*0.3);
      ctx.fill();

      // Lighter canopy (sunlit forest)
      ctx.fillStyle='#2e6a2a';
      ctx.beginPath();
      ctx.moveTo(px+pr*0.1,py-pr*0.6);
      ctx.quadraticCurveTo(px+pr*0.4,py-pr*0.7,px+pr*0.55,py-pr*0.45);
      ctx.quadraticCurveTo(px+pr*0.5,py-pr*0.2,px+pr*0.25,py-pr*0.25);
      ctx.quadraticCurveTo(px+pr*0.05,py-pr*0.35,px+pr*0.1,py-pr*0.6);
      ctx.fill();

      // Tropical/bright forest
      ctx.fillStyle='#3a7a35';
      ctx.beginPath();
      ctx.moveTo(px-pr*0.2,py+pr*0.15);
      ctx.quadraticCurveTo(px+pr*0.05,py+pr*0.05,px+pr*0.2,py+pr*0.2);
      ctx.quadraticCurveTo(px+pr*0.15,py+pr*0.45,px-pr*0.1,py+pr*0.5);
      ctx.quadraticCurveTo(px-pr*0.3,py+pr*0.35,px-pr*0.2,py+pr*0.15);
      ctx.fill();

      // Mossy highlands
      ctx.fillStyle='#2a5530';
      ctx.beginPath();
      ctx.moveTo(px-pr*0.35,py+pr*0.4);
      ctx.quadraticCurveTo(px-pr*0.5,py+pr*0.6,px-pr*0.2,py+pr*0.75);
      ctx.quadraticCurveTo(px+pr*0.05,py+pr*0.7,px+pr*0.1,py+pr*0.55);
      ctx.quadraticCurveTo(px-pr*0.1,py+pr*0.4,px-pr*0.35,py+pr*0.4);
      ctx.fill();

      // Northern forest belt
      ctx.fillStyle='#1e5020';
      ctx.beginPath();
      ctx.moveTo(px-pr*0.5,py-pr*0.6);
      ctx.quadraticCurveTo(px-pr*0.2,py-pr*0.75,px+pr*0.15,py-pr*0.7);
      ctx.quadraticCurveTo(px+pr*0.05,py-pr*0.55,px-pr*0.2,py-pr*0.5);
      ctx.quadraticCurveTo(px-pr*0.45,py-pr*0.5,px-pr*0.5,py-pr*0.6);
      ctx.fill();

      // === LAKES & RIVERS (scattered blue water bodies) ===
      // Large lake
      ctx.fillStyle='#1a4068';
      ctx.beginPath();
      ctx.ellipse(px+pr*0.35,py+pr*0.1,pr*0.12,pr*0.08,0.4,0,Math.PI*2);
      ctx.fill();
      // Lake highlight
      ctx.fillStyle='rgba(60,120,180,0.3)';
      ctx.beginPath();
      ctx.ellipse(px+pr*0.33,py+pr*0.08,pr*0.06,pr*0.03,0.4,0,Math.PI*2);
      ctx.fill();

      // Medium lake
      ctx.fillStyle='#1a3d62';
      ctx.beginPath();
      ctx.ellipse(px-pr*0.4,py+pr*0.05,pr*0.08,pr*0.06,-0.3,0,Math.PI*2);
      ctx.fill();

      // Small northern lake
      ctx.fillStyle='#1e4570';
      ctx.beginPath();
      ctx.ellipse(px-pr*0.1,py-pr*0.55,pr*0.06,pr*0.04,0.2,0,Math.PI*2);
      ctx.fill();

      // River running through southern forest
      ctx.strokeStyle='#1a3d62';
      ctx.lineWidth=pr*0.025;
      ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(px+pr*0.3,py+pr*0.15);
      ctx.quadraticCurveTo(px+pr*0.15,py+pr*0.3,px-pr*0.05,py+pr*0.4);
      ctx.quadraticCurveTo(px-pr*0.2,py+pr*0.55,px-pr*0.15,py+pr*0.7);
      ctx.stroke();

      // Small pond
      ctx.fillStyle='#1e4268';
      ctx.beginPath(); ctx.arc(px+pr*0.5,py-pr*0.3,pr*0.04,0,Math.PI*2); ctx.fill();

      // === BROWN TERRAIN (clearings, Ewok village areas) ===
      ctx.fillStyle='#4a4030';
      ctx.beginPath();
      ctx.ellipse(px+pr*0.15,py-pr*0.1,pr*0.07,pr*0.05,0.5,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#524838';
      ctx.beginPath();
      ctx.ellipse(px-pr*0.25,py+pr*0.55,pr*0.05,pr*0.04,-0.3,0,Math.PI*2);
      ctx.fill();

      // === CLOUD COVER (thin wisps over the forest) ===
      ctx.fillStyle='rgba(220,235,220,0.1)';
      ctx.beginPath();
      ctx.ellipse(px-pr*0.15,py-pr*0.2,pr*0.28,pr*0.04,0.3,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='rgba(215,230,215,0.08)';
      ctx.beginPath();
      ctx.ellipse(px+pr*0.25,py+pr*0.35,pr*0.22,pr*0.035,-0.4,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='rgba(225,240,225,0.07)';
      ctx.beginPath();
      ctx.ellipse(px+pr*0.05,py-pr*0.65,pr*0.18,pr*0.03,0.5,0,Math.PI*2);
      ctx.fill();

      ctx.restore(); // End clip

      // === ATMOSPHERE RIM (green-tinted thin line) ===
      ctx.strokeStyle='rgba(60,160,80,0.15)';
      ctx.lineWidth=pr*0.04;
      ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.stroke();

      // Atmospheric edge glow (sunlit side)
      ctx.save();
      ctx.beginPath(); ctx.arc(px,py,pr+pr*0.02,0,Math.PI*2); ctx.clip();
      const atmoRim=ctx.createRadialGradient(px-pr*0.5,py-pr*0.4,pr*0.3,px,py,pr*1.05);
      atmoRim.addColorStop(0,'rgba(80,180,100,0.12)');
      atmoRim.addColorStop(0.5,'rgba(50,140,70,0.04)');
      atmoRim.addColorStop(1,'transparent');
      ctx.fillStyle=atmoRim;
      ctx.beginPath(); ctx.arc(px,py,pr*1.02,0,Math.PI*2); ctx.fill();
      ctx.restore();

      // Light-side highlight
      ctx.save();
      ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.clip();
      const highlight=ctx.createRadialGradient(px-pr*0.5,py-pr*0.4,pr*0.05,px,py,pr);
      highlight.addColorStop(0,'rgba(180,220,180,0.1)');
      highlight.addColorStop(0.3,'rgba(140,180,140,0.04)');
      highlight.addColorStop(0.6,'transparent');
      ctx.fillStyle=highlight;
      ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fill();

      // Dark-side shadow (terminator)
      const shadow=ctx.createRadialGradient(px+pr*0.5,py+pr*0.4,pr*0.1,px+pr*0.3,py+pr*0.3,pr*1.2);
      shadow.addColorStop(0,'rgba(0,0,0,0.25)');
      shadow.addColorStop(0.5,'rgba(0,0,0,0.12)');
      shadow.addColorStop(1,'transparent');
      ctx.fillStyle=shadow;
      ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // --- Death Star (upper-right area of the sky) — FULL DETAIL ---
    function drawDeathStar(){
      const dx=W*0.85, dy=H*0.18, dr=Math.min(W,H)*0.0675;

      // Ambient glow (greenish tint for ominous feel)
      const dg=ctx.createRadialGradient(dx,dy,dr*0.3,dx,dy,dr*3.5);
      dg.addColorStop(0,'rgba(140,160,150,0.07)');
      dg.addColorStop(0.5,'rgba(100,120,110,0.03)');
      dg.addColorStop(1,'transparent');
      ctx.fillStyle=dg;
      ctx.beginPath(); ctx.arc(dx,dy,dr*3.5,0,Math.PI*2); ctx.fill();

      ctx.save();
      // Clip to sphere for all interior detail
      ctx.beginPath(); ctx.arc(dx,dy,dr,0,Math.PI*2); ctx.clip();

      // Main body — metallic grey sphere with better shading
      const body=ctx.createRadialGradient(dx-dr*0.3,dy-dr*0.3,dr*0.05,dx+dr*0.2,dy+dr*0.2,dr*1.1);
      body.addColorStop(0,'#7a7e82');
      body.addColorStop(0.25,'#5a5e62');
      body.addColorStop(0.5,'#4a4e52');
      body.addColorStop(0.75,'#2a2e32');
      body.addColorStop(1,'#12161a');
      ctx.fillStyle=body;
      ctx.fillRect(dx-dr,dy-dr,dr*2,dr*2);

      // === SURFACE PANEL GRID (dense, clipped to sphere) ===
      // Horizontal latitude lines (many for surface detail)
      ctx.strokeStyle='rgba(25,28,32,0.5)';
      ctx.lineWidth=dr*0.015;
      for(let lat=-0.85;lat<=0.85;lat+=0.14){
        const ly=dy+lat*dr;
        const halfW=Math.sqrt(Math.max(0,dr*dr-(lat*dr)*(lat*dr)));
        ctx.beginPath(); ctx.moveTo(dx-halfW,ly); ctx.lineTo(dx+halfW,ly); ctx.stroke();
      }

      // Vertical longitude lines (curved to follow sphere surface)
      ctx.strokeStyle='rgba(25,28,32,0.35)';
      ctx.lineWidth=dr*0.012;
      for(let lon=-0.7;lon<=0.7;lon+=0.18){
        ctx.beginPath();
        for(let t2=-0.9;t2<=0.9;t2+=0.05){
          const px2=dx+lon*dr*Math.cos(t2*Math.PI/2);
          const py2=dy+t2*dr;
          if(t2===-0.9) ctx.moveTo(px2,py2); else ctx.lineTo(px2,py2);
        }
        ctx.stroke();
      }

      // === EQUATORIAL TRENCH (prominent dark channel) ===
      // Trench shadow
      ctx.fillStyle='rgba(8,10,14,0.7)';
      ctx.fillRect(dx-dr,dy-dr*0.035,dr*2,dr*0.07);
      // Trench top edge
      ctx.strokeStyle='#3a3e42';
      ctx.lineWidth=dr*0.015;
      ctx.beginPath(); ctx.moveTo(dx-dr,dy-dr*0.035); ctx.lineTo(dx+dr,dy-dr*0.035); ctx.stroke();
      // Trench bottom edge
      ctx.beginPath(); ctx.moveTo(dx-dr,dy+dr*0.035); ctx.lineTo(dx+dr,dy+dr*0.035); ctx.stroke();
      // Trench interior detail (docking bays / tiny structures)
      ctx.fillStyle='rgba(50,55,60,0.4)';
      for(let tx=-0.8;tx<=0.8;tx+=0.12){
        const bx=dx+tx*dr;
        ctx.fillRect(bx,dy-dr*0.02,dr*0.04,dr*0.04);
      }
      // Trench lighting (tiny dots along trench)
      ctx.fillStyle='rgba(200,210,220,0.15)';
      for(let tx=-0.75;tx<=0.75;tx+=0.08){
        ctx.beginPath(); ctx.arc(dx+tx*dr,dy,dr*0.006,0,Math.PI*2); ctx.fill();
      }

      // === SECONDARY TRENCHES (thinner) ===
      ctx.strokeStyle='rgba(20,22,26,0.4)';
      ctx.lineWidth=dr*0.02;
      // Northern hemisphere trench
      ctx.beginPath(); ctx.moveTo(dx-dr*0.92,dy-dr*0.38); ctx.lineTo(dx+dr*0.92,dy-dr*0.38); ctx.stroke();
      // Southern hemisphere trench 
      ctx.beginPath(); ctx.moveTo(dx-dr*0.92,dy+dr*0.38); ctx.lineTo(dx+dr*0.92,dy+dr*0.38); ctx.stroke();
      // Additional thinner lines
      ctx.lineWidth=dr*0.01;
      ctx.beginPath(); ctx.moveTo(dx-dr*0.8,dy-dr*0.65); ctx.lineTo(dx+dr*0.8,dy-dr*0.65); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dx-dr*0.8,dy+dr*0.65); ctx.lineTo(dx+dr*0.8,dy+dr*0.65); ctx.stroke();

      // === SURFACE TEXTURE (random panel clusters / structures) ===
      // Small raised panels scattered on the surface
      ctx.fillStyle='rgba(55,60,65,0.3)';
      const panelSeed=[
        {x:0.3,y:-0.5,w:0.08,h:0.05},{x:-0.4,y:-0.2,w:0.06,h:0.04},
        {x:0.5,y:0.4,w:0.07,h:0.05},{x:-0.2,y:0.55,w:0.05,h:0.04},
        {x:0.1,y:-0.7,w:0.06,h:0.03},{x:-0.5,y:0.2,w:0.04,h:0.06},
        {x:0.4,y:-0.15,w:0.05,h:0.03},{x:-0.3,y:0.7,w:0.05,h:0.03},
        {x:0.6,y:0.15,w:0.04,h:0.05},{x:-0.6,y:-0.45,w:0.05,h:0.04},
        {x:0.15,y:0.25,w:0.06,h:0.04},{x:-0.15,y:-0.55,w:0.04,h:0.03}
      ];
      panelSeed.forEach(p=>{
        ctx.fillRect(dx+p.x*dr,dy+p.y*dr,p.w*dr,p.h*dr);
        // Panel highlight edge
        ctx.strokeStyle='rgba(70,75,80,0.25)';
        ctx.lineWidth=0.5;
        ctx.strokeRect(dx+p.x*dr,dy+p.y*dr,p.w*dr,p.h*dr);
      });

      // Tiny lit windows / structures (scattered bright dots)
      ctx.fillStyle='rgba(180,190,200,0.12)';
      const dotSeed=[
        {x:0.2,y:-0.4},{x:-0.3,y:-0.6},{x:0.5,y:0.2},{x:-0.5,y:0.5},
        {x:0.35,y:0.6},{x:-0.1,y:-0.15},{x:0.6,y:-0.3},{x:-0.6,y:0.1},
        {x:0.1,y:0.45},{x:-0.4,y:-0.35},{x:0.45,y:-0.55},{x:-0.2,y:0.3},
        {x:0.25,y:0.15},{x:-0.55,y:-0.15},{x:0.3,y:-0.7},{x:-0.35,y:0.65}
      ];
      dotSeed.forEach(d=>{
        ctx.beginPath(); ctx.arc(dx+d.x*dr,dy+d.y*dr,dr*0.008,0,Math.PI*2); ctx.fill();
      });

      // === SUPERLASER DISH (concave focus dish) ===
      const dishX=dx-dr*0.25, dishY=dy-dr*0.3, dishR=dr*0.28;
      
      // Dish outer ring shadow
      const dishShadow=ctx.createRadialGradient(dishX,dishY,dishR*0.7,dishX,dishY,dishR*1.1);
      dishShadow.addColorStop(0,'transparent');
      dishShadow.addColorStop(0.8,'rgba(0,0,0,0.15)');
      dishShadow.addColorStop(1,'transparent');
      ctx.fillStyle=dishShadow;
      ctx.beginPath(); ctx.arc(dishX,dishY,dishR*1.1,0,Math.PI*2); ctx.fill();

      // Dish depression (deeper, more contrast)
      const dish=ctx.createRadialGradient(dishX,dishY,dishR*0.05,dishX,dishY,dishR);
      dish.addColorStop(0,'#1a1c20');
      dish.addColorStop(0.3,'#252830');
      dish.addColorStop(0.6,'#353840');
      dish.addColorStop(0.85,'#454850');
      dish.addColorStop(1,'#555860');
      ctx.fillStyle=dish;
      ctx.beginPath(); ctx.arc(dishX,dishY,dishR,0,Math.PI*2); ctx.fill();

      // Dish concentric targeting rings
      ctx.strokeStyle='rgba(70,75,80,0.4)';
      ctx.lineWidth=0.8;
      for(let r=0.3;r<=0.9;r+=0.2){
        ctx.beginPath(); ctx.arc(dishX,dishY,dishR*r,0,Math.PI*2); ctx.stroke();
      }

      // Dish radial spokes (8 spokes converging to center)
      ctx.strokeStyle='rgba(60,65,70,0.35)';
      ctx.lineWidth=0.6;
      for(let a=0;a<Math.PI*2;a+=Math.PI/4){
        ctx.beginPath();
        ctx.moveTo(dishX+Math.cos(a)*dishR*0.15,dishY+Math.sin(a)*dishR*0.15);
        ctx.lineTo(dishX+Math.cos(a)*dishR*0.95,dishY+Math.sin(a)*dishR*0.95);
        ctx.stroke();
      }

      // Dish rim (outer ring, bright edge)
      ctx.strokeStyle='rgba(90,95,100,0.6)';
      ctx.lineWidth=dr*0.025;
      ctx.beginPath(); ctx.arc(dishX,dishY,dishR,0,Math.PI*2); ctx.stroke();

      // Dish focus emitter (central point with subtle glow)
      const emitterGlow=ctx.createRadialGradient(dishX,dishY,0,dishX,dishY,dishR*0.15);
      emitterGlow.addColorStop(0,'rgba(160,255,180,0.15)');
      emitterGlow.addColorStop(0.5,'rgba(100,180,120,0.06)');
      emitterGlow.addColorStop(1,'transparent');
      ctx.fillStyle=emitterGlow;
      ctx.beginPath(); ctx.arc(dishX,dishY,dishR*0.15,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(120,130,140,0.8)';
      ctx.beginPath(); ctx.arc(dishX,dishY,dishR*0.06,0,Math.PI*2); ctx.fill();

      ctx.restore(); // End clip

      // === SPHERE EDGE (outside clip) ===
      // Outer rim stroke
      ctx.strokeStyle='rgba(60,65,70,0.5)';
      ctx.lineWidth=dr*0.02;
      ctx.beginPath(); ctx.arc(dx,dy,dr,0,Math.PI*2); ctx.stroke();

      // Edge highlight (light from upper-left)
      ctx.save();
      ctx.beginPath(); ctx.arc(dx,dy,dr+1,0,Math.PI*2); ctx.clip();
      const rim=ctx.createRadialGradient(dx-dr*0.6,dy-dr*0.5,dr*0.05,dx,dy,dr*1.05);
      rim.addColorStop(0,'rgba(220,225,230,0.12)');
      rim.addColorStop(0.3,'rgba(180,185,190,0.05)');
      rim.addColorStop(0.6,'transparent');
      rim.addColorStop(1,'transparent');
      ctx.fillStyle=rim;
      ctx.beginPath(); ctx.arc(dx,dy,dr,0,Math.PI*2); ctx.fill();
      ctx.restore();

      // Shadow on the right/bottom edge (terminator line)
      ctx.save();
      ctx.beginPath(); ctx.arc(dx,dy,dr,0,Math.PI*2); ctx.clip();
      const shadow=ctx.createRadialGradient(dx+dr*0.5,dy+dr*0.4,dr*0.1,dx+dr*0.3,dy+dr*0.3,dr*1.2);
      shadow.addColorStop(0,'rgba(0,0,0,0.2)');
      shadow.addColorStop(0.5,'rgba(0,0,0,0.1)');
      shadow.addColorStop(1,'transparent');
      ctx.fillStyle=shadow;
      ctx.beginPath(); ctx.arc(dx,dy,dr,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // --- Explosion particles ---
    const explosions=[];
    function spawnExplosion(x,y,color){
      const count=6+Math.floor(Math.random()*6);
      for(let i=0;i<count;i++){
        const ang=Math.random()*Math.PI*2;
        const spd=1+Math.random()*3;
        explosions.push({
          x,y,
          vx:Math.cos(ang)*spd,
          vy:Math.sin(ang)*spd,
          life:1,
          decay:0.015+Math.random()*0.02,
          size:1.5+Math.random()*2.5,
          color
        });
      }
    }
    function spawnDestructionExplosion(x,y,shipSize){
      // Big bright flash at center
      explosions.push({
        x,y,vx:0,vy:0,
        life:1, decay:0.035,
        size:shipSize*0.7,
        color:'#fff'
      });
      // Fireball core (orange/yellow)
      const coreCount=10+Math.floor(Math.random()*6);
      for(let i=0;i<coreCount;i++){
        const ang=Math.random()*Math.PI*2;
        const spd=0.5+Math.random()*2;
        explosions.push({
          x:x+(Math.random()-0.5)*shipSize*0.3,
          y:y+(Math.random()-0.5)*shipSize*0.3,
          vx:Math.cos(ang)*spd,
          vy:Math.sin(ang)*spd,
          life:1, decay:0.012+Math.random()*0.015,
          size:3+Math.random()*4,
          color: Math.random()>0.5?'#ff8800':'#ffcc00'
        });
      }
      // Outer debris (fast-moving sparks)
      const debrisCount=12+Math.floor(Math.random()*8);
      for(let i=0;i<debrisCount;i++){
        const ang=Math.random()*Math.PI*2;
        const spd=2+Math.random()*5;
        explosions.push({
          x,y,
          vx:Math.cos(ang)*spd,
          vy:Math.sin(ang)*spd,
          life:1, decay:0.01+Math.random()*0.018,
          size:1+Math.random()*2.5,
          color: ['#ff4400','#ff6600','#ffaa00','#ff2200','#aaaaaa'][Math.floor(Math.random()*5)]
        });
      }
      // Smoke puffs (slower, darker, linger longer)
      const smokeCount=6+Math.floor(Math.random()*4);
      for(let i=0;i<smokeCount;i++){
        const ang=Math.random()*Math.PI*2;
        const spd=0.3+Math.random()*1.2;
        explosions.push({
          x:x+(Math.random()-0.5)*shipSize*0.4,
          y:y+(Math.random()-0.5)*shipSize*0.4,
          vx:Math.cos(ang)*spd,
          vy:Math.sin(ang)*spd,
          life:1, decay:0.006+Math.random()*0.008,
          size:4+Math.random()*5,
          color:'rgba(80,60,40,0.7)'
        });
      }
    }
    function drawExplosions(){
      // Cap explosion particles
      while(explosions.length>80) explosions.shift();
      for(let i=explosions.length-1;i>=0;i--){
        const p=explosions[i];
        p.x+=p.vx; p.y+=p.vy;
        p.vx*=0.96; p.vy*=0.96;
        p.life-=p.decay;
        if(p.life<=0){ explosions.splice(i,1); continue; }
        ctx.globalAlpha=p.life*0.8;
        // Draw glow as larger faint circle + smaller bright core (no shadowBlur)
        ctx.fillStyle=p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.life*1.8,0,Math.PI*2);
        ctx.globalAlpha=p.life*0.2;
        ctx.fill();
        ctx.globalAlpha=p.life*0.8;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=1;
      }
    }

    // --- Engine exhaust trails ---
    function drawExhaustTrails(){
      // TIE exhaust (no shadowBlur — use layered circles)
      ties.forEach(tie=>{
        if(!tie.trail) tie.trail=[];
        const heading=Math.atan2(tie.vy,tie.vx);
        tie.trail.push({x:tie.x-Math.cos(heading)*tie.size*0.4, y:tie.y-Math.sin(heading)*tie.size*0.4, life:1});
        if(tie.trail.length>12) tie.trail.shift();
        for(let i=0;i<tie.trail.length;i++){
          const pt=tie.trail[i];
          pt.life-=0.08;
          if(pt.life<=0){ tie.trail.splice(i,1); i--; continue; }
          const a=pt.life*0.35*tie.opacity;
          ctx.fillStyle='rgba(68,136,255,'+a+')';
          ctx.beginPath(); ctx.arc(pt.x,pt.y,2.5*pt.life,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='rgba(140,190,255,'+(a*0.6)+')';
          ctx.beginPath(); ctx.arc(pt.x,pt.y,1.2*pt.life,0,Math.PI*2); ctx.fill();
        }
      });
      // X-wing exhaust (dual engines, no shadowBlur)
      xwings.forEach(xw=>{
        if(!xw.trail) xw.trail=[];
        const heading=Math.atan2(xw.vy,xw.vx);
        const perpX=-Math.sin(heading)*xw.size*0.06;
        const perpY=Math.cos(heading)*xw.size*0.06;
        const rearX=xw.x-Math.cos(heading)*xw.size*0.45;
        const rearY=xw.y-Math.sin(heading)*xw.size*0.45;
        xw.trail.push({x:rearX+perpX, y:rearY+perpY, life:1});
        xw.trail.push({x:rearX-perpX, y:rearY-perpY, life:1});
        if(xw.trail.length>20) xw.trail.splice(0,2);
        for(let i=0;i<xw.trail.length;i++){
          const pt=xw.trail[i];
          pt.life-=0.08;
          if(pt.life<=0){ xw.trail.splice(i,1); i--; continue; }
          const a=pt.life*0.4*xw.opacity;
          ctx.fillStyle='rgba(255,136,48,'+a+')';
          ctx.beginPath(); ctx.arc(pt.x,pt.y,2*pt.life,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='rgba(255,200,100,'+(a*0.5)+')';
          ctx.beginPath(); ctx.arc(pt.x,pt.y,0.8*pt.life,0,Math.PI*2); ctx.fill();
        }
      });
    }

    // --- Laser-hit detection (destroy fighters on hit) ---
    function checkLaserHits(){
      // Green TIE lasers vs X-wings (squared distance, no sqrt)
      for(let t=ties.length-1;t>=0;t--){
        const tie=ties[t];
        for(let i=tie.lasers.length-1;i>=0;i--){
          const l=tie.lasers[i];
          let hit=false;
          for(let j=xwings.length-1;j>=0;j--){
            const xw=xwings[j];
            const dx=l.x-xw.x, dy=l.y-xw.y;
            const r=xw.size*0.4;
            if(dx*dx+dy*dy<r*r){
              spawnDestructionExplosion(xw.x,xw.y,xw.size);
              tie.lasers.splice(i,1);
              xwings.splice(j,1);
              hit=true; break;
            }
          }
          if(hit) break;
        }
      }
      // Red X-wing lasers vs TIEs
      for(let x=xwings.length-1;x>=0;x--){
        const xw=xwings[x];
        for(let i=xw.lasers.length-1;i>=0;i--){
          const l=xw.lasers[i];
          let hit=false;
          for(let j=ties.length-1;j>=0;j--){
            const tie=ties[j];
            const dx=l.x-tie.x, dy=l.y-tie.y;
            const r=tie.size*0.4;
            if(dx*dx+dy*dy<r*r){
              spawnDestructionExplosion(tie.x,tie.y,tie.size);
              xw.lasers.splice(i,1);
              ties.splice(j,1);
              hit=true; break;
            }
          }
          if(hit) break;
        }
      }
    }

    // --- Millennium Falcon rare flyby ---
    let falcon=null;
    let nextFalconSpawn=20+Math.random()*40;
    function spawnFalcon(){
      const fromLeft=Math.random()>0.5;
      const dir=fromLeft?1:-1;
      const baseAng=fromLeft?0:Math.PI;
      const wobble=(Math.random()-0.5)*0.25;
      const speed=8+Math.random()*4;
      falcon={
        x: fromLeft?-120:W+120,
        y: 50+Math.random()*(H*0.4),
        vx: Math.cos(baseAng+wobble)*speed,
        vy: Math.sin(baseAng+wobble)*speed,
        speed,
        dir,
        size: 32+Math.random()*12,
        opacity: 0.8+Math.random()*0.15,
        trail: [],
        angle: baseAng+wobble
      };
    }
    function drawFalcon(){
      if(!falcon) return;
      falcon.x+=falcon.vx;
      falcon.y+=falcon.vy;
      // Exhaust trail
      const heading=falcon.angle;
      const rearX=falcon.x-Math.cos(heading)*falcon.size*0.6;
      const rearY=falcon.y-Math.sin(heading)*falcon.size*0.6;
      falcon.trail.push({x:rearX,y:rearY,life:1});
      if(falcon.trail.length>20) falcon.trail.shift();
      for(let i=0;i<falcon.trail.length;i++){
        const pt=falcon.trail[i];
        pt.life-=0.05;
        if(pt.life<=0){ falcon.trail.splice(i,1); i--; continue; }
        const a=pt.life*0.5;
        ctx.fillStyle='rgba(100,170,255,'+a+')';
        ctx.beginPath(); ctx.arc(pt.x,pt.y,3.5*pt.life,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(180,220,255,'+(a*0.4)+')';
        ctx.beginPath(); ctx.arc(pt.x,pt.y,1.5*pt.life,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;

      const s=falcon.size;
      const d=falcon.dir;
      ctx.save();
      ctx.translate(falcon.x,falcon.y);
      const bankAngle=falcon.angle-(d>0?0:Math.PI);
      if(d<0) ctx.scale(-1,1);
      ctx.rotate(d>0?bankAngle:-bankAngle);
      ctx.globalAlpha=falcon.opacity;

      // Main saucer body (iconic disc shape)
      ctx.fillStyle='#8a8a8a';
      ctx.strokeStyle='#555';
      ctx.lineWidth=0.8;
      ctx.beginPath();
      ctx.ellipse(0,0,s*0.55,s*0.28,0,0,Math.PI*2);
      ctx.fill(); ctx.stroke();

      // Forward mandibles (the front prongs)
      ctx.fillStyle='#7a7a7a';
      ctx.beginPath();
      ctx.moveTo(s*0.4,-s*0.12);
      ctx.lineTo(s*0.85,-s*0.08);
      ctx.lineTo(s*0.85,-s*0.02);
      ctx.lineTo(s*0.4,-s*0.03);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s*0.4,s*0.12);
      ctx.lineTo(s*0.85,s*0.08);
      ctx.lineTo(s*0.85,s*0.02);
      ctx.lineTo(s*0.4,s*0.03);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Gap between mandibles
      ctx.fillStyle='#222';
      ctx.beginPath();
      ctx.moveTo(s*0.45,-s*0.025);
      ctx.lineTo(s*0.82,-s*0.015);
      ctx.lineTo(s*0.82,s*0.015);
      ctx.lineTo(s*0.45,s*0.025);
      ctx.closePath(); ctx.fill();

      // Cockpit (offset to the right/starboard side)
      ctx.fillStyle='#606060';
      ctx.strokeStyle='#444';
      ctx.lineWidth=0.5;
      ctx.beginPath();
      ctx.moveTo(s*0.15,-s*0.28);
      ctx.lineTo(s*0.32,-s*0.32);
      ctx.lineTo(s*0.38,-s*0.28);
      ctx.lineTo(s*0.28,-s*0.22);
      ctx.lineTo(s*0.15,-s*0.23);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Cockpit glass
      ctx.fillStyle='rgba(100,180,255,0.5)';
      ctx.beginPath();
      ctx.moveTo(s*0.22,-s*0.3);
      ctx.lineTo(s*0.3,-s*0.31);
      ctx.lineTo(s*0.32,-s*0.28);
      ctx.lineTo(s*0.24,-s*0.26);
      ctx.closePath(); ctx.fill();

      // Top hull detail (raised section)
      ctx.fillStyle='#6e6e6e';
      ctx.beginPath();
      ctx.ellipse(-s*0.05,0,s*0.2,s*0.12,0,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle='#555';
      ctx.lineWidth=0.4;
      ctx.stroke();

      // Sensor dish (top of raised section)
      ctx.fillStyle='#999';
      ctx.beginPath(); ctx.arc(-s*0.05,-s*0.01,s*0.04,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#666';
      ctx.lineWidth=0.4;
      ctx.stroke();

      // Engine glow (rear)
      const engGlow=ctx.createRadialGradient(-s*0.55,0,0,-s*0.55,0,s*0.2);
      engGlow.addColorStop(0,'rgba(80,160,255,0.7)');
      engGlow.addColorStop(0.4,'rgba(60,120,220,0.3)');
      engGlow.addColorStop(1,'transparent');
      ctx.fillStyle=engGlow;
      ctx.beginPath(); ctx.arc(-s*0.55,0,s*0.2,0,Math.PI*2); ctx.fill();

      // Hull panel lines
      ctx.strokeStyle='rgba(0,0,0,0.15)';
      ctx.lineWidth=0.3;
      ctx.beginPath(); ctx.moveTo(-s*0.3,-s*0.15); ctx.lineTo(s*0.1,-s*0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.3,s*0.15); ctx.lineTo(s*0.1,s*0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.15,-s*0.25); ctx.lineTo(-s*0.15,s*0.25); ctx.stroke();

      ctx.globalAlpha=1;
      ctx.restore();

      // Remove if off-screen
      if(falcon.x<-200||falcon.x>W+200||falcon.y<-200||falcon.y>H+200) falcon=null;
    }

    // --- Animation loop ---
    let nextTIESpawn=0.5+Math.random()*2;
    let nextXWSpawn=1+Math.random()*2.5;

    // Seed initial fighters only on home page
    if(isHomePage){
      for(let i=0;i<3;i++) spawnTIE();
      for(let i=0;i<2;i++) spawnXWing();
    }

    function loop(ts){
      const t=ts/1000;
      ctx.clearRect(0,0,W,H);

      // Deep space vignette
      const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.2,W/2,H/2,Math.max(W,H)*0.8);
      vg.addColorStop(0,'rgba(10,16,30,0)');
      vg.addColorStop(1,'rgba(2,4,10,0.4)');
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      drawNebulae(t);
      drawStarfield(t);
      drawPlanet();
      drawDeathStar();

      // Space battle only on home page
      if(isHomePage){
        // Spawn TIE fighters on a pre-rolled timer  
        if(t>=nextTIESpawn){ spawnTIE(); nextTIESpawn=t+3+Math.random()*5; }
        drawTIE(t);

        // Spawn X-wings on a pre-rolled timer
        if(t>=nextXWSpawn){ spawnXWing(); nextXWSpawn=t+4+Math.random()*6; }
        drawXWing(t);

        // Engine exhaust trails (behind fighters)
        drawExhaustTrails();

        // Laser hit detection and explosions
        checkLaserHits();
        drawExplosions();

        // Millennium Falcon rare flyby
        if(!falcon && t>=nextFalconSpawn){ spawnFalcon(); nextFalconSpawn=t+45+Math.random()*60; }
        drawFalcon();
      }

      window.__fpSWRAF=requestAnimationFrame(loop);
    }
    window.__fpSWRAF=requestAnimationFrame(loop);

    // ===== HYPERSPACE STREAKS (DOM) =====
    const decor=document.createElement('div');
    decor.id='fp-sw-decor';
    decor.setAttribute('aria-hidden','true');
    decor.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
    document.body.appendChild(decor);



    // ===== JEDI LOGO (Jedi Order symbol) =====
    function applyStarWarsLogo(){
      if(document.documentElement.getAttribute('data-theme')!=='star-wars') return;
      // Simplified Jedi Order-inspired wings/star emblem
      const jediSVG="<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><path fill='#ffe81f' d='M32 4l3 10h10l-8 6 3 10-8-6-8 6 3-10-8-6h10z'/><path fill='#ffe81f' opacity='0.7' d='M32 34c-2 0-4 1-5 3l-8 14c0 0 5 5 13 5s13-5 13-5l-8-14c-1-2-3-3-5-3z'/><path fill='#ffe81f' opacity='0.5' d='M20 30c-4-2-10-2-14 1 6 2 10 5 14 9 0-4 0-7 0-10zm24 0c4-2 10-2 14 1-6 2-10 5-14 9 0-4 0-7 0-10z'/></svg>";
      const headings=Array.from(document.querySelectorAll('h1')).filter(h=>h.textContent.trim()==='FocusPath');
      headings.forEach(h=>{
        if(h.dataset.swLogo) return;
        h.dataset.origHtml=h.innerHTML;
        h.dataset.swLogo='1';
        h.innerHTML=`<span class="fp-sw-logo" aria-hidden="true">${jediSVG}</span><span>FocusPath</span>`;
      });
    }
    applyStarWarsLogo();

    // ===== HEADER LIGHTSABER ACCENTS =====
    function injectHeaderSabers(){
      const header=document.querySelector('header');
      if(!header) return;
      header.querySelectorAll('.fp-sw-header-saber').forEach(e=>e.remove());
      const saberColors=['#ff2f2f','#1f8bff','#19ff6a','#a855f7','#ffe81f'];
      const count=saberColors.length;
      const btns=Array.from(header.querySelectorAll('button, .text-2xl, .text-sm'));
      let left=0, right=header.offsetWidth;
      if(btns.length) left=btns[0].offsetLeft+btns[0].offsetWidth+8;
      const gap=(right-left-40)/(count-1);
      for(let i=0;i<count;i++){
        const s=document.createElement('div');
        s.className='fp-sw-header-saber';
        const c=saberColors[i];
        s.style.cssText=`position:absolute;bottom:0;height:3px;width:20px;border-radius:2px;background:${c};box-shadow:0 0 6px ${c}, 0 0 12px ${c}88;z-index:10;pointer-events:none;opacity:0.7;`;
        let px=left+i*gap;
        if(i===count-1) px=Math.min(px,right-24);
        s.style.left=px+'px';
        header.appendChild(s);
      }
      header.style.position='relative';
    }
    injectHeaderSabers();

    // ===== LIGHTSABER HOVER GLOW (kept from original) =====
    const glowColors=['#ff2f2f','#1f8bff','#19ff6a','#a855f7','#ffffff','#f97316','#ffe81f'];
    function overHandler(e){
      const el=e.target.closest('button, a, [role="button"], input, select, textarea, .nav-group');
      if(!el) return;
      const c=glowColors[Math.floor(Math.random()*glowColors.length)];
      if(!el.dataset.swGlow) el.dataset.origBg=el.style.background||'';
      const computedBg=getComputedStyle(el).backgroundColor||'';
      const isPrimaryYellow=/255\s*,\s*232\s*,\s*31/.test(computedBg);
      if(!isPrimaryYellow) el.style.background='transparent'; else el.style.color='#000';
      el.style.setProperty('--sw-glow-c',c);
      el.style.setProperty('box-shadow',`0 0 0 1px ${c}, 0 0 6px 2px ${c}, 0 0 14px 4px ${c}`,'important');
      el.classList.add('fp-sw-pulse');
      el.dataset.swGlow='1';
    }
    function outHandler(e){
      const el=e.target.closest('[data-sw-glow]');
      if(!el) return;
      el.style.removeProperty('box-shadow');
      el.style.background=el.dataset.origBg||'';
      el.classList.remove('fp-sw-pulse');
      el.style.removeProperty('--sw-glow-c');
      delete el.dataset.swGlow; delete el.dataset.origBg;
    }
    if(!window.__fpSWGlow){
      document.addEventListener('mouseover',overHandler,true);
      document.addEventListener('mouseout',outHandler,true);
      window.__fpSWGlow={overHandler,outHandler};
    }

    // Resize handler
    window.__fpSWResize=function(){
      if(document.documentElement.getAttribute('data-theme')!=='star-wars') return;
      resize();
      starLayers.forEach(layer=>layer.forEach(s=>{ s.x=Math.random()*W; s.y=Math.random()*H; }));
      injectHeaderSabers();
      applyStarWarsLogo();
    };
    window.addEventListener('resize',window.__fpSWResize);
  }

  /* ---------- Halloween Seasonal Extras (October) ---------- */
  function applyHalloweenExtras(active){
    // --- Cleanup when deactivating ---
    if(!active){
      document.querySelectorAll('[data-halloween-logo]')?.forEach(h=>{
        if(h.dataset.origHtml){ h.innerHTML = h.dataset.origHtml; delete h.dataset.origHtml; }
        h.removeAttribute('data-halloween-logo');
      });
      document.getElementById('fp-halloween-canvas')?.remove();
      document.getElementById('fp-halloween-style')?.remove();
      document.getElementById('fp-halloween-decor')?.remove();
      document.querySelectorAll('.fp-header-pumpkin').forEach(e=>e.remove());
      window.removeEventListener('resize', window.__fpHalloweenResize||(()=>{}));
      delete window.__fpHalloweenResize;
      if(window.__fpHalloweenRAF) cancelAnimationFrame(window.__fpHalloweenRAF);
      delete window.__fpHalloweenRAF;
      return;
    }

    // --- Already active guard ---
    if(document.getElementById('fp-halloween-canvas')) return;

    // ===== STYLE INJECTION =====
    if(!document.getElementById('fp-halloween-style')){
      const style=document.createElement('style');
      style.id='fp-halloween-style';
      style.textContent=`
        [data-theme='halloween'] body, [data-theme='halloween'] { background: #0d0015 !important; }
        [data-theme='halloween'] .bg-\\[var\\(--primary-color\\)\\]{ color:#0d0015 !important; font-weight:700; }
        /* Eerie card glow */
        [data-theme='halloween'] .fp-bubble,
        [data-theme='halloween'] .fp-section-card {
          box-shadow: 0 0 18px rgba(139,45,142,0.25), 0 0 4px rgba(255,106,0,0.15), 0 8px 22px rgba(0,0,0,0.4) !important;
          border-color: #5b2d8e !important;
        }
        [data-theme='halloween'] .fp-bubble:hover,
        [data-theme='halloween'] .fp-section-card:hover {
          box-shadow: 0 0 28px rgba(139,45,142,0.4), 0 0 8px rgba(255,106,0,0.3), 0 12px 32px rgba(0,0,0,0.5) !important;
        }
        /* Spooky button glow on hover */
        [data-theme='halloween'] button:hover, [data-theme='halloween'] a:hover {
          text-shadow: 0 0 8px rgba(255,106,0,0.5);
        }
        /* Cobweb corner on panels */
        [data-theme='halloween'] .fp-bubble::before,
        [data-theme='halloween'] .fp-section-card::before {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 48px; height: 48px;
          background: radial-gradient(ellipse at 100% 0%, rgba(200,154,255,0.12) 0%, transparent 70%);
          border-top: 1px solid rgba(200,154,255,0.15);
          border-right: 1px solid rgba(200,154,255,0.15);
          border-radius: 0 18px 0 0;
          pointer-events: none;
          z-index: 1;
        }
        /* Jack-o-lantern logo */
        @keyframes fp-hw-flicker { 0%,100%{filter:drop-shadow(0 0 6px rgba(255,106,0,0.8));} 50%{filter:drop-shadow(0 0 12px rgba(255,166,0,1)) drop-shadow(0 0 22px rgba(255,106,0,0.5));} }
        [data-theme='halloween'] .fp-hw-logo{display:inline-flex;width:32px;height:32px;vertical-align:middle;margin-right:6px;animation:fp-hw-flicker 2.5s ease-in-out infinite;}
        [data-theme='halloween'] .fp-hw-logo svg{width:100%;height:100%;}
        /* Candy particle layer */
        @keyframes fp-candy-fall {
          0%   { transform: translate3d(0, -30px, 0) rotate(0deg); opacity: 0; }
          5%   { opacity: 0.9; }
          90%  { opacity: 0.85; }
          100% { transform: translate3d(var(--hw-drift), 105vh, 0) rotate(var(--hw-spin)); opacity: 0; }
        }
        .fp-hw-candy {
          position: absolute;
          pointer-events: none;
          animation: fp-candy-fall var(--hw-dur) linear var(--hw-delay) infinite;
          font-size: var(--hw-size);
          z-index: 1;
        }
      `;
      document.head.appendChild(style);
    }

    // ===== CANVAS (fog + moon + bats) =====
    const canvas=document.createElement('canvas');
    canvas.id='fp-halloween-canvas';
    Object.assign(canvas.style,{position:'fixed',top:'0',left:'0',width:'100%',height:'100%',zIndex:'0',pointerEvents:'none'});
    document.body.prepend(canvas);
    const ctx=canvas.getContext('2d');
    let W,H;
    function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
    resize();

    // --- Moon ---
    const moonX=()=>W-90, moonY=70, moonR=45;
    function drawMoon(){
      // Outer glow
      const g=ctx.createRadialGradient(moonX(),moonY,moonR*0.3,moonX(),moonY,moonR*3);
      g.addColorStop(0,'rgba(255,230,150,0.12)');
      g.addColorStop(0.5,'rgba(200,160,80,0.04)');
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(moonX(),moonY,moonR*3,0,Math.PI*2); ctx.fill();
      // Moon body
      ctx.fillStyle='#f5e6c8';
      ctx.beginPath(); ctx.arc(moonX(),moonY,moonR,0,Math.PI*2); ctx.fill();
      // Craters
      ctx.fillStyle='rgba(180,160,120,0.3)';
      ctx.beginPath(); ctx.arc(moonX()-12,moonY-8,7,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(moonX()+10,moonY+12,5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(moonX()+5,moonY-15,4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(moonX()-8,moonY+18,3,0,Math.PI*2); ctx.fill();
    }

    // --- Bats ---
    const bats=[];
    for(let i=0;i<8;i++){
      bats.push({
        x: Math.random()*W, y: 30+Math.random()*(H*0.4),
        vx: (1+Math.random()*2)*(Math.random()>.5?1:-1),
        vy: Math.sin(Math.random()*Math.PI*2)*0.5,
        size: 10+Math.random()*14,
        wingPhase: Math.random()*Math.PI*2,
        wingSpeed: 4+Math.random()*3
      });
    }
    function drawBat(b,t){
      const wing=Math.sin(t*b.wingSpeed+b.wingPhase);
      const s=b.size;
      ctx.save();
      ctx.translate(b.x,b.y);
      ctx.fillStyle='#1a0a2e';
      // Body
      ctx.beginPath();
      ctx.ellipse(0,0,s*0.2,s*0.35,0,0,Math.PI*2);
      ctx.fill();
      // Left wing
      ctx.beginPath();
      ctx.moveTo(-s*0.15,0);
      ctx.quadraticCurveTo(-s*0.6, -s*0.5*wing, -s, -s*0.1*wing);
      ctx.quadraticCurveTo(-s*0.7, s*0.3, -s*0.15, s*0.1);
      ctx.fill();
      // Right wing
      ctx.beginPath();
      ctx.moveTo(s*0.15,0);
      ctx.quadraticCurveTo(s*0.6, -s*0.5*wing, s, -s*0.1*wing);
      ctx.quadraticCurveTo(s*0.7, s*0.3, s*0.15, s*0.1);
      ctx.fill();
      // Eyes
      ctx.fillStyle='#ff6a00';
      ctx.beginPath(); ctx.arc(-s*0.07,-s*0.1,s*0.05,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*0.07,-s*0.1,s*0.05,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // --- Fog layers ---
    const fogLayers=[];
    for(let i=0;i<3;i++){
      fogLayers.push({ offset: Math.random()*W, speed: 8+Math.random()*16, y: H-60-i*40, h:80+i*30, opacity: 0.06+i*0.025 });
    }
    function drawFog(t){
      fogLayers.forEach(f=>{
        f.offset += f.speed*0.016;
        if(f.offset>W) f.offset-=W*2;
        const g=ctx.createLinearGradient(0,f.y,0,f.y+f.h);
        g.addColorStop(0,'transparent');
        g.addColorStop(0.4,`rgba(120,60,180,${f.opacity})`);
        g.addColorStop(0.7,`rgba(80,30,140,${f.opacity*0.8})`);
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g;
        // Draw wavy fog band
        ctx.beginPath();
        ctx.moveTo(0,f.y+f.h);
        for(let x=0;x<=W;x+=20){
          const wave=Math.sin((x+f.offset)*0.008)*18 + Math.sin((x+f.offset*0.7)*0.015)*10;
          ctx.lineTo(x,f.y+wave);
        }
        ctx.lineTo(W,f.y+f.h); ctx.closePath(); ctx.fill();
      });
    }

    // --- Stars (twinkling) ---
    const stars=[];
    for(let i=0;i<60;i++){
      stars.push({ x:Math.random()*W, y:Math.random()*(H*0.5), r:0.5+Math.random()*1.5, phase:Math.random()*Math.PI*2, speed:0.5+Math.random()*2 });
    }
    function drawStars(t){
      stars.forEach(s=>{
        const a=0.3+0.7*((Math.sin(t*s.speed+s.phase)+1)/2);
        ctx.fillStyle=`rgba(200,180,255,${a})`;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
      });
    }

    // --- Animation loop ---
    function loop(ts){
      const t=ts/1000;
      ctx.clearRect(0,0,W,H);

      // Ambient purple glow from bottom corners
      const glow1=ctx.createRadialGradient(0,H,0,0,H,H*0.6);
      glow1.addColorStop(0,'rgba(91,45,142,0.08)');
      glow1.addColorStop(1,'transparent');
      ctx.fillStyle=glow1; ctx.fillRect(0,0,W,H);
      const glow2=ctx.createRadialGradient(W,H,0,W,H,H*0.5);
      glow2.addColorStop(0,'rgba(255,106,0,0.05)');
      glow2.addColorStop(1,'transparent');
      ctx.fillStyle=glow2; ctx.fillRect(0,0,W,H);

      drawStars(t);
      drawMoon();

      // Bats
      bats.forEach(b=>{
        b.x+=b.vx; b.y+=Math.sin(t*1.5+b.wingPhase)*0.6;
        if(b.x<-50) b.x=W+50;
        if(b.x>W+50) b.x=-50;
        drawBat(b,t);
      });

      drawFog(t);

      window.__fpHalloweenRAF=requestAnimationFrame(loop);
    }
    window.__fpHalloweenRAF=requestAnimationFrame(loop);

    // ===== FALLING CANDY PARTICLES (DOM) =====
    const decor=document.createElement('div');
    decor.id='fp-halloween-decor';
    decor.setAttribute('aria-hidden','true');
    decor.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
    document.body.appendChild(decor);

    const candyEmojis=['🎃','🍬','🍭','👻','🕷️','💀','🦇','🕸️','🧙'];
    for(let i=0;i<18;i++){
      const c=document.createElement('span');
      c.className='fp-hw-candy';
      c.textContent=candyEmojis[Math.floor(Math.random()*candyEmojis.length)];
      const size=14+Math.random()*14;
      const dur=10+Math.random()*15;
      const delay=Math.random()*dur;
      const drift=(Math.random()*120-60);
      const spin=Math.floor(Math.random()*720-360)+'deg';
      c.style.cssText+=`left:${Math.random()*100}%;--hw-size:${size}px;--hw-dur:${dur}s;--hw-delay:${delay}s;--hw-drift:${drift}px;--hw-spin:${spin};`;
      decor.appendChild(c);
    }

    // ===== JACK-O-LANTERN LOGO =====
    function applyHalloweenLogo(){
      if(document.documentElement.getAttribute('data-theme')!=='halloween') return;
      const pumpkinLogoSVG="<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><path fill='#ff6a00' d='M32 10c-2 0-3.5 1-3.5 3v2c-2-.6-4.5-.8-6.5-.2-3.5.8-6.5 3-8 6.2-2 3.2-2.5 7-1.5 10.5 1 3.8 3.2 7.2 6.5 9 3.3 1.8 7.2 2 10.8 1 1-.3 2-.6 3-.9 1 .3 2 .6 3 .9 3.6 1 7.5.8 10.8-1 3.3-1.8 5.5-5.2 6.5-9 1-3.5.5-7.3-1.5-10.5-1.5-3.2-4.5-5.4-8-6.2-2-.6-4.5-.4-6.5.2v-2c0-2-1.5-3-3.5-3Z'/><path fill='#cc5500' d='M28.5 15c-5.5 9-5.5 19 0 29-3-.2-6.2-.8-8.8-2.2-3-1.7-5-4.5-6.2-7.8-.8-3-.5-6.8 1-10 1.5-2.5 4-4.5 6.8-5.3 2.3-.6 4.8-.3 7.2.3Zm7 0c5.5 9 5.5 19 0 29 3-.2 6.2-.8 8.8-2.2 3-1.7 5-4.5 6.2-7.8.8-3 .5-6.8-1-10-1.5-2.5-4-4.5-6.8-5.3-2.3-.6-4.8-.3-7.2.3Z'/><path fill='#ffe066' d='M22 30l4-5 4 5-4 2Zm12 0l4-5 4 5-4 2Z'/><path fill='#ffe066' d='M26 38l6-3 6 3-3 4h-6Z'/><circle cx='32' cy='8' r='2.5' fill='#4a7c10'/><path fill='#5a9a15' d='M32 6c2-3 6-5 9-4-2 2-5 4-7 5Z'/></svg>";
      const headings=Array.from(document.querySelectorAll('h1')).filter(h=>h.textContent.trim()==='FocusPath');
      headings.forEach(h=>{
        if(h.dataset.halloweenLogo) return;
        h.dataset.origHtml=h.innerHTML;
        h.dataset.halloweenLogo='1';
        h.innerHTML=`<span class="fp-hw-logo" aria-hidden="true">${pumpkinLogoSVG}</span><span>FocusPath</span>`;
      });
    }
    applyHalloweenLogo();

    // ===== HEADER PUMPKINS =====
    function injectHeaderPumpkins(){
      const header=document.querySelector('header');
      if(!header) return;
      header.querySelectorAll('.fp-header-pumpkin').forEach(e=>e.remove());
      const btns=Array.from(header.querySelectorAll('button, .text-2xl, .text-sm, .text-center, .font-bold'));
      let left=0, right=header.offsetWidth;
      if(btns.length){ left=btns[0].offsetLeft+btns[0].offsetWidth+8; }
      const pumpkinSVG="<svg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><path fill='#ff6a00' d='M16 4c-1.1 0-2 .9-2 2v1.1c-1.3-.4-2.7-.6-4-.3-2.3.5-4.4 2-5.5 4.1C2 13 1.7 15.7 2.3 18.2c.6 2.5 2 4.9 4.3 6.2 2.2 1.2 4.9 1.3 7.3.7.7-.2 1.4-.4 2.1-.7.7.3 1.4.5 2.1.7 2.4.6 5.1.5 7.3-.7 2.3-1.3 3.7-3.7 4.3-6.2.6-2.5.3-5.2-1.2-7.3-1.1-2.1-3.2-3.6-5.5-4.1-1.3-.3-2.7-.1-4 .3V6c0-1.1-.9-2-2-2h-2Z'/><path fill='#ffe066' d='M11 16l2-3 2 3-2 1Zm6 0l2-3 2 3-2 1Z'/><path fill='#ffe066' d='M13 21l3-2 3 2-1.5 2h-3Z'/></svg>";
      const count=4, rightMargin=64;
      const gap=(right-left-32-rightMargin)/(count-1);
      for(let i=0;i<count;i++){
        const p=document.createElement('div');
        p.className='fp-header-pumpkin';
        p.style.cssText='position:absolute;bottom:0;width:32px;height:32px;z-index:10;pointer-events:none;';
        let px=left+i*gap;
        if(i===count-1) px=Math.min(px,right-32);
        p.style.left=px+'px';
        p.innerHTML=pumpkinSVG;
        header.appendChild(p);
      }
      header.style.position='relative';
    }
    injectHeaderPumpkins();

    // Resize handler
    window.__fpHalloweenResize=function(){
      if(document.documentElement.getAttribute('data-theme')!=='halloween') return;
      resize();
      stars.forEach(s=>{ s.x=Math.random()*W; s.y=Math.random()*(H*0.5); });
      fogLayers.forEach((f,i)=>{ f.y=H-60-i*40; });
      bats.forEach(b=>{ b.x=Math.random()*W; b.y=30+Math.random()*(H*0.4); });
      injectHeaderPumpkins();
      applyHalloweenLogo();
    };
    window.addEventListener('resize',window.__fpHalloweenResize);
  }

  /* ---------- Christmas Seasonal Extras (December) ---------- */
  function applyChristmasExtras(active){
    // --- Cleanup when deactivating ---
    if(!active){
      document.getElementById('fp-christmas-canvas')?.remove();
      document.getElementById('fp-christmas-style')?.remove();
      document.getElementById('fp-christmas-decor')?.remove();
      document.getElementById('fp-snow-global')?.remove();
      document.body.classList.remove('christmas-page-bg');
      const area=document.getElementById('primaryArea')||document.querySelector('main');
      if(area) area.classList.remove('christmas-primary-area');
      const legacy=document.getElementById('fpSnowOverlay'); if(legacy) legacy.style.display='none';
      document.querySelectorAll('.fp-header-ornament').forEach(e=>e.remove());
      document.querySelectorAll('[data-christmas-logo]')?.forEach(h=>{
        if(h.dataset.origHtml){ h.innerHTML=h.dataset.origHtml; delete h.dataset.origHtml; }
        h.removeAttribute('data-christmas-logo');
      });
      window.removeEventListener('resize',window.__fpChristmasResize||(()=>{}));
      delete window.__fpChristmasResize;
      if(window.__fpChristmasRAF) cancelAnimationFrame(window.__fpChristmasRAF);
      delete window.__fpChristmasRAF;
      return;
    }

    // --- Already active guard ---
    if(document.getElementById('fp-christmas-canvas')) return;

    // ===== STYLE INJECTION =====
    if(!document.getElementById('fp-christmas-style')){
      const style=document.createElement('style');
      style.id='fp-christmas-style';
      style.textContent=`
        .christmas-primary-area { background: linear-gradient(to bottom, #06101e 0%, #0a1628 60%, #0e1e38 100%); }
        body.christmas-page-bg { background: linear-gradient(to bottom, #06101e 0%, #0a1628 60%, #0e1e38 100%) !important; }
        [data-theme='christmas'] .bg-\\[var\\(--primary-color\\)\\]{ color:#fff !important; font-weight:700; }
        /* Festive card glow */
        [data-theme='christmas'] .fp-bubble,
        [data-theme='christmas'] .fp-section-card {
          box-shadow: 0 0 16px rgba(196,30,58,0.15), 0 0 4px rgba(34,120,60,0.12), 0 8px 22px rgba(0,0,0,0.35) !important;
          border-color: #1e4060 !important;
          position: relative;
        }
        [data-theme='christmas'] .fp-bubble:hover,
        [data-theme='christmas'] .fp-section-card:hover {
          box-shadow: 0 0 24px rgba(196,30,58,0.25), 0 0 8px rgba(34,120,60,0.2), 0 12px 32px rgba(0,0,0,0.45) !important;
        }
        /* Warm glow on buttons */
        [data-theme='christmas'] button:hover, [data-theme='christmas'] a:hover {
          text-shadow: 0 0 6px rgba(255,180,60,0.4);
        }
        /* Christmas tree logo */
        @keyframes fp-xmas-twinkle { 0%,100%{filter:drop-shadow(0 0 4px rgba(255,215,0,0.6));} 50%{filter:drop-shadow(0 0 10px rgba(255,215,0,1)) drop-shadow(0 0 18px rgba(255,100,50,0.4));} }
        [data-theme='christmas'] .fp-xmas-logo{display:inline-flex;width:30px;height:30px;vertical-align:middle;margin-right:6px;animation:fp-xmas-twinkle 3s ease-in-out infinite;}
        [data-theme='christmas'] .fp-xmas-logo svg{width:100%;height:100%;}
        /* Ornament string lights on cards */
        [data-theme='christmas'] .fp-bubble::before,
        [data-theme='christmas'] .fp-section-card::before {
          content: ''; position: absolute; top: 0; left: 12px; right: 12px; height: 2px;
          background: repeating-linear-gradient(90deg, #c41e3a 0 6px, transparent 6px 14px, #22783c 14px 20px, transparent 20px 28px, #ffd700 28px 34px, transparent 34px 42px);
          border-radius: 1px; pointer-events: none; z-index: 2; opacity: 0.7;
        }
        /* Falling ornament particles */
        @keyframes fp-xmas-drift {
          0%   { transform: translate3d(0, -30px, 0) rotate(0deg); opacity: 0; }
          5%   { opacity: 0.85; }
          85%  { opacity: 0.75; }
          100% { transform: translate3d(var(--xm-drift), 105vh, 0) rotate(var(--xm-spin)); opacity: 0; }
        }
        .fp-xmas-particle {
          position: absolute; pointer-events: none;
          animation: fp-xmas-drift var(--xm-dur) linear var(--xm-delay) infinite;
          font-size: var(--xm-size); z-index: 1;
        }
      `;
      document.head.appendChild(style);
    }

    // Toggle page-wide background
    document.body.classList.add('christmas-page-bg');
    const area=document.getElementById('primaryArea')||document.querySelector('main');
    if(area) area.classList.add('christmas-primary-area');
    const legacy=document.getElementById('fpSnowOverlay'); if(legacy) legacy.style.display='none';

    // ===== CANVAS (northern lights + snow + stars) =====
    const canvas=document.createElement('canvas');
    canvas.id='fp-christmas-canvas';
    Object.assign(canvas.style,{position:'fixed',top:'0',left:'0',width:'100%',height:'100%',zIndex:'0',pointerEvents:'none'});
    document.body.prepend(canvas);
    const ctx=canvas.getContext('2d');
    let W,H;
    function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
    resize();

    // --- Stars ---
    const stars=[];
    for(let i=0;i<80;i++){
      stars.push({ x:Math.random()*W, y:Math.random()*(H*0.6), r:0.4+Math.random()*1.8, phase:Math.random()*Math.PI*2, speed:0.3+Math.random()*1.5 });
    }
    function drawStars(t){
      stars.forEach(s=>{
        const a=0.25+0.75*((Math.sin(t*s.speed+s.phase)+1)/2);
        ctx.fillStyle=`rgba(220,230,255,${a})`;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
      });
    }

    // --- Northern Lights / Aurora ---
    function drawAurora(t){
      const bands=[
        { color1:'rgba(196,30,58,0.06)', color2:'rgba(196,30,58,0.01)', yBase:H*0.18, amp:40, freq:0.003, speed:0.4 },
        { color1:'rgba(34,120,60,0.07)', color2:'rgba(34,120,60,0.01)', yBase:H*0.25, amp:50, freq:0.004, speed:0.3 },
        { color1:'rgba(255,215,0,0.04)', color2:'rgba(255,215,0,0.005)', yBase:H*0.15, amp:30, freq:0.005, speed:0.5 }
      ];
      bands.forEach(b=>{
        ctx.beginPath();
        ctx.moveTo(0,H);
        for(let x=0;x<=W;x+=8){
          const y=b.yBase+Math.sin(x*b.freq+t*b.speed)*b.amp+Math.sin(x*b.freq*2.3+t*b.speed*0.7)*b.amp*0.4;
          ctx.lineTo(x,y);
        }
        ctx.lineTo(W,H); ctx.closePath();
        const g=ctx.createLinearGradient(0,b.yBase-b.amp,0,H*0.7);
        g.addColorStop(0,b.color1);
        g.addColorStop(1,b.color2);
        ctx.fillStyle=g; ctx.fill();
      });
    }

    // --- Snowflakes (canvas-based, more natural) ---
    const flakes=[];
    for(let i=0;i<120;i++){
      flakes.push({
        x:Math.random()*W, y:Math.random()*H-H,
        r:1+Math.random()*3.5,
        vy:0.4+Math.random()*1.8,
        vx:0, drift:0.3+Math.random()*0.6,
        phase:Math.random()*Math.PI*2,
        opacity:0.4+Math.random()*0.6
      });
    }
    function drawSnow(t){
      flakes.forEach(f=>{
        f.y+=f.vy;
        f.vx=Math.sin(t*0.8+f.phase)*f.drift;
        f.x+=f.vx;
        if(f.y>H+10){ f.y=-10; f.x=Math.random()*W; }
        if(f.x<-10) f.x=W+10;
        if(f.x>W+10) f.x=-10;
        ctx.globalAlpha=f.opacity;
        ctx.fillStyle='#fff';
        ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fill();
        // Soft glow for larger flakes
        if(f.r>2.5){
          ctx.globalAlpha=f.opacity*0.3;
          ctx.beginPath(); ctx.arc(f.x,f.y,f.r*2.5,0,Math.PI*2); ctx.fill();
        }
      });
      ctx.globalAlpha=1;
    }

    // --- Ground snow drift ---
    function drawGroundSnow(){
      const g=ctx.createLinearGradient(0,H-40,0,H);
      g.addColorStop(0,'rgba(200,215,235,0)');
      g.addColorStop(0.5,'rgba(200,215,235,0.06)');
      g.addColorStop(1,'rgba(220,230,245,0.1)');
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.moveTo(0,H);
      for(let x=0;x<=W;x+=30){
        ctx.lineTo(x,H-8-Math.sin(x*0.02)*6-Math.sin(x*0.007)*10);
      }
      ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
    }

    // --- Animation loop ---
    function loop(ts){
      const t=ts/1000;
      ctx.clearRect(0,0,W,H);

      drawAurora(t);
      drawStars(t);
      drawSnow(t);
      drawGroundSnow();

      window.__fpChristmasRAF=requestAnimationFrame(loop);
    }
    window.__fpChristmasRAF=requestAnimationFrame(loop);

    // ===== FALLING FESTIVE PARTICLES (DOM) =====
    const decor=document.createElement('div');
    decor.id='fp-christmas-decor';
    decor.setAttribute('aria-hidden','true');
    decor.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
    document.body.appendChild(decor);

    const xmasEmojis=['🎄','🎅','⭐','🎁','🦌','❄️','🔔','🕯️','🧦'];
    for(let i=0;i<14;i++){
      const c=document.createElement('span');
      c.className='fp-xmas-particle';
      c.textContent=xmasEmojis[Math.floor(Math.random()*xmasEmojis.length)];
      const size=12+Math.random()*14;
      const dur=12+Math.random()*18;
      const delay=Math.random()*dur;
      const drift=(Math.random()*100-50);
      const spin=Math.floor(Math.random()*540-270)+'deg';
      c.style.cssText+=`left:${Math.random()*100}%;--xm-size:${size}px;--xm-dur:${dur}s;--xm-delay:${delay}s;--xm-drift:${drift}px;--xm-spin:${spin};`;
      decor.appendChild(c);
    }

    // ===== CHRISTMAS TREE LOGO =====
    function applyChristmasLogo(){
      if(document.documentElement.getAttribute('data-theme')!=='christmas') return;
      const treeSVG="<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><polygon fill='#22783c' points='32,6 20,24 44,24'/><polygon fill='#1e6b35' points='32,14 16,34 48,34'/><polygon fill='#196130' points='32,22 12,44 52,44'/><rect fill='#8B4513' x='28' y='44' width='8' height='10' rx='1'/><circle fill='#ffd700' cx='32' cy='6' r='3'/><circle fill='#c41e3a' cx='26' cy='20' r='2'/><circle fill='#ffd700' cx='38' cy='18' r='1.5'/><circle fill='#c41e3a' cx='22' cy='30' r='2'/><circle fill='#4488ff' cx='40' cy='28' r='1.8'/><circle fill='#ffd700' cx='30' cy='32' r='1.5'/><circle fill='#c41e3a' cx='18' cy='40' r='2'/><circle fill='#4488ff' cx='34' cy='38' r='2'/><circle fill='#ffd700' cx='44' cy='40' r='1.8'/><circle fill='#c41e3a' cx='26' cy='42' r='1.5'/></svg>";
      const headings=Array.from(document.querySelectorAll('h1')).filter(h=>h.textContent.trim()==='FocusPath');
      headings.forEach(h=>{
        if(h.dataset.christmasLogo) return;
        h.dataset.origHtml=h.innerHTML;
        h.dataset.christmasLogo='1';
        h.innerHTML=`<span class="fp-xmas-logo" aria-hidden="true">${treeSVG}</span><span>FocusPath</span>`;
      });
    }
    applyChristmasLogo();

    // ===== HEADER ORNAMENTS =====
    function injectHeaderOrnaments(){
      const header=document.querySelector('header');
      if(!header) return;
      header.querySelectorAll('.fp-header-ornament').forEach(e=>e.remove());
      const btns=Array.from(header.querySelectorAll('button, .text-2xl, .text-sm, .text-center, .font-bold'));
      let left=0, right=header.offsetWidth;
      if(btns.length) left=btns[0].offsetLeft+btns[0].offsetWidth+8;
      const ornamentColors=['#c41e3a','#22783c','#ffd700','#4488ff','#c41e3a'];
      const count=5, rightMargin=64;
      const gap=(right-left-20-rightMargin)/(count-1);
      for(let i=0;i<count;i++){
        const o=document.createElement('div');
        o.className='fp-header-ornament';
        const color=ornamentColors[i%ornamentColors.length];
        o.style.cssText=`position:absolute;bottom:2px;width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color}88, 0 2px 4px rgba(0,0,0,0.3);z-index:10;pointer-events:none;`;
        // String/hook
        const hook=document.createElement('div');
        hook.style.cssText=`position:absolute;top:-8px;left:50%;width:1px;height:8px;background:rgba(200,200,200,0.5);transform:translateX(-50%);`;
        o.appendChild(hook);
        let px=left+i*gap;
        if(i===count-1) px=Math.min(px,right-20);
        o.style.left=px+'px';
        header.appendChild(o);
      }
      header.style.position='relative';
    }
    injectHeaderOrnaments();

    // Resize handler
    window.__fpChristmasResize=function(){
      if(document.documentElement.getAttribute('data-theme')!=='christmas') return;
      resize();
      stars.forEach(s=>{ s.x=Math.random()*W; s.y=Math.random()*(H*0.6); });
      flakes.forEach(f=>{ f.x=Math.random()*W; f.y=Math.random()*H-H; });
      injectHeaderOrnaments();
      applyChristmasLogo();
    };
    window.addEventListener('resize',window.__fpChristmasResize);
  }

  /* ---------- USMC "Crayon" Extras ---------- */
  function applyUSMCExtras(active){
    if(!active){
      // Restore all original text
      document.querySelectorAll('[data-fp-og]').forEach(function(el){
        el.textContent = el.dataset.fpOg;
        delete el.dataset.fpOg;
        el.removeAttribute('data-fp-og');
      });
      // Disconnect observer
      if(window.__fpUSMCObs){ window.__fpUSMCObs.disconnect(); delete window.__fpUSMCObs; }
      return;
    }

    var crayon = {
      'FocusPath':        'FokussPaf',
      'Flash Cards':      'Flahsh Cardz',
      'Flashcards':       'Flahshcardz',
      'Flashcard Home':   'Flahshcard Hoem',
      'Flashcard Stats':  'Flahshcard Statz',
      'Tests':            'Tsets',
      'Test Home':        'Tset Hoem',
      'Test Stats':       'Tset Statz',
      'Statistics':       'Stattistikz',
      'Stats Home':       'Statz Hoem',
      'Trophy Room':      'Trofy Rooom',
      'New Set':          'Nuw Sett',
      'New Test':         'Nuw Tset',
      'Import Sets':      'Importt Setz',
      'Import Tests':     'Importt Tsetz',
      'Export Set':       'Eksport Sett',
      'Export Test':      'Eksport Tset',
      'Hard Reset':       'Hard Reesett',
      'Upcoming Events':  'Upcomming Evnets',
      'Upcoming Holidays':'Upcomming Hollidaze',
      'Sets':             'Setz',
      'Trash All':        'Trahsh Awl',
      'Theme':            'Theem',
      'Home':             'Hoem',
      'Games':            'Gaemz',
      'Dictionary':       'Dikshunary',
      'Settings':         'Settingz',
      'Welcome':          'Welkome',
      'Search':           'Surch',
      'Save':             'Sayve',
      'Cancel':           'Cansel',
      'Delete':           'Deleet',
      'Edit':             'Editt',
      'Create':           'Creeate',
      'Submit':           'Subbmit',
      'Score':            'Skoar',
      'Correct':          'Correkt',
      'Incorrect':        'Incurrekt',
      'Study':            'Studee',
      'Review':           'Revew',
      'Practice':         'Praktiss',
      'Start':            'Staart',
      'Finish':           'Finnesh',
      'Results':          'Rezults',
      'Progress':         'Proggres',
      'Achievements':     'Acheevmints',
      'Calendar':         'Calandar'
    };

    function crayonify(el){
      if(el.dataset.fpOg) return; // already swapped
      var txt = el.textContent.trim();
      // Exact match
      if(crayon[txt]){
        el.dataset.fpOg = el.textContent;
        el.textContent = crayon[txt];
        return;
      }
      // Partial: "Welcome PO2 Smith!" → "Welkome PO2 Smith!"
      for(var w in crayon){
        if(txt.indexOf(w) === 0 && txt.length > w.length){
          el.dataset.fpOg = el.textContent;
          el.textContent = el.textContent.replace(w, crayon[w]);
          return;
        }
      }
    }

    function sweep(){
      var sels = 'h1,h2,h3,h4,h5,span,a,button,label,th,td,p,#fpBrandText';
      document.querySelectorAll(sels).forEach(function(el){
        // Skip elements that contain child elements with text (avoid double-swap)
        if(el.children.length > 0 && el.querySelector('span,a,button')) return;
        // Skip script/style
        if(el.tagName==='SCRIPT'||el.tagName==='STYLE') return;
        crayonify(el);
      });
    }

    sweep();

    // Watch for dynamically added content
    if(!window.__fpUSMCObs){
      window.__fpUSMCObs = new MutationObserver(function(muts){
        muts.forEach(function(m){
          m.addedNodes.forEach(function(n){
            if(n.nodeType===1){
              crayonify(n);
              var sels = 'h1,h2,h3,h4,h5,span,a,button,label,th,td,p';
              n.querySelectorAll && n.querySelectorAll(sels).forEach(crayonify);
            }
          });
        });
      });
      window.__fpUSMCObs.observe(document.body,{childList:true,subtree:true});
    }
  }

  /* ---------- Chinese New Year Seasonal Extras ---------- */
  function applyAmericaExtras(active){
    // --- Cleanup ---
    if(!active){
      document.getElementById('fp-usa-canvas')?.remove();
      document.getElementById('fp-usa-style')?.remove();
      document.getElementById('fp-usa-decor')?.remove();
      document.querySelectorAll('[data-usa-logo]')?.forEach(h=>{
        if(h.dataset.origHtml){ h.innerHTML=h.dataset.origHtml; delete h.dataset.origHtml; }
        h.removeAttribute('data-usa-logo');
      });
      window.removeEventListener('resize',window.__fpUSAResize||(()=>{}));
      delete window.__fpUSAResize;
      if(window.__fpUSARAF) cancelAnimationFrame(window.__fpUSARAF);
      delete window.__fpUSARAF;
      return;
    }
    if(document.getElementById('fp-usa-canvas')) return;

    // ===== STYLE INJECTION =====
    if(!document.getElementById('fp-usa-style')){
      const style=document.createElement('style');
      style.id='fp-usa-style';
      style.textContent=`
        [data-theme='america'] body,
        [data-theme='america'] { background: linear-gradient(180deg, #0a1628 0%, #0d1f3c 40%, #111d33 100%) !important; }
        [data-theme='america'] .fp-bubble,
        [data-theme='america'] .fp-section-card {
          box-shadow: 0 0 12px rgba(178,34,52,0.08), 0 0 2px rgba(60,100,180,0.12), 0 8px 24px rgba(0,0,0,0.5) !important;
          border-color: #1e3a5f !important;
          position: relative;
        }
        [data-theme='america'] .fp-bubble:hover,
        [data-theme='america'] .fp-section-card:hover {
          box-shadow: 0 0 20px rgba(178,34,52,0.18), 0 0 8px rgba(60,100,180,0.2), 0 12px 32px rgba(0,0,0,0.6) !important;
        }
        [data-theme='america'] .fp-bubble::after,
        [data-theme='america'] .fp-section-card::after {
          content: '';
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: repeating-linear-gradient(0deg, transparent 0, transparent 8px, rgba(255,255,255,0.012) 8px, rgba(255,255,255,0.012) 9px);
          border-radius: inherit; opacity: 0.5;
        }
        @keyframes fp-usa-wave { 0%{transform:rotate(-2deg)} 25%{transform:rotate(1deg)} 50%{transform:rotate(-1deg)} 75%{transform:rotate(2deg)} 100%{transform:rotate(-2deg)} }
        @keyframes fp-usa-twinkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        .fp-usa-flag { animation: fp-usa-wave 4s ease-in-out infinite; display:inline-block; }
        .fp-usa-star-twinkle { animation: fp-usa-twinkle 2s ease-in-out infinite; display:inline-block; }
        [data-theme='america'] .bg-\\[var\\(--primary-color\\)\\]{ color:#ffffff !important; font-weight:700; }
        [data-theme='america'] main,
        [data-theme='america'] .fp-bubble,
        [data-theme='america'] .fp-section-card,
        [data-theme='america'] header,
        [data-theme='america'] nav,
        [data-theme='america'] footer,
        [data-theme='america'] form,
        [data-theme='america'] .container { position: relative; z-index: 2; }
      `;
      document.head.appendChild(style);
    }

    // ===== CANVAS (fireworks + stars + subtle stripes) =====
    const isHomePage=/(^|\/)home\.html(\?|#|$)/.test(window.location.pathname+window.location.search);
    const canvas=document.createElement('canvas');
    canvas.id='fp-usa-canvas';
    canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none';
    document.body.prepend(canvas);
    const ctx=canvas.getContext('2d');
    let W,H;
    function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
    resize();

    // -- Twinkling stars background --
    const starCount = isHomePage ? 80 : 40;
    const bgStars = Array.from({length:starCount},()=>({
      x: Math.random()*W,
      y: Math.random()*H*0.7,
      r: 0.5+Math.random()*1.5,
      alpha: 0.3+Math.random()*0.7,
      twinkleSpeed: 0.005+Math.random()*0.015,
      phase: Math.random()*Math.PI*2
    }));

    // -- Fireworks --
    const fireworks=[];
    const sparks=[];
    let fwTimer=0;
    const fwInterval = isHomePage ? 80 : 200;
    const fwColors=['#ff1744','#ffffff','#2979ff','#ff5252','#e3f2fd','#d50000','#1565c0','#ff8a80','#82b1ff'];

    function spawnFirework(){
      fireworks.push({
        x:W*0.1+Math.random()*W*0.8,
        y:H,
        tx:W*0.1+Math.random()*W*0.8,
        ty:H*0.05+Math.random()*H*0.35,
        speed:4+Math.random()*3,
        color:fwColors[Math.floor(Math.random()*fwColors.length)],
        trail:[]
      });
    }

    function explode(fw){
      const count=35+Math.floor(Math.random()*30);
      // Multi-color burst: pick 2-3 colors
      const cols=[fw.color, fwColors[Math.floor(Math.random()*fwColors.length)]];
      for(let i=0;i<count;i++){
        const angle=Math.PI*2*(i/count)+Math.random()*0.3;
        const vel=2+Math.random()*3.5;
        sparks.push({
          x:fw.x, y:fw.y,
          vx:Math.cos(angle)*vel,
          vy:Math.sin(angle)*vel,
          life:1,
          decay:0.01+Math.random()*0.008,
          color:cols[Math.floor(Math.random()*cols.length)],
          r:1.5+Math.random()*2
        });
      }
      // Star-shaped secondary burst (smaller, white)
      for(let i=0;i<8;i++){
        const angle=Math.PI*2*(i/8);
        const vel=1+Math.random()*1.5;
        sparks.push({
          x:fw.x, y:fw.y,
          vx:Math.cos(angle)*vel,
          vy:Math.sin(angle)*vel,
          life:1,
          decay:0.018+Math.random()*0.008,
          color:'#ffffff',
          r:2+Math.random()*1
        });
      }
    }

    // -- Falling confetti (red, white, blue) --
    const confettiCount = isHomePage ? 35 : 15;
    const confetti = Array.from({length:confettiCount},()=>({
      x: Math.random()*W,
      y: Math.random()*H-H*0.1,
      w: 3+Math.random()*4,
      h: 6+Math.random()*6,
      dx: 0.2+Math.random()*0.4,
      dy: 0.5+Math.random()*0.8,
      rot: Math.random()*Math.PI*2,
      drot: 0.02+Math.random()*0.04,
      color: ['#b22234','#ffffff','#3c3b6e'][Math.floor(Math.random()*3)],
      alpha: 0.5+Math.random()*0.4
    }));

    function drawConfetti(c){
      ctx.save();
      ctx.translate(c.x,c.y);
      ctx.rotate(c.rot);
      ctx.globalAlpha=c.alpha;
      ctx.fillStyle=c.color;
      ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h);
      ctx.globalAlpha=1;
      ctx.restore();
    }

    // -- Draw a 5-pointed star --
    function drawStar(cx,cy,r,color,alpha){
      ctx.save();
      ctx.globalAlpha=alpha;
      ctx.fillStyle=color;
      ctx.beginPath();
      for(let i=0;i<5;i++){
        const angle=Math.PI*2*(i/5)-Math.PI/2;
        const ox=cx+Math.cos(angle)*r;
        const oy=cy+Math.sin(angle)*r;
        if(i===0) ctx.moveTo(ox,oy); else ctx.lineTo(ox,oy);
        const inner=Math.PI*2*((i+0.5)/5)-Math.PI/2;
        ctx.lineTo(cx+Math.cos(inner)*r*0.4, cy+Math.sin(inner)*r*0.4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha=1;
      ctx.restore();
    }

    // -- Detailed American Flag (official proportions) --
    // US Flag spec: fly/hoist = 1.9, 13 stripes, canton 7 stripes tall × 2/5 fly wide, 50 stars (9 rows: 6-5-6-5-6-5-6-5-6)
    let flagTime=0;
    function drawFlag(x, y, flagW, opacity){
      ctx.save();
      const flagH = flagW / 1.9;       // official aspect ratio
      const stripeH = flagH / 13;
      const cantonH = stripeH * 7;
      const cantonW = flagW * 0.4;     // 2/5 of fly

      flagTime += 0.012;

      // (no static glow — flag is fully rendered by wave slices)
      ctx.globalAlpha = opacity;

      // Render flag in vertical slices for wave distortion
      const slices = Math.max(60, Math.floor(flagW / 3));
      const sliceW = flagW / slices;

      for(let s=0;s<slices;s++){
        const sx = x + s * sliceW;
        const progress = s / slices; // 0 at hoist, 1 at fly
        // Wave: amplitude increases toward fly end
        const waveAmp = progress * stripeH * 0.6;
        const waveOffset = Math.sin(flagTime * 2.5 + progress * Math.PI * 3) * waveAmp;
        // Slight vertical compression from wave
        const scaleY = 1 - Math.abs(Math.cos(flagTime * 2.5 + progress * Math.PI * 3)) * progress * 0.02;
        // Shading: light shifts across the wave
        const shade = 0.85 + 0.15 * Math.sin(flagTime * 2.5 + progress * Math.PI * 3 + 0.5);

        ctx.save();
        ctx.translate(sx, y + waveOffset);
        ctx.scale(1, scaleY);

        // Draw 13 stripes for this slice
        // In canton area (left 40%, top 7 stripes), draw blue instead of stripes
        const inCanton = progress < 0.4;
        for(let i=0;i<13;i++){
          const sy = i * stripeH;
          if(inCanton && i < 7){
            // Canton blue — draw solid blue, no stripe underneath
            const br = Math.round(10 * shade);
            const bg = Math.round(49 * shade);
            const bb = Math.round(178 * shade);
            ctx.fillStyle = `rgb(${br},${bg},${bb})`;
          } else {
            const isRed = i % 2 === 0;
            if(isRed){
              const r = Math.round(178 * shade);
              const g = Math.round(34 * shade);
              const b = Math.round(52 * shade);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
            } else {
              const v = Math.round(255 * shade);
              ctx.fillStyle = `rgb(${v},${v},${v})`;
            }
          }
          ctx.fillRect(0, sy, sliceW + 0.5, stripeH + 0.5);
        }

        ctx.restore();
      }

      // Stars on canton (drawn after stripes so they sit on top)
      // 9 rows alternating 6 and 5 stars
      const starRows = [6,5,6,5,6,5,6,5,6];
      const starR = cantonH / 22; // star radius proportional to canton
      const rowH = cantonH / 10;  // vertical spacing (10 gaps for 9 rows + margins)
      const col6W = cantonW / 7;  // horizontal spacing for 6-star rows
      const col5W = cantonW / 7;  // same grid, offset by half

      for(let row=0; row<9; row++){
        const count = starRows[row];
        const rowY = y + rowH * (row + 0.75);
        // Wave at the star's x position (hoist side, so minimal wave)
        for(let col=0; col<count; col++){
          let starX, starY;
          if(count===6){
            starX = x + col6W * (col + 0.75);
          } else {
            starX = x + col5W * (col + 1.25);
          }
          // Apply wave distortion matching the stripe wave at this x position
          const prog = (starX - x) / flagW;
          const wAmp = prog * stripeH * 0.6;
          const wOff = Math.sin(flagTime * 2.5 + prog * Math.PI * 3) * wAmp;
          const sShade = 0.85 + 0.15 * Math.sin(flagTime * 2.5 + prog * Math.PI * 3 + 0.5);
          starY = rowY + wOff;
          const starAlpha = Math.min(1, opacity * 3.5 * (0.85 + 0.15 * sShade));
          drawStar(starX, starY, starR, '#ffffff', starAlpha);
        }
      }

      // Pole (hoist edge) — extends to bottom of page
      ctx.globalAlpha = opacity * 0.7;
      ctx.fillStyle = '#8B7355';
      const poleW = Math.max(3, flagW * 0.012);
      const poleX = x - poleW - 1;
      const poleTop = y - flagH * 0.08;
      const poleBottom = H; // extend to bottom of canvas
      ctx.fillRect(poleX, poleTop, poleW, poleBottom - poleTop);
      // Subtle pole highlight (left edge shine)
      ctx.globalAlpha = opacity * 0.25;
      ctx.fillStyle = '#c4a87a';
      ctx.fillRect(poleX, poleTop, poleW * 0.35, poleBottom - poleTop);
      // Pole cap (gold finial)
      ctx.globalAlpha = opacity * 0.7;
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(poleX + poleW/2, poleTop, poleW * 1.8, 0, Math.PI * 2);
      ctx.fill();
      // Gold ball on top
      ctx.beginPath();
      ctx.arc(poleX + poleW/2, poleTop - poleW * 1.2, poleW * 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function tick(){
      ctx.clearRect(0,0,W,H);

      // Draw the detailed American flag
      if(isHomePage){
        // Large flag in the right area, behind content
        const fW = Math.min(W * 0.38, 460);
        drawFlag(W - fW - 50, H * 0.48, fW, 0.88);
      } else {
        // Slightly smaller flag on other pages
        const fW = Math.min(W * 0.28, 340);
        drawFlag(W - fW - 30, H * 0.52, fW, 0.82);
      }

      // Background stars
      bgStars.forEach(s=>{
        s.phase+=s.twinkleSpeed;
        const a=s.alpha*(0.5+0.5*Math.sin(s.phase));
        drawStar(s.x,s.y,s.r,'#ffffff',a);
      });

      // Confetti
      confetti.forEach(c=>{
        c.x+=c.dx+Math.sin(c.rot)*0.2;
        c.y+=c.dy;
        c.rot+=c.drot;
        if(c.y>H+10){ c.y=-10; c.x=Math.random()*W; }
        if(c.x>W+10) c.x=-10;
        drawConfetti(c);
      });

      // Fireworks
      fwTimer++;
      if(fwTimer>=fwInterval){
        fwTimer=0;
        spawnFirework();
        // Sometimes double burst on home page
        if(isHomePage && Math.random()<0.3) setTimeout(spawnFirework, 200+Math.random()*300);
      }
      // Update rockets
      for(let i=fireworks.length-1;i>=0;i--){
        const fw=fireworks[i];
        const dx=fw.tx-fw.x, dy=fw.ty-fw.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<fw.speed){
          explode(fw);
          fireworks.splice(i,1);
        } else {
          fw.x+=dx/dist*fw.speed;
          fw.y+=dy/dist*fw.speed;
          fw.trail.push({x:fw.x,y:fw.y,a:1});
          if(fw.trail.length>14) fw.trail.shift();
          fw.trail.forEach((t,ti)=>{
            ctx.globalAlpha=t.a*0.5*(ti/fw.trail.length);
            ctx.fillStyle=fw.color;
            ctx.beginPath();
            ctx.arc(t.x,t.y,2,0,Math.PI*2);
            ctx.fill();
          });
          ctx.globalAlpha=1;
          ctx.fillStyle=fw.color;
          ctx.beginPath();
          ctx.arc(fw.x,fw.y,3,0,Math.PI*2);
          ctx.fill();
        }
      }
      // Update sparks
      for(let i=sparks.length-1;i>=0;i--){
        const s=sparks[i];
        s.x+=s.vx; s.y+=s.vy;
        s.vy+=0.03;
        s.vx*=0.99;
        s.life-=s.decay;
        if(s.life<=0){ sparks.splice(i,1); continue; }
        ctx.globalAlpha=s.life*0.85;
        ctx.fillStyle=s.color;
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2);
        ctx.fill();
        // Sparkle trail
        if(s.life>0.5 && Math.random()<0.3){
          ctx.globalAlpha=s.life*0.3;
          ctx.beginPath();
          ctx.arc(s.x-s.vx*2,s.y-s.vy*2,s.r*0.5,0,Math.PI*2);
          ctx.fill();
        }
      }
      ctx.globalAlpha=1;

      window.__fpUSARAF=requestAnimationFrame(tick);
    }
    window.__fpUSARAF=requestAnimationFrame(tick);

    // ===== DECORATIVE HEADER =====
    const decor=document.createElement('div');
    decor.id='fp-usa-decor';
    decor.style.cssText='position:fixed;top:0;left:0;width:100%;z-index:1;pointer-events:none;display:flex;justify-content:space-around;padding:0 6vw';
    const headerItems=['\u2B50','\uD83C\uDDFA\uD83C\uDDF8','\u2B50','\uD83C\uDDFA\uD83C\uDDF8','\u2B50'];
    headerItems.forEach((e,i)=>{
      const span=document.createElement('span');
      span.textContent=e;
      span.className=i%2===0?'fp-usa-star-twinkle':'fp-usa-flag';
      span.style.cssText='font-size:'+(i%2===0?'20px':'28px')+';animation-delay:'+i*0.5+'s;display:inline-block';
      decor.appendChild(span);
    });
    document.body.appendChild(decor);

    // ===== LOGO SWAP =====
    function applyUSALogo(){
      document.querySelectorAll('h1,h2').forEach(h=>{
        if(h.id==='pageTitle'||h.id==='welcomeHeader'||h.id==='calTitle') return;
        if(h.dataset.usaLogo) return;
        if(h.textContent.trim()==='FocusPath'){
          h.dataset.usaLogo='1';
          h.dataset.origHtml=h.innerHTML;
          h.innerHTML='<span class="fp-usa-flag" style="display:inline-block;margin-right:6px">\uD83C\uDDFA\uD83C\uDDF8</span> FocusPath';
        }
      });
    }
    applyUSALogo();

    window.__fpUSAResize=()=>{
      if(document.documentElement.getAttribute('data-theme')!=='america') return;
      resize();
      bgStars.forEach(s=>{ s.x=Math.random()*W; s.y=Math.random()*H*0.7; });
      confetti.forEach(c=>{ c.x=Math.random()*W; c.y=Math.random()*H; });
      applyUSALogo();
    };
    window.addEventListener('resize',window.__fpUSAResize);
  }

  function applyChineseNewYearExtras(active){
    // --- Cleanup ---
    if(!active){
      document.getElementById('fp-cny-canvas')?.remove();
      document.getElementById('fp-cny-style')?.remove();
      document.getElementById('fp-cny-decor')?.remove();
      document.querySelectorAll('[data-cny-logo]')?.forEach(h=>{
        if(h.dataset.origHtml){ h.innerHTML=h.dataset.origHtml; delete h.dataset.origHtml; }
        h.removeAttribute('data-cny-logo');
      });
      window.removeEventListener('resize',window.__fpCNYResize||(()=>{}));
      delete window.__fpCNYResize;
      if(window.__fpCNYRAF) cancelAnimationFrame(window.__fpCNYRAF);
      delete window.__fpCNYRAF;
      return;
    }
    if(document.getElementById('fp-cny-canvas')) return;

    // ===== STYLE INJECTION =====
    if(!document.getElementById('fp-cny-style')){
      const style=document.createElement('style');
      style.id='fp-cny-style';
      style.textContent=`
        [data-theme='chinese-new-year'] body,
        [data-theme='chinese-new-year'] { background: radial-gradient(ellipse at 50% 0%, #3a0a0a 0%, #1a0505 70%) !important; }
        [data-theme='chinese-new-year'] .fp-bubble,
        [data-theme='chinese-new-year'] .fp-section-card {
          box-shadow: 0 0 12px rgba(212,175,55,0.08), 0 0 2px rgba(200,50,50,0.12), 0 8px 24px rgba(0,0,0,0.5) !important;
          border-color: #6b1515 !important;
          position: relative;
        }
        [data-theme='chinese-new-year'] .fp-bubble:hover,
        [data-theme='chinese-new-year'] .fp-section-card:hover {
          box-shadow: 0 0 20px rgba(212,175,55,0.18), 0 0 6px rgba(200,50,50,0.2), 0 12px 32px rgba(0,0,0,0.6) !important;
        }
        [data-theme='chinese-new-year'] .fp-bubble::after,
        [data-theme='chinese-new-year'] .fp-section-card::after {
          content: '';
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: repeating-linear-gradient(0deg, transparent 0, transparent 5px, rgba(212,175,55,0.015) 5px, rgba(212,175,55,0.015) 6px);
          border-radius: inherit; opacity: 0.5;
        }
        @keyframes fp-cny-lantern-sway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        @keyframes fp-cny-glow { 0%,100%{filter:drop-shadow(0 0 4px rgba(212,175,55,0.5))} 50%{filter:drop-shadow(0 0 12px rgba(212,175,55,0.9)) drop-shadow(0 0 20px rgba(200,50,50,0.3))} }
        @keyframes fp-cny-float { 0%{transform:translateY(0)} 50%{transform:translateY(-8px)} 100%{transform:translateY(0)} }
        .fp-cny-lantern { animation: fp-cny-lantern-sway 3s ease-in-out infinite, fp-cny-glow 4s ease-in-out infinite; }
        [data-theme='chinese-new-year'] .bg-\\[var\\(--primary-color\\)\\]{ color:#1a0505 !important; font-weight:700; }
        [data-theme='chinese-new-year'] main,
        [data-theme='chinese-new-year'] .fp-bubble,
        [data-theme='chinese-new-year'] .fp-section-card,
        [data-theme='chinese-new-year'] header,
        [data-theme='chinese-new-year'] nav,
        [data-theme='chinese-new-year'] footer,
        [data-theme='chinese-new-year'] form,
        [data-theme='chinese-new-year'] .container { position: relative; z-index: 2; }
      `;
      document.head.appendChild(style);
    }

    // ===== CANVAS (fireworks + floating lanterns + falling petals) =====
    const isHomePage=/(^|\/)home\.html(\?|#|$)/.test(window.location.pathname+window.location.search);
    const canvas=document.createElement('canvas');
    canvas.id='fp-cny-canvas';
    canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none';
    document.body.prepend(canvas);
    const ctx=canvas.getContext('2d');
    let W,H;
    function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
    resize();

    // -- Floating lanterns --
    const lanternCount = isHomePage ? 8 : 4;
    const lanterns = Array.from({length:lanternCount},()=>({
      x: Math.random()*W,
      y: Math.random()*H*0.6+H*0.1,
      size: 18+Math.random()*14,
      speed: 0.15+Math.random()*0.2,
      sway: Math.random()*Math.PI*2,
      swaySpeed: 0.008+Math.random()*0.006,
      glow: 0.4+Math.random()*0.4
    }));

    function drawLantern(l){
      ctx.save();
      ctx.translate(l.x, l.y);
      const sway = Math.sin(l.sway)*6;
      ctx.translate(sway, 0);
      const s = l.size;
      // Glow
      const grad = ctx.createRadialGradient(0,0,s*0.3,0,0,s*1.8);
      grad.addColorStop(0,'rgba(255,80,20,'+l.glow*0.3+')');
      grad.addColorStop(0.5,'rgba(200,40,10,'+l.glow*0.1+')');
      grad.addColorStop(1,'rgba(200,40,10,0)');
      ctx.fillStyle=grad;
      ctx.fillRect(-s*1.8,-s*1.8,s*3.6,s*3.6);
      // String
      ctx.strokeStyle='rgba(212,175,55,0.4)';
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,-s*1.2); ctx.lineTo(0,-s*1.8); ctx.stroke();
      // Top ring
      ctx.fillStyle='#d4af37';
      ctx.fillRect(-s*0.2,-s*1.2,s*0.4,s*0.15);
      // Body
      ctx.fillStyle='#cc2222';
      ctx.beginPath();
      ctx.ellipse(0,-s*0.3,s*0.45,s*0.85,0,0,Math.PI*2);
      ctx.fill();
      // Ribs (gold bands)
      ctx.strokeStyle='rgba(212,175,55,0.6)';
      ctx.lineWidth=1.2;
      for(let i=-2;i<=2;i++){
        const ry=i*s*0.18-s*0.3;
        const rx=s*0.45*Math.cos(Math.asin(Math.min(1,Math.abs(i)*0.22)));
        ctx.beginPath(); ctx.moveTo(-rx,ry); ctx.lineTo(rx,ry); ctx.stroke();
      }
      // Bottom tassel
      ctx.fillStyle='#d4af37';
      ctx.fillRect(-s*0.08,s*0.5,s*0.16,s*0.2);
      ctx.strokeStyle='rgba(212,175,55,0.7)';
      ctx.lineWidth=1;
      for(let i=-1;i<=1;i++){
        ctx.beginPath(); ctx.moveTo(i*s*0.06,s*0.7); ctx.lineTo(i*s*0.1,s*1.0); ctx.stroke();
      }
      // Inner glow highlight
      const ig=ctx.createRadialGradient(0,-s*0.35,0,0,-s*0.35,s*0.35);
      ig.addColorStop(0,'rgba(255,200,80,0.25)');
      ig.addColorStop(1,'rgba(255,80,20,0)');
      ctx.fillStyle=ig;
      ctx.beginPath();
      ctx.ellipse(0,-s*0.35,s*0.3,s*0.5,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    // -- Cherry blossom petals --
    const petalCount = isHomePage ? 45 : 20;
    const petals=Array.from({length:petalCount},()=>({
      x:Math.random()*W,
      y:Math.random()*H-H*0.2,
      r:2+Math.random()*3,
      dx:0.2+Math.random()*0.5,
      dy:0.4+Math.random()*0.6,
      rot:Math.random()*Math.PI*2,
      drot:0.01+Math.random()*0.02,
      alpha:0.4+Math.random()*0.4
    }));

    function drawPetal(p){
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha=p.alpha;
      ctx.fillStyle='#ffb7c5';
      ctx.beginPath();
      ctx.ellipse(0,0,p.r,p.r*0.5,0,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=1;
      ctx.restore();
    }

    // -- Fireworks (home page only) --
    const fireworks=[];
    const sparks=[];
    let fwTimer=0;
    const fwInterval=isHomePage?120:0;
    const fwColors=['#ff3333','#d4af37','#ff6600','#ff1a75','#ffcc00','#ff4444','#ff8800'];

    function spawnFirework(){
      fireworks.push({
        x:W*0.15+Math.random()*W*0.7,
        y:H,
        tx:W*0.15+Math.random()*W*0.7,
        ty:H*0.1+Math.random()*H*0.3,
        speed:4+Math.random()*2,
        color:fwColors[Math.floor(Math.random()*fwColors.length)],
        trail:[]
      });
    }

    function explode(fw){
      const count=30+Math.floor(Math.random()*25);
      for(let i=0;i<count;i++){
        const angle=Math.PI*2*(i/count)+Math.random()*0.3;
        const vel=1.5+Math.random()*3;
        sparks.push({
          x:fw.x,y:fw.y,
          vx:Math.cos(angle)*vel,
          vy:Math.sin(angle)*vel,
          life:1,
          decay:0.012+Math.random()*0.008,
          color:fw.color,
          r:1.5+Math.random()*1.5
        });
      }
    }

    // -- Dragon particles (subtle golden trail on home) --
    const dragonParticles=[];
    let dragonAngle=0;

    function tick(){
      ctx.clearRect(0,0,W,H);

      // Petals
      petals.forEach(p=>{
        p.x+=p.dx+Math.sin(p.rot)*0.3;
        p.y+=p.dy;
        p.rot+=p.drot;
        if(p.y>H+10){ p.y=-10; p.x=Math.random()*W; }
        if(p.x>W+10) p.x=-10;
        drawPetal(p);
      });

      // Lanterns
      lanterns.forEach(l=>{
        l.y-=l.speed*0.15;
        l.sway+=l.swaySpeed;
        l.glow=0.4+Math.sin(l.sway*2)*0.2;
        if(l.y<-l.size*2){ l.y=H+l.size*2; l.x=Math.random()*W; }
        drawLantern(l);
      });

      // Fireworks (home only)
      if(isHomePage && fwInterval){
        fwTimer++;
        if(fwTimer>=fwInterval){
          fwTimer=0;
          spawnFirework();
        }
        // Update rockets
        for(let i=fireworks.length-1;i>=0;i--){
          const fw=fireworks[i];
          const dx=fw.tx-fw.x, dy=fw.ty-fw.y;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<fw.speed){
            explode(fw);
            fireworks.splice(i,1);
          } else {
            fw.x+=dx/dist*fw.speed;
            fw.y+=dy/dist*fw.speed;
            fw.trail.push({x:fw.x,y:fw.y,a:1});
            if(fw.trail.length>12) fw.trail.shift();
            // Draw trail
            fw.trail.forEach((t,ti)=>{
              ctx.globalAlpha=t.a*0.5*(ti/fw.trail.length);
              ctx.fillStyle=fw.color;
              ctx.beginPath();
              ctx.arc(t.x,t.y,2,0,Math.PI*2);
              ctx.fill();
            });
            ctx.globalAlpha=1;
            // Draw rocket
            ctx.fillStyle=fw.color;
            ctx.beginPath();
            ctx.arc(fw.x,fw.y,3,0,Math.PI*2);
            ctx.fill();
          }
        }
        // Update sparks
        for(let i=sparks.length-1;i>=0;i--){
          const s=sparks[i];
          s.x+=s.vx; s.y+=s.vy;
          s.vy+=0.03; // gravity
          s.vx*=0.99;
          s.life-=s.decay;
          if(s.life<=0){ sparks.splice(i,1); continue; }
          ctx.globalAlpha=s.life*0.8;
          ctx.fillStyle=s.color;
          ctx.beginPath();
          ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2);
          ctx.fill();
        }
        ctx.globalAlpha=1;

        // Dragon golden trail
        dragonAngle+=0.008;
        const dx2=W*0.5+Math.sin(dragonAngle)*W*0.3;
        const dy2=H*0.25+Math.cos(dragonAngle*0.7)*H*0.12;
        if(Math.random()<0.3){
          dragonParticles.push({x:dx2,y:dy2,a:0.6,r:1.5+Math.random()*2,life:1,decay:0.015});
        }
        for(let i=dragonParticles.length-1;i>=0;i--){
          const dp=dragonParticles[i];
          dp.life-=dp.decay;
          dp.y-=0.3;
          dp.x+=Math.sin(dp.life*10)*0.5;
          if(dp.life<=0){dragonParticles.splice(i,1);continue;}
          ctx.globalAlpha=dp.life*dp.a;
          ctx.fillStyle='#d4af37';
          ctx.beginPath();
          ctx.arc(dp.x,dp.y,dp.r*dp.life,0,Math.PI*2);
          ctx.fill();
        }
        ctx.globalAlpha=1;
      }

      window.__fpCNYRAF=requestAnimationFrame(tick);
    }
    window.__fpCNYRAF=requestAnimationFrame(tick);

    // ===== DECORATIVE HEADER LANTERNS =====
    const decor=document.createElement('div');
    decor.id='fp-cny-decor';
    decor.style.cssText='position:fixed;top:0;left:0;width:100%;z-index:1;pointer-events:none;display:flex;justify-content:space-around;padding:0 8vw';
    const lanternEmojis=['🏮','🏮','🧧','🏮','🏮'];
    lanternEmojis.forEach((e,i)=>{
      const span=document.createElement('span');
      span.textContent=e;
      span.className='fp-cny-lantern';
      span.style.cssText='font-size:28px;animation-delay:'+i*0.4+'s;display:inline-block';
      decor.appendChild(span);
    });
    document.body.appendChild(decor);

    // ===== LOGO SWAP =====
    function applyCNYLogo(){
      document.querySelectorAll('h1,h2').forEach(h=>{
        if(h.id==='pageTitle'||h.id==='welcomeHeader'||h.id==='calTitle') return;
        if(h.dataset.cnyLogo) return;
        if(h.textContent.trim()==='FocusPath'){
          h.dataset.cnyLogo='1';
          h.dataset.origHtml=h.innerHTML;
          h.innerHTML='<span class="fp-cny-lantern" style="display:inline-block;margin-right:6px">🏮</span> FocusPath';
        }
      });
    }
    applyCNYLogo();

    window.__fpCNYResize=()=>{
      if(document.documentElement.getAttribute('data-theme')!=='chinese-new-year') return;
      resize();
      lanterns.forEach(l=>{ l.x=Math.random()*W; l.y=Math.random()*H*0.6+H*0.1; });
      petals.forEach(p=>{ p.x=Math.random()*W; p.y=Math.random()*H; });
      applyCNYLogo();
    };
    window.addEventListener('resize',window.__fpCNYResize);
  }

  function applyThemeKey(key){
    let vars;
    if (key === 'system') {
      vars = computeSystemTheme();
      document.documentElement.setAttribute('data-theme', 'system');
    } else {
      vars = THEMES[key] || THEMES.light;
      document.documentElement.setAttribute('data-theme', key);
    }
    applyVars(vars);
  // Layering: avoid forcing body above overlays; let overlays manage their own z-index
  try { document.body.style.position=''; document.body.style.zIndex=''; } catch {}
    // Apply or remove Star Wars extras
  applyStarWarsExtras(key==='star-wars');
  applyHalloweenExtras(key==='halloween');
  applyChristmasExtras(key==='christmas');
  applyUSMCExtras(key==='usmc');
  applyChineseNewYearExtras(key==='chinese-new-year');
  applyAmericaExtras(key==='america');
  // Broadcast theme change for listeners (e.g., quotes)
  try { window.dispatchEvent(new CustomEvent('fpThemeChanged',{detail:{theme:key}})); } catch {}
  }

  function setTheme(key){
    // Only allow Halloween theme in October (unless Dev Mode)
    if(key === 'halloween' && !devIsOn()) {
      const now = new Date();
      const month = now.getMonth(); // 0-indexed: October is 9
      if(month !== 9) {
        // If not October, fallback to system theme and show a notice
        applyThemeKey('system');
        alert('Halloween theme is only available in October!');
        return;
      }
    }
    // Only allow Christmas theme in December (month 11) unless Dev Mode
    if(key === 'christmas' && !devIsOn()){
      const now = new Date();
      const month = now.getMonth(); // 0-indexed: December is 11
      if(month !== 11){
        applyThemeKey('system');
        alert('Christmas theme is only available in December!');
        return;
      }
    }
    // Only allow Chinese New Year theme during CNY season (15-day window) unless Dev Mode
    if(key === 'chinese-new-year' && !devIsOn()){
      if(!isCNYSeason()){
        applyThemeKey('system');
        alert('Chinese New Year theme is only available during the Lunar New Year celebration!');
        return;
      }
    }
    // Only allow America theme in July unless Dev Mode
    if(key === 'america' && !devIsOn()){
      if(new Date().getMonth() !== 6){
        applyThemeKey('system');
        alert('America theme is only available in July!');
        return;
      }
    }
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
    applyThemeKey(key);
  }

  function getTheme(){
    try { return localStorage.getItem(STORAGE_KEY) || 'system'; } catch { return 'system'; }
  }

  function init(){
    // Inject a small CSS bridge so common Tailwind utility colors defer to theme variables
    if (!document.getElementById('fp-theme-bridge')) {
      const style = document.createElement('style');
      style.id = 'fp-theme-bridge';
      style.textContent = `
        /* Theme variable bridge */
        html, body { background: var(--background-color); color: var(--text-primary); }
        .bg-white { background-color: var(--white) !important; }
        .bg-gray-50 { background-color: var(--white) !important; }
        .bg-gray-100 { background-color: var(--surface-hover) !important; }
        .hover\\:bg-gray-100:hover { background-color: var(--surface-hover) !important; }
        .bg-gray-200 { background-color: var(--surface-hover) !important; }
        .hover\\:bg-gray-300:hover { background-color: var(--surface-hover) !important; }
        .hover\\:bg-red-50:hover { background-color: var(--surface-hover) !important; }
        .bg-blue-600 { background-color: var(--primary-color) !important; }
        .hover\\:bg-blue-700:hover { background-color: var(--primary-color) !important; }
        .border-gray-300 { border-color: var(--border-color) !important; }
        .text-gray-800, .text-gray-900, .text-black { color: var(--text-primary) !important; }
        .text-gray-400, .text-gray-500, .text-gray-600, .text-gray-700 { color: var(--text-secondary) !important; }
        
        /* Bubbly, rounded look upgrades */
        /* Increase radii app-wide, but avoid distorting native input controls */
        .rounded:not(input):not(select):not(textarea) { border-radius: 12px !important; }
        .rounded-sm:not(input):not(select):not(textarea) { border-radius: 10px !important; }
        .rounded-md:not(input):not(select):not(textarea) { border-radius: 14px !important; }
        .rounded-lg:not(input):not(select):not(textarea) { border-radius: 18px !important; }
        .rounded-xl:not(input):not(select):not(textarea) { border-radius: 24px !important; }
        .rounded-2xl:not(input):not(select):not(textarea) { border-radius: 28px !important; }
        /* Do not touch .rounded-full so avatars and pills remain circular */

        /* Softer, floatier card shadows */
        .shadow { box-shadow: 0 8px 22px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04) !important; }
        .shadow-sm { box-shadow: 0 6px 16px rgba(0,0,0,0.05), 0 1px 6px rgba(0,0,0,0.04) !important; }
        .shadow-md { box-shadow: 0 12px 28px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05) !important; }
        .shadow-lg { box-shadow: 0 18px 42px rgba(0,0,0,0.12), 0 6px 18px rgba(0,0,0,0.06) !important; }
        
        /* Slightly round theme menus and popovers even if utilities are missing */
  #themeMenu, .popover, .menu, .dropdown { border-radius: 14px !important; z-index: 50; }

        /* Floating bubble components */
        .fp-bubble {
          background: var(--white) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: 18px !important;
          box-shadow: 0 12px 28px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05) !important;
          transition: transform .12s ease, box-shadow .12s ease, background-color .2s ease;
        }
        .fp-bubble:hover { transform: translateY(-1px); box-shadow: 0 16px 36px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06) !important; }
        .fp-bubble:active { transform: translateY(0); }
        .fp-bubble-primary {
          background: var(--primary-color) !important;
          color: #fff !important;
          border: 1px solid color-mix(in srgb, var(--primary-color) 55%, transparent) !important;
          border-radius: 18px !important;
          box-shadow: 0 14px 30px color-mix(in srgb, var(--primary-color) 20%, transparent), 0 4px 10px rgba(0,0,0,0.06) !important;
          transition: transform .12s ease, box-shadow .12s ease, filter .2s ease;
        }
        .fp-bubble-primary:hover { transform: translateY(-1px); filter: brightness(0.98); }
        /* Circular bubble button (icon button) */
        .fp-bubble-circle {
          width: 44px; height: 44px; border-radius: 9999px !important; padding: 0 !important;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--white) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-color) !important;
          box-shadow: 0 12px 28px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05) !important;
          transition: transform .12s ease, box-shadow .12s ease, background-color .2s ease;
        }
        .fp-bubble-circle:hover { transform: translateY(-1px); box-shadow: 0 16px 36px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06) !important; }
        .fp-bubble-circle:active { transform: translateY(0); }
        .fp-section-card {
          background: var(--white) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: 18px !important;
          box-shadow: 0 12px 28px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05) !important;
          padding: 0.75rem !important;
        }
        /* On page-wide Christmas gradient, keep panels readable but floaty */
        body.christmas-page-bg .fp-bubble,
        body.christmas-page-bg .fp-section-card {
          background: color-mix(in srgb, var(--white) 95%, transparent) !important;
          border-color: color-mix(in srgb, var(--border-color) 80%, transparent) !important;
          box-shadow: 0 0 16px rgba(196,30,58,0.12), 0 0 4px rgba(34,120,60,0.1), 0 16px 36px rgba(0,0,0,0.25) !important;
        }

          /* Modern input styling */
    input[type=text], input[type=search], input[type=number], input[type=email], input[type=password], input[type=date], input[type=time], textarea, select, .modern-input {
            border-radius: 14px !important;
            background: var(--white) !important;
            border: 1px solid var(--border-color) !important;
            padding: 0.65rem 0.9rem !important;
            font-family: inherit; font-size: 0.9rem; line-height:1.3;
            color: var(--text-primary) !important;
            transition: border-color .18s ease, box-shadow .18s ease, background-color .25s ease;
          }
          input:focus, textarea:focus, select:focus {
            outline: none !important;
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 35%, transparent) !important;
          }
          input[disabled], textarea[disabled], select[disabled] { opacity:.55; cursor:not-allowed; }
          /* Subtle inner background for textareas */
          textarea { min-height: 110px; resize: vertical; }
          /* Placeholder color alignment */
          ::placeholder { color: var(--text-secondary); opacity:.7; }
          /* Remove number input spinners (webkit) */
          input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          /* Dark theme adjustments auto rely on variables */
          @media (prefers-color-scheme: dark) {
            input[type=text], input[type=search], input[type=number], input[type=email], input[type=password], input[type=date], input[type=time], textarea, select {
              background: var(--white) !important; /* dark theme 'white' variable is a dark panel color */
              color: var(--text-primary) !important;
            }
          [data-theme='dark'] input[type=date], [data-theme='dark'] input[type=time]{ background: var(--white) !important; color: var(--text-primary) !important; }
          }
          /* USMC crayon font – bump 2px bigger since Gaegu renders small */
          [data-theme='usmc'] { font-size: calc(1em + 2px); }
          [data-theme='usmc'] * { font-family: 'Gaegu', cursive !important; }
      `;
      document.head.appendChild(style);
    }
  let selected = getTheme();
  // Guard stored Christmas outside December unless Dev Mode
  const isDecember = new Date().getMonth() === 11;
  if(selected === 'christmas' && !isDecember && !devIsOn()){ selected = 'system'; try { localStorage.setItem(STORAGE_KEY, selected); } catch {} }
    // Seasonal override: Use Halloween as ephemeral default in October if user hasn't explicitly chosen something else
    let storedRaw=null; try { storedRaw = localStorage.getItem(STORAGE_KEY); } catch {}
  // Guard stored America outside July unless Dev Mode
  const isJuly = new Date().getMonth() === 6;
  if(selected === 'america' && !isJuly && !devIsOn()){ selected = 'system'; try { localStorage.setItem(STORAGE_KEY, selected); } catch {} }
  const isOctober = new Date().getMonth() === 9; // 0=Jan
    if(isJuly && (!storedRaw || storedRaw==='system')) {
      applyThemeKey('america');
    } else if(isOctober && (!storedRaw || storedRaw==='system')) {
      applyThemeKey('halloween');
    } else {
  applyThemeKey(selected);
    }
    // Update on system changes if using system
    if (selected === 'system' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', () => applyThemeKey('system'));
      } else if (typeof mq.addListener === 'function') { // legacy
        mq.addListener(() => applyThemeKey('system'));
      }
    }
    // Dev mode: keyboard shortcut and badge
    try {
      ensureDevBadge();
      window.addEventListener('keydown', (e)=>{
        // Ctrl+Shift+D opens Dev modal
        if((e.ctrlKey||e.metaKey) && e.shiftKey && (e.key==='D' || e.key==='d')){
          e.preventDefault(); showDevModal();
        }
      });
      // Hidden text command: type "focusdev" anywhere to open Dev modal
      (function(){
        const SEQ = 'focusdev';
        let buf = '';
        let timer = null;
        window.addEventListener('keydown', function(e){
          if(e.ctrlKey || e.metaKey || e.altKey) return;
          if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
          if(e.key.length === 1) buf += e.key.toLowerCase();
          else buf = '';
          clearTimeout(timer);
          timer = setTimeout(function(){ buf = ''; }, 2000);
          if(buf.endsWith(SEQ)){ buf = ''; showDevModal(); }
        });
      })();
    } catch {}
  }

  /* ─── Shared Theme Picker Modal ─── */
  let _pickerOverlay = null;
  function openThemePicker(){
    if(_pickerOverlay){ closeThemePicker(); return; }

    const list = window.ThemeManager ? window.ThemeManager.listThemes() : ['system',...Object.keys(THEMES)];
    const unlockedStarWars = list.includes('star-wars');
    const DEV = !!(window.FPDev && window.FPDev.isDev && window.FPDev.isDev());
    const month = new Date().getMonth();

    // Inject scoped styles
    const styleId = 'fpThemePickerStyles';
    if(!document.getElementById(styleId)){
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        #fpThemePickerOverlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0);transition:background .2s ease;}
        .fptp-panel{
          width:100%;max-width:360px;max-height:min(520px,80vh);
          background:var(--white,#fff);color:var(--text-primary);
          border:1px solid var(--border-color);
          border-radius:18px;
          box-shadow:0 12px 48px rgba(0,0,0,.15),0 4px 16px rgba(0,0,0,.08);
          display:flex;flex-direction:column;overflow:hidden;
          transform:scale(.92) translateY(12px);opacity:0;
          transition:transform .25s cubic-bezier(.22,1,.36,1),opacity .2s ease;
        }
        .fptp-panel.fptp-open{transform:scale(1) translateY(0);opacity:1;}
        .fptp-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 12px;border-bottom:1px solid var(--border-color);}
        .fptp-title{font:700 16px/1.3 system-ui,-apple-system,sans-serif;color:var(--text-primary);margin:0;}
        .fptp-close{background:none;border:none;cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:10px;color:var(--text-secondary);font-size:18px;transition:background .15s,color .15s;}
        .fptp-close:hover{background:var(--background-color);color:var(--text-primary);}
        .fptp-scroll{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:8px;}
        .fptp-scroll::-webkit-scrollbar{width:6px;}.fptp-scroll::-webkit-scrollbar-track{background:transparent;}.fptp-scroll::-webkit-scrollbar-thumb{background:var(--border-color);border-radius:3px;}
        .fptp-item{
          width:100%;display:flex;align-items:center;gap:12px;
          padding:10px 12px;margin-bottom:2px;border-radius:12px;
          border:none;background:transparent;cursor:pointer;text-align:left;
          font:inherit;color:var(--text-primary);transition:background .12s ease;
        }
        .fptp-item:hover{background:var(--background-color);}
        .fptp-item.fptp-active{background:color-mix(in srgb,var(--primary-color) 12%,transparent);}
        .fptp-swatch{
          width:32px;height:32px;border-radius:8px;flex-shrink:0;
          border:1px solid var(--border-color);position:relative;overflow:hidden;
        }
        .fptp-swatch-half{position:absolute;top:0;bottom:0;width:50%;}
        .fptp-label{flex:1;min-width:0;}
        .fptp-label-text{font-weight:500;font-size:13px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .fptp-label-sub{font-size:11px;color:var(--text-secondary);margin-top:1px;}
        .fptp-check{color:var(--primary-color);font-size:16px;flex-shrink:0;font-weight:700;}
        .fptp-divider{height:1px;background:var(--border-color);margin:6px 12px;}
        .fptp-hint{padding:10px 16px;font-size:11px;color:var(--text-secondary);text-align:center;border-top:1px solid var(--border-color);}
      `;
      document.head.appendChild(style);
    }

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'fpThemePickerOverlay';
    overlay.addEventListener('click', e => { if(e.target === overlay) closeThemePicker(); });

    // Panel
    const panel = document.createElement('div');
    panel.className = 'fptp-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'fptp-header';
    const title = document.createElement('h3');
    title.className = 'fptp-title';
    title.textContent = 'Theme';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'fptp-close';
    closeBtn.setAttribute('aria-label','Close');
    closeBtn.innerHTML = '&#x2715;';
    closeBtn.addEventListener('click', closeThemePicker);
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Scrollable list
    const scroll = document.createElement('div');
    scroll.className = 'fptp-scroll';

    const branchLabels = {usa:'U.S. Army',usn:'U.S. Navy',usmc:'U.S. Marine Corps',usaf:'U.S. Air Force'};
    const emojiMap = {'chinese-new-year':'🏮','america':'🗽','halloween':'🎃','christmas':'🎄','star-wars':'⭐','usa':'🪖','usn':'⚓','usmc':'🦅','usaf':'✈️'};
    const swatchColors = {
      system:['#3b82f6','#60a5fa'], light:['#f8fafc','#d1d5db'], dark:['#1e293b','#334155'],
      ocean:['#0c4a6e','#38bdf8'], forest:['#14532d','#22c55e'], sunset:['#7c2d12','#fb923c'],
      'high-contrast':['#000000','#ffff00'], halloween:['#1a1a2e','#ff6600'], christmas:['#1a472a','#c41e3a'],
      'chinese-new-year':['#8b0000','#ffd700'], america:['#002868','#bf0a30'], 'star-wars':['#000000','#ffe81f'],
      usa:['#4b5320','#c19a6b'], usn:['#003366','#ffd700'], usmc:['#8b0000','#c5b358'], usaf:['#00308f','#87ceeb']
    };

    // Categorize themes
    const baseKeys = ['system','light','dark','ocean','forest','sunset','high-contrast'];
    const seasonalKeys = ['halloween','christmas','chinese-new-year','america'];
    const branchKeys = Object.keys(branchLabels);
    const secretKeys = ['star-wars'];

    function rebuildList(){
      const cur = getTheme();
      const scrollTop = scroll.scrollTop;
      scroll.innerHTML = '';

      function addSection(label){
        if(scroll.children.length > 0){
          const div = document.createElement('div');
          div.className = 'fptp-divider';
          scroll.appendChild(div);
        }
        const lbl = document.createElement('div');
        lbl.style.cssText = 'padding:6px 14px 2px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-secondary);';
        lbl.textContent = label;
        scroll.appendChild(lbl);
      }

      function addItem(key){
        if(!list.includes(key)) return;
        if(key==='halloween' && month!==9 && !DEV) return;

        const btn = document.createElement('button');
        btn.className = 'fptp-item' + (cur===key ? ' fptp-active' : '');

        // Swatch
        const swatch = document.createElement('div');
        swatch.className = 'fptp-swatch';
        const colors = swatchColors[key] || ['#6366f1','#a78bfa'];
        const half1 = document.createElement('div');
        half1.className = 'fptp-swatch-half';
        half1.style.cssText = 'left:0;background:'+colors[0]+';';
        const half2 = document.createElement('div');
        half2.className = 'fptp-swatch-half';
        half2.style.cssText = 'left:50%;background:'+colors[1]+';';
        swatch.appendChild(half1);
        swatch.appendChild(half2);
        btn.appendChild(swatch);

        // Label
        const labelWrap = document.createElement('div');
        labelWrap.className = 'fptp-label';
        let label = key==='system' ? 'System Default' : key.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
        if(branchLabels[key]) label = branchLabels[key];
        if(key==='star-wars') label = 'Star Wars';
        const emoji = emojiMap[key] || '';
        const textEl = document.createElement('div');
        textEl.className = 'fptp-label-text';
        textEl.textContent = (emoji ? emoji+' ' : '') + label;
        labelWrap.appendChild(textEl);
        btn.appendChild(labelWrap);

        // Checkmark
        if(cur === key){
          const chk = document.createElement('span');
          chk.className = 'fptp-check';
          chk.textContent = '✓';
          btn.appendChild(chk);
        }

        btn.addEventListener('click', () => {
          if(window.ThemeManager) window.ThemeManager.setTheme(key);
          // Rebuild list in-place to update checkmark without closing
          rebuildList();
        });
        scroll.appendChild(btn);
      }

      addSection('Standard');
      baseKeys.forEach(addItem);

      const hasAnySeasonal = seasonalKeys.some(k => list.includes(k));
      if(hasAnySeasonal){
        addSection('Seasonal');
        seasonalKeys.forEach(addItem);
      }

      const hasAnyBranch = branchKeys.some(k => list.includes(k));
      if(hasAnyBranch){
        addSection('Military Branch');
        branchKeys.forEach(addItem);
      }

      if(list.includes('star-wars')){
        addSection('Unlocked');
        addItem('star-wars');
      }

      // Restore scroll position
      scroll.scrollTop = scrollTop;
    }

    rebuildList();
    panel.appendChild(scroll);

    // Secret hint footer
    if(!unlockedStarWars){
      const hint = document.createElement('div');
      hint.className = 'fptp-hint';
      hint.textContent = '🔒 Unlock all achievements to reveal a secret theme.';
      panel.appendChild(hint);
    }

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    _pickerOverlay = overlay;

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.background = 'rgba(0,0,0,.32)';
        panel.classList.add('fptp-open');
      });
    });

    // Escape key
    overlay._escHandler = e => { if(e.key === 'Escape') closeThemePicker(); };
    document.addEventListener('keydown', overlay._escHandler);
  }

  function closeThemePicker(){
    if(!_pickerOverlay) return;
    const overlay = _pickerOverlay;
    const panel = overlay.querySelector('.fptp-panel');
    overlay.style.background = 'rgba(0,0,0,0)';
    if(panel) panel.classList.remove('fptp-open');
    document.removeEventListener('keydown', overlay._escHandler);
    setTimeout(() => { overlay.remove(); }, 250);
    _pickerOverlay = null;
  }

  window.ThemeManager = {
    init,
    setTheme,
    getTheme,
    openPicker: openThemePicker,
    closePicker: closeThemePicker,
    listThemes: () => {
      // In Developer Mode, reveal all themes (including seasonal and secret) regardless of month
      if (devIsOn()) {
        const all = ['system', ...Object.keys(THEMES)];
        // Ensure unique ordering, keep system first
        return Array.from(new Set(all));
      }
      const base=['system','light','dark','ocean','forest','sunset','high-contrast'];
      const month = new Date().getMonth();
      // Halloween only in October
      if(month === 9) base.splice(6,0,'halloween'); // insert before high-contrast
      // Christmas only in December
      if(month === 11) base.splice(base.length-0,0,'christmas');
      // Chinese New Year during lunar new year celebration
      if(isCNYSeason()) base.push('chinese-new-year');
      // America theme in July
      if(month === 6) base.push('america');
      // Branch-exclusive theme: unlock the one matching the user's branch
      try {
        const u = JSON.parse(localStorage.getItem('fpTestUser') || '{}');
        if(u.branch && THEMES[u.branch.toLowerCase()]) base.push(u.branch.toLowerCase());
      } catch {}
      // Star Wars unlocks when every current achievement is earned (count-independent)
      // TODO: restore achievement gate after revamp preview
      base.push('star-wars');
      // try {
      //   const ids = window.FP_ACHIEVEMENT_IDS || [];
      //   const persisted = JSON.parse(localStorage.getItem('fpPersistedBadges')||'[]');
      //   if(ids.length > 0 && ids.every(id => persisted.includes(id))) base.push('star-wars');
      // } catch {}
      return base;
    }
  };

  // Expose Dev API (optional use by pages)
  window.FPDev = {
    isDev: devIsOn,
    enable: devEnable,
    disable: devDisable,
    prompt: showDevModal
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
