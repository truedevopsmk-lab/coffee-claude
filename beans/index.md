---
layout: default
title: Beans
show_title: false
plain: true
---

{% assign beans = site.pages | where_exp: "p", "p.path contains 'beans/'" | where_exp: "p", "p.name != 'index.md'" | sort: "title" %}

<div class="page-head">
  <p class="eyebrow">Beans</p>
  <h1>The Shelf</h1>
  <p>{{ beans | size }} single origins and lots profiled — origin, variety, process, and roaster notes for every bag worth remembering.</p>
</div>

{% assign beans_with_process = beans | where_exp: "b", "b.process" %}
{% assign processes = beans_with_process | map: "process" | uniq | sort %}
<div class="filter-bar" id="bean-filter">
  <button class="filter-btn active" data-filter="all" type="button">All</button>
  {% for p in processes %}{% if p and p != "" and p != "Not specified" %}<button class="filter-btn" data-filter="{{ p | downcase | replace: ' ', '-' }}" type="button">{{ p }}</button>{% endif %}{% endfor %}
</div>

{% if beans.size == 0 %}
  <div class="empty"><em>No beans logged yet.</em></div>
{% else %}
<div class="card-grid" id="bean-grid">
  {% for bean in beans %}
    {% if bean.title %}
    <article class="card" data-process="{% if bean.process %}{{ bean.process | downcase | replace: ' ', '-' }}{% else %}other{% endif %}">
      <h3 class="bean-card-title"><a href="{{ bean.url | relative_url }}">{{ bean.title }}</a></h3>
      <div class="chip-row">
        {% if bean.origin %}<span class="chip chip-origin">📍 {{ bean.origin }}</span>{% endif %}
        {% if bean.process and bean.process != "Not specified" %}<span class="chip chip-process">{{ bean.process }}</span>{% endif %}
        {% if bean.variety and bean.variety != "Not specified" %}<span class="chip">{{ bean.variety }}</span>{% endif %}
      </div>
    </article>
    {% endif %}
  {% endfor %}
</div>
{% endif %}

<script>
  (function () {
    var bar = document.getElementById('bean-filter');
    var grid = document.getElementById('bean-grid');
    if (!bar || !grid) return;
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      bar.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      grid.querySelectorAll('[data-process]').forEach(function (card) {
        card.style.display = (f === 'all' || card.dataset.process === f) ? '' : 'none';
      });
    });
  })();
</script>
