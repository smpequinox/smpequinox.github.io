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

{% assign directions = "North,Northeast,East,Southeast,South,Southwest,West,Northwest" | split: "," %}
{% for d in directions %}
### {{ d }}

{% capture empty_msg %}No {{ d | downcase }}ern locations have been recorded yet.{% endcapture %}
{% include entry-list.html category="locations" direction=d message=empty_msg %}
{% endfor %}
