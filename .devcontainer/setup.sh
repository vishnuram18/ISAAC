#!/bin/bash
set -e

echo "=== ISAAC SmartShop: Codespaces Setup ==="

# --- Wait for MySQL to be ready ---
echo "Waiting for MySQL..."
for i in $(seq 1 30); do
  if mysqladmin ping -u root -p180618 --silent 2>/dev/null; then
    echo "MySQL is ready."
    break
  fi
  echo "  attempt $i/30..."
  sleep 3
done

# --- Create databases ---
echo "Creating databases..."
mysql -u root -p180618 <<'SQL'
CREATE DATABASE IF NOT EXISTS smartshop_user CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS smartshop_product CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS smartshop_order CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SQL
echo "Databases created: smartshop_user, smartshop_product, smartshop_order"

# --- Make Maven wrappers executable ---
echo "Setting mvnw permissions..."
find /workspaces/ISAAC -name "mvnw" -exec chmod +x {} \;

# --- Install frontend dependencies ---
echo "Installing frontend dependencies..."
cd /workspaces/ISAAC/FRONT/smartshop-ui
npm install --legacy-peer-deps
echo "Frontend dependencies installed."

echo ""
echo "=== Setup complete! ==="
echo ""
echo "To start all services, run:  bash start-all.sh"
echo "To stop all services, run:   bash stop-all.sh"
