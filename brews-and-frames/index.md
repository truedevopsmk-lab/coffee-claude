---
layout: default
title: "Brews & Frames"
permalink: /brews-and-frames/
show_title: false
plain: true
---

{% assign gallery_files = site.static_files | where_exp: "f", "f.path contains '/assets/gallery/'" | sort: "path" %}

<div class="page-head">
  <p class="eyebrow">Brews &amp; Frames</p>
  <h1>The Frames</h1>
  <p>A visual archive of my coffee rituals — brewers, beans, crema, and experiments. {{ gallery_files | size }} frames and counting.</p>
  <div class="hero-actions" style="margin-top:1rem">
    <a class="btn btn-primary" href="{{ '/upload-photo/' | relative_url }}">📷 Add photos</a>
  </div>
</div>

{%- comment -%} Build the in-page section navigation from configured sections that actually have files. {%- endcomment -%}
<nav class="gallery-nav" aria-label="Gallery sections">
  {% for section in site.data.gallery.sections %}
    {% assign section_files = gallery_files | where_exp: "f", "f.path contains section.folder" %}
    {% if section_files.size > 0 %}
      <a class="filter-btn" href="#gallery-{{ section.key }}">{{ section.title }} <span style="opacity:.6">{{ section_files.size }}</span></a>
    {% endif %}
  {% endfor %}
</nav>

{% capture detected_folders %}{% for file in gallery_files %}{% assign folder_name = file.path | remove: '/assets/gallery/' | split: '/' | first | strip %}{{ folder_name }}|{% endfor %}{% endcapture %}
{% assign detected_folder_list = detected_folders | split: '|' | uniq %}

{% for section in site.data.gallery.sections %}
{% assign section_files = gallery_files | where_exp: "f", "f.path contains section.folder" %}
{% if section_files.size > 0 %}
<section class="gallery-section" id="gallery-{{ section.key }}" aria-labelledby="gallery-{{ section.key }}-h">
  <div class="section-head">
    <h2 class="section-title" id="gallery-{{ section.key }}-h">{{ section.title }}</h2>
    <span class="section-link">{{ section_files.size }} frame{% if section_files.size != 1 %}s{% endif %}</span>
  </div>
  <div class="gallery-grid">
    {% for file in section_files %}
      {% assign caption = site.data.gallery.captions[file.path] | default: "" %}
      <figure class="gallery-card">
        <button
          class="gallery-trigger"
          type="button"
          data-gallery-image="{{ file.path | relative_url }}"
          data-gallery-caption="{{ caption | escape }}"
          aria-label="Open image{% if caption != '' %}: {{ caption }}{% endif %}">
          <img src="{{ file.path | relative_url }}" alt="{{ caption }}" loading="lazy">
        </button>
        {% if caption != "" %}<figcaption>{{ caption }}</figcaption>{% endif %}
      </figure>
    {% endfor %}
  </div>
</section>
{% endif %}
{% endfor %}

{%- comment -%} Auto-render any folder not covered by a configured section. {%- endcomment -%}
{% for detected_folder in detected_folder_list %}
  {% assign folder = detected_folder | strip %}
  {% if folder != "" %}
    {% assign is_configured = false %}
    {% for section in site.data.gallery.sections %}
      {% capture folder_token %}/{{ folder }}/{% endcapture %}
      {% if section.folder contains folder_token %}{% assign is_configured = true %}{% endif %}
    {% endfor %}
    {% unless is_configured %}
      {% capture auto_folder_path %}/assets/gallery/{{ folder }}/{% endcapture %}
      {% assign auto_files = gallery_files | where_exp: "f", "f.path contains auto_folder_path" %}
      {% if auto_files.size > 0 %}
<section class="gallery-section" id="gallery-{{ folder }}">
  <div class="section-head">
    <h2 class="section-title">📸 {{ folder | replace: '-', ' ' | replace: '_', ' ' | capitalize }}</h2>
    <span class="section-link">{{ auto_files.size }} frame{% if auto_files.size != 1 %}s{% endif %}</span>
  </div>
  <div class="gallery-grid">
    {% for file in auto_files %}
      {% assign caption = site.data.gallery.captions[file.path] | default: "" %}
      <figure class="gallery-card">
        <button
          class="gallery-trigger"
          type="button"
          data-gallery-image="{{ file.path | relative_url }}"
          data-gallery-caption="{{ caption | escape }}"
          aria-label="Open image{% if caption != '' %}: {{ caption }}{% endif %}">
          <img src="{{ file.path | relative_url }}" alt="{{ caption }}" loading="lazy">
        </button>
        {% if caption != "" %}<figcaption>{{ caption }}</figcaption>{% endif %}
      </figure>
    {% endfor %}
  </div>
</section>
      {% endif %}
    {% endunless %}
  {% endif %}
{% endfor %}

<div id="gallery-lightbox" class="gallery-lightbox" hidden>
  <div class="gallery-lightbox-backdrop" data-gallery-close></div>
  <div class="gallery-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Image preview" tabindex="-1">
    <button type="button" class="gallery-lightbox-close" data-gallery-close aria-label="Close image preview">×</button>
    <button type="button" class="gallery-nav-arrow prev" data-gallery-prev aria-label="Previous image">‹</button>
    <button type="button" class="gallery-nav-arrow next" data-gallery-next aria-label="Next image">›</button>
    <img id="gallery-lightbox-image" src="" alt="" loading="eager">
    <p id="gallery-lightbox-caption"></p>
  </div>
</div>

<script src="{{ '/assets/js/gallery.js' | relative_url }}"></script>
