---
layout: default
title: "AeroPress Go Plus — Personal Recipes"
group: mine
icon: "🛢"
---

## ✍️ My notes

### Sweet & Balanced (Default)
- Ratio: 1:15
- Temp: 88–90°C
- Bloom: Yes (30s)
- Method: Inverted

### Clarity-Forward
- Ratio: 1:17
- Temp: 86–88°C
- Bloom: Optional
- Gentle agitation

{% include recipe-library.html method="aeropress" %}

## 🏆 World AeroPress Championship archive

Every podium recipe I could verify, 2009–2025 (no world final was held in 2020). These are the recipes **as competed**: many use 30–35 g of coffee, which is more than one C3S Pro load, and most are **inverted**, which AeroPress strongly discourages. ⤵ marks an inverted recipe. The upright ones are in the library above, scaled for the Go Plus.

<table class="wac">
  <thead><tr><th>Year</th><th>Place</th><th>Champion</th><th>Coffee</th><th>Water</th><th>Temp</th></tr></thead>
  <tbody>
    {%- for r in site.data.recipes.wac %}
    <tr><td>{{ r.year }}</td><td>{% case r.place %}{% when 1 %}🥇{% when 2 %}🥈{% else %}🥉{% endcase %}</td><td>{{ r.name }} <span style="color:var(--ink-faint)">· {{ r.country }}</span>{% if r.inverted %} ⤵{% endif %}</td><td>{{ r.dose }}</td><td>{{ r.water }}</td><td>{{ r.temp }}</td></tr>
    {%- endfor %}
  </tbody>
</table>

Full step-by-step recipes: [World AeroPress Championship recipes]({{ site.data.recipes.wac_source }}). Some official sources disagree on details, e.g. 2022's temperature (90 vs 92 °C) and 2018 3rd place's dose (15 vs 30 g). Both values are shown where that happens.
