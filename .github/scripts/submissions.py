#!/usr/bin/env python3
"""Player submissions for the Equinox SMP wiki.

One list (TYPES below) describes every kind of submission. It is used two ways:

  python3 .github/scripts/submissions.py forms
      Rewrites the GitHub issue forms in .github/ISSUE_TEMPLATE/ from TYPES.
      Run this after changing TYPES, then commit the result.

  python3 .github/scripts/submissions.py build <issue.json>
      Turns an approved submission issue into a wiki file. Used by the
      "Approved submission" workflow. Prints the path of the file it wrote.
"""
import json
import os
import re
import sys
import urllib.request

# Field kinds:
#   title   - the entry's name (page title)
#   front   - a top-level setting, e.g. kind: Monster
#   fact    - a row in the info box
#   summary - the one-line summary
#   body    - the page text
#   image   - a picture the player attaches; downloaded into assets/img/<folder>/
#   bonds   - character bonds, one per line: Name | Relation | Type
#   ranks   - a hierarchy, one rank per line, highest first: Rank: holder, holder
# Inputs: "input" (one line), "textarea" (several lines), or a list of choices (dropdown).

LORE_STATUS = {"status": "Public"}

TYPES = [
    {"id": "character", "name": "Character", "order": 1,
     "about": "Add your approved character to the Character Gallery.",
     "folder": "_characters", "image_folder": "characters", "fixed": {},
     "fields": [
        ("Character name", "title", "title", "input", True, "e.g. Aster Vale"),
        ("Character type", "front", "type", ["Player Character", "Staff Character", "Important NPC"], True, ""),
        ("Status", "front", "status", ["Alive", "Dead", "Retired", "Unknown"], True, ""),
        ("Known for", "front", "known_for", "input", False, "Their public reputation in one sentence"),
        ("Affiliations", "front", "affiliation", "input", False, "Nations, factions, faiths or jobs, separated by commas"),
        ("Race or ancestry", "front", "race", "input", False, ""),
        ("Current whereabouts", "front", "whereabouts", "input", False, "Where they can usually be found"),
        ("Played by", "front", "player", "input", True, "Your Minecraft or Discord name"),
        ("Character art", "image", "image", "textarea", False, "Drag and drop a picture here (PNG or JPG)"),
        ("Art by", "front", "art_credit", "input", False, "Who drew the art. Only submit art you have permission to use."),
        ("Bonds", "bonds", "bonds", "textarea", False, "One per line: Name | Relation | Type\nType is Family, Ally, Rival, Romance or Other.\nExample: Bram Vale | Older brother | Family"),
        ("Background", "body", "body", "textarea", False, "Their public background. Public knowledge only, never secrets."),
     ]},
    {"id": "theory", "name": "Theory", "order": 2,
     "about": "Share a theory about the world's mysteries for the Theory Gallery.",
     "folder": "_lore", "fixed": {"category": "theories", "verdict": "Unconfirmed"},
     "fields": [
        ("Theory title", "title", "title", "input", True, "e.g. The Tide is The Cycle in disguise"),
        ("Your name", "front", "theorist", "input", True, "Your Minecraft or Discord name, for credit"),
        ("The theory in one line", "summary", "summary", "input", True, ""),
        ("What it is about", "fact", "About", "input", False, "Gods, places or people it involves, separated by commas"),
        ("Main evidence", "fact", "Evidence", "input", False, "The key clues, in a few words"),
        ("Full theory", "body", "body", "textarea", True, "Explain your theory and the evidence for it"),
     ]},
    {"id": "location", "name": "Location", "order": 3,
     "about": "A city, ruin, dungeon, landmark or other place.",
     "folder": "_lore", "fixed": dict(category="locations", **LORE_STATUS),
     "fields": [
        ("Location name", "title", "title", "input", True, ""),
        ("Kind of place", "front", "place_type", ["Capital", "City", "Town", "Village", "Fort", "Port", "Landmark", "Ruin", "Other"], False, ""),
        ("Region", "front", "direction", ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest", "Central", "Not sure"], False, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Type of place", "fact", "Type", "input", False, "A short description, e.g. walled port city, mountain fortress"),
        ("Controlled by", "fact", "Controlled by", "input", False, "Nation, faction or house. Naming a nation lists this place in its chart."),
        ("Known for", "fact", "Known for", "input", False, ""),
        ("Description", "body", "body", "textarea", False, "History, points of interest, anything public"),
     ]},
    {"id": "nation", "name": "Nation", "order": 4,
     "about": "A kingdom, republic or other nation.",
     "folder": "_lore", "fixed": dict(category="nations", **LORE_STATUS),
     "fields": [
        ("Nation name", "title", "title", "input", True, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Ruler", "fact", "Ruler", "input", False, ""),
        ("Government", "fact", "Government", "input", False, "Monarchy, republic, theocracy..."),
        ("Capital", "fact", "Capital", "input", False, ""),
        ("Ruling house", "fact", "Ruling house", "input", False, ""),
        ("Faith", "fact", "Faith", "input", False, ""),
        ("Allies", "fact", "Allies", "input", False, "Separated by commas"),
        ("Rivals", "fact", "Rivals", "input", False, "Separated by commas"),
        ("Ranks", "ranks", "ranks", "textarea", False, "The hierarchy, one rank per line, highest first: Rank: holder, holder\nLeave the holders empty if a rank is vacant.\nExample:\nKing: Aldric Vale\nPrince: Swobble\nKnights: Name, Name"),
        ("Description", "body", "body", "textarea", False, "History, culture, anything public"),
     ]},
    {"id": "faction", "name": "Faction", "order": 5,
     "about": "A guild, clan, order, rebel movement or other group.",
     "folder": "_lore", "fixed": dict(category="factions", **LORE_STATUS),
     "fields": [
        ("Faction name", "title", "title", "input", True, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Type of group", "fact", "Type", "input", False, "Guild, clan, rebel movement..."),
        ("Leader", "fact", "Leader", "input", False, ""),
        ("Based in", "fact", "Based in", "input", False, ""),
        ("Allegiance", "fact", "Allegiance", "input", False, "The nation it serves, or Independent"),
        ("Goals", "fact", "Goals", "input", False, "What it wants, publicly"),
        ("Allies", "fact", "Allies", "input", False, "Separated by commas"),
        ("Rivals", "fact", "Rivals", "input", False, "Separated by commas"),
        ("Ranks", "ranks", "ranks", "textarea", False, "The hierarchy, one rank per line, highest first: Rank: holder, holder\nLeave the holders empty if a rank is vacant.\nExample:\nKing: Aldric Vale\nPrince: Swobble\nKnights: Name, Name"),
        ("Description", "body", "body", "textarea", False, "History, how to join, anything public"),
     ]},
    {"id": "house", "name": "Noble house", "order": 6,
     "about": "A ruling or fallen noble house.",
     "folder": "_lore", "fixed": dict(category="houses", **LORE_STATUS),
     "fields": [
        ("House name", "title", "title", "input", True, "e.g. House Vale"),
        ("Standing", "front", "standing", ["Ruling", "Fallen"], True, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Head of house", "fact", "Head of house", "input", False, "Current head, or last head if fallen"),
        ("Seat", "fact", "Seat", "input", False, "Where the house is based"),
        ("Sworn to", "fact", "Sworn to", "input", False, "The nation it serves"),
        ("Words", "fact", "Words", "input", False, "The house motto"),
        ("Faith", "fact", "Faith", "input", False, ""),
        ("Allies", "fact", "Allies", "input", False, "Separated by commas"),
        ("Rivals", "fact", "Rivals", "input", False, "Separated by commas"),
        ("Ranks", "ranks", "ranks", "textarea", False, "The hierarchy, one rank per line, highest first: Rank: holder, holder\nLeave the holders empty if a rank is vacant.\nExample:\nKing: Aldric Vale\nPrince: Swobble\nKnights: Name, Name"),
        ("Description", "body", "body", "textarea", False, "History, notable members, anything public"),
     ]},
    {"id": "religion", "name": "Religion or order", "order": 7,
     "about": "A faith, sacred order or tradition.",
     "folder": "_lore", "fixed": dict(category="religions", **LORE_STATUS),
     "fields": [
        ("Faith name", "title", "title", "input", True, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Deity or principle", "fact", "Deity or principle", "input", False, "e.g. The Cycle"),
        ("Followed by", "fact", "Followed by", "input", False, "Nations or factions, separated by commas"),
        ("Ranks", "ranks", "ranks", "textarea", False, "The hierarchy, one rank per line, highest first: Rank: holder, holder\nLeave the holders empty if a rank is vacant.\nExample:\nKing: Aldric Vale\nPrince: Swobble\nKnights: Name, Name"),
        ("Description", "body", "body", "textarea", False, "Beliefs, practices, anything public"),
     ]},
    {"id": "deity", "name": "God", "order": 8,
     "about": "A god of the pantheon.",
     "folder": "_lore", "fixed": dict(category="deities", **LORE_STATUS),
     "fields": [
        ("God name", "title", "title", "input", True, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Titles", "fact", "Titles", "input", False, "Other titles, separated by commas"),
        ("Domain", "fact", "Domain", "input", False, ""),
        ("Worshipped by", "fact", "Worshipped by", "input", False, "Faiths, separated by commas"),
        ("Description", "body", "body", "textarea", False, "Mythology, worship, anything public"),
     ]},
    {"id": "spirit", "name": "Spirit", "order": 9,
     "about": "A spirit of the world.",
     "folder": "_lore", "fixed": dict(category="spirits", **LORE_STATUS),
     "fields": [
        ("Spirit name", "title", "title", "input", True, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Titles", "fact", "Titles", "input", False, ""),
        ("Resonance", "fact", "Resonance", "input", False, "What the spirit resonates with"),
        ("Found in", "fact", "Found in", "input", False, "Where in the world it can be found"),
        ("Connected god", "fact", "Connected god", "input", False, "A god's name, or None"),
        ("Tier", "fact", "Tier", ["Ancient", "Greater", "Lesser"], False, ""),
        ("Classification", "fact", "Classification", "input", False, "e.g. Warrior"),
        ("Description", "body", "body", "textarea", False, "Legends, encounters, anything public"),
     ]},
    {"id": "myth", "name": "Myth or legend", "order": 10,
     "about": "A story told about the gods, spirits or the past.",
     "folder": "_lore", "fixed": dict(category="myths", **LORE_STATUS),
     "fields": [
        ("Myth name", "title", "title", "input", True, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Figures involved", "fact", "Figures involved", "input", False, "Gods or spirits, separated by commas"),
        ("Told by", "fact", "Told by", "input", False, "Who tells this story"),
        ("Era", "fact", "Era", "input", False, "When the story is set"),
        ("The tale", "body", "body", "textarea", True, "Tell the myth as its tellers tell it"),
     ]},
    {"id": "unknown", "name": "Unknown", "order": 11,
     "about": "A being, force or mystery nobody has identified.",
     "folder": "_lore", "fixed": dict(category="unknowns", **LORE_STATUS),
     "fields": [
        ("Name", "title", "title", "input", True, "What people call it"),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Also called", "fact", "Also called", "input", False, ""),
        ("First noticed", "fact", "First noticed", "input", False, "When or during which event"),
        ("Seen at", "fact", "Seen at", "input", False, ""),
        ("Possibly linked to", "fact", "Possibly linked to", "input", False, "A god, spirit, faction or place, or None"),
        ("Description", "body", "body", "textarea", False, "Sightings, what people believe"),
     ]},
    {"id": "relic", "name": "Relic", "order": 12,
     "about": "An artifact of power.",
     "folder": "_lore", "image_folder": "relics", "fixed": dict(category="relics", **LORE_STATUS),
     "fields": [
        ("Relic name", "title", "title", "input", True, ""),
        ("Rarity class", "front", "rarity", ["Awakened Class", "Tempered Class", "Ruler Class", "Sovereign Class", "Paragon Class", "Primordial Class", "Cataclysm Class"], True, ""),
        ("Cursed or blessed", "front", "nature", ["Neither", "Cursed", "Blessed"], False, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Current wielder", "front", "wielder", "input", False, "Only shown for Paragon Class and above"),
        ("Origin", "fact", "Origin", "input", False, "Who made it, or where it was found"),
        ("Type of relic", "fact", "Type", "input", False, "Weapon, armor, jewelry, tome..."),
        ("Powers", "fact", "Powers", "input", False, "What it is publicly known to do"),
        ("Picture", "image", "image", "textarea", False, "Drag and drop a picture here (optional)"),
        ("Description", "body", "body", "textarea", False, "History, past wielders, anything public"),
     ]},
    {"id": "creature", "name": "Beastiary creature", "order": 13,
     "about": "An animal, monster or species players cannot play.",
     "folder": "_lore", "image_folder": "beastiary", "fixed": dict(category="beastiary", **LORE_STATUS),
     "fields": [
        ("Creature name", "title", "title", "input", True, ""),
        ("Kind", "front", "kind", ["Animal", "Monster", "Species"], True, ""),
        ("Temperament", "front", "temperament", ["Passive", "Neutral", "Hostile"], True, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Picture", "image", "image", "textarea", False, "Drag and drop a picture here (optional)"),
        ("Habitat", "fact", "Habitat", "input", False, "Snowy peaks, deep caves, open sea..."),
        ("Found in", "fact", "Found in", "input", False, "Places, separated by commas"),
        ("Diet", "fact", "Diet", "input", False, ""),
        ("Drops", "fact", "Drops", "input", False, "What it leaves behind when slain"),
        ("Weaknesses", "fact", "Weaknesses", "input", False, ""),
        ("Description", "body", "body", "textarea", False, "Behaviour, encounters, anything public"),
     ]},
    {"id": "world", "name": "World lore", "order": 14,
     "about": "Cosmology, history, ages, magic or anything else about the world.",
     "folder": "_lore", "fixed": dict(category="world", **LORE_STATUS),
     "fields": [
        ("Title", "title", "title", "input", True, ""),
        ("Summary", "summary", "summary", "input", True, "One line a new player should understand"),
        ("Description", "body", "body", "textarea", True, ""),
     ]},
]

EMPTY_ANSWERS = {"", "_No response_", "None", "Neither", "Not sure"}

# Every form starts with this question. Answering it replaces an existing page
# instead of adding a new one.
UPDATE_LABEL = "Updating an existing page?"
UPDATE_HINT = ("Leave this empty for a new page. To update a page, paste its address "
               "(e.g. https://smpequinox.github.io/characters/swobble/) or its exact name, then fill in only "
               "what changes: empty boxes keep the current info, and new bonds are added to the existing ones. "
               "To remove something, write a single - in its box; to remove a bond, write: Name | remove")
# In an update, an answer of exactly this removes the current value.
CLEAR = "-"
# Settings staff add by hand that a player's update can never change: map
# pins, the Featured flag, the Living Legend honour and a theory's verdict.
KEEP_ON_UPDATE = ["map_x", "map_y", "featured", "verdict", "legend", "legend_for", "legend_since"]


# ---------- issue forms ----------

def q(text):
    """A YAML-safe double-quoted string."""
    return json.dumps(text, ensure_ascii=False)


def write_forms(root):
    folder = os.path.join(root, ".github", "ISSUE_TEMPLATE")
    for name in os.listdir(folder):
        if name.startswith("submit-") and name.endswith(".yml"):
            os.remove(os.path.join(folder, name))
    for t in TYPES:
        lines = [
            "# Generated by .github/scripts/submissions.py. Edit TYPES there, then run:",
            "#   python3 .github/scripts/submissions.py forms",
            f"name: {q(t['name'])}",
            f"description: {q(t['about'])}",
            f"title: {q('[' + t['name'] + '] ')}",
            f"labels: [{q('submission')}, {q('submission:' + t['id'])}]",
            "body:",
            "  - type: markdown",
            "    attributes:",
            "      value: |",
            "        **Everything here is public.** Only share what any player is allowed to know: no secrets or staff spoilers.",
            "        Staff review every submission. Once approved, it is added to the wiki and this issue is closed.",
            "  - type: input",
            "    id: update",
            "    attributes:",
            f"      label: {q(UPDATE_LABEL)}",
            f"      description: {q(UPDATE_HINT)}",
            "    validations:",
            "      required: false",
        ]
        for i, (label, kind, key, inp, required, hint) in enumerate(t["fields"]):
            fid = f"f{i}"
            if isinstance(inp, list):
                lines += ["  - type: dropdown", f"    id: {fid}", "    attributes:", f"      label: {q(label)}",
                          "      options:"] + [f"        - {q(o)}" for o in inp]
            else:
                lines += [f"  - type: {inp}", f"    id: {fid}", "    attributes:", f"      label: {q(label)}"]
                if hint:
                    lines.append(f"      description: {q(hint)}")
            lines += ["    validations:", f"      required: {'true' if required else 'false'}"]
        path = os.path.join(folder, f"submit-{t['order']:02d}-{t['id']}.yml")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")
        print(path)


# ---------- building a wiki file from an issue ----------

def parse_issue_body(body):
    """Issue forms post as '### Label' headings followed by the answer."""
    answers, label, buf = {}, None, []
    for line in (body or "").replace("\r\n", "\n").split("\n"):
        m = re.match(r"^### (.+?)\s*$", line)
        if m:
            if label is not None:
                answers[label] = "\n".join(buf).strip()
            label, buf = m.group(1), []
        elif label is not None:
            buf.append(line)
    if label is not None:
        answers[label] = "\n".join(buf).strip()
    return answers


def clean(text):
    """Keep submitted text as plain text: no HTML and no Liquid on the published site."""
    text = text.replace("<", "&lt;")
    return text.replace("{{", "&#123;&#123;").replace("{%", "&#123;%")


def one_line(text):
    return clean(" ".join(text.split()))


def name_key(text):
    """A name for comparing: capitals, apostrophes, quotation marks and hyphens
    don't matter, so "Cni'daria", "Cni’Daria" and "cnidaria" are the same."""
    text = re.sub(r"[\'’‘`ʼ\"“”]", "", text or "").casefold()
    return re.sub(r"[\s-]+", " ", text).strip()


def plain_name(text):
    """A name without markdown emphasis, e.g. "**The Forest**" -> "The Forest"."""
    return re.sub(r"^[*_]+|[*_]+$", "", one_line(text)).strip()


def slugify(text):
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "entry"


def find_image_url(text):
    m = re.search(r"\((https://[^)\s]+)\)", text) or re.search(r'src="(https://[^"]+)"', text) \
        or re.search(r"(https://\S+)", text)
    return m.group(1) if m else None


def download_image(url, dest_base):
    """Save an attached picture. Only GitHub-hosted uploads are accepted."""
    host = re.match(r"https://([^/]+)/", url)
    if not host or not (host.group(1) == "github.com" or host.group(1).endswith(".githubusercontent.com")):
        raise ValueError(f"Picture must be uploaded to GitHub (drag and drop into the form), got {url}")
    # The repository is public, so its attachments download without a login.
    req = urllib.request.Request(url, headers={"User-Agent": "equinox-wiki-submissions"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read(16 * 1024 * 1024 + 1)
        ctype = resp.headers.get("Content-Type", "")
    if len(data) > 16 * 1024 * 1024:
        raise ValueError("Picture is larger than 16 MB")
    ext = {"image/png": ".png", "image/jpeg": ".jpg", "image/gif": ".gif", "image/webp": ".webp"}.get(ctype.split(";")[0])
    if not ext:
        raise ValueError(f"Attachment is not a PNG, JPG, GIF or WebP picture ({ctype})")
    path = dest_base + ext
    with open(path, "wb") as fh:
        fh.write(data)
    return path


def front_matter(path):
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    m = re.match(r"---\n(.*?)\n---", text, re.S)
    return m.group(1) if m else ""


def setting(front, key):
    """The raw value of a top-level setting line, e.g. 'title: "Arbitus"' -> '"Arbitus"'."""
    m = re.search(rf"^{re.escape(key)}:[ \t]*(.*)$", front, re.M)
    return m.group(1).strip() if m else None


def unquote(value):
    value = (value or "").split(" #")[0].strip()
    if value.startswith('"'):
        try:
            return json.loads(value)
        except ValueError:
            return value.strip('"')
    return value


def find_page(folder, ref, category=None):
    """The file an update replaces, found by its address or its exact name."""
    ref = ref.strip()
    if not os.path.isdir(folder):
        return None
    candidates = sorted(f for f in os.listdir(folder) if f.endswith(".md"))
    if "/" in ref:
        name = [p for p in re.sub(r"[?#].*$", "", ref).split("/") if p][-1]
        name = re.sub(r"\.html$", "", name)
        matches = [f for f in candidates if f[:-3] == name]
    else:
        wanted = name_key(ref)
        matches = [f for f in candidates
                   if name_key(unquote(setting(front_matter(os.path.join(folder, f)), "title"))) == wanted]
    for f in matches:
        path = os.path.join(folder, f)
        if category is None or unquote(setting(front_matter(path), "category")) == category:
            return path
    return None


def unique_path(folder, slug, ext=".md"):
    path, n = os.path.join(folder, slug + ext), 2
    while os.path.exists(path):
        path, n = os.path.join(folder, f"{slug}-{n}{ext}"), n + 1
    return path


def split_page(path):
    """A page's front matter lines and body text."""
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    m = re.match(r"---\n(.*?)\n---\n?(.*)", text, re.S)
    if not m:
        return [], text
    return m.group(1).split("\n"), m.group(2).strip()


def parse_front(lines):
    """Front matter as an ordered list of ("scalar", key, line) and ("block", key, [lines])."""
    entries = []
    for line in lines:
        if not line.strip() or line.startswith("# Submitted in issue"):
            continue
        if line[0] in " \t-":
            if entries and entries[-1][0] == "block":
                entries[-1][2].append(line)
            continue
        if line.startswith("#"):
            entries.append(("comment", None, line))
            continue
        key, _, value = line.partition(":")
        if value.strip() == "":
            entries.append(("block", key.strip(), []))
        else:
            entries.append(("scalar", key.strip(), line))
    return entries


def fact_key(line):
    m = re.match(r'^\s+("(?:[^"\\]|\\.)*"|[^:]+):', line)
    return unquote(m.group(1).strip()) if m else line.strip()


def bond_items(lines):
    """Bond blocks grouped per person: [(name, [lines])]."""
    items = []
    for line in lines:
        m = re.match(r"^\s*- name:\s*(.*)$", line)
        if m:
            items.append((unquote(m.group(1)), [line]))
        elif items:
            items[-1][1].append(line)
    return items


def merge_update(old_lines, old_body, new, cleared, removed_bonds, fixed_keys=()):
    """Merge a player's update into the page it updates. Empty answers keep the
    old values, "-" answers remove them, and bonds are merged by name."""
    entries = parse_front(old_lines)
    old_scalars = {k: l for kind, k, l in entries if kind == "scalar"}
    out = []
    for kind, key, value in entries:
        if kind == "comment":
            out.append(value)
        elif kind == "scalar":
            if key in KEEP_ON_UPDATE or key in fixed_keys or key not in new["scalars"]:
                if key not in cleared or key in KEEP_ON_UPDATE:
                    out.append(value)
            else:
                out.append(new["scalars"][key])
        else:
            out.append(("block", key, value))
    for key, line in new["scalars"].items():
        if key not in old_scalars:
            out.append(line)
    scalars = [l for l in out if isinstance(l, str)]
    blocks = {b[1]: b[2] for b in out if not isinstance(b, str)}
    order = [b[1] for b in out if not isinstance(b, str)]

    # facts: merge by fact name
    facts = [(fact_key(l), l) for l in blocks.get("facts", [])]
    for line in new["facts"]:
        k = fact_key(line)
        facts = [(fk, fl) if fk != k else (k, line) for fk, fl in facts] if any(fk == k for fk, _ in facts) else facts + [(k, line)]
    facts = [(k, l) for k, l in facts if ("fact:" + k) not in cleared]
    # bonds: merge by name; "Name | remove" deletes
    bonds = bond_items(blocks.get("bonds", []))
    for name, lines in bond_items(new["bonds"]):
        if any(name_key(n) == name_key(name) for n, _ in bonds):
            bonds = [(n, lines if name_key(n) == name_key(name) else ls) for n, ls in bonds]
        else:
            bonds.append((name, lines))
    bonds = [(n, ls) for n, ls in bonds if name_key(n) not in removed_bonds]
    # ranks: a new hierarchy replaces the old one as a whole
    ranks = new["ranks"] or ([] if "ranks" in cleared else blocks.get("ranks", []))

    merged = {"facts": [l for _, l in facts], "bonds": [l for _, ls in bonds for l in ls], "ranks": ranks}
    for key in ("facts", "ranks", "bonds"):
        if key not in order:
            order.append(key)
    front = list(scalars)
    for key in order:
        lines = merged.get(key, blocks.get(key, []))
        if lines:
            front += [f"{key}:"] + lines
    body = new["body"] if new["body"] else ("" if "body" in cleared else old_body)
    return front, body


def build(issue, root="."):
    labels = [l["name"] if isinstance(l, dict) else l for l in issue.get("labels", [])]
    type_ids = [l.split(":", 1)[1] for l in labels if l.startswith("submission:")]
    t = next((t for t in TYPES if t["id"] in type_ids), None)
    if not t:
        raise ValueError("Issue has no submission:<type> label")
    answers = parse_issue_body(issue.get("body"))

    raw_title = answers.get(next(f[0] for f in t["fields"] if f[1] == "title"), "").strip()
    if not raw_title or raw_title in EMPTY_ANSWERS:
        raise ValueError("Submission has no name or title")
    title = one_line(raw_title)
    slug = slugify(re.sub(r"<[^>]*>", "", raw_title))
    folder = os.path.join(root, t["folder"])
    os.makedirs(folder, exist_ok=True)
    update_ref = answers.get(UPDATE_LABEL, "").strip()
    old_front = None
    if update_ref and update_ref not in EMPTY_ANSWERS:
        out = find_page(folder, update_ref, t["fixed"].get("category"))
        if not out:
            raise ValueError(f"Couldn't find the {t['name'].lower()} page to update: {update_ref}. "
                             "Check the address or exact name, and that the submission type matches the page.")
        old_front = front_matter(out)
    else:
        out = unique_path(folder, slug)

    front = [f"title: {q(title)}"]
    front += [f"{k}: {q(v)}" for k, v in t["fixed"].items()]
    facts, bonds, ranks, body, written = [], [], [], "", [out]
    cleared, removed_bonds = set(), set()
    for label, kind, key, inp, required, hint in t["fields"]:
        raw = answers.get(label, "").strip()
        if old_front is not None and raw == CLEAR and kind != "title":
            cleared.add("fact:" + key if kind == "fact" else ("summary" if kind == "summary" else key))
            continue
        if kind == "title" or raw in EMPTY_ANSWERS:
            continue
        if kind == "front":
            front.append(f"{key}: {q(one_line(raw))}")
        elif kind == "summary":
            front.append(f"summary: {q(one_line(raw))}")
        elif kind == "fact":
            facts.append(f"  {q(key)}: {q(one_line(raw))}")
        elif kind == "body":
            body = clean(raw)
        elif kind == "image":
            url = find_image_url(raw)
            if url:
                img_dir = os.path.join(root, "assets", "img", t.get("image_folder", "submissions"))
                os.makedirs(img_dir, exist_ok=True)
                saved = download_image(url, os.path.splitext(unique_path(img_dir, slug, ""))[0])
                written.append(saved)
                front.append(f"image: {q('/' + os.path.relpath(saved, root).replace(os.sep, '/'))}")
        elif kind == "ranks":
            for line in raw.split("\n"):
                rank, _, holders = line.partition(":")
                rank = plain_name(rank.lstrip("-* "))
                if not rank:
                    continue
                names = [plain_name(n) for n in holders.split(",") if plain_name(n)]
                ranks += [f"  - rank: {q(rank)}", f"    holders: {q(', '.join(names))}"]
        elif kind == "bonds":
            for line in raw.split("\n"):
                parts = [one_line(p) for p in line.split("|")]
                parts[0] = plain_name(parts[0])
                if not parts[0]:
                    continue
                if len(parts) > 1 and parts[1].strip().casefold() == "remove":
                    removed_bonds.add(name_key(parts[0]))
                    continue
                kind_of = parts[2].title() if len(parts) > 2 and parts[2] else "Other"
                if kind_of not in ("Family", "Ally", "Rival", "Romance", "Other"):
                    kind_of = "Other"
                bonds += [f"  - name: {q(parts[0])}"]
                if len(parts) > 1 and parts[1]:
                    bonds += [f"    relation: {q(parts[1])}"]
                bonds += [f"    type: {kind_of}"]
    if old_front is not None:
        old_lines, old_body = split_page(out)
        new = {"scalars": {l.partition(":")[0]: l for l in front}, "facts": facts,
               "bonds": bonds, "ranks": ranks, "body": body}
        front, body = merge_update(old_lines, old_body, new, cleared, removed_bonds, t["fixed"].keys())
    else:
        if facts:
            front += ["facts:"] + facts
        if ranks:
            front += ["ranks:"] + ranks
        if bonds:
            front += ["bonds:"] + bonds
    front.append(f"# Submitted in issue #{issue.get('number', '?')}")

    with open(out, "w", encoding="utf-8") as fh:
        fh.write("---\n" + "\n".join(front) + "\n---\n" + (f"\n{body}\n" if body else ""))
    return t, title, [os.path.relpath(p, root) for p in written], ("Update" if old_front is not None else "Add")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    repo = os.path.abspath(os.path.join(here, "..", ".."))
    if len(sys.argv) >= 2 and sys.argv[1] == "forms":
        write_forms(repo)
    elif len(sys.argv) >= 3 and sys.argv[1] == "build":
        with open(sys.argv[2], encoding="utf-8") as fh:
            issue = json.load(fh)
        t, title, files, action = build(issue, repo)
        print(json.dumps({"type": t["name"], "title": title, "files": files, "action": action}))
    else:
        sys.exit(__doc__)
