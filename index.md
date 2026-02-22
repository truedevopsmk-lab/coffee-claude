---
layout: default
title: Home
---

Welcome to my personal coffee brewing and tasting journal.  
This space documents my brews, beans, and experiments over time.

---

## ☕ Recent Brews

<ul>
{% assign brews = site.pages
  | where_exp: "p", "p.path contains 'brews/'"
  | where_exp: "p", "p.name != 'index.md'"
  | sort: "date"
  | reverse %}
{% for brew in brews limit:3 %}
  <li>
    {{ brew.date }} —
    <a href="{{ brew.url | relative_url }}">{{ brew.title }}</a>
  </li>
{% endfor %}
</ul>

<p>
  <a href="{{ '/brews/' | relative_url }}">View all brews →</a>
</p>

---

## 🌱 Beans

<ul>
{% assign beans = site.pages
  | where_exp: "p", "p.path contains 'beans/'"
  | where_exp: "p", "p.name != 'index.md'"
  | sort: "title" %}
{% for bean in beans limit:5 %}
  <li>
    <a href="{{ bean.url | relative_url }}">{{ bean.title }}</a>
  </li>
{% endfor %}
</ul>

<p>
  <a href="{{ '/beans/' | relative_url }}">View all beans →</a>
</p>

---

## 🔎 Search the Journal

<div class="home-search">
  <label for="site-search-input">Search keywords</label><br>
  <input id="site-search-input" type="search" placeholder="e.g. gesha, aeropress, sweetness" autocomplete="off" />
  <p id="site-search-status" aria-live="polite">Type to search brews, beans, methods, and tools.</p>
  <ul id="site-search-results" class="search-results"></ul>
</div>

<script>
  window.searchIndex = [
    {% assign search_brews = site.pages | where_exp: "p", "p.path contains 'brews/'" | where_exp: "p", "p.name != 'index.md'" %}
    {% assign search_beans = site.pages | where_exp: "p", "p.path contains 'beans/'" | where_exp: "p", "p.name != 'index.md'" %}
    {% assign search_methods = site.pages | where_exp: "p", "p.path contains 'methods/'" | where_exp: "p", "p.name != 'index.md'" %}
    {% assign search_tools = site.pages | where_exp: "p", "p.path contains 'tools/'" | where_exp: "p", "p.name != 'index.md'" %}
    {% assign searchable_pages = search_brews | concat: search_beans | concat: search_methods | concat: search_tools %}
    {% for p in searchable_pages %}
      {
        title: {{ p.title | jsonify }},
        url: {{ p.url | relative_url | jsonify }},
        content: {{ p.content | strip_html | normalize_whitespace | strip_newlines | jsonify }}
      }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];
</script>
<script src="{{ '/assets/search.js' | relative_url }}"></script>

---

## ⚙️ Brewing Methods

<ul>
{% assign methods = site.pages
  | where_exp: "p", "p.path contains 'methods/'"
  | where_exp: "p", "p.name != 'index.md'" %}
{% for method in methods %}
  <li>
    <a href="{{ method.url | relative_url }}">{{ method.title }}</a>
  </li>
{% endfor %}
</ul>
