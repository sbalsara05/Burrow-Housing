# Troubleshooting 502 Bad Gateway (burrowhousing.com)

A **502 Bad Gateway** means the reverse proxy (e.g. Nginx) in front of your site is running, but the **backend API** it proxies to is not responding. The frontend calls `/api/properties/all` (and other `/api/*` routes); when that proxy target is down or unreachable, you get 502.

---

## After merging the Redis/Mongo fix

If you just merged and the pipeline ran but prod still returns 502:

1. **SSH to the droplet** and confirm the backend is actually running with the new config:
   ```bash
   ssh YOUR_DROPLET_USER@YOUR_DROPLET_IP
   cd ~/app
   docker ps -a
   docker logs burrow-backend --tail 100
   ```
2. **Backend must have `MONGODB_URI` and `REDIS_URL`.** The repo’s `docker-compose.yml` now sets them in the backend service. After `git pull`, `docker compose up -d --build` uses that file. If you use a custom compose or `.env` on the droplet, ensure the backend container gets:
   - `MONGODB_URI=mongodb://admin:password123@mongo:27017/?authSource=admin` (or your prod Mongo URL)
   - `REDIS_URL=redis://redis:6379` (or your prod Redis URL)
3. **Force-recreate the backend** so it uses the new image and env:
   ```bash
   cd ~/app
   git pull origin main
   docker compose up -d --build --force-recreate backend
   docker logs burrow-backend --tail 50
   ```
4. **Check health and properties endpoint on the server:**
   ```bash
   curl -s http://localhost:5001/health
   curl -s -o /dev/null -w "%{http_code}" "http://localhost:5001/api/properties/all?page=1&limit=9"
   ```
   Both should return 200. If not, fix backend/env first; then check Nginx (step 6).

## 1. SSH into your Digital Ocean droplet

```bash
ssh YOUR_DROPLET_USER@YOUR_DROPLET_IP
```

Use the same credentials as in GitHub Actions secrets (`DROPLET_USER`, `DROPLET_IP`).

---

## 2. Check if containers are running

```bash
cd ~/app
docker ps -a
```

You should see something like:

- `burrow-backend` (port 5001)
- `burrow-frontend` (port 3000)
- `burrow-mongo`
- `burrow-redis`

If **burrow-backend** is **Exited** or **Restarting**, the backend is down and that causes 502.

---

## 3. Inspect backend logs (most important)

```bash
docker logs burrow-backend --tail 200
```

Look for:

| Log message | Likely cause |
|-------------|--------------|
| `MongoDB connected` missing, or `MongoDB connection attempt X/10 failed` / `Connection error:` | **MONGODB_URI** wrong or MongoDB container not ready; backend now retries and only starts when DB is connected |
| Redis connection errors | **REDIS_URL** wrong or Redis not reachable |
| `Error: Cannot find module ...` | Build/dependency issue |
| `EADDRINUSE` | Port 5000 already in use |
| Process exiting immediately | Missing env var (e.g. **MONGODB_URI**) or crash on startup |

---

## 4. Prod secrets: `~/app/backend/.env`

The backend service loads **`backend/.env`** (via `env_file: ./backend/.env` in docker-compose). Put all secrets there so the backend can start and payments work.

**Create or edit the file on the droplet:**

```bash
ssh YOUR_DROPLET_USER@YOUR_DROPLET_IP
cd ~/app
nano backend/.env   # or vim backend/.env
```

**Add at least these (no quotes around values):**

```env
MONGODB_URI=mongodb+srv://YOUR_ATLAS_URI_HERE
JWT_SECRET=your-jwt-secret-here
CORS_ORIGIN=https://burrowhousing.com,https://www.burrowhousing.com
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
```

- **MONGODB_URI** – Use your **MongoDB Atlas** URI here so prod uses the same DB as your dev (same users and properties). If you omit it, the backend falls back to the local Docker mongo (empty). In Atlas, add your **droplet’s IP** (or `0.0.0.0/0` for testing) under Network Access.
- REDIS_URL is set in docker-compose; override in `.env` only if you use Redis Cloud in prod.

**After editing `.env`, restart the backend so it picks up the vars:**

```bash
cd ~/app
docker compose up -d --force-recreate backend
docker logs burrow-backend --tail 30
```

---

## 5. Confirm backend env vars (reference)

The backend needs at least:

- **MONGODB_URI** – set in docker-compose; override in `.env` if needed
- **REDIS_URL** – set in docker-compose; override in `.env` if needed
- **JWT_SECRET** – put in `backend/.env`
- **CORS_ORIGIN** – put in `backend/.env`, e.g. `https://burrowhousing.com`
- **STRIPE_SECRET_KEY** – put in `backend/.env` (app starts without it; payments fail until set)
- **STRIPE_WEBHOOK_SECRET** – put in `backend/.env` if you use Stripe webhooks

On the droplet, the backend gets vars from:

1. **`~/app/backend/.env`** – loaded via `env_file: ./backend/.env` in docker-compose (create this file and add your secrets).
2. **`environment:` in docker-compose** – MONGODB_URI, REDIS_URL, etc. (from the repo).

Check:

```bash
cd ~/app
ls -la backend/.env
# If it exists:
grep -E '^[A-Z]' backend/.env | sed 's/=.*/=***/'   # names only, hide values
```

If **`backend/.env`** is missing, create it (`touch backend/.env`) and add at least **JWT_SECRET** and **CORS_ORIGIN** so auth and CORS work. MONGODB_URI and REDIS_URL are set in docker-compose.

---

## 6. Test the backend directly on the server

From the droplet (or from your machine if the API is exposed):

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health
# Expect: 200

curl -s http://localhost:5001/health
# Expect: {"status":"healthy","mongodb":"connected","redis":"configured", ...}
```

If you see **`"mongodb": "disconnected"`** or **`"status": "degraded"`**, the database is not connected. Check backend logs and that the `mongo` container is healthy (`docker ps` and `docker logs burrow-mongo --tail 20`).

If this fails (connection refused, timeout, or non-200), the backend is not healthy. Fix backend/containers first.

Then test the endpoint that the frontend uses:

```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:5001/api/properties/all?page=1&limit=9"
# Expect: 200
```

---

## 7. Check your reverse proxy config (Nginx/Caddy)

If you use Nginx (or Caddy) to serve burrowhousing.com and proxy `/api` to the backend:

- **Nginx**: e.g. `proxy_pass http://127.0.0.1:5001;` for `/api`.
- Ensure the proxy target is **http://127.0.0.1:5001** (or the host/port where the backend container is exposed).

If the proxy points to the wrong port or the backend is down, you get 502.

Reload config after any change:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 8. Restart stack and re-check

```bash
cd ~/app
docker compose down
docker compose up -d --build
docker ps -a
docker logs burrow-backend --tail 100
```

Then:

1. `curl http://localhost:5001/health` → 200
2. `curl "http://localhost:5001/api/properties/all?page=1&limit=9"` → 200
3. Reload https://burrowhousing.com and see if 502 is gone.

---

## 9. Quick checklist

- [ ] `docker ps` shows `burrow-backend` as **Up**
- [ ] `docker logs burrow-backend` shows **MongoDB connected** and no fatal errors
- [ ] `~/app/backend/.env` exists on droplet and has **JWT_SECRET**, **CORS_ORIGIN** (MONGODB_URI/REDIS_URL set in compose or override in .env)
- [ ] `curl http://localhost:5001/health` returns 200
- [ ] Reverse proxy proxies `/api` to the same host/port (e.g. 5001) where the backend is listening

Once the backend is up and the proxy points to it, **fetchAllPublicProperties** (and the rest of `/api/*`) should stop returning 502.
