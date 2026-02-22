---
layout: default
title: Methods
---

## Brewing Methods

{% assign method_pages = site.pages
  | where_exp: "p", "p.path contains 'methods/'"
  | where_exp: "p", "p.name != 'index.md'"
  | sort: "title" %}

<ul>
{% for method in method_pages %}
  <li><a href="{{ method.url | relative_url }}">{{ method.title | split: ' — ' | first }}</a></li>
{% endfor %}
</ul>
