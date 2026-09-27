---
layout: default
title: "Brews & Frames"
permalink: /brews-and-frames/
show_title: false
plain: true
---

{% assign gallery_files = site.static_files | where_exp: "f", "f.path contains '/assets/gallery/'" | sort: "path" %}
{% assign thumb_paths = site.static_files | where_exp: "f", "f.path contains '/assets/gallery-thumbs/'" | map: "path" %}

{%- comment -%} Folders on disk that aren't configured as a section are auto-appended at the bottom. {%- endcomment -%}
{% capture detected_folders %}{% for file in gallery_files %}{% assign folder_name = file.path | remove: '/assets/gallery/' | split: '/' | first | strip %}{{ folder_name }}|{% endfor %}{% endcapture %}
{% assign detected_folder_list = detected_folders | split: '|' | uniq %}
{% capture extra_folders %}{% for detected_folder in detected_folder_list %}{% assign folder = detected_folder | strip %}{% if folder != "" %}{% assign is_configured = false %}{% capture folder_token %}/{{ folder }}/{% endcapture %}{% for section in site.data.gallery.sections %}{% if section.folder contains folder_token %}{% assign is_configured = true %}{% endif %}{% endfor %}{% unless is_configured %}{{ folder }}|{% endunless %}{% endif %}{% endfor %}{% endcapture %}
{% assign extra_folder_list = extra_folders | split: '|' %}

<div class="page-head">
  <p class="eyebrow">Brews &amp; Frames</p>
  <h1>The Frames</h1>
  <p>A visual archive of my coffee rituals — brewers, beans, crema, and experiments. {{ gallery_files | size }} frames and counting.</p>
  <div class="hero-actions" style="margin-top:1rem">
    <a class="btn btn-primary" href="{{ '/upload-photo/' | relative_url }}">📷 Add photos</a>
  </div>
</div>

{%- comment -%} In-page section navigation: configured sections that have files, then auto-detected folders. {%- endcomment -%}
<nav class="gallery-nav" aria-label="Gallery sections">
  {% for section in site.data.gallery.sections %}
    {% assign section_files = gallery_files | where_exp: "f", "f.path contains section.folder" %}
    {% if section_files.size > 0 %}
      <a class="filter-btn" href="#gallery-{{ section.key }}">{{ section.title }} <span style="opacity:.6">{{ section_files.size }}</span></a>
    {% endif %}
  {% endfor %}
  {% for folder in extra_folder_list %}
    {% capture auto_folder_path %}/assets/gallery/{{ folder }}/{% endcapture %}
    {% assign auto_files = gallery_files | where_exp: "f", "f.path contains auto_folder_path" %}
    {% if auto_files.size > 0 %}
      <a class="filter-btn" href="#gallery-{{ folder }}">📸 {{ folder | replace: '-', ' ' | replace: '_', ' ' | capitalize }} <span style="opacity:.6">{{ auto_files.size }}</span></a>
    {% endif %}
  {% endfor %}
</nav>

{% for section in site.data.gallery.sections %}
{% assign section_files = gallery_files | where_exp: "f", "f.path contains section.folder" %}
{% if section_files.size > 0 %}
<section class="gallery-section" id="gallery-{{ section.key }}" aria-labelledby="gallery-{{ section.key }}-h">
  <div class="section-head">
    <h2 class="section-title" id="gallery-{{ section.key }}-h">{{ section.title }}</h2>
    <span class="section-link">{{ section_files.size }} frame{% if section_files.size != 1 %}s{% endif %}</span>
  </div>
  <div class="gallery-grid">
    {% for file in section_files %}{% include gallery-card.html file=file thumbs=thumb_paths %}{% endfor %}
  </div>
</section>
{% endif %}
{% endfor %}

{% for folder in extra_folder_list %}
{% capture auto_folder_path %}/assets/gallery/{{ folder }}/{% endcapture %}
{% assign auto_files = gallery_files | where_exp: "f", "f.path contains auto_folder_path" %}
{% if auto_files.size > 0 %}
<section class="gallery-section" id="gallery-{{ folder }}">
  <div class="section-head">
    <h2 class="section-title">📸 {{ folder | replace: '-', ' ' | replace: '_', ' ' | capitalize }}</h2>
    <span class="section-link">{{ auto_files.size }} frame{% if auto_files.size != 1 %}s{% endif %}</span>
  </div>
  <div class="gallery-grid">
    {% for file in auto_files %}{% include gallery-card.html file=file thumbs=thumb_paths %}{% endfor %}
  </div>
</section>
{% endif %}
{% endfor %}

<div id="gallery-lightbox" class="gallery-lightbox" hidden>
  <div class="gallery-lightbox-backdrop" data-gallery-close></div>
  <div class="gallery-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Image preview" tabindex="-1">
    <button type="button" class="gallery-lightbox-close" data-gallery-close aria-label="Close image preview">×</button>
    <button type="button" class="gallery-nav-arrow prev" data-gallery-prev aria-label="Previous image">‹</button>
    <button type="button" class="gallery-nav-arrow next" data-gallery-next aria-label="Next image">›</button>
    <img id="gallery-lightbox-image" src="" alt="" loading="eager">
    <div class="gallery-lightbox-meta">
      <p id="gallery-lightbox-caption"></p>
      <p class="gallery-lightbox-count" id="gallery-lightbox-count" aria-live="polite"></p>
    </div>
  </div>
</div>

<script src="{{ '/assets/js/gallery.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
