# 📸 Framora

> **Every frame has a story.**

**Framora** is a full-stack photography community and **1-of-1 digital photography marketplace** where photographers can share their work, interact with other users, and sell individual photographs as unique digital assets.

The platform combines a photography-focused social experience with a transactional marketplace, featuring real-time comments, JWT authentication, cloud image management, Razorpay payments, ownership authorization, and atomic protection against duplicate purchases.

---

## 🌐 Live Demo

**Frontend:** 

**Backend API:** 

**GitHub Repository:** Atharva-0707/Framora

> The frontend and backend are deployed separately. The React frontend communicates with the Node.js/Express backend through REST APIs and Socket.IO.

---

# 📷 Screenshots


### 🏠 Home / Feed

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/c85153f2-0829-4d4f-aa41-7031614fea45" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/bad15024-f2bd-43ac-bca2-1ddc1694b087" />


### 📸 Photo Details

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/b9de440c-d63e-4f6b-a4da-4e356c4ace09" />


### 👤 Photographer Profile

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/ac4c96be-1a1f-45d8-bc63-b98548c02ff3" />


### 🛒 Marketplace

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/dcd12675-c1a8-46d6-b928-77be39117f4b" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/cc9f51c3-e423-4e3b-995c-aa61e10e9c1d" />


### 💳 Purchase / Checkout

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/08ecaab5-82c0-4b4e-a6f1-1f947a8a48a0" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/9079da5b-8f07-4795-a827-7a5347d840fb" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/fe99fc92-28f5-4e54-9bcb-1fbcb55ad629" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/7faa7846-26e2-455a-8ea6-847a02f771ad" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/4a60a7a0-2dd1-4249-b81c-4da4d3eed297" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/873e931b-381e-4c47-b1f5-f3faae2a8c50" />


### 📊 Purchases & Sales

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/05bf1b86-98c5-44a8-8434-c57914459dad" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/1ef3e116-e7ac-4916-8763-0e6ded88b80e" />


### 💬 Real-Time Comments

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/4ab7fceb-ae22-4e71-8856-74f2baf18712" />


### 👤 Sign-up & Login

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/82cc81c4-7252-43b0-bc42-a0b3d315eaf8" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/508f94e6-d621-4613-b96f-dd4eadbd22d3" />

---

# ✨ Features

## 👤 Authentication & User Management

* User registration and login
* JWT-based authentication
* Secure password hashing using bcrypt
* Protected API routes
* Authenticated Socket.IO connections
* Role-aware authorization
* User profiles and photographer information

## 📸 Photography Community

* Upload and manage photographs
* Photographer profiles
* Home/feed experience
* Search photographs and users
* Like photographs
* Bookmark photographs
* View photograph details
* Comment on photographs
* Authorized comment deletion

## ⚡ Real-Time Features

* Real-time comments using Socket.IO
* Post-specific Socket.IO rooms
* JWT authentication during socket handshake
* Automatic reconnection support
* Real-time comment creation and deletion
* Real-time `photo:sold` marketplace updates
* Client-side event deduplication

## 🛒 1-of-1 Digital Marketplace

* Photographers can list photographs for sale
* Seller-controlled pricing
* `FOR_SALE` and `SOLD` states
* Each photograph can be sold only once
* Owner-only marketplace controls
* Purchase history
* Sales history
* Authorized digital-asset downloads

## 💳 Razorpay Payments

* Razorpay TEST MODE integration
* Server-side Razorpay order creation
* Razorpay Checkout
* HMAC SHA-256 payment signature verification
* Server-side amount validation
* Payment ↔ purchase ↔ photograph integrity checks
* Idempotent payment verification
* No webhook dependency

## ☁️ Cloudinary Image Management

* Cloudinary-based image storage
* Optimized image delivery
* Preview transformations
* High-resolution authorized download flow

## 🔐 Security & Data Integrity

* JWT authentication
* bcrypt password hashing
* Owner-based authorization
* Production CORS allowlisting
* Production environment validation
* Server-side price authority
* Atomic 1-of-1 purchase protection
* MongoDB transaction-based purchase finalization
* Idempotent payment handling
* Protected download endpoints

---

# 🧰 Tech Stack

## Frontend

* React.js
* Vite
* JavaScript
* CSS
* React Router
* Axios
* Socket.IO Client

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JWT
* bcrypt
* Cloudinary
* Multer
* Razorpay

## Development & Testing

* Git
* GitHub
* Postman
* Node.js automated test suite
* Vite production build

---

# 🏗️ System Architecture

Framora uses a **separately deployed frontend and backend architecture**.

```text
                              ┌──────────────────────┐
                              │      User Browser    │
                              └──────────┬───────────┘
                                         │
                              REST API + Socket.IO
                                         │
                         ┌───────────────┴───────────────┐
                         │                               │
                         ▼                               ▼
                ┌─────────────────┐             ┌─────────────────┐
                │ React + Vite    │             │ Node + Express  │
                │    Frontend     │             │     Backend     │
                │                 │             │   + Socket.IO   │
                └─────────────────┘             └────────┬────────┘
                                                         │
                            ┌────────────────────────────┼────────────────────────────┐
                            │                            │                            │
                            ▼                            ▼                            ▼
                    ┌───────────────┐            ┌───────────────┐            ┌───────────────┐
                    │ MongoDB Atlas │            │   Cloudinary  │            │    Razorpay   │
                    │   Database    │            │     Images    │            │    Payments   │
                    └───────────────┘            └───────────────┘            └───────────────┘
```

### Architecture Responsibilities

**Frontend**

* UI rendering
* Client-side routing
* API communication
* Authentication state
* Marketplace UI
* Razorpay Checkout integration
* Socket.IO client communication

**Backend**

* Authentication
* Authorization
* REST APIs
* Business logic
* Marketplace operations
* Payment verification
* Image handling
* Database operations
* Socket.IO events

**MongoDB Atlas**

* Users
* Photographs
* Comments
* Purchases
* Marketplace state

**Cloudinary**

* Image storage
* Image transformations
* Optimized image delivery

**Razorpay**

* Payment order creation
* Checkout
* Payment verification

---

# 📁 Project Structure

```text
Framora/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── postman/
│   └── Framora_Postman_Collection.json
│
├── docs/
│   └── screenshots/
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

# 🔄 Core Application Flows

## 🔐 Authentication Flow

```text
User
  ↓
Register / Login
  ↓
Backend validates credentials
  ↓
bcrypt password verification
  ↓
JWT generated
  ↓
Frontend stores authentication state
  ↓
JWT sent with protected requests
  ↓
Backend validates JWT
```

---

# 📤 Photo Upload Flow

```text
Photographer
      ↓
React Frontend
      ↓
Multipart Upload
      ↓
Express Backend
      ↓
Multer
      ↓
Cloudinary
      ↓
MongoDB stores photo metadata
      ↓
Photo available on Framora
```

---

# 💬 Real-Time Comment Flow

Framora uses Socket.IO to provide real-time interactions.

```text
User posts comment
        ↓
Frontend sends request
        ↓
Backend authentication + validation
        ↓
Comment stored in MongoDB
        ↓
Socket.IO event emitted
        ↓
Post-specific room
        ↓
Connected users receive update instantly
```

Supported real-time events include:

```text
comment:created
comment:deleted
photo:sold
```

Socket connections use JWT authentication during the handshake.

---

# 🛒 1-of-1 Marketplace

The marketplace is designed around the concept that each photograph can be sold only once.

A photograph follows a marketplace lifecycle such as:

```text
NOT_FOR_SALE
      ↓
FOR_SALE
      ↓
SOLD
```

The backend and database enforce the final purchase transition.

---

## ⚡ Atomic Purchase Protection

The purchase operation uses an atomic database state transition based on the current sale status.

Conceptually:

```text
FOR_SALE
    ↓
Atomic database operation
    ↓
SOLD
```

If multiple buyers attempt to purchase the same photograph concurrently, only one can successfully acquire it.

This protection is implemented at the backend/database level instead of relying on frontend checks.

---

# 💳 Razorpay Payment Flow

Framora uses **Razorpay TEST MODE**.

```text
Buyer selects photograph
        ↓
Backend creates Razorpay order
        ↓
Frontend opens Razorpay Checkout
        ↓
Buyer completes payment
        ↓
Razorpay returns payment details
        ↓
Frontend sends payment details to backend
        ↓
Backend verifies HMAC SHA-256 signature
        ↓
Backend validates:
    • Buyer
    • Purchase
    • Photograph
    • Razorpay Order
    • Amount
    • Currency
        ↓
MongoDB transaction
    • Purchase → PAID
    • Photograph → SOLD
        ↓
Purchase completed
```

### Payment Security

* Payment signatures are verified on the server.
* Client-provided prices are not trusted.
* Purchase/order amount is authoritative for the transaction.
* Razorpay order and payment information are validated.
* A payment cannot be used to finalize an unrelated photograph.
* Repeated verification requests are handled idempotently.
* Razorpay webhooks are not used.

---

# 🖼️ Digital Asset Access

Framora separates public image presentation from the authorized download flow.

### Public Users

Public feed, profile, and post views use optimized preview image representations.

### Authorized Buyers

The protected download endpoint verifies:

```text
Authenticated User
        +
Valid Purchase
        +
Correct Photograph
        +
Successful Payment
        +
Authorization
```

Only after successful authorization is the high-resolution download made available.

---

# 🔐 Security

## Authentication

* JWT-based authentication
* bcrypt password hashing
* Protected REST endpoints
* Authenticated Socket.IO handshakes

## Authorization

* Owner-based marketplace authorization
* Non-owners cannot modify another creator's sale settings
* Buyer authorization for purchased assets
* Role-aware access control

## Payment Security

* HMAC SHA-256 signature verification
* Server-side amount validation
* Purchase/post/order relationship validation
* Idempotent payment verification

## API Security

* Production CORS allowlisting
* Environment-variable based secrets
* No hard-coded production JWT secrets
* Production environment fail-fast validation
* Input validation
* Centralized error handling

---

# 🗄️ Database Design

MongoDB is used through Mongoose.

Core entities include:

```text
User
Post
Comment
Purchase
Bookmark / Like
```

Marketplace relationships include:

```text
Buyer
Seller
Post
Razorpay Order
Purchase
```

Indexes are used for frequently queried fields including:

* Buyer
* Seller
* Post
* Timestamps

---

# 🧪 Testing

Framora includes an automated backend test suite covering authentication, authorization, marketplace logic, payment verification, concurrency protection, digital asset access, CORS, environment validation, and Socket.IO.

### Current Test Result

```text
44 Passed
0 Failed
```

The suite verifies:

* JWT authentication
* Tampered JWT rejection
* Ownership authorization
* Admin/non-owner restrictions
* Marketplace state transitions
* 1-of-1 atomic concurrency protection
* Razorpay HMAC SHA-256 verification
* Invalid/tampered payment signature rejection
* Payment ↔ Purchase ↔ Post integrity
* Price race-condition handling
* MongoDB transaction safety
* Payment idempotency
* Digital asset authorization
* Production CORS
* Production environment validation
* Socket.IO authentication

---

# 🚀 Local Development Setup

## Prerequisites

Install:

* Node.js
* npm
* MongoDB / MongoDB Atlas
* Cloudinary account
* Razorpay account

---

## 1. Clone the Repository

```bash
git clone ADD_YOUR_GITHUB_REPOSITORY_URL_HERE
cd Framora
```

---

## 2. Install Dependencies

From the root directory:

```bash
npm run install:all
```

---

# ⚙️ Environment Variables

## Backend

Create:

```text
backend/.env
```

Use the variables provided in:

```text
backend/.env.example
```

Example:

```env
NODE_ENV=development

PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Frontend

Create the frontend `.env` file using:

```text
frontend/.env.example
```

Use the backend production/development URL as defined by the current frontend configuration.

---

# ▶️ Run Locally

Start the complete development environment:

```bash
npm run dev
```

This starts the frontend and backend development servers.

---

## Run Backend Only

```bash
npm run server
```

---

## Run Frontend Only

```bash
npm run client
```

---

# 🧪 Run Tests

Run the automated backend test suite:

```bash
npm test
```

Expected result:

```text
44 Passed
0 Failed
```

---

# 🏗️ Production Build

Build the React frontend:

```bash
npm --prefix frontend run build
```

The generated production files are placed in:

```text
frontend/dist/
```

The build output should not be committed to Git.

---

# 📮 API Testing

A Postman collection is included at:

```text
postman/Framora_Postman_Collection.json
```

Import the collection into Postman and configure the API base URL.

### Local Backend

```text
http://localhost:5000
```

### Production Backend

```text

```

---


# 🌍 Production Architecture

```text
                     ┌──────────────────────┐
                     │      User Browser    │
                     └──────────┬───────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │  Deployed Frontend   │
                     │   React + Vite       │
                     └──────────┬───────────┘
                                │
                     REST API + Socket.IO
                                │
                                ▼
                     ┌──────────────────────┐
                     │  Deployed Backend    │
                     │ Node.js + Express    │
                     │      + Socket.IO     │
                     └──────────┬───────────┘
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
       ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
       │ MongoDB Atlas│ │  Cloudinary  │ │   Razorpay   │
       │   Database   │ │    Images    │ │   Payments   │
       └──────────────┘ └──────────────┘ └──────────────┘
```

---

# 🚀 Render Backend Deployment

For the backend, create a **Web Service** on Render and connect the GitHub repository.

### Build Command

Use the appropriate backend installation/build command for the repository.

For example:

```bash
npm install
```

### Start Command

Use:

```bash
npm start
```

or the exact production start script defined in the backend `package.json`.

### Environment Variables

Configure the required production variables in Render:

```text
NODE_ENV=production

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_production_jwt_secret

CLIENT_URL=your_deployed_frontend_url

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Render provides the `PORT` environment variable to the application.

The backend should listen on:

```js
process.env.PORT
```

---

# 🚀 Frontend Deployment

For a Vite frontend deployed on Vercel, Render Static Site, or Netlify:

### Build Command

```bash
npm run build
```

### Output Directory

```text
dist
```

Configure the frontend environment variables using the values specified by `frontend/.env.example`.

Most importantly, configure the production backend/API URL.

---

# 🔒 Production Deployment Considerations

Before deploying:

* Store secrets only in the hosting provider's environment variables.
* Never commit `.env` files.
* Use a strong production `JWT_SECRET`.
* Set `CLIENT_URL` to the exact deployed frontend origin.
* Keep backend CORS restricted to the deployed frontend.
* Configure Socket.IO to accept the deployed frontend origin.
* Ensure MongoDB deployment supports the transactions used by marketplace finalization.
* Use Razorpay TEST MODE during testing.
* Never expose server-side secrets to the frontend.
* Do not automatically seed production data.

---

# 🛡️ Git & Secret Safety

The repository ignores sensitive and generated files including:

```text
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
private keys
temporary files
```

Environment templates are committed as:

```text
.env.example
```

Actual credentials must never be committed to GitHub.

---

# 🔮 Future Improvements

Potential future improvements include:

* Private/authenticated Cloudinary original-asset storage
* Advanced image watermarking
* Photographer verification
* Reviews and ratings
* Notifications
* Marketplace analytics
* AI-powered image categorization
* Personalized photography recommendations
* Content moderation
* Follow/follower functionality
* Advanced search filters
* Progressive image loading
* CDN optimization
* More extensive end-to-end integration testing

---

# 🎯 What I Learned

Building Framora helped me move beyond basic CRUD development and work with real-world full-stack engineering concepts, including:

* REST API design
* Authentication and authorization
* JWT security
* MongoDB schema design and indexing
* Real-time communication with Socket.IO
* Cloud image storage and delivery
* Payment gateway integration
* Server-side payment verification
* Atomic database operations
* MongoDB transactions
* Idempotent payment processing
* Concurrency handling
* API testing
* Production environment management
* Separately deployed frontend/backend architecture
* Git and deployment practices

---

# 👨‍💻 Author

**Atharva Srivastava**

B.Tech Computer Science
Bennett University

### Connect With Me

**LinkedIn:** `www.linkedin.com/in/atharva-srivastava-83073429a`

**GitHub:** `https://github.com/Atharva-0707`

---

# 📄 License

This project is licensed under the **MIT License**.

---
