# ShilpMandir — Temple Construction Studio Website

An original, full-stack marketing + lead-generation website for a temple construction contractor.
Designed from scratch — not a clone of any competitor.

## Quick start (local, no Docker)

```bash
# 1) Frontend only (static preview)
cd frontend && npx serve . -l 8080
# open http://localhost:8080

# 2) Backend API
cd backend && npm install && npm run dev
# API at http://localhost:3001  (health: /api/health)

# 3) Full stack with Docker
docker compose up --build
# frontend http://localhost:8080, api http://localhost:3001
```

## Project layout

```
temple-nirman-website/
├── frontend/               # static site (no framework — easy to host anywhere)
│   ├── index.html
│   ├── css/main.css
│   ├── js/config.js        ←★ CHANGE client name, phone, address HERE
│   ├── js/content.json     ←★ all text, services, projects, team HERE
