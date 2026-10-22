---
layout: default
title: Brew Calculator
show_title: false
plain: true
---

<style>
  #methods { display: grid; gap: 0.45rem; margin-bottom: 1.2rem; }
  .method-row { display: flex; flex-wrap: wrap; gap: 0.45rem; }
  /* Phones: each group is one sideways-scrolling row instead of a tall block of chips */
  @media (max-width: 640px) {
    .method-row {
      flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;
      margin: 0 -1.3rem; padding: 0.1rem 1.3rem 0.3rem;
    }
    .method-row::-webkit-scrollbar { display: none; }
    .method { flex: 0 0 auto; white-space: nowrap; }
  }
  .method {
    border: 1px solid var(--border); background: var(--surface); color: var(--espresso);
    padding: 0.45rem 0.95rem; border-radius: var(--radius-pill); cursor: pointer; font: inherit;
    font-size: 0.9rem; font-weight: 600; transition: all .15s;
  }
  .method:hover { border-color: var(--brass); }
  .method.active { background: linear-gradient(135deg, var(--brass), var(--brass-deep)); color: #fff7ee; border-color: transparent; }
  .calc-output .card { margin-top: 0; }
  .calc-output h3 { margin-top: 0; }
  #brew-markdown-output {
    background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: 1rem; overflow-x: auto; font-family: var(--mono); font-size: 0.85rem; white-space: pre-wrap;
  }
  .calc-output .pour-caption { margin: 0.9rem 0 0.4rem; font-size: 0.9rem; }
  .calc-output table.pour-schedule { width: 100%; border-collapse: collapse; margin: 0.3rem 0 0.6rem; font-size: 0.92rem; }
  .calc-output table.pour-schedule th,
  .calc-output table.pour-schedule td { padding: 0.5rem 0.7rem; border: 1px solid var(--border); text-align: left; }
  .calc-output table.pour-schedule th { background: var(--surface-2); color: var(--espresso); font-weight: 600; }
  .calc-output table.pour-schedule td:last-child { font-variant-numeric: tabular-nums; }
  .calc-output table.pour-schedule tr:last-child td { border-top-width: 2px; }
  .calc-output table.pour-schedule td:first-child { font-family: var(--mono); white-space: nowrap; width: 1%; }
  .calc-output table.pour-schedule td:nth-child(3) { white-space: nowrap; }
  .calc-output table.pour-schedule tr.step-action td { color: var(--ink-soft); font-style: italic; }
  .method-group {
    font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-faint); font-weight: 600; margin-top: 0.3rem;
  }
  .method-group:first-child { margin-top: 0; }
  .method.someday:not(.active) { border-style: dashed; color: var(--ink-soft); }
  .recipe-meta { margin: -0.3rem 0 0.8rem; color: var(--ink-soft); font-size: 0.9rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; }
  .recipe-meta .chip-row { display: inline-flex; }
  .chip.conf-high { color: var(--sage-deep); border-color: color-mix(in srgb, var(--sage) 40%, transparent); }
  .chip.conf-low { color: #b3382a; border-color: rgba(192,57,43,.35); }
  .recipe-warn {
    padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.9rem;
    background: color-mix(in srgb, var(--gold) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--gold) 40%, transparent); color: var(--ink);
  }
  .recipe-source { font-size: 0.85rem; color: var(--ink-faint); margin-bottom: 0; }
  .grind-chart { margin-top: 1.4rem; }
  .grind-chart table { width: 100%; border-collapse: collapse; font-size: 0.92rem; margin: 0.4rem 0; }
  .grind-chart th, .grind-chart td { padding: 0.45rem 0.7rem; border: 1px solid var(--border); text-align: left; }
  .grind-chart th { background: var(--surface-2); color: var(--espresso); font-weight: 600; }
  .grind-chart p { margin: 0.3rem 0; font-size: 0.85rem; color: var(--ink-soft); }
  @media (max-width: 480px) {
    .calc-output table.pour-schedule { font-size: 0.84rem; }
    .calc-output table.pour-schedule th, .calc-output table.pour-schedule td { padding: 0.4rem 0.45rem; }
  }

  /* ---------- Brew timer (full-screen overlay) ---------- */
  #brew-log-actions { flex-wrap: wrap; gap: 0.7rem; }
  #brew-log-actions .btn { min-height: 44px; }
  body.bt-open { overflow: hidden; }
  /* The OneSignal bell would sit on top of the controls */
  body.bt-open #onesignal-bell-container { display: none; }
  /* Same status-bar band as the topbar, so white iOS status text stays readable in the app */
  .brew-timer {
    position: fixed; inset: 0; z-index: 1000; background: var(--paper); color: var(--ink);
    border-top: var(--safe-top) solid var(--statusbar);
    overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
  }
  /* Step-change flash: a brass wash that fades out */
  .brew-timer::after {
    content: ""; position: fixed; inset: 0; pointer-events: none; opacity: 0;
    background: color-mix(in srgb, var(--brass) 38%, transparent);
  }
  .brew-timer.bt-flash::after { animation: bt-flash .7s ease-out; }
  @keyframes bt-flash { from { opacity: 1; } to { opacity: 0; } }
  .bt-inner {
    max-width: 560px; margin: 0 auto; min-height: 100%;
    display: flex; flex-direction: column; gap: 1rem;
    padding: 0.9rem max(1.1rem, var(--safe-right)) calc(var(--safe-bottom) + 1rem) max(1.1rem, var(--safe-left));
  }
  /* Clock + step sit in the middle of the screen; the controls stay in thumb reach */
  .bt-main { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 1rem; }
  .brew-timer button { -webkit-tap-highlight-color: transparent; }
  .bt-head { display: flex; align-items: flex-start; gap: 0.8rem; }
  .bt-head-text { flex: 1; min-width: 0; }
  .bt-eyebrow, .bt-label {
    margin: 0; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-faint); font-weight: 600;
  }
  .brew-timer h2 { margin: 0.1rem 0 0; font-size: 1.3rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bt-meta { margin: 0.15rem 0 0; font-size: 0.88rem; color: var(--ink-soft); }
  .bt-close {
    flex: 0 0 auto; width: 44px; height: 44px; border-radius: var(--radius-pill);
    border: 1px solid var(--border); background: var(--surface); color: var(--ink);
    font-size: 1.6rem; line-height: 1; cursor: pointer;
  }
  .bt-clock {
    text-align: center; font-family: var(--mono); font-variant-numeric: tabular-nums;
    font-size: clamp(4.2rem, 23vw, 7.5rem); font-weight: 500; line-height: 1;
    color: var(--espresso); letter-spacing: -0.03em; margin: 0.6rem 0 0.2rem;
  }
  .bt-clock.is-long { font-size: clamp(3rem, 16vw, 5.5rem); }
  .bt-step {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 1.1rem 1.2rem; box-shadow: var(--shadow);
  }
  .bt-now {
    margin: 0.35rem 0 0; font-family: var(--serif); color: var(--espresso);
    font-size: clamp(1.9rem, 9vw, 2.6rem); line-height: 1.1;
  }
  /* Sans with tabular figures: the mono face's wide space split "90 g" apart */
  .bt-now strong { font-family: var(--sans); font-variant-numeric: tabular-nums; font-weight: 700; letter-spacing: -0.02em; color: var(--brass-deep); white-space: nowrap; }
  .bt-now.is-action { font-size: clamp(1.35rem, 6.2vw, 1.8rem); line-height: 1.25; }
  .bt-note { margin: 0.45rem 0 0; color: var(--ink-soft); font-size: 1rem; line-height: 1.4; }
  /* Untimed step: the "wait for the drain" cue is the instruction, so it gets its own line */
  .bt-when {
    margin: 0.7rem 0 0; padding: 0.45rem 0.7rem; border-radius: var(--radius-sm); font-size: 0.95rem; line-height: 1.35;
    color: var(--ink); background: color-mix(in srgb, var(--gold) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--gold) 40%, transparent);
  }
  .bt-next-row { display: flex; align-items: baseline; gap: 0.7rem; margin: 0 0 0.45rem; font-size: 0.95rem; color: var(--ink-soft); line-height: 1.4; }
  .bt-next-row > span:first-child { flex: 1; min-width: 0; }
  .bt-next-row strong { color: var(--ink); font-variant-numeric: tabular-nums; }
  .bt-next-in { font-variant-numeric: tabular-nums; font-weight: 600; color: var(--brass-deep); white-space: nowrap; }
  .bt-bar { height: 8px; border-radius: var(--radius-pill); background: var(--border); overflow: hidden; }
  .bt-bar-fill { height: 100%; width: 0; border-radius: inherit; background: linear-gradient(90deg, var(--gold), var(--brass)); transition: width .15s linear; }
  .bt-controls { display: grid; grid-template-columns: 1fr 1.25fr 1.15fr; gap: 0.5rem; }
  .bt-controls .btn, .bt-big { min-height: 56px; justify-content: center; font-size: 1rem; padding: 0.6rem 0.4rem; white-space: nowrap; }
  .bt-controls #bt-toggle { font-size: 1.1rem; }
  /* Nothing will advance by itself: point at Next */
  .bt-controls .bt-wait {
    border-color: var(--brass); color: var(--brass-deep);
    background: color-mix(in srgb, var(--brass) 14%, var(--surface));
  }
  .bt-done { text-align: center; display: grid; gap: 0.7rem; }
  .bt-done-title { margin: 0; font-family: var(--serif); font-size: 3rem; color: var(--espresso); line-height: 1.1; }
  .bt-done-time { margin: 0; color: var(--ink-soft); font-size: 1.05rem; }
  .bt-done-time strong {
    display: block; margin-top: 0.3rem; font-family: var(--mono); font-variant-numeric: tabular-nums;
    font-size: clamp(3rem, 16vw, 4.5rem); font-weight: 500; line-height: 1; color: var(--sage-deep);
  }
  /* Done: the summary shows the total, so the running clock steps aside */
  .brew-timer.is-done .bt-clock { display: none; }
  .bt-done-actions { display: grid; gap: 0.6rem; }
  @media (hover: hover) { .bt-close:hover { border-color: var(--brass); } }
  /* Short screens (landscape phones): tighten so the controls stay on screen */
  @media (max-height: 560px) {
    .bt-inner { gap: 0.6rem; }
    .bt-clock { font-size: clamp(3rem, 14vh, 4.5rem); margin: 0; }
    .bt-now { font-size: 1.6rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .brew-timer.bt-flash::after { animation: none; }
    .bt-bar-fill { transition: none; }
  }
</style>

<div class="page-head">
  <p class="eyebrow">Tools</p>
  <h1>Brew Calculator</h1>
  <p>Pick a brewer and recipe, enter your dose, and every pour scales with it — championship recipes included. Then generate a ready-to-paste brew log.</p>
</div>

<div class="card" style="margin-bottom:1.4rem">
  <label style="display:block;font-size:0.78rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-faint);font-weight:600;margin-bottom:0.5rem">Method</label>
  <div id="methods" aria-label="Brewing methods"></div>

  <div class="field-row">
    <div class="field" style="margin:0">
      <label for="recipe">Recipe</label>
      <select id="recipe"></select>
    </div>
    <div class="field" style="margin:0" id="dose-field">
      <label for="coffee">Coffee dose (g)</label>
      <input type="number" id="coffee" value="15" min="5" step="0.5" inputmode="decimal">
    </div>
  </div>
</div>

<div class="calc-output">
  <div id="output" class="card" aria-live="polite"><em style="color:var(--ink-faint)">Pick a method and recipe.</em></div>
</div>

<div id="brew-log-actions" style="display:none; margin-top:1rem">
  <button type="button" class="btn btn-primary" id="start-timer" hidden>▶ Start brewing</button>
  <button type="button" class="btn btn-ghost" onclick="openBrewLogBuilder()">📝 Create brew log</button>
</div>

<div id="brew-timer" class="brew-timer" role="dialog" aria-modal="true" aria-labelledby="bt-title" hidden>
  <div class="bt-inner">
    <div class="bt-head">
      <div class="bt-head-text">
        <p class="bt-eyebrow">Brewing</p>
        <h2 id="bt-title"></h2>
        <p id="bt-meta" class="bt-meta"></p>
      </div>
      <button type="button" id="bt-close" class="bt-close" aria-label="Close timer">×</button>
    </div>

    <div class="bt-main">
      <div id="bt-clock" class="bt-clock" role="timer" aria-label="Elapsed time">0:00</div>

      <div id="bt-step" class="bt-step" aria-live="polite"></div>

      <div id="bt-next" class="bt-next">
        <p class="bt-next-row"><span id="bt-next-text"></span><span id="bt-next-in" class="bt-next-in"></span></p>
        <div id="bt-bar" class="bt-bar"><div id="bt-bar-fill" class="bt-bar-fill"></div></div>
      </div>

      <div id="bt-done" class="bt-done" hidden>
        <p class="bt-done-title">Done ☕</p>
        <p class="bt-done-time">Total time <strong id="bt-done-time">0:00</strong></p>
      </div>
    </div>

    <div id="bt-done-actions" class="bt-done-actions" hidden>
      <button type="button" id="bt-log" class="btn btn-primary bt-big">📝 Create brew log</button>
      <button type="button" id="bt-again" class="btn btn-ghost bt-big">↺ Brew again</button>
    </div>

    <div id="bt-controls" class="bt-controls">
      <button type="button" id="bt-reset" class="btn btn-ghost">↺ Reset</button>
      <button type="button" id="bt-toggle" class="btn btn-primary">▶ Start</button>
      <button type="button" id="bt-next-btn" class="btn btn-ghost">Next step ›</button>
    </div>
  </div>
</div>

<div id="brew-log-builder" class="card" style="display:none; margin-top:1.4rem">
  <h3 style="margin-top:0">Brew Log Builder</h3>

  <div class="field">
    <label for="bean-select">Bean</label>
    <select id="bean-select"></select>
  </div>

  <div class="field-row-3">
    <div class="field" style="margin:0">
      <label for="brewer-value">Brewer</label>
      <input id="brewer-value" type="text" readonly>
    </div>
    <div class="field" style="margin:0">
      <label for="grinder-select">Grinder</label>
      <select id="grinder-select"><option>Timemore C3S Pro</option><option>Cafflano Klassic</option></select>
    </div>
    <div class="field" style="margin:0">
      <label for="scale-select">Scale</label>
      <select id="scale-select"><option>InstaCuppa</option></select>
    </div>
  </div>

  <div class="field">
    <label for="server-select">Server / Cup</label>
    <select id="server-select">
      <option>Timemore Coffee Server 600ml</option><option>Borosil Thermo Coffee Cup 360ml</option><option>Coffee Mug</option>
    </select>
  </div>

  <div class="field">
    <label for="strength">Strength: <b id="strengthVal" style="color:var(--brass-deep)">3</b></label>
    <input type="range" id="strength" min="1" max="5" step="1" value="3" style="width:100%;accent-color:var(--brass)">
    <small>1 = tea-like · 3 = balanced · 5 = punchy</small>
  </div>
  <div class="field">
    <label for="acidity">Acidity: <b id="acidityVal" style="color:var(--brass-deep)">3</b></label>
    <input type="range" id="acidity" min="1" max="5" step="1" value="3" style="width:100%;accent-color:var(--brass)">
    <small>1 = soft · 3 = clean · 5 = bright</small>
  </div>
  <div class="field">
    <label for="sweetness">Sweetness: <b id="sweetnessVal" style="color:var(--brass-deep)">3</b></label>
    <input type="range" id="sweetness" min="1" max="5" step="1" value="3" style="width:100%;accent-color:var(--brass)">
    <small>1 = dry · 3 = balanced · 5 = syrupy</small>
  </div>

  <div class="field">
    <label for="notes">Notes</label>
    <textarea id="notes" rows="4" placeholder="Your tasting notes…"></textarea>
  </div>

  <button type="button" class="btn btn-primary" onclick="generateBrewMarkdown()">Generate brew log</button>
</div>

<pre id="brew-markdown-output" style="display:none; margin-top:1.4rem"></pre>

<div style="display:flex;gap:0.7rem;margin-top:0.8rem">
  <button id="copy-brew-log" class="btn btn-ghost btn-sm" style="display:none" onclick="copyBrewLog()">Copy</button>
  <button id="download-brew-log" class="btn btn-ghost btn-sm" style="display:none" onclick="downloadBrewLog()">Download .md</button>
</div>

<section class="card grind-chart" aria-labelledby="grind-chart-h">
  <h3 id="grind-chart-h" style="margin-top:0">⚙️ {{ site.data.recipes.grinder.name }} — grind guide</h3>
  <table>
    <thead><tr><th>Method</th><th>Clicks from zero</th></tr></thead>
    <tbody>
      {% for row in site.data.recipes.grinder.official %}<tr><td>{{ row.method }}</td><td>{{ row.clicks }}</td></tr>{% endfor %}
    </tbody>
  </table>
  <p>Zero = dial turned fully clockwise. Avoid {{ site.data.recipes.grinder.avoid }}. {{ site.data.recipes.grinder.capacity }}.</p>
  <p>TIMEMORE publishes no settings for AeroPress, moka, filter or cold brew, and no conversion from the Comandante or micron settings champions quote — start in the pour-over band and adjust by taste and drawdown time. <a href="{{ site.data.recipes.grinder.source }}" target="_blank" rel="noopener">Source ↗</a></p>
</section>

<script>
  window.siteBaseUrl = {{ site.baseurl | jsonify }};
  window.recipeData = {{ site.data.recipes | jsonify }};
  window.beans = [
    {% assign beans = site.pages | where_exp:"p","p.path contains 'beans/'" | where_exp:"p","p.name != 'index.md'" %}
    {% for bean in beans %}{ title: {{ bean.title | jsonify }}, url: {{ bean.url | relative_url | jsonify }} }{% unless forloop.last %},{% endunless %}{% endfor %}
  ];
</script>
<script src="{{ '/tools/brew-calculator/calculator.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
