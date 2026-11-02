# Deployment (DevOps notes)

## Option A — Docker Compose (VPS, simplest)
```bash
cp .env.example .env   # edit domain/ports
docker compose up -d --build
docker compose logs -f
```
Frontend :8080 → nginx serves static site.
Backend  :3001 → Express API. Data persists in `backend-data` volume.

## Option B — Static frontend + any backend host
The frontend is framework-free. Host `frontend/` on Netlify / Vercel /
S3+CloudFront / Nginx and point `API_BASE` in `js/config.js` at the API.
No build step.

## Option C — Kubernetes
```bash
kubectl apply -f k8s/namespace.yaml
# edit image names in k8s/*.yaml, then:
kubectl apply -f k8s/
kubectl -n temple-site get pods,svc,ingress
```

## Reverse-proxy note
Serve API under the SAME domain (`/api/*` → backend) to avoid CORS.
Sample location block:

```nginx
location /api/ { proxy_pass http://backend:3001; }
```

## Backup
Leads live in the backend volume as `contacts.json` / `quotes.json`:

```bash
docker compose exec backend sh -c 'cat /app/data/contacts.json' > backup.json
```
