#!/bin/bash
set -e

# Domain configuration
DOMAIN="pravaah.ashuttosh.me"
EMAIL="${1:-admin@ashuttosh.me}"
DATA_PATH="./certbot_conf"
STAGING=0 # Set to 1 if testing to avoid hitting Let's Encrypt rate limits

echo "=================================================================="
echo " PRAVAAH — Let's Encrypt SSL Initializer for $DOMAIN"
echo "=================================================================="

if [ -d "$DATA_PATH/live/$DOMAIN" ]; then
  read -p "Existing certificate found for $DOMAIN. Continue and replace? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    echo "Exiting without changes."
    exit 0
  fi
fi

# 1. Create dummy certificate if not present so Nginx can boot
echo "### Creating dummy certificate for $DOMAIN..."
mkdir -p "$DATA_PATH/live/$DOMAIN"
mkdir -p "./certbot_www"

docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:2048 -days 1\
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot

# 2. Start Nginx with dummy certificate
echo "### Starting Nginx..."
docker compose up --force-recreate -d nginx

# 3. Delete dummy certificate
echo "### Deleting dummy certificate..."
docker compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

# 4. Request real Let's Encrypt certificate
echo "### Requesting Let's Encrypt certificate for $DOMAIN..."
STAGING_ARG=""
if [ $STAGING != "0" ]; then
  STAGING_ARG="--staging"
fi

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal" certbot

# 5. Reload Nginx with real certificate
echo "### Reloading Nginx with new certificate..."
docker compose exec nginx nginx -s reload

echo "=================================================================="
echo " SSL Initialization Complete!"
echo " https://$DOMAIN is now secure and live."
echo "=================================================================="
