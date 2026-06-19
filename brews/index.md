---
layout: default
title: The Logbook
show_title: false
plain: true
---

{% assign brews = site.pages | where_exp: "p", "p.path contains 'brews/'" | where_exp: "p", "p.name != 'index.md'" | sort: "date" | reverse %}

<div class="page-head">
  <p class="eyebrow">Brews</p>
  <h1>The Logbook</h1>
  <p>{{ brews | size }} brews logged, newest first — recipes, ratios, and tasting notes. Filter by method to narrow things down.</p>
</div>

{% assign brews_with_method = brews | where_exp: "b", "b.method" %}
{% assign methods = brews_with_method | map: "method" | uniq | sort %}
<div class="filter-bar" id="brew-filter">
  <button class="filter-btn active" data-filter="all" type="button">All</button>
  {% for m in methods %}{% if m and m != "" %}<button class="filter-btn" data-filter="{{ m | downcase }}" type="button">{{ m }}</button>{% endif %}{% endfor %}
</div>

{% if brews.size == 0 %}
  <div class="empty">No brews logged yet. <a href="{{ '/add-brew/' | relative_url }}">Log your first →</a></div>
{% else %}
<div class="card-grid" id="brew-grid">
  {% for brew in brews %}
    <article class="card brew-card" data-method="{% if brew.method %}{{ brew.method | downcase }}{% else %}other{% endif %}">
      <div class="brew-card-top">
        <span class="brew-card-date">{{ brew.date | date: "%d %b %Y" }}</span>
        {% if brew.method %}<span class="chip chip-method">{{ brew.method }}</span>{% endif %}
      </div>
      <h3 class="brew-card-title"><a href="{{ brew.url | relative_url }}">{{ brew.title }}</a></h3>
      <div class="brew-card-specs">
        {% if brew.bean %}<span>🌱 {{ brew.bean | truncate: 30 }}</span>{% endif %}
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
{% endif %}

<script>
  (function () {
    var bar = document.getElementById('brew-filter');
    var grid = document.getElementById('brew-grid');
    if (!bar || !grid) return;
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      bar.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      grid.querySelectorAll('.brew-card').forEach(function (card) {
        card.style.display = (f === 'all' || card.dataset.method === f) ? '' : 'none';
      });
    });
  })();
</script>
