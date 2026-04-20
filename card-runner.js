// card-runner.js — Evidence-based flashcard study engine
// Features: Confidence Rating, Leitner Boxes, Session Results, Keyboard Shortcuts,
// Star/Bookmark, Reverse Mode, Per-Card Stats, Study Streak
(function(){
  /* ── Helpers ── */
  function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }
  function escapeHTML(s){ return (s||'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function loadCardSets(){ try { return JSON.parse(localStorage.getItem('flashcardSets')||'[]'); } catch { return []; } }
  function getSet(id){ return loadCardSets().find(s=>String(s.id)===String(id)) || null; }

  /* ── Per-card stats persistence ── */
  function loadCardStats(){ try { return JSON.parse(localStorage.getItem('fpCardStats')||'{}'); } catch { return {}; } }
  function saveCardStats(m){ localStorage.setItem('fpCardStats', JSON.stringify(m)); }

  /* ── Leitner box persistence ── */
  function loadBoxes(){ try { return JSON.parse(localStorage.getItem('fpCardBoxes')||'{}'); } catch { return {}; } }
  function saveBoxes(m){ localStorage.setItem('fpCardBoxes', JSON.stringify(m)); }

  /* ── Star persistence ── */
  function loadStars(){ try { return JSON.parse(localStorage.getItem('fpStarredCards')||'[]'); } catch { return []; } }
  function saveStars(a){ localStorage.setItem('fpStarredCards', JSON.stringify(a)); }
  function isStarred(cardId){ return loadStars().includes(cardId); }
  function toggleStar(cardId){ let s=loadStars(); if(s.includes(cardId)) s=s.filter(x=>x!==cardId); else s.push(cardId); saveStars(s); return s.includes(cardId); }

  /* ── Study streak ── */
  function todayKey(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function updateStreak(){
    let data; try { data=JSON.parse(localStorage.getItem('fpStudyStreak')||'{}'); } catch { data={}; }
    const today=todayKey();
    if(data.lastStudyDate===today) return data; // already counted today
    // Check if yesterday was studied
    const yest=new Date(); yest.setDate(yest.getDate()-1);
    const yKey=`${yest.getFullYear()}-${String(yest.getMonth()+1).padStart(2,'0')}-${String(yest.getDate()).padStart(2,'0')}`;
    if(data.lastStudyDate===yKey){ data.currentStreak=(data.currentStreak||0)+1; }
    else { data.currentStreak=1; }
    if((data.currentStreak||0) > (data.longestStreak||0)) data.longestStreak=data.currentStreak;
    data.lastStudyDate=today;
    localStorage.setItem('fpStudyStreak', JSON.stringify(data));
    return data;
  }
  function getStreak(){ try { return JSON.parse(localStorage.getItem('fpStudyStreak')||'{}'); } catch { return {}; } }

  /* ── Leitner smart ordering ── */
  function leitnerOrder(cards){
    const boxes=loadBoxes();
    // Partition cards into boxes 1 (default), 2, 3
    const b1=[], b2=[], b3=[];
    cards.forEach((c,i)=>{
      const box=boxes[c.id]||1;
      if(box===3) b3.push(i);
      else if(box===2) b2.push(i);
      else b1.push(i);
    });
    // Prioritize: all box 1, then box 2, then box 3
    return [...shuffle(b1), ...shuffle(b2), ...shuffle(b3)];
  }

  /* ── Styles ── */
  function ensureStyles(){ if(document.getElementById('card-runner-styles')) return; const st=document.createElement('style'); st.id='card-runner-styles'; st.textContent=`
    .fc-study-wrapper { max-width:640px; margin:0 auto; }
    .fc-card-stage { position:relative; height:300px; }
    .fc-card-shell { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
    .fc-card-persp { perspective:1400px; width:100%; height:100%; }
    .fc-flip { position:relative; width:100%; height:100%; transform-style:preserve-3d; cursor:pointer; transition: transform .55s ease; }
    .fc-flip.flipped { transform: rotateY(180deg); }
    .fc-face { position:absolute; inset:0; backface-visibility:hidden; border:1px solid var(--border-color); border-radius:1rem; padding:1.5rem 1.25rem; background:var(--white); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; font-size:.98rem; line-height:1.38; }
    .fc-face-content { width:100%; }
    .fc-card-img-wrap { width:100%; display:flex; justify-content:center; margin-bottom:.75rem; }
    .fc-card-img-wrap img { max-height:220px; max-width:100%; object-fit:contain; border-radius:.75rem; box-shadow:0 3px 10px rgba(0,0,0,.10); }
    .fc-face.fc-back { transform: rotateY(180deg); }
    .fc-hint-pop { position:absolute; top:0; left:100%; margin-left:1rem; width:210px; background:var(--white); border:1px solid var(--border-color); border-radius:.8rem; padding:.7rem .75rem; box-shadow:0 4px 16px rgba(0,0,0,.08); font-size:.7rem; line-height:1.2; }
    @media (max-width:900px){ .fc-hint-pop { position:static; width:100%; margin:1rem 0 0 0; } }
    /* Progress dots */
    .fc-progress { display:flex; gap:4px; justify-content:center; flex-wrap:wrap; max-width:100%; }
    .fc-dot { width:10px; height:10px; border-radius:50%; background:#d1d5db; transition:background .2s, transform .2s; flex-shrink:0; }
    .fc-dot.current { transform:scale(1.35); background:var(--primary-color); }
    .fc-dot.know { background:#22c55e; }
    .fc-dot.kinda { background:#eab308; }
    .fc-dot.noclue { background:#ef4444; }
    .fc-dot.seen { background:#93c5fd; }
    /* Confidence buttons */
    .fc-confidence { display:flex; gap:8px; justify-content:center; }
    .fc-conf-btn { padding:6px 16px; border-radius:8px; font-size:.8rem; font-weight:600; border:none; cursor:pointer; transition:opacity .15s, transform .1s; }
    .fc-conf-btn:hover { opacity:.85; }
    .fc-conf-btn:active { transform:scale(.96); }
    .fc-conf-btn.know { background:#22c55e; color:#fff; }
    .fc-conf-btn.kinda { background:#eab308; color:#fff; }
    .fc-conf-btn.noclue { background:#ef4444; color:#fff; }
    /* Star button */
    .fc-star-btn { position:absolute; top:8px; right:10px; font-size:1.3rem; background:none; border:none; cursor:pointer; z-index:5; opacity:.5; transition:opacity .15s; }
    .fc-star-btn:hover { opacity:1; }
    .fc-star-btn.starred { opacity:1; color:#eab308; }
    /* Leitner badge */
    .fc-box-badge { font-size:.6rem; padding:2px 7px; border-radius:9999px; font-weight:600; text-transform:uppercase; }
    .fc-box-badge.box1 { background:#fef2f2; color:#ef4444; }
    .fc-box-badge.box2 { background:#fefce8; color:#ca8a04; }
    .fc-box-badge.box3 { background:#f0fdf4; color:#16a34a; }
    /* Reverse label */
    .fc-reverse-badge { font-size:.55rem; padding:2px 6px; border-radius:4px; background:#ede9fe; color:#7c3aed; font-weight:600; text-transform:uppercase; }
    /* Results screen */
    .fc-results { max-width:560px; margin:0 auto; }
    .fc-results h2 { font-size:1.4rem; font-weight:700; margin-bottom:.75rem; }
    .fc-results .fc-res-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:1rem 0; }
    .fc-res-card { padding:16px; border-radius:12px; text-align:center; }
    .fc-res-card .fc-res-num { font-size:1.6rem; font-weight:700; }
    .fc-res-card .fc-res-lbl { font-size:.7rem; text-transform:uppercase; font-weight:600; margin-top:2px; }
    .fc-focus-list { margin:.75rem 0; padding:0; list-style:none; }
    .fc-focus-list li { padding:6px 10px; margin-bottom:4px; border-radius:8px; background:#fef2f2; font-size:.82rem; color:#b91c1c; }
    .fc-streak-badge { display:inline-flex; align-items:center; gap:4px; background:#fef3c7; color:#92400e; padding:4px 10px; border-radius:9999px; font-size:.75rem; font-weight:600; }
    .fc-kbd { display:inline-block; padding:1px 5px; border:1px solid #d1d5db; border-radius:4px; font-size:.6rem; background:#f9fafb; color:#6b7280; font-family:monospace; }
  `; document.head.appendChild(st); }

  /* ── Main entry ── */
  window.startCardRunner = function(setId, options){
    options = options || {};
    const reverseMode = !!options.reverse;
    const starredOnly = !!options.starredOnly;
    const smartReview = options.smartReview !== false; // default true

    const set=getSet(setId);
    const container=document.getElementById('flashContent') || document.getElementById('primaryArea');
    if(!container) return;
    if(!set){ container.innerHTML='<div class="p-8 text-center text-[var(--text-secondary)]">Set not found.</div>'; return; }

    // Filter cards
    let studyCards = set.cards.slice();
    if(starredOnly){
      const stars=loadStars();
      studyCards = studyCards.filter(c=> stars.includes(c.id));
    }
    if(!studyCards.length){ container.innerHTML='<div class="p-8 text-center text-[var(--text-secondary)]">'+(starredOnly?'No starred cards in this set.':'No cards to study.')+'</div>'; return; }
    ensureStyles();

    const tpl=document.querySelector('template[data-file="card-runner.html"]');
    function initRunner(html){
      container.innerHTML=html;
      const stage=document.getElementById('fcStage');
      const meta=document.getElementById('fcMeta');
      const hintPop=document.getElementById('fcHintPop');
      const progressWrap=document.getElementById('fcProgress');
      const confWrap=document.getElementById('fcConfidence');

      // Build study order
      let order = smartReview ? leitnerOrder(studyCards) : shuffle(studyCards.map((_,i)=>i));

      const state={ idx:0, flipped:false, hint:false };
      const sessionStart=Date.now();
      const seen=new Set();
      const ratings={}; // cardId -> 'know'|'kinda'|'noclue'
      const cardTimes={}; // cardId -> ms spent
      let cardShownAt=Date.now();
      let sessionLogged=false;

      /* ── Progress dots ── */
      function renderProgress(){
        if(!progressWrap) return;
        progressWrap.innerHTML='';
        // Limit dots to 60 to avoid overflow; show condensed for large sets
        const total=order.length;
        if(total<=60){
          order.forEach((_,i)=>{
            const dot=document.createElement('span');
            dot.className='fc-dot';
            const cid=studyCards[order[i]]?.id;
            if(i===state.idx) dot.classList.add('current');
            else if(ratings[cid]==='know') dot.classList.add('know');
            else if(ratings[cid]==='kinda') dot.classList.add('kinda');
            else if(ratings[cid]==='noclue') dot.classList.add('noclue');
            else if(seen.has(cid)) dot.classList.add('seen');
            progressWrap.appendChild(dot);
          });
        } else {
          // Condensed: show fraction
          const rated=Object.keys(ratings).length;
          progressWrap.innerHTML=`<span class="text-xs text-[var(--text-secondary)]">${state.idx+1} / ${total} &middot; ${rated} rated</span>`;
        }
      }

      /* ── Confidence ── */
      function showConfidence(show){
        if(!confWrap) return;
        confWrap.style.display=show?'flex':'none';
      }
      function rateCard(level){
        const card=studyCards[order[state.idx]];
        if(!card) return;
        const cid=card.id||order[state.idx];
        ratings[cid]=level;
        // Track time
        cardTimes[cid]=(cardTimes[cid]||0)+(Date.now()-cardShownAt);
        // Update per-card stats
        const stats=loadCardStats();
        if(!stats[cid]) stats[cid]={seen:0, know:0, kinda:0, noclue:0, lastSeen:''};
        stats[cid].seen++;
        stats[cid][level]++;
        stats[cid].lastSeen=new Date().toISOString();
        saveCardStats(stats);
        // Update Leitner box
        const boxes=loadBoxes();
        const curBox=boxes[cid]||1;
        if(level==='know') boxes[cid]=Math.min(3, curBox+1);
        else if(level==='noclue') boxes[cid]=1;
        // 'kinda' stays same box
        else boxes[cid]=curBox;
        saveBoxes(boxes);
        // Advance
        renderProgress();
        showConfidence(false);
        if(state.idx<order.length-1){ state.idx++; state.flipped=false; state.hint=false; cardShownAt=Date.now(); prevBtn.disabled=state.idx===0; showCard(); }
        else { finishSession(); }
      }

      /* ── Session logging ── */
      function logSession(){
        if(sessionLogged) return; sessionLogged=true;
        // Record final card time if not rated
        const curCard=studyCards[order[state.idx]];
        if(curCard){
          const cid=curCard.id||order[state.idx];
          if(!cardTimes[cid]) cardTimes[cid]=Date.now()-cardShownAt;
        }
        const durationSeconds=Math.max(1, Math.round((Date.now()-sessionStart)/1000));
        const payload={ setId:set.id, setName:set.name, subject:set.subject||'', date:new Date().toISOString(),
          cardsSeen:seen.size, uniqueCardIds:[...seen], totalCards:studyCards.length, durationSeconds,
          ratings:Object.assign({}, ratings), reverseMode, starredOnly };
        let sessions=[]; try{ sessions=JSON.parse(localStorage.getItem('flashcardSessions')||'[]'); }catch{}
        sessions.push(payload);
        localStorage.setItem('flashcardSessions', JSON.stringify(sessions));
        // Update study streak
        updateStreak();
      }
      window.addEventListener('beforeunload', logSession, { once:true });

      /* ── Results screen ── */
      function showResults(){
        const know=Object.values(ratings).filter(r=>r==='know').length;
        const kinda=Object.values(ratings).filter(r=>r==='kinda').length;
        const noclue=Object.values(ratings).filter(r=>r==='noclue').length;
        const total=order.length;
        const rated=know+kinda+noclue;
        const pct=rated? Math.round((know/rated)*100) : 0;
        const totalTime=Object.values(cardTimes).reduce((a,b)=>a+b,0);
        const avgTime=rated? (totalTime/rated/1000).toFixed(1) : '0';
        const streak=getStreak();

        // Cards to focus on (noclue + kinda)
        const focusCards=[];
        Object.entries(ratings).forEach(([cid,r])=>{
          if(r==='noclue'||r==='kinda'){
            const card=studyCards.find(c=>c.id===cid);
            if(card) focusCards.push({card, rating:r});
          }
        });

        container.innerHTML=`
        <div class="fc-results space-y-5 py-6">
          <h2 class="text-[var(--text-primary)] text-center">Session Complete</h2>
          ${streak.currentStreak>1?`<div class="text-center"><span class="fc-streak-badge">&#128293; ${streak.currentStreak}-day streak!</span></div>`:''}
          <div class="fc-res-grid">
            <div class="fc-res-card" style="background:#f0fdf4;">
              <div class="fc-res-num" style="color:#16a34a;">${know}</div>
              <div class="fc-res-lbl" style="color:#15803d;">Know It</div>
            </div>
            <div class="fc-res-card" style="background:#fefce8;">
              <div class="fc-res-num" style="color:#ca8a04;">${kinda}</div>
              <div class="fc-res-lbl" style="color:#a16207;">Kinda</div>
            </div>
            <div class="fc-res-card" style="background:#fef2f2;">
              <div class="fc-res-num" style="color:#dc2626;">${noclue}</div>
              <div class="fc-res-lbl" style="color:#b91c1c;">No Clue</div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 text-center text-sm">
            <div><div class="text-lg font-bold text-[var(--text-primary)]">${pct}%</div><div class="text-xs text-[var(--text-secondary)]">Mastery</div></div>
            <div><div class="text-lg font-bold text-[var(--text-primary)]">${avgTime}s</div><div class="text-xs text-[var(--text-secondary)]">Avg/Card</div></div>
            <div><div class="text-lg font-bold text-[var(--text-primary)]">${Math.round(totalTime/1000)}s</div><div class="text-xs text-[var(--text-secondary)]">Total Time</div></div>
          </div>
          ${focusCards.length?`
          <div>
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-1">Cards to Focus On</h3>
            <ul class="fc-focus-list">${focusCards.map(f=>`<li>${escapeHTML(reverseMode?f.card.back:f.card.front)} <span class="fc-kbd">${f.rating}</span></li>`).join('')}</ul>
          </div>`:''}
          <div class="flex justify-center gap-3 mt-4">
            <button id="btnRestudy" class="px-5 py-2 rounded-lg bg-[var(--primary-color)] text-white font-medium text-sm">Study Again</button>
            ${focusCards.length?`<button id="btnRestudyWeak" class="px-5 py-2 rounded-lg bg-amber-500 text-white font-medium text-sm">Study Weak Cards</button>`:''}
            <button id="btnResDone" class="px-5 py-2 rounded-lg bg-gray-200 text-[var(--text-primary)] font-medium text-sm">Done</button>
          </div>
        </div>`;

        document.getElementById('btnRestudy')?.addEventListener('click',()=>{ startCardRunner(setId, options); });
        document.getElementById('btnRestudyWeak')?.addEventListener('click',()=>{
          // Mark weak cards as starred temporarily and study them
          const weakIds=focusCards.map(f=>f.card.id);
          let stars=loadStars();
          weakIds.forEach(id=>{ if(!stars.includes(id)) stars.push(id); });
          saveStars(stars);
          startCardRunner(setId, { ...options, starredOnly:true });
        });
        document.getElementById('btnResDone')?.addEventListener('click',()=>{
          window.__selectedSetId=null;
          window.__fpBuilderActive=false;
          document.querySelectorAll('#cardList .test-item').forEach(n=>n.classList.remove('selected'));
          if(typeof renderFlashcardDashboard==='function') try{ renderFlashcardDashboard(); }catch{}
        });
      }

      function finishSession(){
        logSession();
        try { window.removeEventListener('beforeunload', logSession); } catch {}
        try { document.removeEventListener('keydown', keyHandler); } catch {}
        showResults();
      }

      /* ── Meta bar ── */
      function updateMeta(){
        const boxes=loadBoxes();
        const card=studyCards[order[state.idx]];
        const cid=card?.id;
        const box=boxes[cid]||1;
        const boxLabels=['','Learning','Reviewing','Mastered'];
        const boxClass=['','box1','box2','box3'];
        meta.innerHTML=`
          <span>${escapeHTML(set.subject||'(No Subject)')} ${reverseMode?'<span class="fc-reverse-badge">Reverse</span>':''}</span>
          <span class="flex items-center gap-2">
            <span class="fc-box-badge ${boxClass[box]}">${boxLabels[box]}</span>
            Card ${state.idx+1} / ${order.length}
          </span>`;
      }

      /* ── Card building ── */
      function buildCard(card){
        const wrap=document.createElement('div'); wrap.className='fc-card-anim';
        const shell=document.createElement('div'); shell.className='fc-card-shell';
        const persp=document.createElement('div'); persp.className='fc-card-persp';
        const flip=document.createElement('div'); flip.className='fc-flip'; flip.id='fcFlipCurrent';
        // In reverse mode, swap front/back
        const frontText = reverseMode ? (card.back||'(Back)') : (card.front||'(Front)');
        const backText = reverseMode ? (card.front||'(Front)') : (card.back||'(Back)');
        const frontImage = reverseMode ? null : card.image; // image only on normal front
        let frontHTML = '';
        if(frontImage){ frontHTML += `<div class="fc-card-img-wrap"><img src="${frontImage}" alt="Card image" loading="lazy"/></div>`; }
        frontHTML += `<div class="fc-face-content">${escapeHTML(frontText)}</div>`;
        let backHTML = `<div class="fc-face-content">${escapeHTML(backText)}</div>`;
        flip.innerHTML = `<div class="fc-face fc-front">${frontHTML}</div><div class="fc-face fc-back">${backHTML}</div>`;
        // Star button
        const starBtn=document.createElement('button');
        starBtn.className='fc-star-btn'+(isStarred(card.id)?' starred':'');
        starBtn.innerHTML=isStarred(card.id)?'&#9733;':'&#9734;';
        starBtn.title='Star this card (S)';
        starBtn.addEventListener('click',(e)=>{ e.stopPropagation(); const on=toggleStar(card.id); starBtn.innerHTML=on?'&#9733;':'&#9734;'; starBtn.classList.toggle('starred',on); });
        flip.querySelector('.fc-front').appendChild(starBtn);
        // Flip handler
        flip.addEventListener('click',()=>{
          state.flipped=!state.flipped;
          flip.classList.toggle('flipped', state.flipped);
          showConfidence(state.flipped);
        });
        persp.appendChild(flip); shell.appendChild(persp); wrap.appendChild(shell); return wrap;
      }

      function showCard(){
        const card=studyCards[order[state.idx]];
        if(card) seen.add(card.id || order[state.idx]);
        updateMeta();
        const hintText=card.hint||'';
        hintPop.style.display=(state.hint && hintText)?'':'none';
        hintPop.textContent=hintText;
        stage.innerHTML='';
        stage.appendChild(buildCard(card));
        renderProgress();
        showConfidence(false);
        // Toggle Next vs Finish buttons
        if(state.idx === order.length -1){
          nextBtn.classList.add('hidden');
          finishBtn.classList.remove('hidden');
        } else {
          finishBtn.classList.add('hidden');
          nextBtn.classList.remove('hidden');
        }
      }

      /* ── Button wiring ── */
      const prevBtn=document.getElementById('btnPrevCard');
      const nextBtn=document.getElementById('btnNextCard');
      const finishBtn=document.getElementById('btnFinishSession');

      prevBtn.addEventListener('click',()=>{ if(state.idx===0) return; cardTimes[studyCards[order[state.idx]]?.id]=(cardTimes[studyCards[order[state.idx]]?.id]||0)+(Date.now()-cardShownAt); state.idx--; state.flipped=false; state.hint=false; cardShownAt=Date.now(); showCard(); prevBtn.disabled=state.idx===0; });
      nextBtn.addEventListener('click',()=>{ if(state.idx<order.length-1){ cardTimes[studyCards[order[state.idx]]?.id]=(cardTimes[studyCards[order[state.idx]]?.id]||0)+(Date.now()-cardShownAt); state.idx++; state.flipped=false; state.hint=false; cardShownAt=Date.now(); prevBtn.disabled=state.idx===0; showCard(); } else { finishSession(); } });
      finishBtn.addEventListener('click', finishSession);
      document.getElementById('btnHint').addEventListener('click',()=>{ state.hint=!state.hint; const card=studyCards[order[state.idx]]; hintPop.style.display=(state.hint && card.hint)?'':'none'; hintPop.textContent=card.hint||''; });
      document.getElementById('btnReturnSet').addEventListener('click',()=>{ logSession(); try{ document.removeEventListener('keydown', keyHandler); }catch{} const node=document.querySelector(`#cardList .test-item[data-id="${set.id}"] div`); if(node) node.click(); else if(typeof renderFlashcardSets==='function') renderFlashcardSets(); if(typeof renderFlashcardDashboard==='function') try{ renderFlashcardDashboard(); }catch{} });

      // Confidence button wiring
      document.getElementById('btnKnow')?.addEventListener('click',()=>rateCard('know'));
      document.getElementById('btnKinda')?.addEventListener('click',()=>rateCard('kinda'));
      document.getElementById('btnNoclue')?.addEventListener('click',()=>rateCard('noclue'));

      /* ── Keyboard shortcuts ── */
      function keyHandler(e){
        // Ignore if typing in input/textarea
        if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return;
        const key=e.key.toLowerCase();
        if(key===' '||key==='spacebar'){
          e.preventDefault();
          const flip=document.getElementById('fcFlipCurrent');
          if(flip){ state.flipped=!state.flipped; flip.classList.toggle('flipped',state.flipped); showConfidence(state.flipped); }
        }
        else if(key==='arrowright'){ if(state.flipped && !ratings[studyCards[order[state.idx]]?.id]) return; nextBtn.click(); }
        else if(key==='arrowleft'){ prevBtn.click(); }
        else if(key==='1' && state.flipped) rateCard('know');
        else if(key==='2' && state.flipped) rateCard('kinda');
        else if(key==='3' && state.flipped) rateCard('noclue');
        else if(key==='s'){
          const card=studyCards[order[state.idx]];
          if(card){ const on=toggleStar(card.id); const sb=document.querySelector('.fc-star-btn'); if(sb){ sb.innerHTML=on?'&#9733;':'&#9734;'; sb.classList.toggle('starred',on); } }
        }
        else if(key==='h'){ document.getElementById('btnHint')?.click(); }
      }
      document.addEventListener('keydown', keyHandler);

      prevBtn.disabled=true;
      showCard();
    }
    if(tpl){ initRunner(tpl.innerHTML); }
    else { fetch('card-runner.html').then(r=>r.text()).then(initRunner).catch(e=>{ console.error('card-runner fetch failed:', e); container.innerHTML='<div class="p-8 text-center text-red-600">Failed to load card runner.</div>'; }); }
  };

  /* ── Duplicate set (exposed globally) ── */
  window.duplicateCardSet = function(setId){
    const sets=loadCardSets();
    const orig=sets.find(s=>String(s.id)===String(setId));
    if(!orig) return;
    const clone=JSON.parse(JSON.stringify(orig));
    clone.id='fcset_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
    clone.name=(clone.name||'Untitled')+' (Copy)';
    // Give each card a new ID
    clone.cards.forEach(c=>{ c.id='fccard_'+Date.now()+'_'+Math.random().toString(36).slice(2,7); });
    sets.push(clone);
    localStorage.setItem('flashcardSets', JSON.stringify(sets));
    if(typeof renderFlashcardSets==='function') renderFlashcardSets();
  };

  /* ── Expose helpers for dashboard/builder ── */
  window.fpGetCardStats = loadCardStats;
  window.fpGetStreak = getStreak;
  window.fpGetBoxes = loadBoxes;
  window.fpGetStars = loadStars;
})();