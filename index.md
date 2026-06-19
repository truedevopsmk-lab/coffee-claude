---
layout: default
title: Home
show_title: false
plain: true
---

{% assign all_brews = site.pages | where_exp: "p", "p.path contains 'brews/'" | where_exp: "p", "p.name != 'index.md'" | sort: "date" | reverse %}
{% assign all_beans = site.pages | where_exp: "p", "p.path contains 'beans/'" | where_exp: "p", "p.name != 'index.md'" %}
{% assign all_methods = site.pages | where_exp: "p", "p.path contains 'methods/'" | where_exp: "p", "p.name != 'index.md'" %}
{% assign gallery_count = site.static_files | where_exp: "f", "f.path contains '/assets/gallery/'" | size %}

<section class="hero">
  <p class="hero-eyebrow">Pour · Taste · Note · Repeat</p>
  <h1 class="hero-title">A <span class="accent">brew lab</span> notebook.</h1>
  <p class="hero-lede">Every cup logged like an experiment — recipes, ratios, grind settings, and tasting notes for beans I've chased across origins and processes. This is my running record of getting better, one brew at a time.</p>
  <div class="hero-actions">
    <a class="btn btn-primary" href="{{ '/add-brew/' | relative_url }}">＋ Log a brew</a>
    <a class="btn btn-ghost" href="{{ '/brews/' | relative_url }}">Browse the logbook</a>
  </div>

  <div class="stats">
    <div class="stat"><span class="stat-num">{{ all_brews | size }}</span><span class="stat-label">Brews logged</span></div>
    <div class="stat"><span class="stat-num">{{ all_beans | size }}</span><span class="stat-label">Beans profiled</span></div>
    <div class="stat"><span class="stat-num">{{ all_methods | size }}</span><span class="stat-label">Methods</span></div>
    <div class="stat"><span class="stat-num">{{ gallery_count }}</span><span class="stat-label">Frames</span></div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <h2 class="section-title"><span class="ico">☕</span> Latest from the logbook</h2>
    <a class="section-link" href="{{ '/brews/' | relative_url }}">All brews →</a>
  </div>
  <div class="card-grid">
    {% for brew in all_brews limit: 6 %}
      <article class="card brew-card">
        <div class="brew-card-top">
          <span class="brew-card-date">{{ brew.date | date: "%d %b %Y" }}</span>
          {% if brew.method %}<span class="chip chip-method">{{ brew.method }}</span>{% endif %}
        </div>
        <h3 class="brew-card-title"><a href="{{ brew.url | relative_url }}">{{ brew.title }}</a></h3>
        <div class="brew-card-specs">
          {% if brew.bean %}<span>🌱 {{ brew.bean | truncate: 28 }}</span>{% endif %}
          {% if brew.dose and brew.dose != "" and brew.water and brew.water != "" %}
            {% assign dose_f = brew.dose | plus: 0.0 %}
            {% assign r = brew.water | divided_by: dose_f | round: 1 %}
            <span>⚖ <b>1:{{ r }}</b></span>
          {% endif %}
          {% if brew.water_temp and brew.water_temp != "" %}<span>🌡 <b>{{ brew.water_temp }}°</b></span>{% endif %}
          {% if brew.rating and brew.rating != 0 and brew.rating != "" %}<span class="rating">{% for i in (1..5) %}<span class="{% if i <= brew.rating %}on{% endif %}">★</span>{% endfor %}</span>{% endif %}
        </div>
      </article>
    {% endfor %}
  </div>
</section>

<section class="section">
  <div class="section-head">
    <h2 class="section-title"><span class="ico">🌱</span> Beans on the shelf</h2>
    <a class="section-link" href="{{ '/beans/' | relative_url }}">All beans →</a>
  </div>
  <div class="card-grid">
    {% for bean in all_beans limit: 4 %}
      <article class="card">
        <h3 class="bean-card-title"><a href="{{ bean.url | relative_url }}">{{ bean.title }}</a></h3>
        <div class="chip-row">
          {% if bean.origin %}<span class="chip chip-origin">📍 {{ bean.origin }}</span>{% endif %}
          {% if bean.process %}<span class="chip chip-process">{{ bean.process }}</span>{% endif %}
        </div>
      </article>
    {% endfor %}
  </div>
</section>

<section class="section">
  <div class="section-head">
    <h2 class="section-title"><span class="ico">🔎</span> Search the journal</h2>
  </div>
  <div class="search-wrap">
    <label for="site-search-input" class="visually-hidden" style="position:absolute;left:-9999px">Search keywords</label>
    <input id="site-search-input" type="search" placeholder="Try “gesha”, “aeropress”, or “toffee”…" autocomplete="off">
    <p id="site-search-status" aria-live="polite">Search across brews, beans, methods, and tools.</p>
    <ul id="site-search-results" class="search-results"></ul>
  </div>

  <script>
    window.searchIndex = [
      {% assign sb = site.pages | where_exp: "p", "p.path contains 'brews/'" | where_exp: "p", "p.name != 'index.md'" %}
      {% assign sn = site.pages | where_exp: "p", "p.path contains 'beans/'" | where_exp: "p", "p.name != 'index.md'" %}
      {% assign sm = site.pages | where_exp: "p", "p.path contains 'methods/'" | where_exp: "p", "p.name != 'index.md'" %}
      {% assign st = site.pages | where_exp: "p", "p.path contains 'tools/'" | where_exp: "p", "p.name != 'index.md'" %}
      {% for p in sb %}{ title: {{ p.title | jsonify }}, url: {{ p.url | relative_url | jsonify }}, kind: "Brew", content: {{ p.content | strip_html | normalize_whitespace | strip_newlines | jsonify }} },{% endfor %}
      {% for p in sn %}{ title: {{ p.title | jsonify }}, url: {{ p.url | relative_url | jsonify }}, kind: "Bean", content: {{ p.content | strip_html | normalize_whitespace | strip_newlines | jsonify }} },{% endfor %}
      {% for p in sm %}{ title: {{ p.title | jsonify }}, url: {{ p.url | relative_url | jsonify }}, kind: "Method", content: {{ p.content | strip_html | normalize_whitespace | strip_newlines | jsonify }} },{% endfor %}
      {% for p in st %}{ title: {{ p.title | jsonify }}, url: {{ p.url | relative_url | jsonify }}, kind: "Tool", content: {{ p.content | strip_html | normalize_whitespace | strip_newlines | jsonify }} }{% unless forloop.last %},{% endunless %}{% endfor %}
    ];
  </script>
  <script src="{{ '/assets/search.js' | relative_url }}"></script>
</section>

<section class="section">
  <div class="section-head">
    <h2 class="section-title"><span class="ico">⚙</span> Brewing methods</h2>
    <a class="section-link" href="{{ '/methods/' | relative_url }}">All methods →</a>
  </div>
  <div class="card-grid">
    {% assign method_icons = "v60:🌀,aeropress:🛢,chemex:⏳,french:🪵,espresso:☕,cold:🧊,moka:🫖,b75:🟤" | split: "," %}
    {% for method in all_methods %}
      <a class="card method-card" href="{{ method.url | relative_url }}" style="text-decoration:none">
        <span class="method-ico">⚙️</span>
        <h3>{{ method.title | split: ' — ' | first | split: ' –' | first }}</h3>
        <p>Personal recipes &amp; dialed-in parameters.</p>
      </a>
    {% endfor %}
  </div>
</section>
