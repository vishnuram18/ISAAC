#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/.logs"
mkdir -p "$LOG_DIR"

wait_for_port() {
  local name=$1
  local port=$2
  echo -n "  Waiting for $name on port $port"
  for i in $(seq 1 60); do
    if curl -s "http://localhost:$port" > /dev/null 2>&1 || \
       curl -s "http://localhost:$port/actuator/health" > /dev/null 2>&1; then
      echo " ✓"
      return 0
    fi
    echo -n "."
    sleep 3
  done
  echo " (timeout — check $LOG_DIR/$name.log)"
}

echo "======================================"
echo "  Starting ISAAC SmartShop"
echo "======================================"

# 1. Eureka Server
echo ""
echo "[1/5] Starting Eureka Server (port 8761)..."
cd "$ROOT/eureka-server/eureka-server"
./mvnw spring-boot:run -q > "$LOG_DIR/eureka.log" 2>&1 &
echo $! > "$LOG_DIR/eureka.pid"
wait_for_port "Eureka" 8761

# 2. User Service
echo ""
echo "[2/5] Starting User Service (port 8081)..."
cd "$ROOT/user-service/user-service"
./mvnw spring-boot:run -q > "$LOG_DIR/user-service.log" 2>&1 &
echo $! > "$LOG_DIR/user-service.pid"
wait_for_port "User Service" 8081

# 3. Product Service
echo ""
echo "[3/5] Starting Product Service (port 8082)..."
cd "$ROOT/product-service/product-service"
./mvnw spring-boot:run -q > "$LOG_DIR/product-service.log" 2>&1 &
echo $! > "$LOG_DIR/product-service.pid"
wait_for_port "Product Service" 8082

# 4. Order Service
echo ""
echo "[4/5] Starting Order Service (port 8083)..."
cd "$ROOT/order-service/order-service"
./mvnw spring-boot:run -q > "$LOG_DIR/order-service.log" 2>&1 &
echo $! > "$LOG_DIR/order-service.pid"
wait_for_port "Order Service" 8083

# 5. API Gateway
echo ""
echo "[5/5] Starting API Gateway (port 8080)..."
cd "$ROOT/api-gateway/api-gateway"
./mvnw spring-boot:run -q > "$LOG_DIR/api-gateway.log" 2>&1 &
echo $! > "$LOG_DIR/api-gateway.pid"
wait_for_port "API Gateway" 8080

# 6. Next.js Frontend
echo ""
echo "[6/6] Starting Frontend (port 3000)..."
cd "$ROOT/FRONT/smartshop-ui"
npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
echo $! > "$LOG_DIR/frontend.pid"
wait_for_port "Frontend" 3000

echo ""
echo "======================================"
echo "  All services running!"
echo "======================================"
echo "  Frontend:         http://localhost:3000"
echo "  API Gateway:      http://localhost:8080"
echo "  Eureka Dashboard: http://localhost:8761"
echo "  Logs in:          $LOG_DIR/"
echo "======================================"
echo ""
echo "Run 'bash stop-all.sh' to stop everything."
