// test-runner.js

window.startTestRunner = function (test) {
  const root = document.getElementById("testRunner");
  if (!root) { console.error('test-runner: #testRunner element not found.'); return; }

  const titleEl   = root.querySelector("#runnerTitle");
  const contentEl = root.querySelector("#runnerContent");
  const btnPrev   = root.querySelector("#btnPrevQ");
  const btnNext   = root.querySelector("#btnNextQ");
  const btnFlag   = root.querySelector("#btnFlagQ");
  const dotsEl    = root.querySelector("#runnerDots");
  const barEl     = root.querySelector("#runnerBar");
  const progressWrap = root.querySelector("#runnerProgressBar");

  if (!contentEl || !btnPrev || !btnNext || !titleEl) {
    console.error("test-runner: missing required runner elements.");
    return;
  }

  titleEl.textContent = test?.name || "";

  // ── Deep-copy & prepare questions ──
  const rawQuestions = Array.isArray(test?.questions) ? JSON.parse(JSON.stringify(test.questions)) : [];
  const total = rawQuestions.length;

  // Fisher-Yates shuffle utility
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Build display-order index array (shuffle if requested)
  let order = rawQuestions.map((_, i) => i);
  if (test.shuffleQuestions) order = shuffleArray(order);

  // Pre-shuffle options for MC / select-all / matching if requested
  const optionOrders = {}; // index → shuffled option array or pair indices
  if (test.shuffleOptions) {
    rawQuestions.forEach((q, i) => {
      if ((q.type === "multiple" || q.type === "selectall") && Array.isArray(q.options)) {
        optionOrders[i] = shuffleArray([...q.options]);
      }
      if (q.type === "matching" && Array.isArray(q.pairs)) {
        // Shuffle the right-side choices shown in dropdowns
        optionOrders[i] = shuffleArray(q.pairs.map(p => p.right));
      }
    });
  }

  let index = 0; // position in order[]
  const answers = new Array(total).fill(null);
  const flagged = new Array(total).fill(false);
  const startTime = Date.now();

  // ── Progress bar ──
  function renderProgress() {
    if (!dotsEl || !barEl) return;
    dotsEl.innerHTML = "";
    order.forEach((qIdx, pos) => {
      const dot = document.createElement("span");
      dot.className = "fp-progress-dot";
      dot.textContent = pos + 1;
      if (pos === index) dot.classList.add("active");
      else if (answers[qIdx] !== null) dot.classList.add("answered");
      if (flagged[qIdx]) dot.classList.add("flagged");
      dot.addEventListener("click", () => { saveCurrentAnswer(); index = pos; renderQuestion(); });
      dotsEl.appendChild(dot);
    });
    const answeredCount = answers.filter(a => a !== null).length;
    barEl.style.width = total ? `${Math.round((answeredCount / total) * 100)}%` : "0%";
  }

  // ── Flag button ──
  if (btnFlag) {
    btnFlag.onclick = () => {
      const qi = order[index];
      flagged[qi] = !flagged[qi];
      btnFlag.textContent = flagged[qi] ? "🚩 Flagged" : "🚩 Flag";
      renderProgress();
    };
  }

  // ── Render question ──
  function renderQuestion() {
    contentEl.innerHTML = "";

    if (total === 0) {
      contentEl.innerHTML = '<div class="italic text-gray-500">No questions in this test.</div>';
      btnPrev.disabled = true; btnNext.disabled = true;
      if (btnFlag) btnFlag.style.display = "none";
      return;
    }

    const qi = order[index]; // actual question index
    const q  = rawQuestions[qi];

    // Flag button state
    if (btnFlag) { btnFlag.style.display = ""; btnFlag.textContent = flagged[qi] ? "🚩 Flagged" : "🚩 Flag"; }

    const wrapper = document.createElement("div");
    wrapper.className = "p-4 bg-white rounded shadow space-y-4";

    const qText = document.createElement("div");
    qText.className = "font-medium text-lg";
    qText.textContent = (index + 1) + ". " + (q.text || "(Untitled Question)");
    wrapper.appendChild(qText);

    if (q.image) {
      const img = document.createElement("img");
      img.src = q.image; img.alt = "Question image";
      img.className = "max-h-64 rounded border border-gray-200";
      wrapper.appendChild(img);
    }

    const answersWrap = document.createElement("div");
    answersWrap.className = "space-y-2";

    if (q.type === "multiple") {
      const opts = optionOrders[qi] || q.options || [];
      opts.forEach(function(opt) {
        const label = document.createElement("label");
        label.className = "flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50";
        const input = document.createElement("input");
        input.type = "radio"; input.name = "answer"; input.value = opt;
        if (answers[qi] === opt) input.checked = true;
        const span = document.createElement("span"); span.textContent = opt;
        label.appendChild(input); label.appendChild(span);
        answersWrap.appendChild(label);
      });

    } else if (q.type === "truefalse") {
      ["True", "False"].forEach(function(val) {
        const label = document.createElement("label");
        label.className = "flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50";
        const input = document.createElement("input");
        input.type = "radio"; input.name = "answer"; input.value = val;
        if (answers[qi] === val) input.checked = true;
        const span = document.createElement("span"); span.textContent = val;
        label.appendChild(input); label.appendChild(span);
        answersWrap.appendChild(label);
      });

    } else if (q.type === "text") {
      const input = document.createElement("input");
      input.type = "text"; input.name = "answer";
      input.placeholder = "Type your answer...";
      input.className = "w-full rounded border p-2";
      if (answers[qi] !== null) input.value = answers[qi];
      answersWrap.appendChild(input);

    } else if (q.type === "selectall") {
      const opts = optionOrders[qi] || q.options || [];
      const saved = Array.isArray(answers[qi]) ? answers[qi] : [];
      opts.forEach(function(opt) {
        const label = document.createElement("label");
        label.className = "flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50";
        const input = document.createElement("input");
        input.type = "checkbox"; input.name = "answer"; input.value = opt;
        if (saved.includes(opt)) input.checked = true;
        const span = document.createElement("span"); span.textContent = opt;
        label.appendChild(input); label.appendChild(span);
        answersWrap.appendChild(label);
      });

    } else if (q.type === "matching") {
      const pairs = q.pairs || [];
      var rightChoices = optionOrders[qi] || pairs.map(function(p) { return p.right; });
      var saved = (answers[qi] && typeof answers[qi] === "object" && !Array.isArray(answers[qi])) ? answers[qi] : {};

      pairs.forEach(function(pair, pi) {
        const row = document.createElement("div");
        row.className = "flex items-center gap-2 flex-wrap";
        const term = document.createElement("span");
        term.className = "font-medium min-w-[120px]"; term.textContent = pair.left;
        const arrow = document.createElement("span");
        arrow.className = "text-gray-400"; arrow.textContent = "\u2192";
        const sel = document.createElement("select");
        sel.className = "fp-match-select rounded border p-1";
        sel.dataset.pairIndex = pi;
        var optionsHtml = '<option value="">-- select --</option>';
        rightChoices.forEach(function(r) {
          var escaped = r.replace(/"/g, '&quot;');
          var selected = saved[pair.left] === r ? ' selected' : '';
          optionsHtml += '<option value="' + escaped + '"' + selected + '>' + r + '</option>';
        });
        sel.innerHTML = optionsHtml;
        row.appendChild(term); row.appendChild(arrow); row.appendChild(sel);
        answersWrap.appendChild(row);
      });

    } else {
      answersWrap.innerHTML = '<div class="text-sm text-gray-500">Unknown question type.</div>';
    }

    wrapper.appendChild(answersWrap);
    contentEl.appendChild(wrapper);

    // Nav state
    btnPrev.style.display = ""; btnNext.style.display = "";
    btnPrev.disabled = index === 0;
    btnNext.textContent = index === total - 1 ? "Submit" : "Next";
    btnNext.disabled = false;

    renderProgress();
  }

  // ── Save current answer ──
  function saveCurrentAnswer() {
    if (total === 0) return;
    var qi = order[index];
    var q  = rawQuestions[qi];
    if (!q) return;

    if (q.type === "text") {
      var input = contentEl.querySelector('input[name="answer"]');
      answers[qi] = input ? (input.value.trim() || null) : null;
    } else if (q.type === "selectall") {
      var checked = Array.from(contentEl.querySelectorAll('input[name="answer"]:checked')).map(function(el) { return el.value; });
      answers[qi] = checked.length ? checked : null;
    } else if (q.type === "matching") {
      var selects = contentEl.querySelectorAll("select[data-pair-index]");
      var pairs = q.pairs || [];
      var map = {};
      var anyFilled = false;
      selects.forEach(function(sel) {
        var pi = parseInt(sel.dataset.pairIndex, 10);
        if (pairs[pi] && sel.value) { map[pairs[pi].left] = sel.value; anyFilled = true; }
      });
      answers[qi] = anyFilled ? map : null;
    } else {
      var checked = contentEl.querySelector('input[name="answer"]:checked');
      answers[qi] = checked ? checked.value : null;
    }
  }

  // ── Navigation ──
  btnPrev.onclick = function (e) { e.preventDefault(); if (index === 0) return; saveCurrentAnswer(); index--; renderQuestion(); };

  btnNext.onclick = function (e) {
    e.preventDefault();
    saveCurrentAnswer();
    if (index < total - 1) { index++; renderQuestion(); return; }
    // Submit — check for unanswered / flagged
    var unanswered = answers.filter(function(a) { return a === null; }).length;
    var flaggedCount = flagged.filter(Boolean).length;
    var msg = "";
    if (unanswered) msg += "You have " + unanswered + " unanswered question" + (unanswered > 1 ? "s" : "") + ".\n";
    if (flaggedCount) msg += "You have " + flaggedCount + " flagged question" + (flaggedCount > 1 ? "s" : "") + ".\n";
    if (msg) { msg += "\nSubmit anyway?"; if (!confirm(msg)) return; }
    handleSubmit();
  };

  // ── GRADING ──
  function gradeQuestion(q, ans) {
    if (q.type === "text") {
      return (q.answers || []).some(function(a) { return a.toLowerCase() === (ans || "").toLowerCase(); }) ? 1 : 0;
    }
    if (q.type === "multiple" || q.type === "truefalse") {
      return q.answer === ans ? 1 : 0;
    }
    if (q.type === "selectall") {
      var correct = (q.correctAnswers || []).slice().sort();
      var user = Array.isArray(ans) ? ans.slice().sort() : [];
      return correct.length === user.length && correct.every(function(v, i) { return v === user[i]; }) ? 1 : 0;
    }
    if (q.type === "matching") {
      var pairs = q.pairs || [];
      if (!ans || typeof ans !== "object") return 0;
      var c = 0;
      pairs.forEach(function(p) { if (ans[p.left] === p.right) c++; });
      return c === pairs.length ? 1 : 0;
    }
    return 0;
  }

  function handleSubmit() {
    var timeTaken = Math.round((Date.now() - startTime) / 1000);
    var correctCount = 0;
    for (var i = 0; i < total; i++) correctCount += gradeQuestion(rawQuestions[i], answers[i]);

    var attempt = {
      testId: test.id,
      testName: test.name,
      date: new Date().toISOString(),
      answers: answers,
      score: correctCount,
      total: total,
      timeTaken: timeTaken
    };
    var attempts = [];
    try { attempts = JSON.parse(localStorage.getItem("testAttempts") || "[]"); } catch(e) {}
    attempts.push(attempt);
    localStorage.setItem("testAttempts", JSON.stringify(attempts));

    showTestResults(test, answers, correctCount, total, timeTaken);
  }

  // ── RESULTS SCREEN ──
  function hideTestUI() {
    btnPrev.style.display = "none"; btnNext.style.display = "none";
    if (btnFlag) btnFlag.style.display = "none";
    if (progressWrap) progressWrap.style.display = "none";
  }

  function showTestResults(test, userAnswers, score, total, timeTaken) {
    contentEl.innerHTML = "";
    hideTestUI();

    var pct = total ? ((score / total) * 100).toFixed(1) : "0.0";
    var block = document.createElement("div");
    block.className = "p-6 bg-white rounded-xl shadow space-y-4 text-center";
    block.innerHTML =
      '<h2 class="text-xl font-semibold">Test Completed!</h2>' +
      '<div class="text-gray-700">Score: ' + score + ' / ' + total + '<br>Percentage: ' + pct + '%</div>' +
      (typeof timeTaken === "number" ? '<div class="text-gray-500">Time taken: ' + timeTaken + ' seconds</div>' : "");

    var btnContainer = document.createElement("div");
    btnContainer.className = "flex justify-center gap-4 mt-4";

    var reviewBtn = document.createElement("button");
    reviewBtn.textContent = "Test Review";
    reviewBtn.className = "px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700";
    reviewBtn.addEventListener("click", function() { showReview(test, userAnswers); });

    var homeBtn = createHomeBtn();
    btnContainer.appendChild(reviewBtn);
    btnContainer.appendChild(homeBtn);
    block.appendChild(btnContainer);
    contentEl.appendChild(block);
  }

  // ── REVIEW SCREEN ──
  function showReview(test, userAnswers) {
    contentEl.innerHTML = "";
    hideTestUI();

    rawQuestions.forEach(function(q, i) {
      var block = document.createElement("div");
      block.className = "p-4 mb-3 bg-white rounded shadow space-y-2";

      var qText = document.createElement("div");
      qText.className = "font-medium";
      qText.textContent = (i + 1) + ". " + (q.text || "(Untitled Question)");
      block.appendChild(qText);

      var ansWrap = document.createElement("div");
      ansWrap.className = "space-y-1";
      var userAns = userAnswers[i];
      var isCorrect = gradeQuestion(q, userAns) === 1;

      if (q.type === "multiple" || q.type === "truefalse") {
        (q.options || ["True", "False"]).forEach(function(opt) {
          var span = document.createElement("div");
          span.textContent = opt;
          if (opt === q.answer) span.className = "font-semibold text-green-600";
          if (opt === userAns && opt !== q.answer) span.className = "line-through text-red-600";
          ansWrap.appendChild(span);
        });

      } else if (q.type === "text") {
        var span = document.createElement("div");
        span.textContent = "Your answer: " + (userAns || "(No answer)");
        span.className = isCorrect ? "text-green-600" : "text-red-600";
        ansWrap.appendChild(span);
        var cs = document.createElement("div");
        cs.textContent = "Correct answer(s): " + (q.answers || []).join(", ");
        cs.className = "text-green-600";
        ansWrap.appendChild(cs);

      } else if (q.type === "selectall") {
        var correct = q.correctAnswers || [];
        var user = Array.isArray(userAns) ? userAns : [];
        (q.options || []).forEach(function(opt) {
          var span = document.createElement("div");
          var inCorrect = correct.includes(opt);
          var inUser = user.includes(opt);
          if (inCorrect && inUser) { span.textContent = "\u2713 " + opt; span.className = "text-green-600 font-semibold"; }
          else if (inCorrect && !inUser) { span.textContent = "\u2717 " + opt + " (missed)"; span.className = "text-orange-600"; }
          else if (!inCorrect && inUser) { span.textContent = "\u2717 " + opt + " (wrong)"; span.className = "text-red-600 line-through"; }
          else { span.textContent = opt; span.className = "text-gray-500"; }
          ansWrap.appendChild(span);
        });

      } else if (q.type === "matching") {
        var pairs = q.pairs || [];
        var userMap = (userAns && typeof userAns === "object" && !Array.isArray(userAns)) ? userAns : {};
        pairs.forEach(function(p) {
          var row = document.createElement("div");
          var userPick = userMap[p.left] || "(none)";
          var ok = userPick === p.right;
          row.innerHTML = '<span class="font-medium">' + p.left + '</span> \u2192 ';
          var ans = document.createElement("span");
          ans.textContent = userPick;
          ans.className = ok ? "text-green-600 font-semibold" : "text-red-600 line-through";
          row.appendChild(ans);
          if (!ok) {
            var fix = document.createElement("span");
            fix.textContent = " (correct: " + p.right + ")";
            fix.className = "text-green-600";
            row.appendChild(fix);
          }
          ansWrap.appendChild(row);
        });
      }

      block.appendChild(ansWrap);

      // Explanation
      if (q.explanation) {
        var explDiv = document.createElement("div");
        explDiv.className = "mt-2 p-2 rounded bg-blue-50 text-sm text-blue-800 border border-blue-200";
        explDiv.innerHTML = '<strong>Explanation:</strong> ' + q.explanation;
        block.appendChild(explDiv);
      }

      contentEl.appendChild(block);
    });

    var btnContainer = document.createElement("div");
    btnContainer.className = "flex justify-center gap-4 mt-4";

    var backBtn = document.createElement("button");
    backBtn.textContent = "Back to Results";
    backBtn.className = "px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700";
    backBtn.addEventListener("click", function() {
      var score = 0;
      for (var i = 0; i < total; i++) score += gradeQuestion(rawQuestions[i], userAnswers[i]);
      showTestResults(test, userAnswers, score, total);
    });

    btnContainer.appendChild(backBtn);
    btnContainer.appendChild(createHomeBtn());
    contentEl.appendChild(btnContainer);
  }

  // ── Shared Home button ──
  function createHomeBtn() {
    var btn = document.createElement("button");
    btn.textContent = "Home";
    btn.className = "px-4 py-2 bg-gray-200 text-[var(--text-primary)] rounded shadow hover:bg-gray-300";
    btn.addEventListener("click", function() {
      window.__fpBuilderActive = false;
      if (typeof renderTestList === "function") renderTestList();
      if (typeof renderDashboard === "function") renderDashboard();
      else {
        var container = document.getElementById("testContent");
        if (container) container.innerHTML = '<div class="min-h-[46vh] flex items-center justify-center text-gray-500">Select a test from the list to begin.</div>';
      }
    });
    return btn;
  }

  // ── Kick off ──
  if (progressWrap) progressWrap.style.display = "";
  renderQuestion();
};
