# 🎓 CampusFind — Campus Lost & Found Platform

A full-stack MERN web application that helps students report, discover, claim, and recover lost belongings within a college campus.

## 🎓 Problem Statement

Students frequently lose personal belongings such as ID cards, keys, wallets, books, and electronic devices on campus. Finding these items or returning them to their rightful owners can be difficult because information is scattered across informal communication channels, classroom groups, and notice boards.

CampusFind addresses this problem by providing a centralized platform where students can report lost or found items, search existing reports, submit ownership claims, and coordinate the return of belongings.

## 👥 Target Users

- **Students:** Report lost belongings, discover found items, and submit ownership claims.
- **Students who find belongings:** Publish found-item reports and review claims submitted by potential owners.
- **Campus administrators:** Moderate reports, manage user accounts, and help maintain a reliable platform.

## 💡 Solution

CampusFind provides a centralized, campus-specific lost-and-found system with authenticated student accounts and a structured recovery workflow.

Students can create lost or found reports with descriptions, locations, dates, and images. Search and filtering help users discover relevant reports. When someone believes an item belongs to them, they can submit a private claim containing verification details. The report owner can review the claim, approve or reject it, and confirm the physical handover when the item is returned.

In-app notifications keep users informed about claim decisions and return updates, while administrative tools support moderation and account management.


## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Local Setup](#installation--local-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Seeding Admin User](#seeding-admin-user)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT in HTTP-only cookies, `@sst.scaler.com` email domain restriction
- 📋 **Item Reports** — Create Lost & Found reports with image uploads (Cloudinary)
- 🔍 **Search & Filter** — Keyword, category, location, date range, status filters with pagination
- 📝 **Ownership Claims** — Private claim submission with verification details
- ✅ **Claim Workflow** — Review, approve/reject claims; multiple pending claimants supported
- 🔄 **Return Confirmation** — Track physical handover, close competing claims
- 🔔 **In-App Notifications** — Events for claims, approvals, rejections, returns
- 📊 **Personal Dashboard** — Overview, my reports, incoming/outgoing claims, returned items
- 🛡️ **Admin Panel** — Moderation, archive reports, manage user accounts
- 📱 **Responsive Design** — Mobile-first Tailwind CSS UI

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, Tailwind CSS v3, React Router v7, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (HTTP-only cookie) |
| Images | Cloudinary |
| Forms | react-hook-form |
| Notifications | react-hot-toast |
| Icons | lucide-react |

---

## 📦 Prerequisites

- **Node.js** v20+ ([download](https://nodejs.org))
- **npm** v9+
- **MongoDB Atlas** account and cluster URI
- **Cloudinary** account (free tier works fine)
- **Git**

---

## 🚀 Installation & Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "MERN Final END TERM PROJECT"
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

---

## 🔑 Environment Variables

### Backend — `server/.env`

Copy the example file and fill in your values:

```bash
cd server
cp .env.example .env
```

> For local development, the backend falls back to in-memory MongoDB if `MONGO_URI` is unset and local disk image storage if Cloudinary credentials are unset. Local uploads are served by the backend and proxied by Vite. These are development conveniences only: data and uploaded images may be lost when a process or host restarts. For demos and deployments, configure a persistent MongoDB URI and all three Cloudinary credentials. Production startup requires a `JWT_SECRET` of at least 32 bytes and durable Cloudinary image storage. Archived reports are available through the admin reports endpoint only, not public search.

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://<username>:<password>@<cluster>/<database>` |
| `JWT_SECRET` | Strong random secret for JWT signing (at least 32 bytes in production) | Generate a unique value; see below |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard | `123456789012345` |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard | `your_api_secret` |
| `SEED_ADMIN_PASSWORD` | Unique password (at least 12 characters) used by the seed command to create the initial admin | Set privately; never commit it |
| `CLIENT_ORIGIN` | Comma-separated frontend URLs (for CORS) | `http://localhost:3000,http://localhost:5173` |
| `NODE_ENV` | Environment | `development` |

Generate a strong JWT secret (for example, with `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`) and set it only in your environment configuration. Do not use the development fallback or commit real credentials.

### Frontend — `client/.env`

```bash
cd client
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `/api` (uses Vite proxy in dev) |

> In development, the Vite proxy forwards `/api/*` and `/uploads/*` → `http://localhost:5000` automatically, so no `VITE_API_URL` is needed locally. In production, Vercel proxies `/api/*` to the Render backend so browser requests and the `SameSite=Lax` authentication cookie remain on the frontend origin; replace the example backend URL in `client/vercel.json` with the deployed Render service URL before deploying the frontend.

---

## ▶️ Running the App

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

Keep this terminal open while using the app. If the backend exits, the Vite proxy cannot reach the API; check `http://localhost:5000/health` and restart the backend if it does not return `{"status":"ok",...}`.

**Terminal 2 — Frontend**
```bash
cd client
npm run dev
# App opens at http://localhost:3000
```

Registration requires a campus email, a name of 2–100 characters, and a password of at least 8 characters containing uppercase, lowercase, a number, and a special character.

---

## 🌱 Seeding Admin User

To create the initial admin account, configure `MONGO_URI` to the same persistent database used by the backend and set a private `SEED_ADMIN_PASSWORD` of at least 12 characters in `server/.env`. Then run:

```bash
cd server
npm run seed
```

This creates:
- **Email:** `admin@sst.scaler.com`
- **Password:** the value of `SEED_ADMIN_PASSWORD`
- **Role:** `admin`

The command refuses to run without `MONGO_URI` so it cannot accidentally seed a separate in-memory database. Re-running it synchronizes the seeded admin's password with `SEED_ADMIN_PASSWORD`, so set that variable to the desired password before each run.

---

## 📡 API Documentation

All endpoints use the `/api` prefix. Authentication uses HTTP-only JWT cookies.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new student |
| POST | `/api/auth/login` | No | Login and receive cookie |
| POST | `/api/auth/logout` | No | Clear session cookie |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Items

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/items` | Yes | Create lost/found report |
| GET | `/api/items` | No | List & search reports |
| GET | `/api/items/:id` | No | Get item details |
| PATCH | `/api/items/:id` | Yes (owner) | Update report |
| DELETE | `/api/items/:id` | Yes (owner) | Archive report |
| PATCH | `/api/items/:id/returned` | Yes (owner) | Confirm handover |

**Item list query params:** `type`, `category`, `status`, `location`, `keyword`, `dateFrom`, `dateTo`, `page`, `limit`, `sort`

### Claims

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/items/:id/claims` | Yes | Submit ownership claim |
| GET | `/api/items/:id/claims` | Yes (owner) | List claims for item |
| GET | `/api/claims/my` | Yes | My submitted claims |
| PATCH | `/api/claims/:id/review` | Yes (owner) | Approve or reject |
| PATCH | `/api/claims/:id/withdraw` | Yes (claimant) | Withdraw pending claim |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | Yes | List notifications |
| PATCH | `/api/notifications/:id/read` | Yes | Mark one as read |
| PATCH | `/api/notifications/read-all` | Yes | Mark all as read |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/reports` | Admin | All items including archived |
| GET | `/api/admin/users` | Admin | Paginated campus user directory |
| PATCH | `/api/admin/items/:id/archive` | Admin | Archive any item |
| PATCH | `/api/admin/users/:id/status` | Admin | Toggle user active status |

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": { "item": {} }
}
```

**Error:**
```json
{
  "success": false,
  "message": "You are not authorized to modify this item"
}
```

---

## 🗄️ Database Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required, max 100 chars |
| `email` | String | Unique, must be `@sst.scaler.com` |
| `passwordHash` | String | bcrypt, never returned in API |
| `role` | String | `student` (default) or `admin` |
| `isActive` | Boolean | Default true |

### Item
| Field | Type | Notes |
|---|---|---|
| `title` | String | Required, max 200 chars |
| `description` | String | Required, max 2000 chars |
| `type` | String | `lost` or `found` |
| `category` | String | One of 8 categories |
| `location` | String | Required |
| `dateOccurred` | Date | Required, not future |
| `images` | Array | `[{url, publicId}]` from Cloudinary |
| `status` | String | `open`, `resolved`, `returned`, `archived` |
| `reportedBy` | ObjectId | ref: User |
| `returnedAt` | Date | Set on handover confirmation |
| `returnedBy` | ObjectId | ref: User |

### Claim
| Field | Type | Notes |
|---|---|---|
| `item` | ObjectId | ref: Item |
| `claimant` | ObjectId | ref: User |
| `verificationDetails` | String | **Private** — select: false by default |
| `status` | String | `pending`, `approved`, `rejected`, `withdrawn`, `closed` |
| `reviewedBy` | ObjectId | ref: User |
| `reviewedAt` | Date | |
| `reviewNote` | String | Optional rejection/approval note |

### Notification
| Field | Type | Notes |
|---|---|---|
| `recipient` | ObjectId | ref: User |
| `type` | String | `claim_submitted`, `claim_approved`, `claim_rejected`, `item_returned`, `report_moderated` |
| `message` | String | Human-readable message |
| `relatedItem` | ObjectId | ref: Item |
| `relatedClaim` | ObjectId | ref: Claim |
| `isRead` | Boolean | Default false |

---

## 🚢 Deployment

## 🌐 Deployment Links

Live Application: https://campus-find-two-tau.vercel.app/

GitHub Repository: https://github.com/samanvith0108/CampusFind.git

### Backend → Render

1. Push code to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm ci`.
5. Set **Start Command** to `npm start`.
6. Set `NODE_ENV` to `production`.
7. Add a persistent MongoDB connection string as `MONGO_URI` (for example, a MongoDB Atlas URI with a database name such as `/campusfind`). Do not rely on the development in-memory database.
8. Set a randomly generated `JWT_SECRET` of at least 32 bytes.
9. Configure all three Cloudinary credentials—`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`—from the same Cloudinary account. Production startup verifies the credentials and refuses to start if authentication fails.
10. After creating the Vercel project, set `CLIENT_ORIGIN` to its exact HTTPS origin (scheme and hostname only, no path or trailing slash), then redeploy the backend.
11. Create the initial admin from a trusted machine: set `MONGO_URI` and `SEED_ADMIN_PASSWORD` locally to the production values, run `npm run seed` in the server directory, then remove `SEED_ADMIN_PASSWORD` from the hosting environment. Do not run seed on every deployment; it synchronizes the admin password each time.

### Frontend → Vercel

1. Create a new project on [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Replace the example hostname in the `/api/(.*)` rewrite in `client/vercel.json` with the deployed Render service hostname, preserving `/api/$1` at the end.
6. Set `VITE_API_URL=/api` (or leave it unset, since this is the default).
7. Redeploy after changing the rewrite or environment variables. The remaining SPA rewrite in `client/vercel.json` allows direct visits to client routes such as `/login` and `/dashboard`.

> **Important:** Keep the API rewrite ahead of the SPA fallback. This makes API calls same-origin and avoids third-party-cookie blocking. Set the Render health check path to `/health`.

Before deploying, verify the MongoDB connection, JWT secret, and Cloudinary credentials with the host's environment settings. The backend `/health` endpoint returns `503` unless MongoDB is connected, making it suitable for the Render health check path. For Cloudinary's `Invalid Signature` or `api_secret mismatch` errors, replace the API secret in the host environment with the current secret from the same Cloudinary account as the cloud name and API key, then redeploy. Do not share or commit credentials.

---

## 📁 Project Structure

```
MERN Final END TERM PROJECT/
├── client/                      # React frontend (Vite)
│   ├── src/
│   │   ├── api/                 # Axios API functions
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # AuthContext
│   │   ├── hooks/               # Custom React hooks
│   │   ├── layouts/             # Page shell (Navbar + Outlet)
│   │   ├── pages/               # Route-level page components
│   │   ├── App.jsx              # Router config
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind + global styles
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── config/              # DB, Cloudinary, seed
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/          # Auth, validate, upload, errors
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # Express routers
│   │   ├── services/            # Business logic
│   │   ├── validators/          # express-validator chains
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 👨‍💻 Development Workflow

### State Machines

**Item status:** `open` → `returned` | `archived`

**Claim status:** `pending` → `approved` | `rejected` | `withdrawn` | `closed`

### Security Checklist

- ✅ Passwords hashed with bcrypt (saltRounds=12)
- ✅ JWT in HTTP-only cookie (never accessible to JS)
- ✅ Email domain restricted to `@sst.scaler.com`
- ✅ NoSQL injection prevented via `express-mongo-sanitize`
- ✅ Rate limiting on auth (15/15min) and claim (10/15min) endpoints
- ✅ `verificationDetails` excluded from all public responses
- ✅ Ownership enforced server-side on every mutation
- ✅ Image uploads restricted to JPEG/PNG/WebP, max 5MB each
- ✅ CORS locked to `CLIENT_ORIGIN` env var
- ✅ Helmet security headers applied

---

## 📜 License

Academic project — SST Scaler End-Term Submission.
