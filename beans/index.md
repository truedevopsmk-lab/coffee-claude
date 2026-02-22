---
layout: default
title: Beans
---

{% assign beans = site.pages
  | where_exp: "p", "p.path contains 'beans/'"
  | where_exp: "p", "p.name != 'index.md'"
  | sort: "title" %}

{% if beans.size == 0 %}
  <em>No beans logged yet.</em>
{% else %}
<ul>
{% for bean in beans %}
  {% if bean.title %}
    <li style="margin-bottom: 0.75rem;">
      <a href="{{ bean.url | relative_url }}">
        {{ bean.title }}
      </a><br>
      <small style="color:#666;">
        {{ bean.variety | default: "Variety N/A" }} ·
        {{ bean.process | default: "Process N/A" }} ·
        {{ bean.origin | default: "Origin N/A" }}
      </small>
    </li>
  {% endif %}
{% endfor %}
</ul>
{% endif %}
