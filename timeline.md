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

{% assign cal = site.calendar %}{% assign start_index = cal.start_month | minus: 1 %}{% assign start = site.data.calendar[start_index] %}
<div class="calendar-now" data-calendar-now data-start="{{ cal.start_date }}" data-month="{{ cal.start_month }}" data-year="{{ cal.start_year }}" data-days="{{ cal.days_per_month }}" data-era="{{ cal.era }}">
  <p class="calendar-now__label">The date in Equinox</p>
  <p class="calendar-now__date" data-calendar-date>{{ start.month }} {{ cal.start_year }} {{ cal.era }}</p>
  <p class="calendar-now__detail" data-calendar-detail>{{ start.season }}</p>
</div>

Time in Equinox moves about three times faster than real life: a new month begins roughly every ten real days. The date above updates by itself.

### Months

Each year has twelve months and two seasons.

<table class="calendar" data-calendar>
<thead><tr><th>#</th><th>Month</th><th>Season</th><th>Real-world counterpart</th></tr></thead>
<tbody>
{%- for m in site.data.calendar %}
<tr data-month="{{ forloop.index }}" data-name="{{ m.month }}" data-season="{{ m.season }}"{% if forloop.index == cal.start_month %} class="is-current"{% endif %}><td>{{ forloop.index }}</td><td class="calendar__name">{{ m.month }}</td><td>{{ m.season }}</td><td>{{ m.real }}</td></tr>
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
| 3 years | 1 year |
