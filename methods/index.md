---
layout: default
title: Methods
show_title: false
plain: true
---

{% assign method_pages = site.pages | where_exp: "p", "p.path contains 'methods/'" | where_exp: "p", "p.name != 'index.md'" | sort: "title" %}

<div class="page-head">
  <p class="eyebrow">Methods</p>
  <h1>Brewing Methods</h1>
  <p>The gear and recipes I reach for — each with my dialed-in parameters. Pair these with the <a href="{{ '/tools/brew-calculator/' | relative_url }}">brew calculator</a> to scale a dose.</p>
</div>

<div class="card-grid">
  {% for method in method_pages %}
    <a class="card method-card" href="{{ method.url | relative_url }}" style="text-decoration:none">
      <span class="method-ico">⚙️</span>
      <h3>{{ method.title | split: ' — ' | first | split: ' –' | first }}</h3>
      <p>Personal recipes &amp; parameters.</p>
    </a>
  {% endfor %}
</div>
