---
title: "Character Gallery"
description: "The people of the present age: approved player characters, staff characters, and important figures of the world."
---

{% assign living = site.characters | where_exp: "c", "c.status != 'Dead'" | sort: "title" %}
{% assign featured = living | where: "featured", true %}
{% assign staff = living | where: "type", "Staff Character" %}
{% assign dead = site.characters | where: "status", "Dead" | sort: "title" %}

{% if featured.size > 0 %}
## Featured this arc

Staff characters introduced or central to {{ site.current_arc }}.

{% include character-grid.html characters=featured %}
{% endif %}

## Staff characters

Characters played by staff to drive the story.

{% if staff.size > 0 %}
{% include character-grid.html characters=staff %}
{% else %}
<div class="empty-state">
  <img src="{{ '/assets/img/emblem.png' | relative_url }}" alt="" width="44" height="44">
  <p>No staff characters have been archived yet.</p>
</div>
{% endif %}

## All characters

Every living character, staff and players alike.

{% if living.size > 0 %}
{% include character-grid.html characters=living %}
{% else %}
<div class="empty-state">
  <img src="{{ '/assets/img/emblem.png' | relative_url }}" alt="" width="44" height="44">
  <p>No characters have been archived yet. Approved characters will appear here.</p>
</div>
{% endif %}

## Dead characters

Those who have fallen in the story. Their pages remain as a record.

{% if dead.size > 0 %}
{% include character-grid.html characters=dead %}
{% else %}
<div class="empty-state">
  <img src="{{ '/assets/img/emblem.png' | relative_url }}" alt="" width="44" height="44">
  <p>No characters have fallen yet.</p>
</div>
{% endif %}

## Gallery standards

- Only approved characters or clearly marked NPCs are added.
- Entries use public knowledge, never hidden motives or staff spoilers.
- Player-created art is credited, and featured only with the artist’s permission.
- Major events and relationships link back to their lore pages.
