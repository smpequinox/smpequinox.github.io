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

## Calendar

{% assign cal = site.calendar %}{% assign start_index = cal.start_month | minus: 1 %}{% assign start = site.data.calendar[start_index] %}{% assign season_index = cal.start_season | minus: 1 %}{% assign season = cal.seasons[season_index] %}{% assign era = cal.eras | last %}
<div class="calendar-now" data-calendar-now>
  <p class="calendar-now__label">The date in Equinox</p>
  <p class="calendar-now__date" data-calendar-date>{{ start.month }} {{ cal.start_year }} {{ era.abbr }}</p>
  <p class="calendar-now__detail" data-calendar-detail>{{ season.name }} ({{ season.kind }}) · the era of {{ era.name }}</p>
  <p class="calendar-now__next" data-calendar-next hidden></p>
</div>
<script type="application/json" data-calendar-config>{"calendar": {{ cal | jsonify }}, "months": {{ site.data.calendar | map: "month" | jsonify }}}</script>

Time in Equinox moves about three times faster than real life: a new month begins roughly every ten real days. The date above updates by itself.

### Seasons and eras

Each year has **two seasons**: one from {{ site.data.calendar[0].month }} to {{ site.data.calendar[5].month }}, and one from {{ site.data.calendar[6].month }} to {{ site.data.calendar[11].month }}. The four seasons take turns in this order, so each one returns every two years:

| Season | Also called |
| --- | --- |
{% for s in cal.seasons %}| **{{ s.name }}** | {{ s.kind }} |
{% endfor %}

An **era** lasts {{ cal.years_per_era }} years. Years are counted with the era's initials, e.g. {{ cal.start_year }} {{ era.abbr }}.

| Era | Years |
| --- | --- |
{% for e in cal.eras %}{% assign last_year = e.start_year | plus: cal.years_per_era | minus: 1 %}| **{{ e.name }}** ({{ e.abbr }}) | {{ e.start_year }}–{{ last_year }} |
{% endfor %}

### Months

<table class="calendar" data-calendar>
<thead><tr><th>#</th><th>Month</th><th>Real-world counterpart</th></tr></thead>
<tbody>
{%- for m in site.data.calendar %}
<tr data-month="{{ forloop.index }}"{% if forloop.index == cal.start_month %} class="is-current"{% endif %}><td>{{ forloop.index }}</td><td class="calendar__name">{{ m.month }}</td><td>{{ m.real }}</td></tr>
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
