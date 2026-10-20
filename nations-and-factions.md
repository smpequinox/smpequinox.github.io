---
title: "Nations & Factions"
description: "Kingdoms, republics, clans, guilds, rebel movements, noble houses, and every group with a stake in the world."
---

## Nations

{% include entry-list.html category="nations" message="No nations have been recorded yet. Entries appear here as the story reveals them." %}

## Factions

{% include entry-list.html category="factions" message="No factions have been recorded yet. Entries appear here as the story reveals them." %}

## Noble houses

### Ruling houses

{% include entry-list.html category="houses" standing="Ruling" message="No ruling houses have been recorded yet." %}

### Fallen houses

{% include entry-list.html category="houses" standing="Fallen" message="No fallen houses have been recorded yet." %}

{% assign unsorted_houses = site.lore | where: "category", "houses" | where_exp: "h", "h.standing == nil" %}
{% if unsorted_houses.size > 0 %}
### Other houses

Houses whose standing hasn't been recorded yet.

{% include entry-list.html category="houses" standing="none" %}
{% endif %}

## Joining a faction

Characters can join a faction through roleplay. If your character wants to found or lead a group, ask staff first, since new factions shape the world for everyone.
