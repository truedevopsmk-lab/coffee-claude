---
layout: default
title: Methods
show_title: false
plain: true
---

{% assign method_pages = site.pages | where_exp: "p", "p.path contains 'methods/'" | where_exp: "p", "p.name != 'index.md'" | sort: "title" %}
{% assign mine = method_pages | where_exp: "p", "p.group != 'someday'" %}
{% assign someday = method_pages | where: "group", "someday" %}

<div class="page-head">
  <p class="eyebrow">Methods</p>
  <h1>Brewing Methods</h1>
  <p>The gear I brew with — each with my notes and a library of sourced recipes, championship ones included. Pair these with the <a href="{{ '/tools/brew-calculator/' | relative_url }}">brew calculator</a> to scale any recipe to your dose.</p>
</div>

<section class="section" aria-labelledby="mine-h" style="margin-top:0">
  <div class="section-head"><h2 class="section-title" id="mine-h">My gear</h2><span class="section-link">{{ mine | size }}</span></div>
  <div class="card-grid methods-grid">
    {% for method in mine %}
      {% assign mid = method.url | split: '/' | last %}
      {% assign data = site.data.recipes.methods | where: "page", method.url | first %}
      <a class="card method-card" href="{{ method.url | relative_url }}" style="text-decoration:none">
        <span class="method-ico">{{ method.icon | default: "⚙️" }}</span>
        <h3>{{ method.title | split: ' — ' | first | split: ' –' | first }}</h3>
        <p>{% if data %}{{ data.recipes | size }} recipe{% if data.recipes.size != 1 %}s{% endif %} · {% endif %}my notes &amp; parameters.</p>
      </a>
    {% endfor %}
  </div>
</section>

{% if someday.size > 0 %}
<section class="section" aria-labelledby="someday-h">
  <div class="section-head"><h2 class="section-title" id="someday-h">🗓 Someday</h2><span class="section-link">{{ someday | size }}</span></div>
  <p style="color:var(--ink-soft);margin-top:0">Brewers I don't own yet. The recipes are here for when I do.</p>
  <div class="card-grid methods-grid">
    {% for method in someday %}
      {% assign data = site.data.recipes.methods | where: "page", method.url | first %}
      <a class="card method-card" href="{{ method.url | relative_url }}" style="text-decoration:none;opacity:.85">
        <span class="method-ico">{{ method.icon | default: "⚙️" }}</span>
        <h3>{{ method.title | split: ' — ' | first | split: ' –' | first }}</h3>
        <p>{% if data %}{{ data.recipes | size }} recipe{% if data.recipes.size != 1 %}s{% endif %}{% else %}Recipes{% endif %} for later.</p>
      </a>
    {% endfor %}
  </div>
</section>
{% endif %}
