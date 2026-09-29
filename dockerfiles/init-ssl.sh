#!/bin/bash
set -e

# Domain configuration
DOMAIN="pravaah.ashuttosh.me"
EMAIL="${1:-admin@ashuttosh.me}"
STAGING=0 # Set to 1 if testing to avoid hitting Let's Encrypt rate limits

echo "=================================================================="
echo " PRAVAAH — Let's Encrypt SSL Initializer for $DOMAIN"
echo "=================================================================="

# Check if certificate already exists inside certbot_conf volume
if docker compose run --rm --entrypoint "sh -c 'test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem'" certbot 2>/dev/null; then
  read -p "Existing certificate found for $DOMAIN. Continue and renew/replace? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    echo "Exiting without changes."
    exit 0
  fi
fi

# 1. Create directory and dummy certificate inside volume so Nginx can start
echo "### Creating initial certificate for $DOMAIN inside volume..."
docker compose run --rm --entrypoint "\
  sh -c 'mkdir -p /etc/letsencrypt/live/$DOMAIN && \
         openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
         -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
         -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
         -subj /CN=localhost'" certbot

# 2. Start Nginx to serve the HTTP-01 ACME challenge
echo "### Starting Nginx..."
docker compose up -d nginx
sleep 3

if ! curl -s -o /dev/null http://127.0.0.1/ 2>/dev/null; then
  echo "⚠️ Warning: Nginx is not responding on http://127.0.0.1/. Checking logs:"
  docker logs --tail 20 pravaah_nginx
fi

# 3. Request real Let's Encrypt certificate
echo "### Requesting Let's Encrypt certificate for $DOMAIN..."
STAGING_ARG=""
if [ "$STAGING" != "0" ]; then
  STAGING_ARG="--staging"
fi

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --non-interactive \
    --force-renewal" certbot

# 4. Reload Nginx with real certificate
echo "### Reloading Nginx with new certificate..."
docker compose exec nginx nginx -s reload

echo "=================================================================="
echo " SSL Initialization Complete!"
echo " https://$DOMAIN is now secure and live."
echo "=================================================================="
