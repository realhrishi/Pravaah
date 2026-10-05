#!/bin/bash
set -e

# Domain & Email configuration
EMAIL="${1:-aashutoshsharma2905@gmail.com}"
DOMAIN="${2:-pravaah.ashuttosh.me}"
STAGING=0 # Set to 1 if testing to avoid hitting Let's Encrypt rate limits

echo "=================================================================="
echo " Let's Encrypt SSL Initializer for $DOMAIN"
echo "=================================================================="


# Check if certificate already exists inside certbot_conf volume
if docker compose run --rm --entrypoint "sh -c 'test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem'" certbot 2>/dev/null; then
  read -p "Existing certificate found for $DOMAIN. Continue and renew/replace? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    echo "Exiting without changes."
    exit 0
  fi
fi

# 1. Create directory and dummy certificate inside volume if none exists
echo "### Ensuring SSL certificate structure exists..."
docker compose run --rm --entrypoint "\
  sh -c 'mkdir -p /etc/letsencrypt/live/$DOMAIN && \
         if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then \
           openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
             -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
             -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
             -subj /CN=localhost; \
         fi'" certbot

# 2. Ensure Nginx is running and healthy to serve HTTP-01 challenge
echo "### Starting/restarting Nginx..."
docker compose up -d nginx
sleep 3

echo "### Verifying Nginx port 80 listener..."
if ! curl -s -o /dev/null http://127.0.0.1/ 2>/dev/null; then
  echo "⚠️ Warning: Nginx did not respond locally on port 80. Checking Nginx logs:"
  docker logs --tail 25 pravaah_nginx
  echo "Please check that docker compose up -d is running properly before requesting SSL."
  exit 1
fi
echo "✅ Nginx is running on port 80."

# 3. Request real Let's Encrypt certificate
echo "### Preparing certificate lineage for Certbot..."
# Remove dummy cert directory so Certbot doesn't abort with 'live directory exists'
docker compose run --rm --entrypoint "\
  sh -c 'rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf'" certbot

echo "### Requesting Let's Encrypt certificate for $DOMAIN..."
STAGING_ARG=""
if [ "$STAGING" != "0" ]; then
  STAGING_ARG="--staging"
fi

if ! docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    -d $DOMAIN \
    --cert-name $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --non-interactive" certbot; then
  echo "⚠️ Certbot failed. Re-creating temporary fallback certificate so Nginx stays alive..."
  docker compose run --rm --entrypoint "\
    sh -c 'mkdir -p /etc/letsencrypt/live/$DOMAIN && \
           openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
             -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
             -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
             -subj /CN=localhost'" certbot
  exit 1
fi

# 4. Reload Nginx with real certificate
echo "### Reloading Nginx with new certificate..."
docker compose exec nginx nginx -s reload

echo "=================================================================="
echo " SSL Initialization Complete!"
echo " Both http://$DOMAIN and https://$DOMAIN are live."
echo "=================================================================="
