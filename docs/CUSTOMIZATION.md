# Rebrand in 15 minutes (no code search needed)

## 1. `frontend/js/config.js` (2 min)
Brand name, tagline, phone, WhatsApp number, email, address,
map link, API base URL, social links.

## 2. `frontend/js/content.json` (8 min)
Every headline, stat, service, step, project, stone, team member,
client quote and FAQ. Written in simple words — keep that style.

Projects need only the MAIN photo name:

```json
{ "title": "...", "place": "...", "img": "project-1.jpg" }
```

## 3. `frontend/assets/img/` (5 min)
| File | Size | Used for |
|---|---|---|
| hero-best.jpg | 1920×900+ | Big top photo |
| project-1..9.jpg | 1200×800 | Temple cards (9 live, add more freely) |
| restore-before/after.jpg | 1200×800 | Before/after slider pair |
| project-N-2.jpg, -3.jpg … | 1200×800 | Popup gallery, auto-found (any count) |
| team-1..3.jpg | 600×750 | People (optional — letter card fallback) |
| og-cover.jpg | 1200×630 | WhatsApp/Google preview |

Full rules in `assets/img/README.md`.

## Colours / fonts
CSS variables at the top of `frontend/css/main.css`
(`--paper, --ink, --clay, --moss`). Fonts in `index.html` head.
