---
layout: default
title: Brew Calculator
show_title: false
plain: true
---

<style>
  #methods { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-bottom: 1.2rem; }
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
</style>

<div class="page-head">
  <p class="eyebrow">Tools</p>
  <h1>Brew Calculator</h1>
  <p>Pick a method and recipe, enter your dose, and get scaled parameters — then generate a ready-to-paste brew log.</p>
</div>

<div class="card" style="margin-bottom:1.4rem">
  <label style="display:block;font-size:0.78rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-faint);font-weight:600;margin-bottom:0.5rem">Method</label>
  <div id="methods" aria-label="Brewing methods"></div>

  <div class="field-row">
    <div class="field" style="margin:0">
      <label for="recipe">Recipe</label>
      <select id="recipe"></select>
    </div>
    <div class="field" style="margin:0">
      <label for="coffee">Coffee dose (g)</label>
      <input type="number" id="coffee" value="15" min="5" step="0.5" inputmode="decimal">
    </div>
  </div>
  <button type="button" class="btn btn-primary" style="margin-top:1rem" onclick="calculate()">Calculate</button>
</div>

<div class="calc-output">
  <div id="output" class="card" aria-live="polite"><em style="color:var(--ink-faint)">Select a method, recipe, and dose, then hit Calculate.</em></div>
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
      <select id="scale-select"><option>InstaCuppa</option><option>Dr.Trust</option></select>
    </div>
  </div>

  <div class="field">
    <label for="server-select">Server / Cup</label>
    <select id="server-select">
      <option>Timemore Coffee Server 600ml</option><option>Coffee Mug</option><option>Borosil Coffeemate Travel Mug</option>
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

<script>
  window.beans = [
    {% assign beans = site.pages | where_exp:"p","p.path contains 'beans/'" | where_exp:"p","p.name != 'index.md'" %}
    {% for bean in beans %}{ title: {{ bean.title | jsonify }}, url: {{ bean.url | relative_url | jsonify }} }{% unless forloop.last %},{% endunless %}{% endfor %}
  ];
</script>
<script src="{{ '/tools/brew-calculator/calculator.js' | relative_url }}"></script>
