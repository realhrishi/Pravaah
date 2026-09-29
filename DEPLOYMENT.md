# PRAVAAH — EC2 Deployment

The complete PRAVAAH stack onto an AWS EC2 instance with Docker, PostGIS, Redis, ML inference, API, Workers, Next.js frontend, and Nginx SSL on **`https://pravaah.ashuttosh.me/`**.

---

## 1. Prerequisites on EC2

Ensure your EC2 instance (Ubuntu 22.04 or 24.04 recommended) has:
- **Inbound Security Group Rules**:
  - `Port 80` (HTTP) — `0.0.0.0/0`
  - `Port 443` (HTTPS) — `0.0.0.0/0`
  - `Port 22` (SSH) — your IP
- **DNS Record**:
  - Point an `A` record for `pravaah.ashuttosh.me` to your EC2 Public IPv4 address.

---

## 2. Install Docker & Docker Compose (if not already installed)

```bash
# Update and install Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Re-login to apply group permissions or run:
newgrp docker
```

---

## 3. Clone Repository & Configure Environment

```bash
# Clone the repository
git clone https://github.com/realhrishi/Pravaah.git
cd Pravaah

# Copy production environment template
cp .env.production.example .env

# Edit .env to set your passwords
nano .env
```

---

## 4. Launch the Stack

### Step A: Build & Start All Services
```bash
docker compose up -d --build
```

This starts:
1. `pravaah_postgres`: PostgreSQL 16 with **PostGIS** extension
2. `pravaah_redis`: Redis 7
3. `pravaah_ml`: Python FastAPI hydrodynamic ML service
4. `pravaah_db_migrate`: Runs `prisma db push` to initialize database tables
5. `pravaah_api`: Express + Socket.IO REST & WebSockets API (port 4000)
6. `pravaah_workers`: BullMQ background worker fleet
7. `pravaah_web`: Next.js production frontend (port 3000)
8. `pravaah_nginx`: Reverse proxy with SSL routing

---

## 5. Seed Initial Data (Chamoli Watershed & Villages)

To populate the database with the Chamoli pilot watershed, villages, shelters, and authority credentials:

```bash
docker compose --profile seed run --rm db-seed
```

> **Default Seeded Credentials:**
> - Authority Portal: `authority@chamoli-pilot.local` / `demo-password-123`
> - Admin Portal: `admin@chamoli-pilot.local` / `demo-password-123`

---

## 6. Obtain Let's Encrypt SSL Certificate

Make sure your DNS `pravaah.ashuttosh.me` points to this EC2's public IP. Then run the SSL initializer:

```bash
chmod +x dockerfiles/init-ssl.sh
./dockerfiles/init-ssl.sh your-email@ashuttosh.me
```

Or run Certbot manually via Docker:
```bash
docker compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot --email your-email@ashuttosh.me -d pravaah.ashuttosh.me --agree-tos --no-eff-email" certbot

# Reload Nginx to activate SSL
docker compose exec nginx nginx -s reload
```

---

## 7. Useful Management Commands

```bash
# Check service status
docker compose ps

# View live logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f api
docker compose logs -f workers
docker compose logs -f web

# Restart all services
docker compose restart

# Stop the stack
docker compose down
```
