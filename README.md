<div align="center">

# 📸 Framora

### *Every frame has a story.*

**Framora** is a full-stack photography community and **1-of-1 digital photography marketplace** where photographers can share their work, connect with other creators, and sell individual photographs as one-of-one unique digital assets.



</div>

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend** | https://framora-sigma.vercel.app |
| **Backend API** | https://framora-backend-dy5b.onrender.com |
| **GitHub Repository** | https://github.com/Atharva-0707/Framora |

> The frontend (Vercel) and backend (Render) are deployed as independent services. The React/Vite frontend communicates with the Node.js/Express backend through REST APIs and Socket.IO.

### 🔑 Quick Access Demo Accounts

Try Framora instantly without registering. Password for all accounts: **`password123`**

| Account | Email | Role |
|---|---|---|
| Elena Rodriguez | elena@framora.art | Photographer |
| Kai Takahashi | kai@framora.art | Photographer |
| Maya Chen | maya@framora.art | Photographer |
| Marcus Vance | marcus@framora.art | Admin |

---

## 📷 Screenshots

### 🏠 Home / Feed

<img width="2880" alt="Framora Home Feed" src="https://github.com/user-attachments/assets/c85153f2-0829-4d4f-aa41-7031614fea45" />

<img width="2880" alt="Framora Feed Scroll" src="https://github.com/user-attachments/assets/bad15024-f2bd-43ac-bca2-1ddc1694b087" />

### 📸 Photo Details

<img width="2880" alt="Photo Detail View" src="https://github.com/user-attachments/assets/b9de440c-d63e-4f6b-a4da-4e356c4ace09" />

### 👤 Photographer Profile

<img width="2880" alt="Photographer Profile Page" src="https://github.com/user-attachments/assets/ac4c96be-1a1f-45d8-bc63-b98548c02ff3" />

### 🛒 Marketplace

<img width="2880" alt="Marketplace Listing" src="https://github.com/user-attachments/assets/dcd12675-c1a8-46d6-b928-77be39117f4b" />

<img width="2880" alt="Marketplace Photo for Sale" src="https://github.com/user-attachments/assets/cc9f51c3-e423-4e3b-995c-aa61e10e9c1d" />

### 💳 Purchase / Checkout

<img width="2880" alt="Purchase Initiation" src="https://github.com/user-attachments/assets/08ecaab5-82c0-4b4e-a6f1-1f947a8a48a0" />

<img width="2880" alt="Razorpay Checkout" src="https://github.com/user-attachments/assets/9079da5b-8f07-4795-a827-7a5347d840fb" />

<img width="2880" alt="Purchase Complete" src="https://github.com/user-attachments/assets/4a60a7a0-2dd1-4249-b81c-4da4d3eed297" />

<img width="2880" alt="Digital Asset Download" src="https://github.com/user-attachments/assets/873e931b-381e-4c47-b1f5-f3faae2a8c50" />

### 📊 Purchases & Sales

<img width="2880" alt="Purchase History" src="https://github.com/user-attachments/assets/05bf1b86-98c5-44a8-8434-c57914459dad" />

### 💬 Real-Time Comments

<img width="2880" alt="Real-Time Comments Section" src="https://github.com/user-attachments/assets/4ab7fceb-ae22-4e71-8856-74f2baf18712" />

### 🔐 Sign Up & Login

<img width="2880" alt="Registration Page" src="https://github.com/user-attachments/assets/82cc81c4-7252-43b0-bc42-a0b3d315eaf8" />

<img width="2880" alt="Login Page with Quick Access" src="https://github.com/user-attachments/assets/508f94e6-d621-4613-b96f-dd4eadbd22d3" />

---

## ✨ Features

### 👤 Authentication & User Management

- User registration and login
- JWT-based stateless authentication
- Secure bcrypt password hashing
- Protected API routes with JWT middleware
- Authenticated Socket.IO connections via handshake JWT
- Role-aware authorization (`user` / `admin`)
- Full photographer profiles with bio, location, website, and cover image

### 📸 Photography Community

- Upload and manage photographs with EXIF/camera metadata
- Photographer profiles with follower and following counts
- Infinite-scroll community feed
- Full-text search across photographs and users
- Like and unlike photographs
- Bookmark and unbookmark photographs
- Detailed photograph view with EXIF information
- Comment on photographs
- Authorized comment deletion (owner or admin only)

### ⚡ Real-Time Features

- Real-time comments powered by Socket.IO
- Post-specific Socket.IO rooms (users only receive events for the photo they are viewing)
- JWT authentication during the socket handshake
- Automatic reconnection with exponential backoff
- Real-time comment creation and deletion events
- Real-time `photo:sold` marketplace state broadcasts
- Client-side event deduplication to prevent duplicate renders

### 🛒 1-of-1 Digital Marketplace

- Photographers can list any photograph for sale with a custom INR price
- Seller-controlled pricing and listing management
- Photographs follow a strict `NOT_FOR_SALE → FOR_SALE → SOLD` lifecycle
- Every photograph can only ever be sold once — enforced atomically at the database layer
- Owner-only marketplace controls (admins cannot override another creator's listing)
- Complete purchase history for buyers
- Complete sales history for sellers
- Authorized high-resolution digital asset download for verified buyers

### 💳 Razorpay Payments

- Razorpay **TEST MODE** integration (safe for demos and portfolio reviewers)
- Server-side Razorpay order creation — the client never sets the price
- Razorpay Checkout UI embedded directly in the app
- HMAC SHA-256 payment signature verification on the server
- Server-side amount validation against the locked order price
- Full payment ↔ purchase ↔ photograph integrity checks
- Idempotent payment verification (safe to re-submit)
- No Razorpay webhook dependency

### ☁️ Cloudinary Image Management

- Cloudinary-based image storage and CDN delivery
- Automatic image optimization (quality, format, dimension transformations)
- Public preview URLs with constrained resolution for feed and profile views
- High-resolution authorized download flow restricted to verified buyers

### 🔐 Security & Data Integrity

- JWT authentication on all protected endpoints
- bcrypt password hashing (salt rounds enforced)
- Strict owner-based authorization for marketplace operations
- Production CORS allowlisting — no wildcard `*`
- Production environment fail-fast validation on startup
- Server-side price authority — the backend controls the transaction amount
- Atomic 1-of-1 purchase protection via MongoDB `findOneAndUpdate` with conditional filter
- MongoDB transaction-based purchase finalization (`PAID` + `SOLD` in a single ACID transaction)
- Idempotent payment handling — no double-charge risk on retry

---

## 🧰 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js 18 | UI rendering and component architecture |
| Vite 6 | Build tooling, hot reload, and development proxy |
| JavaScript (ES2023) | Application logic |
| CSS (Vanilla) | Styling and animations |
| React Router v6 | Client-side routing |
| Axios | HTTP API client with interceptors |
| Socket.IO Client | Real-time communication |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | NoSQL document database |
| Mongoose | ODM with schema validation |
| Socket.IO | Real-time WebSocket server |
| jsonwebtoken | JWT generation and validation |
| bcryptjs | Password hashing |
| Cloudinary SDK | Image upload and delivery |
| Multer | Multipart file upload middleware |
| Razorpay Node SDK | Payment order creation and verification |
| cors | Production-safe CORS middleware |
| morgan | HTTP request logging |

### Infrastructure & Tooling

| Tool | Purpose |
|---|---|
| Vercel | Frontend hosting with CDN |
| Render | Backend hosting (Web Service) |
| MongoDB Atlas | Managed cloud database |
| Cloudinary | Image storage and CDN |
| Razorpay | Payment gateway (TEST MODE) |
| Git + GitHub | Version control and repository |
| Postman | API testing and documentation |
| Node.js test suite | Automated backend test coverage |

---

## 🏗️ System Architecture

Framora uses a **separately deployed frontend and backend architecture**:

```text
                          ┌──────────────────────┐
                          │      User Browser    │
                          └──────────┬───────────┘
                                     │
                          HTTPS REST API + WebSocket
                                     │
               ┌─────────────────────┴──────────────────────┐
               │                                            │
               ▼                                            ▼
  ┌────────────────────────┐              ┌────────────────────────┐
  │   React + Vite         │              │   Node.js + Express    │
  │   Frontend             │              │   Backend + Socket.IO  │
  │   (Vercel)             │              │   (Render)             │
  └────────────────────────┘              └───────────┬────────────┘
                                                      │
                    ┌─────────────────────────────────┼──────────────────────┐
                    │                                 │                      │
                    ▼                                 ▼                      ▼
         ┌──────────────────┐             ┌──────────────────┐   ┌──────────────────┐
         │  MongoDB Atlas   │             │   Cloudinary     │   │    Razorpay      │
         │  Database        │             │   Images + CDN   │   │    Payments      │
         └──────────────────┘             └──────────────────┘   └──────────────────┘
```

### Architecture Responsibilities

**Frontend (Vercel)**
- UI rendering and component logic
- Client-side routing with React Router
- REST API communication via Axios
- JWT authentication state management
- Marketplace and purchase UI
- Razorpay Checkout integration
- Socket.IO client for real-time events

**Backend (Render)**
- JWT authentication and authorization
- RESTful API endpoints
- Business logic and validation
- Marketplace state management
- Atomic purchase finalization
- Payment signature verification
- Cloudinary image upload and URL generation
- MongoDB operations and transactions
- Socket.IO server and room management

**MongoDB Atlas** — Users, Posts, Comments, Purchases, Bookmarks, Likes

**Cloudinary** — Image storage, CDN delivery, preview transformations

**Razorpay** — Payment order creation, checkout, HMAC signature verification

---

## 📁 Project Structure

```text
Framora/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                  # MongoDB connection (Atlas + in-memory fallback)
│   │   │   ├── cloudinary.js          # Cloudinary SDK configuration
│   │   │   ├── envValidator.js        # Production environment fail-fast check
│   │   │   └── socket.js             # Socket.IO server initialization and CORS
│   │   ├── controllers/
│   │   │   ├── authController.js      # Register, login, get-me
│   │   │   ├── postController.js      # Feed, upload, like, bookmark, download
│   │   │   ├── userController.js      # Profile, follow, settings
│   │   │   ├── commentController.js   # Create, list, delete comments
│   │   │   └── purchaseController.js  # Razorpay order creation and verification
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js      # JWT verification middleware
│   │   │   └── errorMiddleware.js     # Centralized error handling
│   │   ├── models/
│   │   │   ├── User.js                # User schema with bcrypt pre-save hook
│   │   │   ├── Post.js                # Photo/post schema with marketplace fields
│   │   │   ├── Comment.js             # Comment schema
│   │   │   └── Purchase.js            # Purchase schema with Razorpay fields
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   └── purchaseRoutes.js
│   │   ├── services/
│   │   │   └── cloudinaryService.js   # Upload helpers and URL transformations
│   │   └── utils/
│   │       ├── generateToken.js       # JWT generation utility
│   │       └── seedData.js            # Idempotent demo user and post seeder
│   │
│   ├── server.js                      # App entry point
│   ├── test_suite.js                  # Automated production test suite (71 tests)
│   ├── .env.example                   # Backend environment variable template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global authentication state
│   │   ├── pages/                     # Route-level page components
│   │   ├── services/
│   │   │   ├── api.js                 # Axios instance with auth interceptors
│   │   │   ├── authService.js         # Auth API calls
│   │   │   └── socket.js             # Socket.IO client management
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json                    # SPA rewrite rule for React Router
│   ├── vite.config.js                 # Vite config with development API proxy
│   ├── .env.example                   # Frontend environment variable template
│   └── package.json
│
├── postman/
│   └── Framora_Postman_Collection.json
│
├── vercel.json                        # Root-level SPA rewrite (Vercel fallback)
├── .gitignore
├── package.json                       # Root scripts: dev, server, client, test
└── README.md
```

---

## 🔄 Core Application Flows

### 🔐 Authentication Flow

```text
User
  ↓
Register / Login (email + password)
  ↓
Backend validates credentials
  ↓
bcrypt.compare() password verification
  ↓
JWT signed with JWT_SECRET (30-day expiry)
  ↓
Token returned to frontend
  ↓
AuthContext stores user + token in localStorage
  ↓
Axios interceptor attaches: Authorization: Bearer <token>
  ↓
Backend JWT middleware validates on every protected request
```

### 📤 Photo Upload Flow

```text
Photographer selects photo + metadata
          ↓
React Frontend (multipart/form-data)
          ↓
Express Backend (Multer middleware)
          ↓
Cloudinary upload with folder: framora/posts/
          ↓
Cloudinary returns public_id + secure URL
          ↓
MongoDB stores Post document (imageUrl, imagePublicId, EXIF data, saleStatus)
          ↓
Photo appears in community feed
```

### 💬 Real-Time Comment Flow

```text
User posts a comment on Photo X
          ↓
POST /api/comments/:postId (JWT authenticated)
          ↓
Backend validates + saves Comment to MongoDB
          ↓
Socket.IO emits: comment:created → room: post-<postId>
          ↓
All browsers viewing Photo X receive the update instantly
          ↓
UI appends new comment without a page reload
```

Real-time Socket.IO events:

| Event | Direction | Description |
|---|---|---|
| `comment:created` | Server → Client | New comment posted on a photo |
| `comment:deleted` | Server → Client | Comment removed from a photo |
| `photo:sold` | Server → Client | Marketplace status changed to SOLD |

Socket connections authenticate via JWT during the WebSocket handshake. Unauthenticated connections are allowed for read-only browsing.

---

## 🛒 1-of-1 Marketplace

Every photograph on Framora can only ever be sold **once**. This is enforced at the database layer, not the frontend.

### Photograph Lifecycle

```text
NOT_FOR_SALE ──→ FOR_SALE ──→ SOLD
```

- **NOT_FOR_SALE** — Default state. Not visible in the marketplace.
- **FOR_SALE** — Listed with a seller-set INR price. Any authenticated user can purchase.
- **SOLD** — Permanently finalized. Cannot be re-listed or purchased again.

### ⚡ Atomic Purchase Protection

When two buyers attempt to purchase the same photograph simultaneously, only one transaction succeeds. The backend uses a conditional `findOneAndUpdate` with `saleStatus: 'FOR_SALE'` as the atomic filter — the second concurrent request receives an HTTP 409 Conflict.

```text
Buyer A ──┐
           ├──→ findOneAndUpdate({ saleStatus: 'FOR_SALE' })
Buyer B ──┘             │
                 ┌──────┴──────┐
                 ▼             ▼
           Buyer A wins   Buyer B gets
           (SOLD)         409 Conflict
```

---

## 💳 Razorpay Payment Flow

Framora uses **Razorpay TEST MODE** — no real money is charged.

```text
Buyer clicks "Buy Now" on a FOR_SALE photograph
          ↓
Backend creates a Razorpay order (amount locked server-side in paise)
          ↓
Frontend opens Razorpay Checkout modal
          ↓
Buyer enters test card details and completes payment
          ↓
Razorpay returns: razorpay_order_id, razorpay_payment_id, razorpay_signature
          ↓
Frontend sends all three to: POST /api/purchases/verify
          ↓
Backend verifies HMAC SHA-256 signature
          ↓
Backend validates:
   • Authenticated buyer matches purchase buyer
   • Purchase exists and belongs to the correct post
   • Razorpay order ID matches the locked order
   • Amount matches the locked order amount
   • Currency is INR
          ↓
MongoDB ACID transaction:
   • Purchase.status → PAID
   • Post.saleStatus → SOLD, Post.soldTo → buyer
          ↓
Socket.IO emits photo:sold to all viewers of the post
          ↓
Buyer can now access the authorized high-resolution download
```

### Payment Security

- Prices are set by the backend when the order is created — the client cannot inflate or deflate the amount.
- Signatures are verified with `crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)`.
- A valid Razorpay payment cannot be replayed against a different photograph.
- Re-submitting a completed payment returns an idempotent success response without double-charging.
- Razorpay webhooks are not used.

### Test Card Details

Use Razorpay's [test card details](https://razorpay.com/docs/payments/payments/test-card-upi-details/) during checkout. Example:

| Field | Value |
|---|---|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `1234` |

---

## 🖼️ Digital Asset Access

Framora uses a two-tier image delivery system:

| Tier | Audience | Resolution | How |
|---|---|---|---|
| **Preview URL** | Everyone (public) | Constrained (max 1600px wide, optimized quality) | Cloudinary transformation in the `imageUrl` field |
| **Master Download** | Verified buyers + original photographer only | Full original resolution | Protected endpoint that generates a signed download URL after authorization |

The protected download endpoint (`GET /api/posts/:id/download`) verifies:
1. User is authenticated (valid JWT)
2. User is either the original photographer **or** has a `PAID` Purchase record for this post
3. Generates a Cloudinary download URL on successful authorization

---

## 🔐 Security

### Authentication
- JWT signed with `JWT_SECRET` (never hard-coded, loaded from environment)
- bcrypt password hashing with salt rounds
- Protected REST endpoints via `authMiddleware`
- Authenticated Socket.IO handshakes with JWT

### Authorization
- Owner-based marketplace controls — only the photographer can list/delist their own photo
- Admins cannot override another creator's listing
- Buyer authorization enforced before download access is granted
- Role-aware middleware for admin-only operations

### Payment Security
- HMAC SHA-256 Razorpay signature verification
- Server-side order amount authority
- Buyer, post, order, and amount cross-validation
- Idempotent payment verification endpoint

### API Security
- Production CORS allowlisting — only the exact Vercel domain is permitted in production
- `credentials: true` with specific allowed headers (`Authorization`, `Content-Type`)
- Preflight `OPTIONS` requests handled before authentication middleware runs
- All secrets stored in environment variables — never committed to Git
- Production environment fail-fast validation (server exits immediately if required vars are missing)
- Centralized error handler with stack-trace suppression in production

---

## 🗄️ Database Design

MongoDB is used through Mongoose with explicit schema validation and indexes.

### Core Models

| Model | Key Fields |
|---|---|
| `User` | `username`, `email`, `password` (hashed), `role`, `followers`, `following`, `bookmarks` |
| `Post` | `user`, `imageUrl`, `imagePublicId`, `saleStatus`, `price`, `soldTo`, EXIF fields |
| `Comment` | `post`, `user`, `text`, `createdAt` |
| `Purchase` | `post`, `buyer`, `seller`, `amount`, `razorpayOrderId`, `razorpayPaymentId`, `status` |

### Marketplace Relationships

```text
Post (FOR_SALE)
     │
     ├── soldTo ──────→ User (Buyer)
     └── user ────────→ User (Seller)

Purchase
     ├── post ─────────→ Post
     ├── buyer ────────→ User
     ├── seller ───────→ User
     └── status: PAID / CREATED / FAILED
```

### Indexes

Indexes are defined on frequently queried fields including `buyer`, `seller`, `post`, `email`, `username`, and `createdAt` (descending for feed pagination).

---

## 🧪 Testing

Framora includes an automated backend test suite with **71 tests across 15 sections**.

### Run the Test Suite

```bash
npm test
```

### Current Result

```
====================================================
🧪 FRAMORA AUTOMATED PRODUCTION TEST SUITE
====================================================

Test Execution Summary: 71 Passed, 0 Failed
====================================================
```

### Test Coverage

| Section | What Is Tested |
|---|---|
| 1. JWT Authentication | Token generation, decoding, tampered JWT rejection, wrong-secret rejection |
| 2. Ownership Authorization | Owner vs admin vs non-owner access to sale settings |
| 3. Marketplace State Transitions | NOT_FOR_SALE → FOR_SALE → SOLD; invalid status rejection |
| 4. 1-of-1 Concurrency Protection | Two concurrent buyers; only one succeeds; atomic 409 for the second |
| 5. Razorpay HMAC Verification | Valid signature verification |
| 6. Invalid Signature Rejection | Tampered hex, mismatched order ID, empty signature |
| 7. Payment Integrity | Buyer, post, and order cross-validation; 403/400 for mismatches |
| 8. Price Race Condition | Locked order price survives seller price update |
| 9. Transaction Safety & Idempotency | PAID + SOLD atomic transition; repeat call returns idempotent success |
| 10. Digital Asset Protection | Preview vs master URLs; unauthorized 403; buyer/creator access |
| 11. Production CORS | Vercel origin allowed; localhost rejected in production; no-origin allowed |
| 12. Environment Validation | Complete env passes; missing secret triggers fast-fail |
| 13. Unauthorized Modifications | SOLD photo re-list rejected; non-owner modification rejected |
| 14. Socket.IO Auth Guard | Valid JWT authenticated; invalid token falls back gracefully; guest allowed |
| 15. Demo Account Seeding | All 4 demo users created, passwords verified, JWT valid; idempotency confirmed |

---

## 🚀 Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account **or** local MongoDB (the backend falls back to an in-memory MongoDB instance automatically if no `MONGODB_URI` is set)
- A [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A [Razorpay](https://razorpay.com/) account (TEST MODE keys — free)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Atharva-0707/Framora.git
cd Framora
```

### 2. Install All Dependencies

```bash
npm run install:all
```

This installs dependencies for the root, backend, and frontend in one command.

### 3. Configure Backend Environment Variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5050

# MongoDB Atlas connection string
# Leave blank to use the automatic in-memory MongoDB fallback (no installation needed)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/framora?retryWrites=true&w=majority

# JWT — use any long random string for development
JWT_SECRET=your_strong_jwt_secret_here
JWT_EXPIRE=30d

# Allowed frontend origin for CORS
CLIENT_URL=http://localhost:5173

# Cloudinary (required for photo uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay TEST MODE keys (required for marketplace checkout)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Configure Frontend Environment Variables

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
# For local development — uses the Vite dev proxy defined in vite.config.js
VITE_API_URL=/api
```

> In local development, `/api` is automatically proxied to `http://localhost:5050` by Vite — no CORS issues.

### 5. Start the Development Servers

```bash
npm run dev
```

This starts both servers concurrently with colour-coded output:

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:5050 |

### Individual Servers

```bash
# Backend only (with nodemon hot-reload)
npm run server

# Frontend only (Vite dev server)
npm run client
```

### Demo Data

Demo users and seed posts are seeded **automatically on every backend startup**. The seeder is idempotent — it checks whether each demo user already exists before creating anything.

> If you connect to MongoDB Atlas and the demo data is missing, the seeder creates it. If the demo data already exists but passwords are incorrect, the seeder repairs them.

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Defaults to `5050`; Render overrides this automatically |
| `MONGODB_URI` | Recommended | MongoDB Atlas connection string. Falls back to in-memory MongoDB in development |
| `JWT_SECRET` | Yes | Secret for signing JWTs — use a long random string in production |
| `JWT_EXPIRE` | No | Token lifetime (default: `30d`) |
| `CLIENT_URL` | Yes | Allowed CORS origin — e.g. `http://localhost:5173` (dev) or `https://framora-sigma.vercel.app` (prod) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Yes | Razorpay Key ID (prefix: `rzp_test_` for TEST MODE) |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay Key Secret |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | API base URL. Defaults to `/api` (Vite proxy in development). Set to `https://framora-backend-dy5b.onrender.com/api` in Vercel for production |

---

## 🌍 Production Deployment

### Architecture

```text
                     ┌──────────────────────┐
                     │      User Browser    │
                     └──────────┬───────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │  React + Vite        │
                     │  (Vercel CDN)        │
                     │  framora-sigma       │
                     │  .vercel.app         │
                     └──────────┬───────────┘
                                │
                     HTTPS + WebSocket (wss://)
                                │
                                ▼
                     ┌──────────────────────┐
                     │  Node.js + Express   │
                     │  + Socket.IO         │
                     │  (Render Web Service)│
                     │  framora-backend-    │
                     │  dy5b.onrender.com   │
                     └──────────┬───────────┘
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
       ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
       │ MongoDB Atlas│ │  Cloudinary  │ │   Razorpay   │
       │   Database   │ │  Images+CDN  │ │   Payments   │
       └──────────────┘ └──────────────┘ └──────────────┘
```

---

### 🚀 Backend Deployment — Render

1. Create a **Web Service** on [Render](https://render.com) and connect the GitHub repository.
2. Set the **Root Directory** to `backend`.
3. Configure the following settings:

| Setting | Value |
|---|---|
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free or Starter |

4. Set the following **Environment Variables** in Render's dashboard:

```text
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/framora?retryWrites=true&w=majority
JWT_SECRET=<your_strong_production_secret>
JWT_EXPIRE=30d
CLIENT_URL=https://framora-sigma.vercel.app
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>
```

> Render automatically sets `PORT` — the backend uses `process.env.PORT` to listen on the correct port.

---

### 🚀 Frontend Deployment — Vercel

1. Import the GitHub repository in [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Configure the following settings:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. Set the following **Environment Variable** in Vercel's dashboard:

```text
VITE_API_URL=https://framora-backend-dy5b.onrender.com/api
```

> **Important:** Vite environment variables are embedded into the JavaScript bundle at build time. Whenever you change `VITE_API_URL` in Vercel, you must trigger a **Redeploy** for the change to take effect.

5. The included `frontend/vercel.json` handles SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This ensures that direct navigation to `/login`, `/feed`, or `/photo/:id` does not return a 404.

---

## 🏗️ Production Build (Manual)

Build the React frontend locally:

```bash
npm --prefix frontend run build
```

Output files are placed in `frontend/dist/`. Do not commit this directory — it is in `.gitignore`.

---

## 📮 API Testing

A full Postman collection is included:

```
postman/Framora_Postman_Collection.json
```

Import the collection into [Postman](https://www.postman.com/) and set the base URL variable.

| Environment | Base URL |
|---|---|
| Local | `http://localhost:5050` |
| Production | `https://framora-backend-dy5b.onrender.com` |

### Key Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create a new account |
| `POST` | `/api/auth/login` | — | Login and receive JWT |
| `GET` | `/api/auth/me` | ✅ JWT | Get the authenticated user's profile |
| `GET` | `/api/posts` | — | Get the community feed |
| `GET` | `/api/posts/:id` | — | Get a single post |
| `POST` | `/api/posts` | ✅ JWT | Upload a new photograph |
| `DELETE` | `/api/posts/:id` | ✅ JWT | Delete a photograph (owner only) |
| `PUT` | `/api/posts/:id/like` | ✅ JWT | Like / unlike a photograph |
| `PUT` | `/api/posts/:id/bookmark` | ✅ JWT | Bookmark / unbookmark a photograph |
| `GET` | `/api/posts/:id/download` | ✅ JWT | Download original (buyer or photographer) |
| `POST` | `/api/comments/:postId` | ✅ JWT | Post a comment |
| `DELETE` | `/api/comments/:id` | ✅ JWT | Delete a comment (owner or admin) |
| `GET` | `/api/users/:username` | — | Get a photographer's profile |
| `PUT` | `/api/users/follow/:id` | ✅ JWT | Follow / unfollow a user |
| `POST` | `/api/purchases/create-order` | ✅ JWT | Create a Razorpay order |
| `POST` | `/api/purchases/verify` | ✅ JWT | Verify payment and finalize purchase |
| `GET` | `/api/purchases/my-purchases` | ✅ JWT | Buyer's purchase history |
| `GET` | `/api/purchases/my-sales` | ✅ JWT | Seller's sales history |
| `GET` | `/api/health` | — | Backend health check |

---

## 🔒 Production Security Checklist

- [x] Store all secrets in the hosting provider's environment variables — never in code
- [x] Never commit `.env` files — they are in `.gitignore`
- [x] Use a strong, randomly generated `JWT_SECRET` in production
- [x] Set `CLIENT_URL` to the exact deployed frontend origin (no trailing slash)
- [x] Keep backend CORS restricted to the deployed frontend — no wildcard `*`
- [x] Configure Socket.IO to accept only the deployed frontend origin
- [x] Use MongoDB Atlas with replica set support for Mongoose transactions
- [x] Use Razorpay TEST MODE for demos; switch to LIVE keys only when ready for real payments
- [x] Never expose `CLOUDINARY_API_SECRET`, `JWT_SECRET`, or `RAZORPAY_KEY_SECRET` to the frontend

---

## 🛡️ Git & Secret Safety

The following files and directories are excluded from version control via `.gitignore`:

```
.env
.env.*
node_modules/
dist/
build/
uploads/
.DS_Store
.vscode/
.idea/
*.log
```

Environment templates (safe to commit) are provided as:

```
backend/.env.example
frontend/.env.example
```

Actual credentials must **never** be committed to GitHub.

---

## 🔮 Potential Future Improvements

- Private/authenticated Cloudinary original-asset storage (restricted delivery URLs)
- Advanced image watermarking for original assets
- Photographer verification badges
- Buyer and seller reviews and ratings
- In-app notification system
- Marketplace analytics dashboard for sellers
- AI-powered image categorization and tagging
- Personalized photography recommendation feed
- Content moderation tooling
- Advanced search with filters (camera, location, gear, price range)
- Progressive image loading (blur hash placeholders)
- CDN cache optimization
- End-to-end integration testing with Playwright or Cypress

---

## 🎯 What I Learned

Building Framora pushed me well beyond basic CRUD and taught me real-world production full-stack engineering:

- Designing and implementing a RESTful API with layered authorization
- JWT authentication and stateless session management
- bcrypt-based password security
- MongoDB schema design, indexing, and Mongoose ODM
- Real-time bidirectional communication with Socket.IO (rooms, events, JWT handshake)
- Cloud image storage and CDN delivery with Cloudinary
- Integrating a third-party payment gateway (Razorpay) end-to-end
- Server-side payment signature verification with HMAC SHA-256
- Writing atomic database operations with `findOneAndUpdate` conditional filters
- MongoDB ACID transactions for multi-document state changes
- Idempotent payment processing to prevent double-charges
- Designing concurrency-safe systems (race conditions at the database layer)
- Writing an automated backend test suite without a third-party testing framework
- Managing production environment variables and fail-fast startup validation
- Configuring CORS correctly for a separately deployed frontend/backend
- Deploying and debugging a full-stack application across Vercel and Render
- Maintaining clean Git history and secret safety practices

---

## 👨‍💻 Author

**Atharva Srivastava**
B.Tech Computer Science — Bennett University

<div align="center">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Atharva%20Srivastava-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/atharva-srivastava-83073429a/)
[![GitHub](https://img.shields.io/badge/GitHub-Atharva--0707-181717?style=for-the-badge&logo=github)](https://github.com/Atharva-0707)

</div>

---
