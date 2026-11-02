# API reference (backend :3001)

| Method | Path | Body / query | Response |
|---|---|---|---|
| GET | /api/health | — | `{ok:true}` |
| GET | /api/projects?style=Nagara&stone=Marble | filters | `{projects:[...]}` |
| POST | /api/contact | `{name, phone, place?, message?}` | `{ok:true, id}` |
| POST | /api/quotes | `{name, phone, estimate:{}}` | `{ok:true, id, reference}` |
| GET | /api/leads | — | last 100 contacts + quotes |

Validation: `400 {error}` when name/phone missing or phone malformed.
Frontend degrades gracefully: if the API is unreachable the form still
opens WhatsApp with the prefilled enquiry (see `js/main.js`).
