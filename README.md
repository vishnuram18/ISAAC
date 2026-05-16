# 🛒 Isaac SmartShop — Full-Stack Microservices E-Commerce Platform

A production-style microservices application built with **Java Spring Boot**, **Spring Cloud**, **Next.js**, and **Docker** — demonstrating distributed systems design, JWT security, async event-driven communication, resilience patterns, distributed tracing, and a modern glassmorphism UI.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                Next.js Frontend (App Router)                  │
│          Dark Glassmorphism UI · AuthContext · TypeScript     │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP / REST
┌─────────────────────────▼────────────────────────────────────┐
│           API Gateway  :8080  (Spring Cloud Gateway)          │
│         CORS · Route Rules · JWT Passthrough · Tracing        │
└──────┬───────────────────┬───────────────────┬───────────────┘
       │                   │                   │
┌──────▼───────┐  ┌────────▼────────┐  ┌──────▼────────────┐
│ user-service │  │ product-service │  │   order-service   │
│    :8081     │  │     :8082       │  │      :8083        │
│ JWT · BCrypt │  │  CRUD · Stock   │  │  Circuit Breaker  │
│   Tracing    │  │  Redis Cache    │  │  Kafka Producer   │
│              │  │ Kafka Consumer  │  │  Feign → product  │
│              │  │    Tracing      │  │     Tracing       │
└──────┬───────┘  └────────┬────────┘  └──────┬────────────┘
       │                   │       ◄─Kafka─────┘
┌──────▼───────┐  ┌────────▼────────┐  ┌──────▼────────────┐
│smartshop_user│  │smartshop_product│  │  smartshop_order  │
│  MySQL 8.0   │  │   MySQL 8.0     │  │    MySQL 8.0      │
└──────────────┘  └────────────────┘  └───────────────────┘

  ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────────┐
  │ eureka   :8761  │   │  redis    :6379  │   │  kafka       :9092   │
  │ Service Reg.    │   │  L1 Cache        │   │  Topics:             │
  └─────────────────┘   └──────────────────┘   │  · order-placed      │
                                                │  · stock-restore     │
  ┌──────────────────────────────────────────── └──────────────────────┘
  │  zipkin  :9411  — Distributed Tracing (all services report here)   │
  └────────────────────────────────────────────────────────────────────┘
```

All services run in an isolated Docker Compose network. The Next.js server-side components communicate with `http://api-gateway:8080/api` (internal), while the browser calls `http://localhost:8080/api` (external).

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Java 21, Spring Boot 3, Spring Cloud (Gateway, Eureka, OpenFeign) |
| Security | Spring Security, JWT (JJWT), BCrypt password hashing |
| Database | MySQL 8.0 — 3 isolated databases (one per service) |
| Caching | Redis 7 — `@Cacheable` / `@CacheEvict` with 10-min TTL |
| Messaging | Apache Kafka — async event-driven stock operations |
| Resilience | Resilience4j — Circuit Breaker on Feign client |
| Tracing | Micrometer Tracing + Brave + Zipkin — end-to-end distributed traces |
| Sync Comms | OpenFeign (product lookup — synchronous, needs price/stock at request time) |
| DevOps | Docker, Docker Compose, Maven multi-stage builds |
| Kubernetes | Minikube-ready manifests for all 12 components (`k8s/`) |

---

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based stateless authentication with role claims (`USER` / `SELLER`)
- `JwtAuthFilter` reads the role claim and maps it to Spring Security authorities (`ROLE_USER`, `ROLE_SELLER`)
- BCrypt password hashing via Spring Security's `PasswordEncoder`
- React `AuthContext` — login/logout state syncs to Navbar instantly without a page reload
- Roles stored in `localStorage` and used client-side for conditional UI rendering

### 👤 User Roles

| Role | Capabilities |
|------|-------------|
| Buyer (USER) | Browse products, search, add to cart, place / cancel / return orders |
| Seller (SELLER) | All Buyer features + Seller Dashboard, add / edit / delete own products |

### 🛍️ Product Service

- Full product CRUD with seller ownership enforcement (server-side 403 if a seller touches another's product)
- `sellerUsername` stamped on product creation
- Stock management — stock decremented on order placed event, restored on cancel/return event
- `ROLE_SELLER` required for `POST`, `PUT`, `DELETE` on `/api/products`

### 📦 Order Service

- Place orders: synchronous Feign call to get price + validate stock, then save order and publish `order-placed` Kafka event
- Cancel order: `PLACED → CANCELLED` — publishes `stock-restore` Kafka event
- Return order: `DELIVERED → RETURNED` — publishes `stock-restore` Kafka event
- Stock mutation is fully decoupled from the HTTP response via Kafka

### ⚡ Redis Caching (product-service)

- `@Cacheable` on `getAllProducts`, `getProductById`, `getProductsBySeller`, `searchProducts`
- `@CacheEvict` / `@CachePut` on every write operation — cache stays consistent
- JSON serializer (human-readable in `redis-cli`) with 10-minute TTL
- `REDIS_HOST` env var — `localhost` for local dev, `redis` inside Docker / Kubernetes

### 🔁 Kafka Async Messaging

| Topic | Producer | Consumer | Action |
|-------|----------|----------|--------|
| `order-placed` | order-service | product-service | Reduce stock |
| `stock-restore` | order-service | product-service | Restore stock (cancel / return) |

- KRaft mode — no Zookeeper needed
- Typed `JsonSerializer` / `JsonDeserializer` with per-topic `ConcurrentKafkaListenerContainerFactory`
- Consumer catches and logs failed events rather than blocking the partition (dead-letter ready)

### 🛡️ Resilience4j Circuit Breaker (order-service)

- Wraps the `getProductById` Feign call to product-service
- Opens after 50% failure rate over a 5-call sliding window
- Returns HTTP 503 with a clear message when the circuit is open (vs 502 when the call fails)
- Auto-transitions to half-open after 10 seconds; closes after 3 successful probe calls

### 📊 Zipkin Distributed Tracing

- All four services (`api-gateway`, `user-service`, `product-service`, `order-service`) report spans
- HTTP trace context propagated automatically by Brave across Feign and Gateway hops
- Kafka producer/consumer observations enabled — traces span HTTP + async Kafka legs
- 100% sampling rate in development (`management.tracing.sampling.probability=1.0`)
- Visit **http://localhost:9411** to see full request traces across services

### 🔍 Search

- Server-side product search using `GATEWAY_INTERNAL_URL=http://api-gateway:8080/api` inside Docker — avoids the localhost-vs-container hostname bug
- Search results cached per query term in Redis

### 🎨 Frontend UI

- Deep navy gradient background with glowing orbs and backdrop-blur glassmorphism cards
- Fully responsive dark UI built with Tailwind CSS v4
- Pages: Home (product grid), Login, Register, Cart, Orders, Profile, Seller Dashboard, Add/Edit Product

---

## 📁 Project Structure

```
ISAAC/
├── eureka-server/          # Netflix Eureka service registry
├── api-gateway/            # Spring Cloud Gateway — entry point for all traffic
├── user-service/           # Auth, JWT issuance, user management
├── product-service/        # Product CRUD, Redis cache, Kafka consumer (stock)
├── order-service/          # Order lifecycle, Feign client, Kafka producer, circuit breaker
├── FRONT/smartshop-ui/     # Next.js App Router frontend
│   ├── app/
│   │   ├── (pages)/        # Home, Login, Register, Cart, Orders, Profile
│   │   ├── seller/         # Seller Dashboard, Add/Edit Product
│   │   └── context/        # AuthContext (global login state)
│   └── components/
│       └── Navbar.tsx      # Auth-aware navigation
├── docker/
│   └── init.sql            # Creates 3 MySQL databases on first start
├── k8s/                    # Kubernetes manifests (Minikube-ready)
│   ├── namespace.yaml
│   ├── secret.yaml
│   ├── mysql.yaml          # PVC + Deployment + Service + init ConfigMap
│   ├── redis.yaml
│   ├── kafka.yaml
│   ├── zipkin.yaml
│   ├── eureka.yaml
│   ├── user-service.yaml
│   ├── product-service.yaml
│   ├── order-service.yaml
│   ├── api-gateway.yaml    # NodePort :30080
│   └── frontend.yaml       # NodePort :30000
└── docker-compose.yml      # Orchestrates all 10 services
```

---

## 🚀 Running Locally

### Prerequisites

- Docker Desktop installed and running
- Ports `3000`, `8080`–`8083`, `8761`, `6379`, `9094`, `9411` free

### Start everything with one command

```bash
git clone https://github.com/vishnuram18/ISAAC.git
cd ISAAC
docker compose up --build -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| Zipkin Tracing | http://localhost:9411 |
| User Service | http://localhost:8081 |
| Product Service | http://localhost:8082 |
| Order Service | http://localhost:8083 |

### Stop all services

```bash
docker compose down          # keep data
docker compose down -v       # wipe MySQL volume too
```

---

## ☸️ Kubernetes (Minikube)

```bash
# 1. Start Minikube
minikube start --cpus=2 --memory=6144

# 2. Point Docker CLI at Minikube's daemon
& minikube -p minikube docker-env --shell powershell | Invoke-Expression  # PowerShell
# eval $(minikube docker-env)                                              # bash/zsh

# 3. Build app images into Minikube's daemon
docker build -t smartshop/eureka-server:latest  ./eureka-server/eureka-server
docker build -t smartshop/user-service:latest   ./user-service/user-service
docker build -t smartshop/product-service:latest ./product-service/product-service
docker build -t smartshop/order-service:latest  ./order-service/order-service
docker build -t smartshop/api-gateway:latest    ./api-gateway/api-gateway
docker build -t smartshop/frontend:latest \
  --build-arg NEXT_PUBLIC_GATEWAY_URL=http://localhost:30080/api \
  ./FRONT/smartshop-ui

# 4. Deploy
kubectl apply -f k8s/
kubectl get pods -n smartshop -w

# 5. Access (run minikube tunnel in a separate terminal)
minikube tunnel
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:30000 |
| API Gateway | http://localhost:30080 |
| Eureka Dashboard | http://localhost:30761 |
| Zipkin Tracing | http://localhost:30411 |

---

## 🔑 Key Design Decisions

### 1. Database-per-service isolation
Each microservice owns its own MySQL database (`smartshop_user`, `smartshop_product`, `smartshop_order`). No service queries another's DB directly — all cross-service data goes through REST or Kafka events.

### 2. Hybrid sync/async communication
`getProductById` stays synchronous (Feign) because the price and current stock level are needed *before* accepting the order — you can't compute a total or validate availability without them. Stock *mutation* (reduce / restore) is async via Kafka. This keeps the happy path fast while decoupling the write side.

### 3. Redis caching at the service layer
Caching is applied in `ProductService`, not the controller, so it covers all callers including the Kafka consumer. `@CacheEvict` on every write ensures the cache never serves stale data. JSON serialization means cached values are human-readable in `redis-cli monitor`.

### 4. Circuit breaker only on the sync Feign call
Resilience4j wraps `getProductById` — the one remaining synchronous dependency. The circuit breaker fails fast with 503 when product-service is down, preventing thread exhaustion in order-service. Stock events (reduce/restore) are no longer Feign calls, so they don't need a circuit breaker — if product-service is down, the Kafka event waits and is consumed on recovery.

### 5. Kafka consumer error handling
Consumers catch exceptions and log them rather than letting them propagate. An unhandled exception in a Kafka consumer causes the message to be retried, which is correct for transient errors but will loop forever on "product not found" or "insufficient stock." Catching and discarding is safe here; in production these would route to a dead-letter topic.

### 6. Internal vs external URL resolution
Next.js server components use `GATEWAY_INTERNAL_URL=http://api-gateway:8080/api` (Docker internal hostname). Browser-side calls use `http://localhost:8080/api`. This separation prevents the common Docker networking pitfall where server-side fetches to localhost fail inside a container.

### 7. JWT role claim → Spring Security authority
The `JwtAuthFilter` parses the role claim from the token and programmatically sets `ROLE_SELLER` or `ROLE_USER` as the granted authority. This avoids a second DB lookup on every request.

### 8. Zipkin sampling at 100% in development
`management.tracing.sampling.probability=1.0` traces every request. This is intentional for development — you can see every trace without triggering the problem multiple times. Reduce to `0.1` in production to limit the network overhead of shipping spans.

---

## 📡 API Reference

### User Service :8081

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | None | Register as USER or SELLER |
| POST | `/api/users/login` | None | Returns JWT token |
| GET | `/api/users/profile` | JWT | Get current user profile |

### Product Service :8082

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products/all` | None | List all products (cached) |
| GET | `/api/products/{id}` | None | Get product by ID (cached) |
| GET | `/api/products/search?q=` | None | Search products (cached) |
| GET | `/api/products/my` | ROLE_SELLER | Get seller's own products (cached) |
| POST | `/api/products/add` | ROLE_SELLER | Create product |
| PUT | `/api/products/{id}` | ROLE_SELLER + owner | Update product |
| DELETE | `/api/products/{id}` | ROLE_SELLER + owner | Delete product |
| PUT | `/api/products/{id}/reduce-stock` | Internal (Kafka consumer) | Reduce stock on order placed |
| PUT | `/api/products/{id}/restore-stock` | Internal (Kafka consumer) | Restore stock on cancel/return |

### Order Service :8083

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders/place` | JWT | Place an order |
| GET | `/api/orders/my` | JWT | Get user's orders |
| GET | `/api/orders/{id}` | JWT + owner | Get order by ID |
| PUT | `/api/orders/{id}/cancel` | JWT + owner | Cancel order (PLACED → CANCELLED) |
| PUT | `/api/orders/{id}/return` | JWT + owner | Return order (DELIVERED → RETURNED) |

---

## 🧠 What This Demonstrates

This project covers concepts commonly assessed in backend and full-stack engineering interviews:

- ✅ Microservices architecture with service discovery (Eureka)
- ✅ API Gateway pattern with centralized routing and CORS
- ✅ Stateless JWT authentication with role-based access control (RBAC)
- ✅ Database-per-service isolation (bounded context)
- ✅ Synchronous service-to-service calls (OpenFeign)
- ✅ Async event-driven communication (Apache Kafka)
- ✅ Redis caching with automatic cache invalidation
- ✅ Resilience patterns — circuit breaker with fallback (Resilience4j)
- ✅ Distributed tracing across all services (Micrometer + Zipkin)
- ✅ Docker Compose orchestration of a 10-service system
- ✅ Kubernetes manifests — Deployments, Services, Secrets, PVC, ConfigMap
- ✅ React state management with Context API
- ✅ Server vs client component distinction in Next.js App Router
- ✅ Domain-driven ownership enforcement (seller cannot modify another seller's product)
- ✅ Stock lifecycle management across distributed services

---

## 👨‍💻 Author

**Vishnuram** — [GitHub](https://github.com/vishnuram18)

Built as a portfolio project to demonstrate production-style microservices design with real-world patterns: JWT security, async messaging, resilience, distributed tracing, Redis caching, Docker orchestration, and Kubernetes deployment.
