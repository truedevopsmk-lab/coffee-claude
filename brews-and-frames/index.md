---
layout: default
title: "Brews & Frames"
permalink: /brews-and-frames/
---

A visual archive of my coffee rituals, brewers, beans, and moments.

{% assign gallery_files = site.static_files | where_exp: "f", "f.path contains '/assets/gallery/'" | sort: "path" %}

{% capture detected_folders %}{% for file in gallery_files %}{% assign folder_name = file.path | remove: '/assets/gallery/' | split: '/' | first | strip %}{{ folder_name }}|{% endfor %}{% endcapture %}
{% assign detected_folder_list = detected_folders | split: '|' | uniq %}

{% for section in site.data.gallery.sections %}
<section class="gallery-section" aria-labelledby="gallery-{{ section.key }}">
  <h2 id="gallery-{{ section.key }}">{{ section.title }}</h2>
  {% assign section_files = gallery_files | where_exp: "f", "f.path contains section.folder" %}

  {% if section_files.size > 0 %}
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
          <figcaption>{{ caption }}</figcaption>
        </figure>
      {% endfor %}
    </div>
  {% else %}
    <p class="gallery-empty">No photos yet in this category.</p>
  {% endif %}
</section>
{% endfor %}

{% for detected_folder in detected_folder_list %}
  {% assign folder = detected_folder | strip %}
  {% if folder != "" %}
    {% assign is_configured = false %}
    {% for section in site.data.gallery.sections %}
      {% capture folder_token %}/{{ folder }}/{% endcapture %}
      {% if section.folder contains folder_token %}
        {% assign is_configured = true %}
      {% endif %}
    {% endfor %}

    {% unless is_configured %}
      {% capture auto_folder_path %}/assets/gallery/{{ folder }}/{% endcapture %}
      {% assign auto_files = gallery_files | where_exp: "f", "f.path contains auto_folder_path" %}
      {% if auto_files.size > 0 %}
<section class="gallery-section" aria-labelledby="gallery-{{ folder }}">
  <h2 id="gallery-{{ folder }}">📸 {{ folder | replace: '-', ' ' | replace: '_', ' ' | capitalize }}</h2>
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
        <figcaption>{{ caption }}</figcaption>
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
    <img id="gallery-lightbox-image" src="" alt="" loading="eager">
    <p id="gallery-lightbox-caption"></p>
  </div>
</div>

<script src="{{ '/assets/js/gallery.js' | relative_url }}"></script>
