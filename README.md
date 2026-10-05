# ShopKart: Full-Stack E-Commerce (MERN)

A Flipkart-inspired e-commerce web application with a customer storefront and an admin panel.This is a portfolio project. It is not affiliated with Flipkart.

**Live demo:** https://shopkart-gules-kappa.vercel.app &nbsp;|&nbsp; **API:** https://shopkart-2z5d.onrender.com/api/health

> The API runs on a free tier and may take up to a minute to wake after inactivity.

## Features

**Customers**
- Register, login, logout, JWT auth; update profile and password
- Browse, search (name/brand), filter (category, brand, price, rating), sort, paginate
- Product details with image gallery, specs, stock status, similar products
- Persistent cart with stock checks; checkout with Cash on Delivery or Demo Payment
- Order history, order details, order cancellation

**Admin**
- Dashboard: users, products, orders, revenue, pending orders, recent orders, low stock
- Product CRUD, inline stock updates, active/inactive toggle; category management
- Order management with enforced status workflow (Pending → Confirmed → Processing → Shipped → Delivered, or Cancelled)
- User management (activate/deactivate customers)

**Engineering**
- REST API: routes → controllers → services → models
- Role-based authorization enforced on the server; centralized error handling
- Request validation (express-validator), rate limiting, helmet, CORS allow-list, input sanitization
- Atomic stock handling with MongoDB transactions; price snapshots on orders
- Responsive UI, skeleton loaders, empty/error states, toasts, lazy-loaded admin routes
- API integration tests (node:test + supertest)

## Tech Stack

React 19, Vite, Tailwind CSS v4, React Router, Zustand, Axios · Node.js, Express, Mongoose, JWT, bcryptjs · MongoDB Atlas

## Project Structure

```text
ecommerce/
├── client/   React app (components, pages, layouts, hooks, services, store, utils)
├── server/   Express API (config, controllers, middleware, models, routes, services, seed, tests)
├── docs/     QA checklist
└── README.md
```

## Getting Started

Requires Node 20+ and a MongoDB Atlas cluster (transactions need a replica set).

```bash
git clone https://github.com/SAIFUR-RAHMAN123/shopkart.git
cd shopkart

# API
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env, then fill in the values
npm run seed                # categories + ~100 products (imported once from DummyJSON)
npm run seed:admin          # admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                 # http://localhost:5000

# Client (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```

## Environment Variables

**server/.env**

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing tokens (32+ chars in production) |
| `CLIENT_URL` | Allowed frontend origin(s), comma-separated |
| `NODE_ENV` | `development` or `production` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by `npm run seed:admin` |

**client/.env** (production only): `VITE_API_URL=https://<api-host>/api`

## Scripts (server)

| Command | Purpose |
|---|---|
| `npm run dev` | Start with file watching |
| `npm start` | Start in production |
| `npm run seed` | Reset and seed categories and products (**wipes them**) |
| `npm run seed:admin` | Create the admin user |
| `npm test` | Run API tests (needs `server/.env.test` pointing at a `*_test` database) |

## API Overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/password` |
| Products | `GET /api/products` (search, category, brand, minPrice, maxPrice, minRating, sort, page, limit), `GET /api/products/filters`, `GET /api/products/:idOrSlug` |
| Categories | `GET /api/categories` |
| Cart | `GET/POST/DELETE /api/cart`, `PUT/DELETE /api/cart/:productId` |
| Orders | `POST /api/orders`, `GET /api/orders/my-orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/cancel` |
| Admin | `GET /api/admin/stats`, `/products`, `/orders`, `/users`; `PUT /api/admin/orders/:id/status`, `PUT /api/admin/users/:id/status` |
| Admin (write) | `POST/PUT/DELETE /api/products`, `POST/PUT/DELETE /api/categories` (admin only) |

Errors share one shape: `{ "success": false, "message": "...", "errors": [{ "field", "message" }] }`.

## Deployment

- **Frontend:** Vercel — `client`
- **Backend API:** Render — `server`
- **Database:** MongoDB Atlas

**Live demo:** https://shopkart-gules-kappa.vercel.app  
**API health:** https://shopkart-2z5d.onrender.com/api/health

The Render free-tier API may sleep after inactivity, so the first request after a period of inactivity can take longer while the service wakes up.

## Notes

- Product data and images come from DummyJSON (stable CDN URLs), imported once into MongoDB.
- Payments are simulated; no real payment gateway is integrated.
- This is a portfolio project. It is not affiliated with Flipkart.