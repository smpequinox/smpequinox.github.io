---
title: "Timeline"
description: "A living record of eras, wars, discoveries, disasters, treaties, and the small moments that changed the world."
---

## The current age

| Arc | Status |
| --- | --- |
| **{{ site.current_arc }}** | Underway |

## Master timeline

Events appear here once the story has revealed them. Dates follow the in-world calendar.

{% include timeline-list.html %}

## Events

The moments that shaped the story, newest first.

{% assign story_events = site.data.events %}
{% if story_events and story_events.size > 0 %}
<div class="event-cards">
{%- for ev in story_events %}
<article class="event-card" id="event-{{ ev.title | slugify }}">
  {%- if ev.image %}
  <a class="event-card__cover" href="{{ ev.image | relative_url }}"><img src="{{ ev.image | relative_url }}" alt="Cover art for {{ ev.title }}" loading="lazy"></a>
  {%- endif %}
  <div class="event-card__body">
    <p class="event-card__when">{% if ev.arc %}{{ ev.arc }}{% endif %}{% if ev.arc and ev.date %} · {% endif %}{{ ev.date }}</p>
    <h3 class="event-card__title">{{ ev.title }}</h3>
    {%- if ev.description %}
    <div class="event-card__text">{{ ev.description | markdownify }}</div>
    {%- elsif ev.summary %}
    <p class="event-card__text">{{ ev.summary }}</p>
    {%- endif %}
  </div>
</article>
{%- endfor %}
</div>
{% else %}
<div class="empty-state">
  <img src="{{ '/assets/img/emblem.png' | relative_url }}" alt="" width="44" height="44">
  <p>No events have been recorded yet.</p>
</div>
{% endif %}

## Calendar

{% include calendar-now.html %}

Time in Equinox moves about three times faster than real life: a new month begins roughly every ten real days. The date above updates by itself.

### Seasons and eras

Each year has **two seasons**: one from {{ site.data.calendar[0].month }} to {{ site.data.calendar[5].month }}, and one from {{ site.data.calendar[6].month }} to {{ site.data.calendar[11].month }}. The four seasons take turns in this order, so each one returns every two years:

| Season | Also called |
| --- | --- |
{% for s in site.calendar.seasons %}| **{{ s.name }}** | {{ s.kind }} |
{% endfor %}

An **era** lasts {{ site.calendar.years_per_era }} years. Years are counted with the era's initials, e.g. {{ site.calendar.start_year }} {{ site.calendar.eras.last.abbr }}.

| Era | Years |
| --- | --- |
{% for e in site.calendar.eras %}{% assign last_year = e.start_year | plus: site.calendar.years_per_era | minus: 1 %}| **{{ e.name }}** ({{ e.abbr }}) | {{ e.start_year }}–{{ last_year }} |
{% endfor %}

### Months

<table class="calendar" data-calendar>
<thead><tr><th>#</th><th>Month</th><th>Real-world counterpart</th></tr></thead>
<tbody>
{%- for m in site.data.calendar %}
<tr data-month="{{ forloop.index }}"{% if forloop.index == site.calendar.start_month %} class="is-current"{% endif %}><td>{{ forloop.index }}</td><td class="calendar__name">{{ m.month }}</td><td>{{ m.real }}</td></tr>
{%- endfor %}
</tbody>
</table>

### Time conversion

| In Equinox | In real life |
| --- | --- |
| 1 month | about 10 days |
| 2 months | about 20 days |
| 3 months | 1 month |
| 4 months | 1 month and 10 days |
| 6 months (one season) | 2 months |
| 12 months (1 year) | 4 months |
| 3 years (one era) | 1 year |
