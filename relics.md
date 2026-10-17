---
title: "Relics"
description: "Artifacts of power, from uncommon curiosities to world-class treasures: where they came from and who wields them now."
---

Relics are ranked by rarity, from **Uncommon** up to **World Class**. Legendary, Mythic and World Class relics are tracked by who currently wields them.

{% assign tiers = site.data.relic_tiers | reverse %}
{% for tier in tiers %}
## {{ tier.name }}

{% include relic-list.html tier=tier %}
{% endfor %}
