document.addEventListener("DOMContentLoaded", () => {
  // Recipes live in _data/recipes.yml; index.md inlines them as window.recipeData.
  const data = window.recipeData || { methods: [] };
  const methods = data.methods || [];
  const grinder = data.grinder || {};
  const baseUrl = window.siteBaseUrl || "";
  const pageUrl = (path) => (path ? baseUrl + path : "");
  const GROUPS = [
    { id: "mine", label: "My gear" },
    { id: "someday", label: "Someday" }
  ];

  const params = new URLSearchParams(location.search);
  let currentMethod = (methods.find((m) => m.id === params.get("method")) || methods[0] || {}).id;

  const methodsContainer = document.getElementById("methods");
  const recipeSelect = document.getElementById("recipe");
  const coffeeInput = document.getElementById("coffee");
  const doseField = document.getElementById("dose-field");
  const output = document.getElementById("output");
  const brewLogActions = document.getElementById("brew-log-actions");
  const markdownOutput = document.getElementById("brew-markdown-output");
  const copyButton = document.getElementById("copy-brew-log");
  const downloadButton = document.getElementById("download-brew-log");
  const brewerValue = document.getElementById("brewer-value");
  const grinderSelect = document.getElementById("grinder-select");
  const scaleSelect = document.getElementById("scale-select");
  const serverSelect = document.getElementById("server-select");
  const strengthInput = document.getElementById("strength");
  const acidityInput = document.getElementById("acidity");
  const sweetnessInput = document.getElementById("sweetness");
  const strengthValue = document.getElementById("strengthVal");
  const acidityValue = document.getElementById("acidityVal");
  const sweetnessValue = document.getElementById("sweetnessVal");

  if (!methodsContainer || !recipeSelect || !coffeeInput || !output || !brewerValue) {
    return;
  }

  function getMethodById(methodId) {
    return methods.find((method) => method.id === methodId);
  }

  function getCurrentRecipe() {
    const method = getMethodById(currentMethod);
    return method ? method.recipes.find((r) => r.id === recipeSelect.value) : null;
  }

  function getCurrentBrewerName() {
    const method = getMethodById(currentMethod);
    return method ? method.gear || method.name : "";
  }

  function resetGeneratedLog() {
    markdownOutput.style.display = "none";
    markdownOutput.textContent = "";
    copyButton.style.display = "none";
    downloadButton.style.display = "none";
  }

  function renderMethodButtons() {
    methodsContainer.innerHTML = "";
    GROUPS.forEach((group) => {
      const groupMethods = methods.filter((m) => (m.group || "mine") === group.id);
      if (!groupMethods.length) return;
      const label = document.createElement("span");
      label.className = "method-group";
      label.textContent = group.label;
      methodsContainer.appendChild(label);
      const row = document.createElement("div");
      row.className = "method-row";
      methodsContainer.appendChild(row);
      groupMethods.forEach((method) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `method${method.id === currentMethod ? " active" : ""}${group.id === "someday" ? " someday" : ""}`;
        button.dataset.method = method.id;
        button.textContent = `${method.icon || ""} ${method.name}`.trim();
        button.setAttribute("aria-pressed", method.id === currentMethod ? "true" : "false");
        button.addEventListener("click", () => {
          currentMethod = method.id;
          renderMethodButtons();
          loadRecipes();
          brewerValue.value = getCurrentBrewerName();
          calculate();
        });
        row.appendChild(button);
      });
    });
    // Scroll only the chip row (not the page) so the active chip is visible on phones
    const active = methodsContainer.querySelector(".method.active");
    if (active) {
      const row = active.parentElement;
      row.scrollLeft = Math.max(0, active.offsetLeft - row.offsetLeft - 16);
    }
  }

  function loadRecipes(selectedId) {
    const method = getMethodById(currentMethod);
    recipeSelect.innerHTML = "";
    (method ? method.recipes : []).forEach((recipe) => {
      const option = document.createElement("option");
      option.value = recipe.id;
      option.textContent = recipe.event && /champion/i.test(recipe.event) ? `🏆 ${recipe.name}` : recipe.name;
      recipeSelect.appendChild(option);
    });
    if (selectedId && method && method.recipes.some((r) => r.id === selectedId)) recipeSelect.value = selectedId;
    applyRecipeDefaults();
  }

  // Each recipe's reference dose becomes the starting dose; fixed recipes hide the dose field.
  function applyRecipeDefaults() {
    const recipe = getCurrentRecipe();
    if (!recipe) return;
    doseField.hidden = Boolean(recipe.fixed);
    if (!recipe.fixed) coffeeInput.value = recipe.dose;
  }

  function syncSliderLabels() {
    strengthValue.textContent = strengthInput.value;
    acidityValue.textContent = acidityInput.value;
    sweetnessValue.textContent = sweetnessInput.value;
  }

  const round = (n) => Math.round(n);
  const ratioLabel = (dose, water) => `1:${(water / dose).toFixed(1).replace(/\.0$/, "")}`;
  const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  // "m:ss" or "h:mm:ss" → seconds; null when the source published no time.
  function parseAt(at) {
    if (!at) return null;
    const parts = String(at).split(":").map(Number);
    return parts.every(Number.isFinite) ? parts.reduce((sum, n) => sum * 60 + n, 0) : null;
  }

  // Cumulative scale targets are rounded from the published fractions, so each target is
  // exact for the chosen dose and the "add" column always sums to the total. The table and
  // the brew timer both read this, so their numbers can't drift apart.
  function scheduleFor(recipe, coffee) {
    const scale = recipe.fixed ? 1 : coffee / recipe.dose;
    const total = recipe.fixed ? recipe.water : round(recipe.water * scale);
    let prev = 0;
    let pourNo = 0;
    const steps = (recipe.steps || []).map((step) => {
      const base = { at: step.at || "", sec: parseAt(step.at), note: step.note || "" };
      if (step.to === undefined || recipe.fixed) return base;
      pourNo++;
      const target = round(total * step.to);
      const add = target - prev;
      prev = target;
      return { ...base, pourNo, target, add, note: step.note || `Pour ${pourNo}` };
    });
    return { scale, total, steps, pours: pourNo };
  }

  function renderRecipe(method, recipe, coffee) {
    const { scale, total, steps, pours } = scheduleFor(recipe, coffee);
    const items = [];
    if (recipe.fixed) {
      if (recipe.dose) items.push(`Coffee: ${recipe.dose} g`);
      if (recipe.water) items.push(`Water: ${recipe.water} ml`);
    } else {
      items.push(`Coffee: ${coffee} g`);
      items.push(`${recipe.output ? "Yield (in the cup)" : "Total water"}: ${total} g`);
      items.push(`Ratio: ${ratioLabel(coffee, total)}`);
    }
    if (recipe.bypass) items.push(`Bypass water: ${round(recipe.bypass * scale)} g (in the server, not the brewer)`);
    if (recipe.ice) items.push(`Ice: ${round(recipe.ice * scale)} g (in the server)`);
    if (recipe.yield) items.push(`Yield: ${recipe.yield}`);
    if (recipe.temp) items.push(`Water temp: ${recipe.temp}`);
    if (recipe.grind) items.push(`Grind: ${recipe.grind}`);
    const clicks = recipe.clicks || method.clicks;
    if (clicks) items.push(`${grinder.name || "Grinder"}: ${clicks}${/^\d/.test(clicks) ? " clicks" : ""}`);
    if (recipe.time) items.push(`Brew time: ${recipe.time}`);

    const rows = steps.map((s) => (s.target === undefined
      ? `<tr class="step-action"><td>${esc(s.at)}</td><td colspan="2">${esc(s.note)}</td><td></td></tr>`
      : `<tr><td>${esc(s.at)}</td><td>${esc(s.note)}</td><td>${s.pourNo === 1 ? s.add : `+${s.add}`} g</td><td><strong>${s.target} g</strong></td></tr>`
    )).join("");

    const chips = [
      recipe.event ? `<span class="chip chip-method">${esc(recipe.event)}</span>` : "",
      `<span class="chip conf-${esc(recipe.confidence)}" title="How well the numbers are sourced">${recipe.confidence === "high" ? "✓ Well sourced" : recipe.confidence === "medium" ? "≈ Partly sourced" : "⚠ Loosely sourced"}</span>`
    ].join("");

    return `
      <h3>${esc(recipe.name)}</h3>
      <p class="recipe-meta">${recipe.author ? `<span>${esc(recipe.author)}</span>` : ""}<span class="chip-row">${chips}</span></p>
      ${recipe.warn ? `<p class="recipe-warn">⚠ ${esc(recipe.warn)}</p>` : ""}
      <ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      ${rows ? `
      <p class="pour-caption"><strong>${pours > 1 ? "Scale targets (cumulative)" : "Steps"}</strong>${pours > 1 ? " — pour up to each number, don't add in your head:" : ""}</p>
      <table class="pour-schedule">
        <thead><tr><th>Time</th><th>Step</th><th>Add</th><th>Scale reads</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>` : ""}
      ${recipe.serve ? `<p><strong>Serve:</strong> ${esc(recipe.serve)}</p>` : ""}
      ${recipe.tips ? `<p><strong>Tips:</strong> ${esc(recipe.tips)}</p>` : ""}
      <p class="recipe-source"><a href="${esc(recipe.source)}" target="_blank" rel="noopener">Source ↗</a>${method.page ? ` · <a href="${esc(pageUrl(method.page))}">All ${esc(method.name)} recipes</a>` : ""}</p>
    `;
  }

  function calculate() {
    const method = getMethodById(currentMethod);
    const recipe = getCurrentRecipe();
    if (!method || !recipe) {
      output.innerHTML = "<strong>Pick a method and recipe.</strong>";
      brewLogActions.style.display = "none";
      return;
    }
    const coffee = Number.parseFloat(coffeeInput.value);
    if (!recipe.fixed && (!Number.isFinite(coffee) || coffee <= 0)) {
      output.innerHTML = "<strong>Please enter a valid coffee dose.</strong>";
      brewLogActions.style.display = "none";
      resetGeneratedLog();
      return;
    }
    output.innerHTML = renderRecipe(method, recipe, coffee);
    brewLogActions.style.display = "flex";
    timerButton.hidden = !timerFits(recipe);
    resetGeneratedLog();
    history.replaceState(null, "", `?method=${encodeURIComponent(method.id)}&recipe=${encodeURIComponent(recipe.id)}`);
  }
  window.calculate = calculate;

  // ---------- Brew timer ----------
  // A full-screen guide for the current recipe at the current dose, built from scheduleFor()
  // so its targets match the table. Elapsed time is a clock delta from the start (see runMs),
  // never a count of ticks, so a throttled or backgrounded tab catches up instead of drifting.
  const TIMER_MAX_SEC = 30 * 60;
  const timerButton = document.getElementById("start-timer");
  const tEl = {};
  ["overlay:brew-timer", "title:bt-title", "meta:bt-meta", "clock:bt-clock", "step:bt-step",
    "next:bt-next", "nextText:bt-next-text", "nextIn:bt-next-in", "barWrap:bt-bar", "bar:bt-bar-fill",
    "done:bt-done", "doneTime:bt-done-time", "doneActions:bt-done-actions", "controls:bt-controls", "reset:bt-reset",
    "toggle:bt-toggle", "nextBtn:bt-next-btn", "close:bt-close", "log:bt-log", "again:bt-again"
  ].forEach((pair) => { const [key, id] = pair.split(":"); tEl[key] = document.getElementById(id); });
  let T = null;
  let tickId = 0;
  let audioCtx = null;

  // Only for brews you stand over: a 16 h or overnight cold brew is a reminder, not a timer.
  function timerFits(recipe) {
    const secs = (recipe.steps || []).map((s) => parseAt(s.at)).filter((s) => s !== null);
    return secs.length > 0 && Math.max(...secs) <= TIMER_MAX_SEC && !/\d\s*h\b/.test(recipe.time || "");
  }

  function clock(sec) {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = String(s % 60).padStart(2, "0");
    return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
  }

  // performance.now() ignores clock changes but may stop while the phone sleeps; Date.now()
  // keeps wall time, so it wins when it is clearly ahead.
  function runMs() {
    const mono = performance.now() - T.startedAt;
    const wall = Date.now() - T.startedWall;
    return wall > mono + 2000 ? wall : mono;
  }
  const elapsedSec = () => (T.accMs + (T.running ? runMs() : 0)) / 1000;
  const isPour = (s) => s.target !== undefined;
  const pourVerb = () => (T.recipe.output ? "Pull to" : "Pour to");
  const untimedWhen = (s) => (isPour(s) ? "when the previous pour has drained" : "when the previous step is done");

  // A timed step fires when the clock crosses its time. If a late tap on Next lands you on a
  // step after the following one was already due, it waits for a tap rather than flashing past.
  function autoNext() {
    const next = T.steps[T.idx + 1];
    return next && next.sec !== null && next.sec > T.enteredAt ? next : null;
  }

  // iOS only lets Web Audio start inside a tap, so every timer button calls this first.
  function unlockAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state !== "running") audioCtx.resume().catch(() => {});
    } catch (e) { audioCtx = null; }
  }

  function beep(freq, ms, vol) {
    if (!audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + ms / 1000 + 0.02);
    } catch (e) { /* no audio is fine */ }
  }

  function cue() {
    beep(988, 220, 0.3);
    try { if (navigator.vibrate) navigator.vibrate([150, 80, 150]); } catch (e) { /* iOS has no vibrate */ }
    tEl.overlay.classList.remove("bt-flash");
    void tEl.overlay.offsetWidth; // restart the animation
    tEl.overlay.classList.add("bt-flash");
  }

  async function requestWakeLock() {
    try { return navigator.wakeLock ? await navigator.wakeLock.request("screen") : null; } catch (e) { return null; }
  }
  function releaseWakeLock(lock) {
    if (lock) lock.release().catch(() => {});
  }
  async function holdWakeLock() {
    const t = T;
    releaseWakeLock(t.wakeLock);
    t.wakeLock = null;
    const lock = await requestWakeLock();
    // Paused or closed while the request was pending: hand it straight back.
    if (T === t && t.running && !t.wakeLock) t.wakeLock = lock; else releaseWakeLock(lock);
  }
  function dropWakeLock() {
    releaseWakeLock(T.wakeLock);
    T.wakeLock = null;
  }

  function renderStep() {
    const s = T.steps[T.idx];
    const next = T.steps[T.idx + 1];
    let when = `Step ${T.idx + 1} of ${T.steps.length}`;
    if (s.prep) when = "Before you start";
    else if (s.sec !== null) when += ` · ${s.at}`;
    // No published time: the cue is the drain, not the clock.
    const untimed = !s.prep && s.sec === null && T.idx > 0
      ? `<p class="bt-when">⏳ Go ${untimedWhen(s)}</p>` : "";
    tEl.step.innerHTML = `<p class="bt-label">${esc(when)}</p>${isPour(s)
      ? `<p class="bt-now">${pourVerb()} <strong>${s.target} g</strong></p><p class="bt-note">${esc(s.note)}${s.pourNo > 1 ? ` · +${s.add} g` : ""}</p>`
      : `<p class="bt-now is-action">${esc(s.note)}</p>`}${untimed}`;
    if (!next) {
      tEl.nextText.innerHTML = "Last step — tap <strong>Finish</strong> when you're done";
    } else {
      const what = isPour(next) ? `${pourVerb().toLowerCase()} <strong>${next.target} g</strong>` : esc(next.note);
      tEl.nextText.innerHTML = `Next: ${next.sec !== null ? esc(next.at) : untimedWhen(next)} — ${what}`;
    }
  }

  function renderControls() {
    const started = T.running || T.accMs > 0;
    tEl.toggle.textContent = T.running ? "❚❚ Pause" : started ? "▶ Resume" : "▶ Start";
    tEl.nextBtn.textContent = T.idx >= T.steps.length - 1 ? "Finish ✓" : "Next step ›";
    // Highlight Next when nothing will move on by itself.
    tEl.nextBtn.classList.toggle("bt-wait", T.running && !autoNext());
    tEl.reset.disabled = !started && T.idx === 0;
  }

  function renderClock(sec) {
    const text = clock(sec);
    if (tEl.clock.textContent !== text) {
      tEl.clock.textContent = text;
      tEl.clock.classList.toggle("is-long", sec >= 3600);
    }
    const next = T.steps[T.idx + 1];
    const auto = autoNext();
    tEl.barWrap.hidden = !next || next.sec === null;
    if (auto) {
      const frac = (sec - T.enteredAt) / (auto.sec - T.enteredAt);
      tEl.bar.style.width = `${(Math.min(1, Math.max(0, frac)) * 100).toFixed(1)}%`;
      tEl.nextIn.textContent = `in ${clock(Math.ceil(auto.sec - sec))}`;
    } else {
      tEl.bar.style.width = T.steps[T.idx].prep ? "0%" : "100%";
      tEl.nextIn.textContent = next && next.sec !== null && !T.steps[T.idx].prep ? "due" : "";
    }
  }

  function render() {
    tEl.step.hidden = T.done;
    tEl.next.hidden = T.done;
    tEl.controls.hidden = T.done;
    tEl.done.hidden = !T.done;
    tEl.doneActions.hidden = !T.done;
    tEl.overlay.classList.toggle("is-done", T.done);
    if (T.done) tEl.doneTime.textContent = clock(elapsedSec());
    else { renderStep(); renderControls(); }
    renderClock(elapsedSec());
  }

  function tick() {
    if (!T || T.done) return;
    const sec = elapsedSec();
    let moved = false;
    // Catch up on every step the clock has crossed (a backgrounded tab can skip several).
    for (let next = autoNext(); T.running && next && sec >= next.sec; next = autoNext()) {
      T.idx++;
      T.enteredAt = next.sec;
      moved = true;
    }
    if (moved) { cue(); renderStep(); renderControls(); }
    const next = autoNext();
    // Forgotten on a step that waits for a tap: pause so the wake lock doesn't drain the battery.
    if (T.running && !next && sec - T.enteredAt > TIMER_MAX_SEC) { pauseTimer(); render(); return; }
    if (T.running && next) {
      const left = Math.ceil(next.sec - sec);
      const key = `${T.idx}:${left}`;
      if (left >= 1 && left <= 3 && T.beeped !== key) { T.beeped = key; beep(660, 70, 0.15); }
    }
    renderClock(sec);
  }

  function startTimer() {
    const fresh = T.accMs === 0;
    // Prep steps ("ice in the server") come before the clock; Start jumps to the 0:00 step.
    if (T.steps[T.idx].prep) { T.idx = T.steps.findIndex((s) => !s.prep); T.enteredAt = 0; }
    T.running = true;
    T.startedAt = performance.now();
    T.startedWall = Date.now();
    clearInterval(tickId);
    tickId = setInterval(tick, 100);
    holdWakeLock();
    if (fresh) cue();
  }

  function pauseTimer() {
    T.accMs += runMs();
    T.running = false;
    clearInterval(tickId);
    dropWakeLock();
  }

  function finishTimer() {
    if (T.running) pauseTimer();
    T.done = true;
    render();
    tEl.log.focus();
  }

  function resetTimer() {
    if (T.running) pauseTimer();
    Object.assign(T, { idx: 0, accMs: 0, enteredAt: 0, done: false, beeped: "" });
    render();
  }

  function openTimer() {
    const recipe = getCurrentRecipe();
    const coffee = Number.parseFloat(coffeeInput.value);
    if (!recipe || !timerFits(recipe)) return;
    const sched = scheduleFor(recipe, coffee);
    // Untimed steps before a 0:00 step are prep, done before the clock starts.
    const firstTimed = sched.steps.findIndex((s) => s.sec !== null);
    const steps = sched.steps.map((s, i) => ({ ...s, prep: i < firstTimed && sched.steps[firstTimed].sec === 0 }));
    T = { recipe, steps, idx: 0, accMs: 0, startedAt: 0, startedWall: 0, enteredAt: 0, running: false, done: false, beeped: "", wakeLock: null };

    tEl.title.textContent = recipe.name;
    const meta = recipe.fixed
      ? [recipe.dose ? `${recipe.dose} g coffee` : "", recipe.water ? `${recipe.water} ml water` : ""]
      : [`${coffee} g coffee`, `${sched.total} g ${recipe.output ? "in the cup" : "water"}`,
        recipe.bypass ? `${round(recipe.bypass * sched.scale)} g bypass` : "",
        recipe.ice ? `${round(recipe.ice * sched.scale)} g ice` : ""];
    tEl.meta.textContent = meta.filter(Boolean).join(" · ") || "As published";
    tEl.overlay.classList.remove("bt-flash");
    tEl.overlay.hidden = false;
    document.body.classList.add("bt-open");
    render();
    tEl.toggle.focus();
  }

  function closeTimer() {
    if (!T) return;
    if (T.running) pauseTimer();
    clearInterval(tickId);
    T = null;
    tEl.overlay.hidden = true;
    document.body.classList.remove("bt-open");
    timerButton.focus();
  }

  timerButton.addEventListener("click", () => { unlockAudio(); openTimer(); });
  tEl.toggle.addEventListener("click", () => {
    unlockAudio();
    if (T.running) pauseTimer(); else startTimer();
    render();
  });
  tEl.nextBtn.addEventListener("click", () => {
    unlockAudio();
    if (T.idx >= T.steps.length - 1) { finishTimer(); return; }
    T.idx++;
    T.enteredAt = elapsedSec();
    T.beeped = "";
    render();
  });
  tEl.reset.addEventListener("click", resetTimer);
  tEl.again.addEventListener("click", () => { resetTimer(); tEl.toggle.focus(); });
  tEl.close.addEventListener("click", closeTimer);
  tEl.log.addEventListener("click", () => {
    const total = clock(elapsedSec());
    closeTimer();
    window.openBrewLogBuilder();
    const notes = document.getElementById("notes");
    if (notes && !notes.value.trim()) notes.value = `Brew timer: ${total} total.`;
    document.getElementById("brew-log-builder").scrollIntoView({ block: "start" });
  });

  document.addEventListener("keydown", (e) => {
    if (!T) return;
    if (e.key === "Escape") { e.preventDefault(); closeTimer(); return; }
    if (e.key !== "Tab") return;
    // Keep focus inside the dialog
    const items = Array.from(tEl.overlay.querySelectorAll("button")).filter((b) => !b.disabled && b.offsetParent !== null);
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // The browser drops the wake lock whenever the page is hidden; take it back on return.
  document.addEventListener("visibilitychange", () => {
    if (!T || !T.running || document.visibilityState !== "visible") return;
    holdWakeLock();
    unlockAudio();
    tick();
  });

  renderMethodButtons();
  loadRecipes(params.get("recipe"));
  brewerValue.value = getCurrentBrewerName();
  syncSliderLabels();
  calculate();

  recipeSelect.addEventListener("change", () => { applyRecipeDefaults(); calculate(); });
  coffeeInput.addEventListener("input", calculate);
  strengthInput.addEventListener("input", syncSliderLabels);
  acidityInput.addEventListener("input", syncSliderLabels);
  sweetnessInput.addEventListener("input", syncSliderLabels);

  window.openBrewLogBuilder = function () {
    const builder = document.getElementById("brew-log-builder");
    const beanSelect = document.getElementById("bean-select");

    builder.style.display = "block";
    beanSelect.innerHTML = "";

    const beans = Array.isArray(window.beans) ? window.beans : [];

    beans.forEach((bean) => {
      const option = document.createElement("option");
      option.value = bean.title;
      option.textContent = bean.title;
      beanSelect.appendChild(option);
    });

    brewerValue.value = getCurrentBrewerName();
  };

  window.generateBrewMarkdown = function () {
    const bean = document.getElementById("bean-select").value;
    const strength = document.getElementById("strength").value;
    const acidity = document.getElementById("acidity").value;
    const sweetness = document.getElementById("sweetness").value;
    const notes = document.getElementById("notes").value;
    const brewer = brewerValue.value || getCurrentBrewerName();
    const grinderName = grinderSelect.value;
    const scale = scaleSelect.value;
    const server = serverSelect.value;

    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    const recipe = getCurrentRecipe();
    const recipeName = recipe ? recipe.name : recipeSelect.options[recipeSelect.selectedIndex].text;

    const brewParams = Array.from(output.querySelectorAll("li"))
      .map((item) => `- ${item.textContent}`)
      .join("\n");

    // Keep the cumulative pour schedule in the log as a Markdown table.
    const scheduleTable = output.querySelector("table.pour-schedule");
    let pourSchedule = "";
    if (scheduleTable) {
      const headers = Array.from(scheduleTable.querySelectorAll("thead th")).map(
        (cell) => cell.textContent.trim()
      );
      const bodyRows = Array.from(scheduleTable.querySelectorAll("tbody tr")).map((row) => {
        const cells = Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent.trim());
        while (cells.length < headers.length) cells.splice(2, 0, "");
        return "| " + cells.join(" | ") + " |";
      });
      pourSchedule = [
        "",
        "**Pour schedule (cumulative scale targets)**",
        "",
        "| " + headers.join(" | ") + " |",
        "| " + headers.map(() => "---").join(" | ") + " |",
        ...bodyRows
      ].join("\n");
    }

    const markdown = `
---
layout: brew
title: ${recipeName} — ${bean}
date: ${today}
---

This entry documents my **${recipeName}** brew and tasting notes for **${bean}**.

---

## 📦 Coffee Details
- **Bean**: ${bean}

---

## ⚖️ Brew Recipe
${brewParams}
${pourSchedule}
${recipe && recipe.source ? `\nRecipe source: ${recipe.source}\n` : ""}
---

## 🧰 Brewing Equipment
- **Brewer**: ${brewer}
- **Grinder**: ${grinderName}
- **Scale**: ${scale}
- **Server / Cup**: ${server}

---

## 👅 Cup Profile & Notes
- **Strength**: ${strength}
- **Acidity**: ${acidity}
- **Sweetness**: ${sweetness}

${notes}

---

## 📝 Journal Thoughts
Overall impressions, adjustments, and reflections from this brew.
`.trim();

    markdownOutput.style.display = "block";
    markdownOutput.textContent = markdown;
    copyButton.style.display = "inline-block";
    downloadButton.style.display = "inline-block";
  };
});

window.downloadBrewLog = function () {
  const pre = document.getElementById("brew-markdown-output");
  const markdown = pre.textContent.trim();

  if (!markdown) {
    return;
  }

  const firstLine = markdown
    .split("\n")
    .find((line) => line.startsWith("title:"));
  const fileBase = firstLine
    ? firstLine
        .replace("title:", "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    : `brew-log-${new Date().toISOString().split("T")[0]}`;

  const blob = new Blob([markdown + "\n"], {
    type: "text/markdown;charset=utf-8"
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = `${fileBase || "brew-log"}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
};

window.copyBrewLog = function () {
  const pre = document.getElementById("brew-markdown-output");
  const button = document.getElementById("copy-brew-log");

  navigator.clipboard.writeText(pre.textContent).then(
    () => {
      const originalText = button.textContent;
      button.textContent = "Copied ✓";
      setTimeout(() => { button.textContent = originalText; }, 1500);
    },
    () => {
      button.textContent = "Copy failed";
      setTimeout(() => { button.textContent = "Copy"; }, 1500);
    }
  );
};
