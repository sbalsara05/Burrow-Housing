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
| `MongoDB connected` missing, or `Connection error:` | **MONGODB_URI** wrong or MongoDB container not reachable |
| Redis connection errors | **REDIS_URL** wrong or Redis not reachable |
| `Error: Cannot find module ...` | Build/dependency issue |
| `EADDRINUSE` | Port 5000 already in use |
| Process exiting immediately | Missing env var (e.g. **MONGODB_URI**) or crash on startup |

---

## 4. Confirm backend env vars on the droplet

The backend needs at least:

- **MONGODB_URI** – e.g. `mongodb://admin:password123@mongo:27017` (for Docker) or your Atlas URL
- **REDIS_URL** – e.g. `redis://redis:6379` (for Docker)
- **JWT_SECRET**
- **CORS_ORIGIN** – should include `https://burrowhousing.com` (and http if you use it)

On the droplet, env vars can come from:

1. **`~/app/.env`** – if `docker-compose` is set up to load it (e.g. `env_file: .env`).
2. **Secrets in GitHub Actions** – your workflow only runs `docker compose up -d --build`; it does **not** create a `.env` on the server. So either:
   - You have a `.env` file on the droplet at `~/app/.env` that you created manually, or
   - You pass env vars another way (e.g. Docker Compose `environment` section or a separate env file).

Check:

```bash
cd ~/app
ls -la .env
# If it exists:
grep -E '^[A-Z]' .env | sed 's/=.*/=***/'   # names only, hide values
```

If there is **no `.env`** or **MONGODB_URI/REDIS_URL** are missing, the backend will fail to connect to DB/Redis and can crash or hang, leading to 502.

---

## 5. Test the backend directly on the server

From the droplet:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health
# Expect: 200

curl -s http://localhost:5001/health
# Expect: {"status":"healthy", ...}
```

If this fails (connection refused, timeout, or non-200), the backend is not healthy. Fix backend/containers first.

Then test the endpoint that the frontend uses:

```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:5001/api/properties/all?page=1&limit=9"
# Expect: 200
```

---

## 6. Check your reverse proxy config (Nginx/Caddy)

If you use Nginx (or Caddy) to serve burrowhousing.com and proxy `/api` to the backend:

- **Nginx**: e.g. `proxy_pass http://127.0.0.1:5001;` for `/api`.
- Ensure the proxy target is **http://127.0.0.1:5001** (or the host/port where the backend container is exposed).

If the proxy points to the wrong port or the backend is down, you get 502.

Reload config after any change:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 7. Restart stack and re-check

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

## 8. Quick checklist

- [ ] `docker ps` shows `burrow-backend` as **Up**
- [ ] `docker logs burrow-backend` shows **MongoDB connected** and no fatal errors
- [ ] `~/app/.env` exists on droplet and has **MONGODB_URI**, **REDIS_URL**, **JWT_SECRET**, **CORS_ORIGIN**
- [ ] `curl http://localhost:5001/health` returns 200
- [ ] Reverse proxy proxies `/api` to the same host/port (e.g. 5001) where the backend is listening

Once the backend is up and the proxy points to it, **fetchAllPublicProperties** (and the rest of `/api/*`) should stop returning 502.
