#!/bin/bash

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/.logs"

echo "Stopping ISAAC SmartShop services..."

for service in frontend api-gateway order-service product-service user-service eureka; do
  pid_file="$LOG_DIR/$service.pid"
  if [ -f "$pid_file" ]; then
    pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" && echo "  Stopped $service (pid $pid)"
    else
      echo "  $service already stopped"
    fi
    rm -f "$pid_file"
  fi
done

# Kill any remaining Spring Boot or Next.js processes on our ports
for port in 3000 8080 8081 8082 8083 8761; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    kill $pid 2>/dev/null && echo "  Killed process on port $port"
  fi
done

echo "All services stopped."
