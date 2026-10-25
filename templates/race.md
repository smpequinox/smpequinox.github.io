---
# COPY THIS FILE into the _lore folder and rename it, e.g. _lore/sea-elf.md
# Use this template for the races native to the world (the Native Races page).
# Upload pictures to assets/img/races/ first, or delete the image lines; a
# blank picture shows the wiki emblem.
# The page lists every character whose race mentions this race's name (or an
# alias) by itself, so there is no need to list them here.
title: "Race Name"
category: races
aliases: []                     # other spellings, e.g. ["Ashlandian"]
image: "/assets/img/races/race-name.png"
summary: "One line a new player should understand."
status: Public                  # Public / Revealed / Draft
# Variants and their lineages: drawn as a tree on the page, with a tab for each
# variant. Every field but name can be left out; blank info shows
# "Nothing has been recorded yet".
variants:
  - name: "Variant Name"
    image: "/assets/img/races/variant-name.png"
    info: "What is known about this variant. Can be several lines."
    lineages:
      - name: "Lineage Name"
        image: "/assets/img/races/lineage-name.png"
        info: "What is known about this lineage."
---

Write what is publicly known about this race here. Use ## for section headings.
