// test-builder.js

// ---------- Storage helpers ----------
function loadTestsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("tests") || "[]");
  } catch {
    return [];
  }
}
function saveTestsToStorage(tests) {
  localStorage.setItem("tests", JSON.stringify(tests));
}
function generateId() {
  return "test_" + Date.now();
}

// ---------- Global refs ----------
let currentTest = null;
let activeQuestionIndex = null;
let els = {};

// Expose init for tests.html loader
window.initTestBuilder = function () {
  // ---------- State ----------
  currentTest = {
    id: null,
    subject: "",
    name: "",
    desc: "",
    image: null,
    questions: []
  };
  activeQuestionIndex = null;

  // ---------- Element refs ----------
  els = {
  subject: document.getElementById("testSubject"),
    name: document.getElementById("testName"),
    desc: document.getElementById("testDesc"),
    shuffleQuestions: document.getElementById("chkShuffleQuestions"),
    shuffleOptions: document.getElementById("chkShuffleOptions"),

    questionsList: document.getElementById("questionsList"),
    activeQuestion: document.getElementById("activeQuestion"),

    btnAddQuestion: document.getElementById("btnAddQuestion"),
  btnBulkAddQuestions: document.getElementById("btnBulkAddQuestions"),
    btnSaveQuestion: document.getElementById("btnSaveQuestion"),
    btnSaveTest: document.getElementById("btnSaveTest"),
  btnMoveUp: document.getElementById("btnMoveUpQuestion"),
  btnMoveDown: document.getElementById("btnMoveDownQuestion"),
  btnDelete: document.getElementById("btnDeleteQuestion"),
  };

  if (!els.questionsList || !els.activeQuestion) {
    console.error("Test Builder: Missing DOM nodes â€” did the HTML load?");
    return;
  }

  // ---------- Button handlers ----------
  // Subject custom creation handler
  if(els.subject){
    els.subject.addEventListener('change',()=>{
      if(els.subject.value==='__create'){
        let name = prompt('Enter new subject name:');
        if(name){
          name = name.trim();
          if(name){
            // Assign color if not exists
            try{
              const map = JSON.parse(localStorage.getItem('fpSubjectColors')||'{}');
              const list = JSON.parse(localStorage.getItem('fpCustomSubjects')||'[]');
              if(!list.includes(name)){ list.push(name); localStorage.setItem('fpCustomSubjects',JSON.stringify(list)); }
              if(!map[name]){
                const used = new Set(Object.values(map).map(v=>v.toLowerCase()));
                const palette = ['#ef4444','#f59e0b','#0d78f2','#22c55e','#8b5cf6','#14b8a6','#6366f1','#ec4899','#10b981','#eab308','#0ea5e9','#fb923c','#84cc16','#f472b6','#38bdf8','#a855f7','#dc2626','#2563eb','#9333ea','#047857','#ea580c'];
                let pick=null;
                // Try palette first
                for(const col of palette){ if(!used.has(col.toLowerCase())){ pick=col; break; } }
                // If still null generate random unique
                let guard=0; while(!pick && guard<50){
                  const cand = '#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');
                  if(!used.has(cand.toLowerCase())) pick=cand; guard++;
                }
                if(!pick) pick='#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');
                map[name]=pick; localStorage.setItem('fpSubjectColors',JSON.stringify(map));
              }
            }catch{}
            // Insert option if missing
            const exists = Array.from(els.subject.options).some(o=>o.value===name||o.text===name);
            if(!exists){ const opt=document.createElement('option'); opt.value=name; opt.textContent=name; els.subject.insertBefore(opt, els.subject.querySelector('option[value="__create"]')); }
            els.subject.value=name;
            toggleRemoveBtn();
          } else { els.subject.value=''; }
        } else {
          els.subject.value='';
        }
      }
      toggleRemoveBtn();
    });
  }

  function loadCustomSubjects(){
    try{
      const list=JSON.parse(localStorage.getItem('fpCustomSubjects')||'[]');
      if(els.subject){
        // Insert customs
        list.forEach(sub=>{
          if(!Array.from(els.subject.options).some(o=>o.value===sub)){
            const opt=document.createElement('option'); opt.value=sub; opt.textContent=sub; els.subject.insertBefore(opt, els.subject.querySelector('option[value="__create"]'));
          }
        });
      }
    }catch{}
  }

  function removeCurrentSubject(){
    const val = els.subject.value;
    if(!val) return; if(!confirm('Remove subject "'+val+'" from dropdown? Existing tests keep the label; you can re-create later.')) return;
    try{
      let custom=JSON.parse(localStorage.getItem('fpCustomSubjects')||'[]');
      if(custom.includes(val)){
        custom=custom.filter(s=>s!==val); localStorage.setItem('fpCustomSubjects',JSON.stringify(custom));
        const map=JSON.parse(localStorage.getItem('fpSubjectColors')||'{}'); delete map[val]; localStorage.setItem('fpSubjectColors',JSON.stringify(map));
      }
    }catch{}
    const opt=[...els.subject.options].find(o=>o.value===val); if(opt) opt.remove(); els.subject.value=''; toggleRemoveBtn();
  }

  function toggleRemoveBtn(){
    const btn=document.getElementById('btnRemoveSubjectTest'); if(!btn) return; const val=els.subject.value; if(!val || val==='__create'){ btn.classList.add('hidden'); return; }
    btn.classList.remove('hidden');
  }

  document.getElementById('btnManageSubjectsTest')?.addEventListener('click',()=>{
    const list = JSON.parse(localStorage.getItem('fpCustomSubjects')||'[]');
    alert(list.length? 'Custom Subjects:\n'+list.join('\n') : 'No custom subjects yet.');
  });
  document.getElementById('btnRemoveSubjectTest')?.addEventListener('click',removeCurrentSubject);

  loadCustomSubjects();
  toggleRemoveBtn();
  els.btnAddQuestion.addEventListener("click", () => {
    const newQ = { text: "", type: "multiple", options: ["", "", "", ""], answer: null };
    currentTest.questions.push(newQ);
    activeQuestionIndex = currentTest.questions.length - 1;
    renderQuestionsList();
    renderActiveQuestion();
  });

  // Bulk add dialog similar to flashcard bulk (simple textarea parse)
  if (els.btnBulkAddQuestions) {
    els.btnBulkAddQuestions.addEventListener('click', () => {
      const raw = prompt('Bulk Add Questions:\nEnter one question per line. Use | to separate multiple-choice options and * to mark the correct one.\nExample:\nWhat is 2+2?|3|*4|5|6\nThe earth is round|*True|False');
      if (!raw) return;
      const lines = raw.split(/\n+/).map(l => l.trim()).filter(Boolean);
      let added = 0;
      lines.forEach(line => {
        // Determine if multiple choice style with options
        if (line.includes('|')) {
          const parts = line.split('|').map(s=>s.trim()).filter(Boolean);
          if (!parts.length) return;
          const qText = parts.shift();
          let answer = null;
          const opts = parts.map(p => {
            if (p.startsWith('*')) { answer = p.replace(/^\*/,'').trim(); return answer; }
            return p; });
          if (opts.length) {
            currentTest.questions.push({ text:qText, type:'multiple', options:opts, answer: answer && opts.includes(answer) ? answer : null });
            added++;
          }
        } else if (/^(true|false)/i.test(line)) {
          // if line starts with true/false treat as simple true/false statement (prefix not ideal so fallback)
          currentTest.questions.push({ text: line, type:'truefalse', options:['True','False'], answer:'True' });
          added++;
        } else {
          currentTest.questions.push({ text: line, type:'text', answers:[''] });
          added++;
        }
      });
      if (added) {
        activeQuestionIndex = currentTest.questions.length - 1;
        renderQuestionsList();
        renderActiveQuestion();
        alert('Added '+added+' question'+(added!==1?'s':'')+'.');
      } else {
        alert('No valid lines to add.');
      }
    });
  }

  els.btnSaveQuestion.addEventListener("click", () => {
    const q = currentTest.questions[activeQuestionIndex ?? -1];
    if (q && q.type === "multiple") {
      const cleaned = (q.options || []).map(o => o.trim()).filter(Boolean);
      q.options = cleaned;
      if (!cleaned.includes(q.answer)) q.answer = null;
    }
    if (q && q.type === "text") {
      q.answers = (q.answers || []).map(a => a.trim()).filter(Boolean);
    }
    if (q && q.type === "selectall") {
      const cleaned = (q.options || []).map(o => o.trim()).filter(Boolean);
      q.options = cleaned;
      q.correctAnswers = (q.correctAnswers || []).filter(a => cleaned.includes(a));
    }
    if (q && q.type === "matching") {
      q.pairs = (q.pairs || []).filter(p => p.left.trim() && p.right.trim());
      q.pairs.forEach(p => { p.left = p.left.trim(); p.right = p.right.trim(); });
    }
    if (q && q.explanation !== undefined) {
      q.explanation = (q.explanation || "").trim() || undefined;
    }
    renderQuestionsList();
  });

  els.btnSaveTest.addEventListener("click", () => {
  // Subject select stores value text
  currentTest.subject = (els.subject && els.subject.value) ? els.subject.value.trim() : "";
    currentTest.name = els.name.value.trim();
    currentTest.desc = els.desc.value.trim();
    currentTest.shuffleQuestions = els.shuffleQuestions ? els.shuffleQuestions.checked : false;
    currentTest.shuffleOptions = els.shuffleOptions ? els.shuffleOptions.checked : false;

    currentTest.questions = currentTest.questions.map((q) => {
      if (q.type === "multiple") {
        const cleaned = (q.options || []).map(o => o.trim()).filter(Boolean);
        const ans = cleaned.includes(q.answer) ? q.answer : null;
        return { ...q, options: cleaned, answer: ans };
      }
      if (q.type === "text") {
        const answers = (q.answers || []).map(a => a.trim()).filter(Boolean);
        return { ...q, answers };
      }
      if (q.type === "selectall") {
        const cleaned = (q.options || []).map(o => o.trim()).filter(Boolean);
        const correct = (q.correctAnswers || []).filter(a => cleaned.includes(a));
        return { ...q, options: cleaned, correctAnswers: correct };
      }
      if (q.type === "matching") {
        const pairs = (q.pairs || []).filter(p => p.left.trim() && p.right.trim())
          .map(p => ({ left: p.left.trim(), right: p.right.trim() }));
        return { ...q, pairs };
      }
      return q;
    });

  // No test-level image uploader anymore; persist immediately
  persistTestAndReset();
  });

  // Reorder & delete controls
  if (els.btnMoveUp) {
    els.btnMoveUp.addEventListener('click', () => {
      if (activeQuestionIndex===null || activeQuestionIndex<=0) return;
      const i = activeQuestionIndex;
      const arr = currentTest.questions;
      [arr[i-1], arr[i]] = [arr[i], arr[i-1]];
      activeQuestionIndex = i-1;
      renderQuestionsList();
      renderActiveQuestion();
    });
  }
  if (els.btnMoveDown) {
    els.btnMoveDown.addEventListener('click', () => {
      if (activeQuestionIndex===null || activeQuestionIndex>=currentTest.questions.length-1) return;
      const i = activeQuestionIndex;
      const arr = currentTest.questions;
      [arr[i+1], arr[i]] = [arr[i], arr[i+1]];
      activeQuestionIndex = i+1;
      renderQuestionsList();
      renderActiveQuestion();
    });
  }
  if (els.btnDelete) {
    els.btnDelete.addEventListener('click', () => {
      if (activeQuestionIndex===null) return;
      if (!confirm('Delete this question?')) return;
      currentTest.questions.splice(activeQuestionIndex,1);
      if (activeQuestionIndex >= currentTest.questions.length) activeQuestionIndex = currentTest.questions.length-1;
      if (activeQuestionIndex < 0) activeQuestionIndex = null;
      renderQuestionsList();
      renderActiveQuestion();
    });
  }

  function persistTestAndReset() {
    if (!currentTest.name) {
      alert("Please provide a Test Name before saving.");
      return;
    }
    let tests = loadTestsFromStorage();

    if (!currentTest.id) {
      currentTest.id = generateId();
      tests.push(currentTest);
    } else {
      const idx = tests.findIndex(t => t.id === currentTest.id);
      if (idx >= 0) tests[idx] = currentTest;
      else tests.push(currentTest);
    }

    saveTestsToStorage(tests);

    // âœ… Refresh the test list in the sidebar immediately
    if (typeof renderTestList === "function") {
      renderTestList();
    }
    // âœ… Refresh dashboard KPIs if available
    if (typeof renderDashboard === "function") {
      renderDashboard();
    }

    alert("Test saved successfully!");
  }

  // ---------- Initial render ----------
  renderQuestionsList();
  renderActiveQuestion();
  updateReorderState();
};

// ---------- Expose loadTestIntoBuilder ----------
window.loadTestIntoBuilder = function (testObj) {
  if (!testObj) return;

  currentTest = JSON.parse(JSON.stringify(testObj)); // deep copy
  activeQuestionIndex = null;

  // Fill form fields
  // If current test's subject is not in the fixed list, inject it as a temporary option
  if (els.subject && currentTest.subject) {
    const exists = Array.from(els.subject.options).some(o => o.text === currentTest.subject || o.value === currentTest.subject);
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = currentTest.subject;
      opt.textContent = currentTest.subject;
      els.subject.insertBefore(opt, els.subject.firstChild);
    }
  }
  els.subject.value = currentTest.subject || "";
  els.name.value = currentTest.name || "";
  els.desc.value = currentTest.desc || "";
  if (els.shuffleQuestions) els.shuffleQuestions.checked = !!currentTest.shuffleQuestions;
  if (els.shuffleOptions) els.shuffleOptions.checked = !!currentTest.shuffleOptions;

  // Render UI
  renderQuestionsList();
  renderActiveQuestion();
};

// ---------- Rendering ----------
function renderQuestionsList() {
  const list = els.questionsList;
  list.innerHTML = "";

  // Update question count
  const countEl = document.getElementById("questionCount");
  const len = currentTest ? currentTest.questions.length : 0;
  if (countEl) countEl.textContent = len + " question" + (len !== 1 ? "s" : "");

  if (!currentTest || currentTest.questions.length === 0) {
    list.innerHTML = `<div class="text-[var(--text-secondary)] italic p-4 text-center">No questions yet. Use "+ Add".</div>`;
    return;
  }

  var badgeMap = {
    multiple:  { cls: "q-badge q-badge-mc",    text: "MC" },
    truefalse: { cls: "q-badge q-badge-tf",    text: "T/F" },
    text:      { cls: "q-badge q-badge-text",   text: "Text" },
    selectall: { cls: "q-badge q-badge-sa",     text: "Select All" },
    matching:  { cls: "q-badge q-badge-match",  text: "Match" }
  };

  currentTest.questions.forEach((q, i) => {
    const item = document.createElement("div");
    item.className = "q-item p-2.5 rounded-lg bg-white cursor-pointer flex items-center gap-2" +
      (i === activeQuestionIndex ? " q-active" : "");

    var badge = badgeMap[q.type] || { cls: "q-badge", text: "?" };
    var preview = (q.text || "").trim();
    if (preview.length > 60) preview = preview.substring(0, 57) + "â€¦";

    item.innerHTML =
      '<span class="text-xs font-bold text-[var(--text-secondary)] min-w-[20px]">' + (i + 1) + '</span>' +
      '<div class="flex-1 min-w-0">' +
        '<div class="font-medium text-[var(--text-primary)] truncate text-[13px] leading-tight">' + (preview || '<span class="italic text-[var(--text-secondary)]">Untitled</span>') + '</div>' +
        '<span class="' + badge.cls + ' mt-0.5">' + badge.text + '</span>' +
      '</div>' +
      '<button title="Delete" data-del="' + i + '" class="text-red-400 text-sm px-1 rounded hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">x</button>';

    // Show delete on hover via JS (since group-hover may not work without group class)
    var delBtn = item.querySelector("[data-del]");
    item.addEventListener("mouseenter", function() { delBtn.style.opacity = "1"; });
    item.addEventListener("mouseleave", function() { delBtn.style.opacity = "0"; });

    item.addEventListener("click", (e) => {
      if (e.target && e.target.matches("[data-del]")) return;
      activeQuestionIndex = i;
      renderActiveQuestion();
      [...list.children].forEach(el => el.classList.remove("q-active"));
      item.classList.add("q-active");
      updateReorderState();
    });
    delBtn.addEventListener("click", () => {
      if (activeQuestionIndex === i) activeQuestionIndex = null;
      currentTest.questions.splice(i, 1);
      renderQuestionsList();
      renderActiveQuestion();
      updateReorderState();
    });
    list.appendChild(item);
  });
}

function renderActiveQuestion() {
  const editor = els.activeQuestion;
  editor.innerHTML = "";

  if (!currentTest || activeQuestionIndex === null) {
    editor.innerHTML = '<div class="text-[var(--text-secondary)] italic text-center py-12">No active question. Click "+ Add" to begin editing.</div>';
    updateReorderState();
    return;
  }

  const q = currentTest.questions[activeQuestionIndex];
  const wrap = document.createElement("div");
  wrap.className = "space-y-4";

  // â”€â”€ Question text + type row â”€â”€
  const topSection = document.createElement("div");
  topSection.className = "editor-section space-y-3";

  const topRow = document.createElement("div");
  topRow.className = "flex gap-3 items-start";

  const qTextWrap = document.createElement("div");
  qTextWrap.className = "flex-1";
  const qTextLabel = document.createElement("label");
  qTextLabel.className = "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1";
  qTextLabel.textContent = "Question Text";
  const qText = document.createElement("textarea");
  qText.rows = 3;
  qText.className = "w-full rounded-lg border-gray-300 p-2 text-sm";
  qText.placeholder = "Enter your question...";
  qText.value = q.text || "";
  qText.addEventListener("input", (e) => {
    q.text = e.target.value;
  });
  qTextWrap.appendChild(qTextLabel);
  qTextWrap.appendChild(qText);

  const typeWrap = document.createElement("div");
  typeWrap.className = "w-[160px] flex-shrink-0";
  const typeLabel = document.createElement("label");
  typeLabel.className = "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1";
  typeLabel.textContent = "Type";
  const typeSelect = document.createElement("select");
  typeSelect.className = "w-full rounded-lg border-gray-300 p-2 text-sm";
  typeSelect.innerHTML = `
    <option value="multiple">Multiple Choice</option>
    <option value="truefalse">True / False</option>
    <option value="text">Typing Answer</option>
    <option value="selectall">Select All That Apply</option>
    <option value="matching">Matching</option>
  `;
  typeSelect.value = q.type || "multiple";
  typeSelect.addEventListener("change", (e) => {
    q.type = e.target.value;
    if (q.type === "multiple") {
      q.options = q.options && q.options.length ? q.options : ["", "", "", ""];
      q.answer = q.answer ?? null;
      delete q.answers;
      delete q.correctAnswers;
      delete q.pairs;
    } else if (q.type === "truefalse") {
      q.options = ["True", "False"];
      q.answer = q.answer || "True";
      delete q.answers;
      delete q.correctAnswers;
      delete q.pairs;
    } else if (q.type === "text") {
      delete q.options;
      q.answers = Array.isArray(q.answers) && q.answers.length ? q.answers : [""];
      q.answer = undefined;
      delete q.correctAnswers;
      delete q.pairs;
    } else if (q.type === "selectall") {
      q.options = q.options && q.options.length ? q.options : ["", "", "", ""];
      q.correctAnswers = q.correctAnswers || [];
      delete q.answer;
      delete q.answers;
      delete q.pairs;
    } else if (q.type === "matching") {
      q.pairs = q.pairs && q.pairs.length ? q.pairs : [{ left:"", right:"" },{ left:"", right:"" },{ left:"", right:"" }];
      delete q.options;
      delete q.answer;
      delete q.answers;
      delete q.correctAnswers;
    }
    renderActiveQuestion();
  });

  typeWrap.appendChild(typeLabel);
  typeWrap.appendChild(typeSelect);
  topRow.appendChild(qTextWrap);
  topRow.appendChild(typeWrap);
  topSection.appendChild(topRow);
  wrap.appendChild(topSection);

  // Question Image uploader
  const imgBlock = document.createElement('div');
  imgBlock.className = 'editor-section space-y-2';
  const imgLbl = document.createElement('label');
  imgLbl.className = 'block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1';
  imgLbl.textContent = 'Image (optional)';
  const imgRow = document.createElement('div');
  imgRow.className = 'flex items-center gap-3 flex-wrap';

  const imgInput = document.createElement('input');
  imgInput.type = 'file';
  imgInput.accept = 'image/*';
  imgInput.className = 'block text-sm';
  imgInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      q.image = ev.target.result; // data URL
      // Update preview without full re-render
      if (preview) {
        preview.src = q.image;
        preview.classList.remove('hidden');
      }
      if (btnRemove) btnRemove.disabled = false;
    };
    reader.readAsDataURL(file);
  });

  const preview = document.createElement('img');
  preview.className = 'max-h-40 rounded border border-[var(--border-color)] ' + (q.image ? '' : 'hidden');
  preview.alt = 'Question image preview';
  if (q.image) preview.src = q.image;

  const btnRemove = document.createElement('button');
  btnRemove.type = 'button';
  btnRemove.textContent = 'Remove Image';
  btnRemove.className = 'px-2 py-1 text-sm rounded border border-[var(--border-color)] hover:bg-gray-100 disabled:opacity-50';
  btnRemove.disabled = !q.image;
  btnRemove.addEventListener('click', () => {
    q.image = null;
    if (preview) {
      preview.src = '';
      preview.classList.add('hidden');
    }
    btnRemove.disabled = true;
  });

  imgRow.appendChild(imgInput);
  imgRow.appendChild(btnRemove);
  imgBlock.appendChild(imgLbl);
  imgBlock.appendChild(imgRow);
  imgBlock.appendChild(preview);

  // Options/Answers block
  const optionsBlock = document.createElement("div");
  optionsBlock.className = "editor-section space-y-2";
  optionsBlock.id = "qOptionsWrapper";

  if (q.type === "multiple") {
    const lbl = document.createElement("label");
    lbl.className = "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1";
    lbl.textContent = "Options (select the correct one)";
    optionsBlock.appendChild(lbl);

    (q.options || ["", "", "", ""]).forEach((opt, idx) => {
      const row = document.createElement("div");
      row.className = "opt-row flex items-center gap-2 p-1";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "qCorrect";
      radio.checked = q.answer === opt && opt !== "";
      radio.addEventListener("change", () => {
        q.answer = opt;
      });

      const input = document.createElement("input");
      input.type = "text";
      input.className = "flex-1 rounded-lg border-gray-300 p-2 text-sm";
      input.placeholder = `Option ${idx + 1}`;
      input.value = opt || "";
      input.addEventListener("input", (e) => {
        q.options[idx] = e.target.value;
        if (q.answer === opt && e.target.value.trim() === "") {
          q.answer = null;
        }
      });

      const btnRemoveOpt = document.createElement("button");
      btnRemoveOpt.type = "button";
      btnRemoveOpt.className = "text-red-500 text-sm px-1 hover:text-red-700";
      btnRemoveOpt.textContent = "x";
      btnRemoveOpt.title = "Remove option";
      btnRemoveOpt.addEventListener("click", () => {
        if ((q.options||[]).length <= 2) return;
        if (q.answer === q.options[idx]) q.answer = null;
        q.options.splice(idx, 1);
        renderActiveQuestion();
      });

      row.appendChild(radio);
      row.appendChild(input);
      if ((q.options||[]).length > 2) row.appendChild(btnRemoveOpt);
      optionsBlock.appendChild(row);
    });

    const btnAddOpt = document.createElement("button");
    btnAddOpt.type = "button";
    btnAddOpt.className = "mt-1 px-2 py-1 text-xs rounded border";
    btnAddOpt.textContent = "+ Add Option";
    btnAddOpt.addEventListener("click", () => {
      q.options = (q.options || []).concat([""]);
      renderActiveQuestion();
    });
    optionsBlock.appendChild(btnAddOpt);

  } else if (q.type === "truefalse") {
    const lbl = document.createElement("label");
    lbl.className = "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1";
    lbl.textContent = "Correct Answer";
    optionsBlock.appendChild(lbl);

    ["True", "False"].forEach((val) => {
      const row = document.createElement("label");
      row.className = "opt-row flex items-center gap-2 p-1 cursor-pointer";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "qTrueFalse";
      radio.value = val.toLowerCase();
      radio.checked = (q.answer || "True") === val;
      radio.addEventListener("change", () => {
        q.answer = val;
      });
      const span = document.createElement("span");
      span.textContent = val;
      row.appendChild(radio);
      row.appendChild(span);
      optionsBlock.appendChild(row);
    });
  } else if (q.type === "text") {
    const lbl = document.createElement("label");
    lbl.className = "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1";
    lbl.textContent = "Acceptable Answers (not case sensitive)";
    optionsBlock.appendChild(lbl);

    const answersWrap = document.createElement("div");
    answersWrap.className = "space-y-2";
    (q.answers || [""]).forEach((ans, i) => {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "w-full rounded-lg border-gray-300 p-2 text-sm qTextAnswer";
      input.placeholder = `Answer ${i + 1}`;
      input.value = ans;
      input.addEventListener("input", (e) => {
        q.answers[i] = e.target.value;
      });
      answersWrap.appendChild(input);
    });

    const btnAddAns = document.createElement("button");
    btnAddAns.type = "button";
    btnAddAns.className = "mt-1 px-2 py-1 text-xs rounded border";
    btnAddAns.textContent = "+ Add Another";
    btnAddAns.addEventListener("click", () => {
      q.answers = (q.answers || []).concat([""]);
      renderActiveQuestion();
    });

    optionsBlock.appendChild(answersWrap);
    optionsBlock.appendChild(btnAddAns);

  } else if (q.type === "selectall") {
    const lbl = document.createElement("label");
    lbl.className = "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1";
    lbl.textContent = "Options (check ALL correct answers)";
    optionsBlock.appendChild(lbl);

    if(!Array.isArray(q.correctAnswers)) q.correctAnswers = [];

    (q.options || ["", "", "", ""]).forEach((opt, idx) => {
      const row = document.createElement("div");
      row.className = "opt-row flex items-center gap-2 p-1";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = q.correctAnswers.includes(opt) && opt !== "";
      cb.addEventListener("change", () => {
        const val = q.options[idx];
        if(cb.checked){ if(!q.correctAnswers.includes(val)) q.correctAnswers.push(val); }
        else { q.correctAnswers = q.correctAnswers.filter(a=>a!==val); }
      });

      const input = document.createElement("input");
      input.type = "text";
      input.className = "flex-1 rounded-lg border-gray-300 p-2 text-sm";
      input.placeholder = `Option ${idx + 1}`;
      input.value = opt || "";
      input.addEventListener("input", (e) => {
        const oldVal = q.options[idx];
        q.options[idx] = e.target.value;
        // Update correctAnswers if this was a selected answer
        const ci = q.correctAnswers.indexOf(oldVal);
        if(ci>=0){ if(e.target.value.trim()) q.correctAnswers[ci]=e.target.value; else q.correctAnswers.splice(ci,1); }
      });

      const btnRemoveOpt = document.createElement("button");
      btnRemoveOpt.type = "button";
      btnRemoveOpt.className = "text-red-500 text-sm px-1 hover:text-red-700";
      btnRemoveOpt.textContent = "x";
      btnRemoveOpt.addEventListener("click", () => {
        if((q.options||[]).length<=2) return;
        q.correctAnswers = q.correctAnswers.filter(a=>a!==q.options[idx]);
        q.options.splice(idx,1);
        renderActiveQuestion();
      });

      row.appendChild(cb);
      row.appendChild(input);
      if((q.options||[]).length>2) row.appendChild(btnRemoveOpt);
      optionsBlock.appendChild(row);
    });

    const btnAddOpt = document.createElement("button");
    btnAddOpt.type = "button";
    btnAddOpt.className = "mt-1 px-2 py-1 text-xs rounded border";
    btnAddOpt.textContent = "+ Add Option";
    btnAddOpt.addEventListener("click", () => {
      q.options = (q.options || []).concat([""]);
      renderActiveQuestion();
    });
    optionsBlock.appendChild(btnAddOpt);

  } else if (q.type === "matching") {
    const lbl = document.createElement("label");
    lbl.className = "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1";
    lbl.textContent = "Match Pairs (left \u2192 right)";
    optionsBlock.appendChild(lbl);

    if(!Array.isArray(q.pairs)) q.pairs = [{left:"",right:""},{left:"",right:""},{left:"",right:""}];

    q.pairs.forEach((pair, idx) => {
      const row = document.createElement("div");
      row.className = "opt-row flex items-center gap-2 p-1";

      const leftInput = document.createElement("input");
      leftInput.type = "text";
      leftInput.className = "flex-1 rounded-lg border-gray-300 p-2 text-sm";
      leftInput.placeholder = `Term ${idx+1}`;
      leftInput.value = pair.left || "";
      leftInput.addEventListener("input", (e) => { q.pairs[idx].left = e.target.value; });

      const arrow = document.createElement("span");
      arrow.textContent = "â†’";
      arrow.className = "text-[var(--text-secondary)] font-bold";

      const rightInput = document.createElement("input");
      rightInput.type = "text";
      rightInput.className = "flex-1 rounded-lg border-gray-300 p-2 text-sm";
      rightInput.placeholder = `Definition ${idx+1}`;
      rightInput.value = pair.right || "";
      rightInput.addEventListener("input", (e) => { q.pairs[idx].right = e.target.value; });

      const btnRemovePair = document.createElement("button");
      btnRemovePair.type = "button";
      btnRemovePair.className = "text-red-500 text-sm px-1 hover:text-red-700";
      btnRemovePair.textContent = "x";
      btnRemovePair.addEventListener("click", () => {
        if(q.pairs.length<=2) return;
        q.pairs.splice(idx,1);
        renderActiveQuestion();
      });

      row.appendChild(leftInput);
      row.appendChild(arrow);
      row.appendChild(rightInput);
      if(q.pairs.length>2) row.appendChild(btnRemovePair);
      optionsBlock.appendChild(row);
    });

    const btnAddPair = document.createElement("button");
    btnAddPair.type = "button";
    btnAddPair.className = "mt-1 px-2 py-1 text-xs rounded border";
    btnAddPair.textContent = "+ Add Pair";
    btnAddPair.addEventListener("click", () => {
      q.pairs.push({left:"",right:""});
      renderActiveQuestion();
    });
    optionsBlock.appendChild(btnAddPair);
  }

  wrap.appendChild(optionsBlock);

  // Explanation field (optional, shown during review)
  const explBlock = document.createElement("div");
  explBlock.className = "editor-section space-y-1";
  const explLbl = document.createElement("label");
  explLbl.className = "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1";
  explLbl.textContent = "Explanation (optional \u2014 shown in review)";
  const explInput = document.createElement("textarea");
  explInput.rows = 2;
  explInput.className = "w-full rounded-lg border-gray-300 p-2 text-sm";
  explInput.placeholder = "Why is this the correct answer? (shown after test)";
  explInput.value = q.explanation || "";
  explInput.addEventListener("input", (e) => { q.explanation = e.target.value; });
  explBlock.appendChild(explLbl);
  explBlock.appendChild(explInput);
  wrap.appendChild(explBlock);

  wrap.appendChild(imgBlock);
  els.activeQuestion.appendChild(wrap);
  updateReorderState();
}

function updateReorderState(){
  if(!els.btnMoveUp||!els.btnMoveDown||!els.btnDelete) return;
  const len = currentTest?.questions?.length||0;
  const idx = activeQuestionIndex;
  const disabled = idx===null;
  els.btnMoveUp.disabled = disabled || idx<=0;
  els.btnMoveDown.disabled = disabled || idx>=len-1;
  els.btnDelete.disabled = disabled;
}
