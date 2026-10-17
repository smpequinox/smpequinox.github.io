---
title: "Relics"
description: "Artifacts of power, from uncommon curiosities to world-class treasures: where they came from and who wields them now."
---

Relics are ranked by rarity, from **Awakened Class** up to **Cataclysm Class**. Paragon, Primordial and Cataclysm Class relics are tracked by who currently wields them.

{% assign tiers = site.data.relic_tiers | reverse %}
{% for tier in tiers %}
## {{ tier.name }}

{% include relic-list.html tier=tier %}
{% endfor %}
