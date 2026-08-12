# Frita Batidos — Site + Admin

A recreation of [fritabatidos.com/ann-arbor](https://fritabatidos.com/ann-arbor) with a built-in
admin that manages every piece of content on the site.

## Run

```bash
node server.js
```

- Site: http://localhost:4173
- Admin: http://localhost:4173/admin

No dependencies — plain Node.js.

## How it works

| Piece | What it does |
|---|---|
| `content.json` | The entire site's content: banner, nav, every page, every menu item |
| `server.js` | Serves the site (server-rendered from `content.json`), the admin, and the API |
| `lib/render.js` | HTML templates for every page |
| `public/` | Styles, admin app, brand assets, uploaded images |

The admin (`/admin`) edits `content.json` through `PUT /api/content` and uploads images through
`POST /api/upload` (saved to `public/uploads/`). Changes are live on the public site as soon as
you hit **Save changes** — refresh the page to see them.

## What the admin manages

- **Top banner** — the gift-card/takeaway/catering links and the awards line, or hide the whole bar
- **Home** — the rotating full-screen background photos
- **Food & Drinks** — order link, intro, and the full food menu (sections, items, prices,
  callout boxes), the Frita Bar menu, happy hour, and other beverages
- **Menu Guide** — every dietary section and note
- **Catering / Press & Praise** — the stacked menu/press images (upload, reorder, remove)
- **Chef / Philosophy** — headed text sections
- **Photos** — slideshow images, order, autoplay speed
- **Contact** — holiday notice, hours, address, connect links
- **Frita Gear** — button text and link
- **Navigation** — labels and order
