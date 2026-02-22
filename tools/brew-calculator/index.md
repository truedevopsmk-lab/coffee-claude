---
layout: default
title: ☕ Brewing Method
---

<div id="methods" aria-label="Brewing methods"></div>

<br>

<label for="recipe">Recipe</label><br>
<select id="recipe"></select>

<br><br>

<label for="coffee">Coffee dose (grams)</label><br>
<input type="number" id="coffee" value="12" min="5" step="0.5">

<br><br>

<button type="button" onclick="calculate()">Calculate</button>

---

## 📊 Brew Parameters

<div id="output" aria-live="polite">
  <em>Select a method, recipe, and dose.</em>
</div>

<div id="brew-log-actions" style="display:none; margin-top:1rem;">
  <button type="button" onclick="openBrewLogBuilder()">Create Brew Log</button>
</div>

<div id="brew-log-builder" style="display:none; margin-top:1.5rem;">
  <h3>📝 Brew Log Builder</h3>

  <label>Bean</label><br>
  <select id="bean-select"></select><br><br>

  <label for="brewer-value">Brewer</label><br>
  <input id="brewer-value" type="text" readonly><br><br>

  <label for="grinder-select">Grinder</label><br>
  <select id="grinder-select">
    <option>Timemore C3S Pro</option>
    <option>Cafflano Klassic</option>
  </select><br><br>

  <label for="scale-select">Scale</label><br>
  <select id="scale-select">
    <option>InstaCuppa</option>
    <option>Dr.Trust</option>
  </select><br><br>

  <label for="server-select">Server / Cup</label><br>
  <select id="server-select">
    <option>Timemore Coffee Server 600ml</option>
    <option>Coffee Mug</option>
    <option>Borosil Coffeemate Travel Mug</option>
  </select><br><br>

  <!-- Strength Slider -->
  <label for="strength">
    Strength: <strong><span id="strengthVal">3</span></strong>
  </label><br>
  <input
    type="range"
    id="strength"
    min="1"
    max="5"
    step="1"
    value="3"
  >
  <small>1 = Tea-like · 3 = Balanced · 5 = Punchy</small>
  <br><br>

  <!-- Acidity Slider -->
  <label for="acidity">
    Acidity: <strong><span id="acidityVal">3</span></strong>
  </label><br>
  <input
    type="range"
    id="acidity"
    min="1"
    max="5"
    step="1"
    value="3"
  >
  <small>1 = Soft · 3 = Clean · 5 = Bright</small>
  <br><br>

  <!-- Sweetness Slider -->
  <label for="sweetness">
    Sweetness: <strong><span id="sweetnessVal">3</span></strong>
  </label><br>
  <input
    type="range"
    id="sweetness"
    min="1"
    max="5"
    step="1"
    value="3"
  >
  <small>1 = Dry · 3 = Balanced · 5 = Syrupy</small>
  <br><br>

  <label>Notes</label><br>
  <textarea
    id="notes"
    rows="4"
    placeholder="Your tasting notes..."
  ></textarea><br><br>

  <button type="button" onclick="generateBrewMarkdown()">Generate Brew Log</button>
</div>

<pre id="brew-markdown-output" style="display:none; margin-top:1.5rem;"></pre>

<button
  id="copy-brew-log"
  style="display:none; margin-top:0.75rem;"
  onclick="copyBrewLog()">
  Copy Brew Log
</button>

<button
  id="download-brew-log"
  style="display:none; margin-top:0.75rem; margin-left:0.5rem;"
  onclick="downloadBrewLog()">
  Download Brew Log (.md)
</button>

<script>
  window.beans = [
    {% assign beans = site.pages
      | where_exp:"p","p.path contains 'beans/'"
      | where_exp:"p","p.name != 'index.md'" %}
    {% for bean in beans %}
      {
        title: "{{ bean.title }}",
        url: "{{ bean.url | relative_url }}"
      }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];
</script>

<script src="{{ '/tools/brew-calculator/calculator.js' | relative_url }}"></script>
