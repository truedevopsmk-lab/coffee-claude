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
  <button type="button" class="btn btn-ghost" onclick="openBrewLogBuilder()">📝 Create brew log</button>
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
