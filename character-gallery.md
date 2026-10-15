---
title: "Character Gallery"
description: "The people of the present age: approved player characters, staff characters, and important figures of the world."
---

{% assign everyone = site.characters | sort: "title" %}
{% assign featured = site.characters | where: "featured", true | sort: "title" %}

{% if featured.size > 0 %}
## Featured this arc

Staff characters introduced or central to {{ site.current_arc }}.

{% include character-grid.html characters=featured %}
{% endif %}

## All characters

{% if everyone.size > 0 %}
{% include character-grid.html characters=everyone %}
{% else %}
<div class="empty-state">
  <img src="{{ '/assets/img/emblem.png' | relative_url }}" alt="" width="44" height="44">
  <p>No characters have been archived yet. Approved characters will appear here.</p>
</div>
{% endif %}

## Gallery standards

- Only approved characters or clearly marked NPCs are added.
- Entries use public knowledge, never hidden motives or staff spoilers.
- Player-created art is credited, and featured only with the artist’s permission.
- Major events and relationships link back to their lore pages.
