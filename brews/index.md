---
layout: default
title: Brews
---

<ul>
{% assign brews = site.pages | where_exp: "p", "p.path contains 'brews/'" | where_exp: "p", "p.name != 'index.md'" | sort: "date" | reverse %}
{% for brew in brews %}
  <li>{{ brew.date }} — <a href="{{ brew.url | relative_url }}">{{ brew.title }}</a></li>
{% endfor %}
</ul>
