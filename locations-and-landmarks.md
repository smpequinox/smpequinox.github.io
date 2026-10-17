---
title: "Locations & Landmarks"
description: "Settlements, ruins, dungeons, natural wonders, roads, borders, and the places where stories happen."
# The world map image. Upload it to assets/img/ with this exact name.
map_image: "/assets/img/world-map.webp"
---

## World map

{% include world-map.html image=page.map_image %}

## Atlas

{% include entry-list.html category="locations" message="This chapter is still being written. Entries appear here as the story reveals them." %}

## By region

### North

{% include entry-list.html category="locations" direction="North" message="No northern locations have been recorded yet." %}

### South

{% include entry-list.html category="locations" direction="South" message="No southern locations have been recorded yet." %}

### East

{% include entry-list.html category="locations" direction="East" message="No eastern locations have been recorded yet." %}

### West

{% include entry-list.html category="locations" direction="West" message="No western locations have been recorded yet." %}
