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

The year has twelve months, each matching a real-world month.

<p class="calendar__now" data-calendar-now hidden></p>

<table class="calendar" data-calendar>
<thead><tr><th>#</th><th>Month</th><th>Real-world month</th></tr></thead>
<tbody>
{%- for m in site.data.calendar %}
<tr data-month="{{ forloop.index }}"><td>{{ forloop.index }}</td><td class="calendar__name">{{ m.month }}</td><td>{{ m.real }}</td></tr>
{%- endfor %}
</tbody>
</table>
