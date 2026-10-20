---
title: "Living Legends"
description: "Characters the community has voted into legend: heroes, villains and figures who have proved themselves worthy of being remembered."
---

{% assign legends = site.characters | where: "legend", true | sort: "title" %}

A place in the Living Legends is earned, not given. Characters are put forward and voted on by the community, and only those who have proved themselves worthy through their deeds in the story are added here.

{% if legends.size > 0 %}
<ul class="char-grid legend-grid">
{%- for c in legends %}
<li><a class="char-card char-card--legend" href="{{ c.url | relative_url }}">
<span class="char-card__art{% unless c.image %} char-card__art--blank{% endunless %}">{% if c.image %}<img src="{{ c.image | relative_url }}" alt="" loading="lazy">{% else %}<img src="{{ '/assets/img/emblem.png' | relative_url }}" alt="">{% endif %}</span>
<span class="char-card__name">{{ c.title }}</span>
{%- if c.legend_for %}<span class="char-card__aff">{{ c.legend_for }}</span>{% endif %}
{%- if c.legend_since %}<span class="char-card__meta">Honoured {{ c.legend_since }}</span>{% endif %}
</a></li>
{%- endfor %}
</ul>
{% else %}
<div class="empty-state">
  <img src="{{ '/assets/img/emblem.png' | relative_url }}" alt="" width="44" height="44">
  <p>No legends have been named yet. Their deeds are still being written.</p>
</div>
{% endif %}

## Becoming a Living Legend

- Characters are nominated and voted on by the community.
- Staff confirm the result and add the character here.
- A legend's page carries the honour for good, even after their story ends.
