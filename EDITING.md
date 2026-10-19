# How to edit the Equinox SMP wiki

Everything is edited on **github.com**. No software to install. Every time you save ("commit") a change, the live site updates by itself in about a minute.

> **Never put secrets here.** This repository is public. Anyone can read every file in it, even files that aren't linked from the site. Unrevealed lore, spoilers, and staff notes stay in the staff Notion or Discord.

---

## The basics: editing any page

1. Open the repository on github.com and click the file you want (for example `rules.md`).
2. Click the **pencil icon** (top right of the file).
3. Make your changes.
4. Click **Commit changes…**, write a short note like "Added rule 1.8", and click **Commit changes** again.
5. Wait about a minute and refresh the site.

If something looks broken afterwards, open the **Actions** tab on GitHub. A red ✕ means the last change had a mistake. Open that file again and check it against the examples below.

### Formatting cheat sheet

```
## Big section heading
### Smaller heading
**bold**   *italic*
- a bullet point
1. a numbered step
[link text](/rules/)              ← link to another wiki page
[link text](https://example.com)   ← link to another website
> A highlighted callout box
```

Tables:

```
| Column one | Column two |
| --- | --- |
| A cell | Another cell |
```

---

## What lives where

| To change… | Edit this file |
| --- | --- |
| Server address, Discord link, application link, Minecraft version, current arc, tagline | `_config.yml` |
| The "Welcome, traveler" paragraph on the home page | `index.md` |
| The "Recent events" gallery on the home page | `_data/events.yml` |
| Timeline entries | `_data/timeline.yml` |
| The side menu | `_data/navigation.yml` |
| Rules, Character Creation, Player Guide, etc. | the matching `.md` file in the main folder |
| Lore entries (faiths, gods, nations, places, world foundations) | files in `_lore/` |
| Characters | files in `_characters/` |

---

## Player submissions

Players submit characters, theories and lore through forms on GitHub: the **Issues** tab → **New issue**, or the [Submit to the Wiki](/submit/) page. Each submission arrives as an issue labelled `submission` and its type, e.g. `submission:character`.

1. **Review it.** Read the issue. Ask questions or request changes in the comments; the player can edit their submission.
2. **Approve it.** Add the **approved** label. Within a minute or two, a bot writes the wiki page, downloads any attached picture, and opens a pull request. It comments a link on the issue.
3. **Publish it.** Open that pull request, check the page, fix anything by editing the file in the pull request, then **Merge**. The issue closes automatically and the page goes live.

To reject a submission, comment why and close the issue. If the bot can't build a page (for example, the picture isn't PNG, JPG, GIF or WebP), it comments on the issue with a link to the error.

**One-time setup:** in the repository's **Settings → Actions → General**, under "Workflow permissions", tick **Allow GitHub Actions to create and approve pull requests**. Without it the bot can't open pull requests.

**Changing the forms:** the fields for every type live in one list, `TYPES` in `.github/scripts/submissions.py`. After editing it, run `python3 .github/scripts/submissions.py forms` and commit the regenerated files in `.github/ISSUE_TEMPLATE/`.

## Adding a lore entry (a faith, god, nation, place…)

These appear on their section page automatically. You don't need to touch the section page.

1. Open the `templates` folder and copy everything in `lore-entry.md`. Use the matching template instead for:
   - **a location:** `location.md` (direction, map position, Type, Controlled by, Known for)
   - **a nation:** `nation.md` (Ruler, Government, Capital, Ruling house, Faith, Allies, Rivals)
   - **a faction:** `faction.md` (Type, Leader, Based in, Allegiance, Goals, Allies, Rivals)
   - **a noble house:** `noble-house.md` (Standing: Ruling or Fallen, Head of house, Seat, Sworn to, Words, Faith, Allies, Rivals)
   - **a god:** `deity.md` (Titles, Domain, Worshipped by)
   - **a spirit:** `spirit.md` (Titles, Resonance, Found in, Connected god, Tier: Ancient, Greater or Lesser, Classification, e.g. Warrior)
   - **a myth or legend:** `myth.md` (Figures involved, Told by, Era)
   - **an unknown:** `unknown.md` (Also called, First noticed, Seen at, Possibly linked to)
   - **a relic:** `relic.md` (rarity, nature: Cursed or Blessed, wielder, Origin, Type, Powers)
   - **a creature or unplayable species:** `beastiary.md` (kind, temperament, picture, Habitat, Found in, Diet, Drops, Weaknesses). Upload its picture to `assets/img/beastiary/` first.
   - **a player theory:** `theory.md` (verdict, theorist, About, Evidence)
   - **a religion or order:** `religion.md` (Deity or principle, Followed by)
2. Go to the `_lore` folder, click **Add file → Create new file**.
3. Name it in lowercase with dashes, ending in `.md`, e.g. `the-silver-coast.md`.
4. Paste the template and fill it in. The `category:` line decides where it shows up:
   - `world`: World Lore, under "Foundations of the world" (cosmology, creation myths, ages, magic)
   - `nations`: Nations & Factions, under "Nations"
   - `factions`: Nations & Factions, under "Factions"
   - `houses`: Nations & Factions, under "Noble houses". Set `standing: Ruling` or `standing: Fallen` to choose the list.
   - `deities`: Deities & Mythology, under "The pantheon"
   - `spirits`: Deities & Mythology, under "Spirits"
   - `myths`: Deities & Mythology, under "Myths & legends"
   - `unknowns`: Deities & Mythology, under "Unknowns"
   - `relics`: the Relics page, under the heading of its `rarity:` (Awakened, Tempered, Ruler, Sovereign, Paragon, Primordial or Cataclysm Class, always ending in "Class"). Paragon Class and up also show `wielder:`. Add `nature: Cursed` or `nature: Blessed` for a sub tag beside the rarity.
   - `beastiary`: the Beastiary. Set `kind:` to Animal, Monster or Species to choose its section, and `temperament:` to Passive, Neutral or Hostile.
   - `theories`: the Theory Gallery. Set `verdict:` to Unconfirmed, Confirmed or Debunked to choose its list.
   - `religions`: Religions & Orders
   - `locations`: Locations & Landmarks. Set `direction:` to North, Northeast, East, Southeast, South, Southwest, West or Northwest (one word, capital first letter) to list it under "By region", and `map_x:` / `map_y:` to pin it on the world map.
5. Commit.

**Keep the dashes and colons exactly as in the template.** The block between the two `---` lines is the entry's settings. Text values with special characters should stay inside "quotes".

**Every line between the `---` lines must be `name: value`.** A line with only a value (like `"Sun mother"` on its own) breaks the settings, and the entry silently won't appear anywhere. Extra details go under `facts:`, indented two spaces, e.g. `  Titles: "The Sun Mother"`.

**Names link themselves.** Any time the name of a wiki page appears in an info box, tree or page text, exactly as its title is spelled (capitals included), it becomes a link to that page. This works inside longer text too: "Prince of Arbitus" links "Arbitus". Info boxes and trees link every mention; page text links the first mention of each page. Names shorter than 4 letters are not linked.

**Hierarchies.** Nation, faction, noble house and religion templates have a `ranks:` list. Write the ranks from highest to lowest, each with its holders separated by commas (or `holders: ""` if vacant). The page shows them as a tree under "Hierarchy".

**Need a folder that doesn't exist yet?** GitHub can't hold empty folders. In **Add file → Create new file**, type the folder name and a slash into the file name box (e.g. `_characters/` then `aster-vale.md`) and GitHub creates the folder for you.

Want to write an entry without publishing it yet? Add the line `published: false` between the `---` lines. Remove it when it's ready. (Remember: the file is still publicly readable on GitHub, so drafts must not contain secrets.)

## Updating the world map

The map on Locations & Landmarks is `assets/img/world-map.webp`.

1. To replace it, go to `assets/img/`, click **Add file → Upload files**, and upload the new map named exactly `world-map.webp`. To use a `.png` or `.jpg` instead, change the `map_image:` line at the top of `locations-and-landmarks.md` to match its name.
2. To pin a location, open the Locations & Landmarks page and click its spot on the map. Zoom in first for a more exact spot; the numbers stay correct at any zoom. The bottom corner shows `map_x` and `map_y` for that spot.
3. Put those two numbers in the location's file (`map_x: 42.5` and `map_y: 18.3`) and commit. Its name now appears on the map and links to its page.

Uploading a new map with the same file name keeps all the pins. Re-check them if the new map's shape or borders changed.

## Adding a character

1. Upload the character art: go to `assets/img/characters/`, click **Add file → Upload files**. Use a simple file name like `aster-vale.png`.
2. Copy `templates/character.md` into a new file in `_characters/`, e.g. `_characters/aster-vale.md`.
3. Set `image:` to `"/assets/img/characters/aster-vale.png"` and fill in the rest. Delete any lines you don't need.
4. Set `featured: true` for staff and arc characters to show them under "Featured this arc".
5. `type: "Staff Character"` also lists them under "Staff characters". Changing `status:` to `"Dead"` moves them from "All characters" to "Dead characters".
6. To draw their **relationship tree**, fill in the `bonds:` list. Each person gets three lines: `name`, `relation` (e.g. "Older brother") and `type` (Family, Ally, Rival, Romance or Other). If the name matches another character's page exactly, it links there and shows their portrait. Bonds are one-way: add the bond to both characters' files if both pages should show it.
7. Commit. They appear in the Character Gallery automatically.

## Adding a recent event to the home page gallery

1. Upload the screenshot to `assets/img/events/`.
2. Open `_data/events.yml` and add a new block **at the top** of the list (below the instructions):

```yaml
- title: "The Fall of the Eastern Gate"
  date: "October 12, 2026"
  summary: "Raiders broke the eastern wall during the harvest festival."
  image: "/assets/img/events/eastern-gate.png"
  link: "/timeline/"
```

Every line except `title` is optional. Indentation matters: two spaces before each line after the first. The gallery shows arrows and rotates once there are two or more events. Delete old events whenever you like.

## Adding to the timeline

Open `_data/timeline.yml` and add a block at the **bottom** (oldest events first):

```yaml
- date: "Year 12, Harvest"
  event: "The Fall of the Eastern Gate"
  summary: "Raiders broke the eastern wall during the festival."
```

## Adding a brand-new standalone page

1. Copy `templates/new-page.md` into a new file in the **main folder**, e.g. `economy.md`. It will live at `/economy/`.
2. Add it to the menu in `_data/navigation.yml`:

```yaml
    - title: "Economy"
      url: "/economy/"
```

Match the spacing of the lines around it exactly.

---

## Common mistakes

- **A red ✕ in the Actions tab** usually means a missing quote or wrong indentation in a `.yml` file or in the settings block of a page. Compare with the template.
- **Image not showing:** the path must start with `/assets/img/` and match the file name exactly, including capital letters and `.png` vs `.jpg`.
- **New page shows "Lost between the stars":** check the file ends in `.md` and the link uses the same name with dashes.
