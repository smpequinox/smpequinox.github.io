# Equinox SMP Wiki

The public wiki for Equinox SMP, built for GitHub Pages.
**To edit pages, read [EDITING.md](EDITING.md).**

## First-time setup

1. Create a free GitHub account.
2. Create a new **public** repository named exactly `YOUR-USERNAME.github.io`.
3. On the new repository page, click **uploading an existing file**.
4. Unzip `equinox-wiki.zip`, open the `equinox-wiki` folder, select **everything inside it**, and drag it all into the upload box. Folders whose names start with `_` must come along.
5. Click **Commit changes**.
6. Go to **Settings → Pages**. Under "Build and deployment", set **Source** to **Deploy from a branch**, branch **main**, folder **/ (root)**, and click **Save**.
7. After 1–2 minutes the site is live at `https://YOUR-USERNAME.github.io`.

To let other staff edit: **Settings → Collaborators → Add people**.

## If you use a different repository name

If the repository is named anything else (e.g. `equinox-wiki`), the site lives at
`https://YOUR-USERNAME.github.io/equinox-wiki/`. In that case open `_config.yml` and set:

```yaml
baseurl: "/equinox-wiki"
```

## Credits

Fonts: Marcellus and Alegreya, SIL Open Font License, self-hosted in `assets/fonts`.
