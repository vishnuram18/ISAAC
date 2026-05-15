# 🛒 Isaac SmartShop — Full-Stack Microservices E-Commerce Platform

A production-style microservices application built with **Java Spring Boot**, **Spring Cloud**, **Next.js 16**, and **Docker** — demonstrating distributed systems design, JWT security, service-to-service communication, and a modern glassmorphism UI.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│               Next.js 16 Frontend (App Router)           │
│         Dark Glassmorphism UI · AuthContext · TypeScript │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / REST
┌──────────────────────────▼──────────────────────────────┐
│             API Gateway  :8080  (Spring Cloud Gateway)   │
│            CORS Config · Route Rules · JWT Passthrough   │
└───────┬──────────────────┬──────────────────┬───────────┘
        │                  │                  │
┌───────▼──────┐  ┌────────▼───────┐  ┌──────▼────────┐
│ user-service │  │product-service │  │ order-service │
│    :8081     │  │    :8082       │  │    :8083      │
│ JWT · BCrypt │  │ CRUD · Stock   │  │ Feign Client  │
│ USER/SELLER  │  │ Seller Owned   │  │ Cancel/Return │
└───────┬──────┘  └────────┬───────┘  └──────┬────────┘
        │                  │       ◄──Feign───┘
┌───────▼──────┐  ┌────────▼───────┐  ┌──────▼────────┐
│smartshop_user│  │smartshop_product│  │smartshop_order│
│  MySQL 8.0   │  │   MySQL 8.0    │  │  MySQL 8.0    │
└──────────────┘  └────────────────┘  └───────────────┘

           ┌───────────────────────────┐
           │  eureka-server  :8761     │
           │  Netflix Eureka Registry  │
           └───────────────────────────┘
           (all services register here)
```

All services run in an isolated Docker Compose network. The Next.js server-side components communicate with `http://api-gateway:8080/api` (internal), while the browser calls `http://localhost:8080/api` (external).

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Java 17, Spring Boot 3, Spring Cloud (Gateway, Eureka, OpenFeign) |
| Security | Spring Security, JWT (JJWT), BCrypt password hashing |
| Database | MySQL 8.0 — 3 isolated databases (one per service) |
| Communication | REST APIs + OpenFeign (synchronous service-to-service) |
| DevOps | Docker, Docker Compose, Maven multi-module build |

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
| Buyer (USER) | Browse products, search, add to cart, place/cancel/return orders |
| Seller (SELLER) | All Buyer features + Seller Dashboard, add/edit/delete own products |

### 🛍️ Product Service

- Full product CRUD with seller ownership enforcement (server-side 403 if a seller touches another's product)
- `sellerUsername` stamped on product creation
- Stock management — stock decremented on order, restored on cancel/return
- `ROLE_SELLER` required for `POST`, `PUT`, `DELETE` on `/api/products`

### 📦 Order Service

- Place orders with automatic stock reservation
- Cancel order: `PLACED → CANCELLED` (stock restored via Feign call to product-service)
- Return order: `DELIVERED → RETURNED` (stock restored via Feign call to product-service)
- `restoreStock` endpoint on product-service called internally by order-service — no direct DB cross-access

### 🔍 Search

- Server-side product search using `GATEWAY_INTERNAL_URL=http://api-gateway:8080/api` inside Docker — avoids the localhost-vs-container hostname bug

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
├── product-service/        # Product CRUD, stock, seller ownership
├── order-service/          # Order lifecycle, Feign client
├── frontend/               # Next.js 16 App Router frontend
│   ├── app/
│   │   ├── (pages)/        # Home, Login, Register, Cart, Orders, Profile
│   │   ├── seller/         # Seller Dashboard, Add/Edit Product
│   │   └── context/        # AuthContext (global login state)
│   └── components/
│       └── Navbar.tsx      # Auth-aware navigation
└── docker-compose.yml      # Orchestrates all 6 services + 3 MySQL instances
```

---

## 🚀 Running Locally

### Prerequisites

- Docker Desktop installed and running
- Ports `8080`, `8081`, `8082`, `8083`, `8761`, `3000`, `3306` free

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
| User Service | http://localhost:8081 |
| Product Service | http://localhost:8082 |
| Order Service | http://localhost:8083 |

### Stop all services

```bash
docker compose down
```

---

## 🔑 Key Design Decisions

### 1. Database-per-service isolation
Each microservice owns its own MySQL database (`smartshop_user`, `smartshop_product`, `smartshop_order`). No service queries another's DB directly — all cross-service data goes through REST/Feign calls.

### 2. Synchronous service-to-service communication via OpenFeign
Order-service calls product-service's `restoreStock` endpoint via a Feign client when orders are cancelled or returned. This keeps stock management inside product-service's domain.

### 3. Internal vs external URL resolution
Next.js server components use `GATEWAY_INTERNAL_URL=http://api-gateway:8080/api` (Docker internal hostname). Browser-side calls use `http://localhost:8080/api`. This separation prevents the common Docker networking pitfall where server-side fetches to localhost fail inside a container.

### 4. JWT role claim → Spring Security authority
The `JwtAuthFilter` parses the role claim from the token and programmatically sets `ROLE_SELLER` or `ROLE_USER` as the granted authority. This avoids a second DB lookup on every request.

### 5. AuthContext for reactive login state
A React Context wraps the entire app. On login/logout, the context updates globally — so the Navbar reflects auth state immediately without requiring a full page reload.

---

## 📡 API Reference

### User Service :8081

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register as USER or SELLER |
| POST | `/api/auth/login` | None | Returns JWT token |
| GET | `/api/users/profile` | JWT | Get current user profile |

### Product Service :8082

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | None | List all products |
| GET | `/api/products/search?q=` | None | Search products |
| POST | `/api/products` | ROLE_SELLER | Create product |
| PUT | `/api/products/{id}` | ROLE_SELLER + owner | Update product |
| DELETE | `/api/products/{id}` | ROLE_SELLER + owner | Delete product |
| PUT | `/api/products/{id}/restoreStock` | Internal (Feign) | Restore stock on cancel/return |

### Order Service :8083

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | ROLE_USER | Place an order |
| GET | `/api/orders/my` | JWT | Get user's orders |
| PUT | `/api/orders/{id}/cancel` | JWT + owner | Cancel order (PLACED→CANCELLED) |
| PUT | `/api/orders/{id}/return` | JWT + owner | Return order (DELIVERED→RETURNED) |

---

## 🧠 What This Demonstrates

This project covers concepts commonly assessed in backend and full-stack engineering interviews:

- ✅ Microservices architecture with service discovery (Eureka)
- ✅ API Gateway pattern with centralized routing and CORS
- ✅ Stateless JWT authentication with role-based access control (RBAC)
- ✅ Database-per-service isolation (bounded context)
- ✅ Synchronous service-to-service calls (OpenFeign)
- ✅ Docker Compose orchestration of a multi-service system
- ✅ React state management with Context API
- ✅ Server vs client component distinction in Next.js App Router
- ✅ Domain-driven ownership enforcement (seller cannot modify another seller's product)
- ✅ Stock lifecycle management across distributed services

---

## 👨‍💻 Author

**Vishnuram** — [GitHub](https://github.com/vishnuram18)

Built as a portfolio project to demonstrate production-style microservices design with real-world patterns: JWT security, service isolation, Docker orchestration, and a polished frontend.