# Ping-up

Ping-up is a modern, full-stack social networking platform designed for real-time interactions, media sharing, and social connectivity. Built with a high-performance React 19 frontend and a robust Express 5 backend, Ping-up leverages cutting-edge technologies like Redis for caching, TanStack Query for state synchronization, and Inngest for event-driven background workflows.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS 4 (with modern utility-first approach)
- **State Management:** Redux Toolkit (for global UI & user state)
- **Data Fetching:** TanStack Query (React Query) for optimized server state management
- **Routing:** React Router 7
- **Authentication:** Clerk (Social & Email login)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose ODM
- **Caching & Rate Limiting:** Redis
- **Background Jobs:** Inngest (Serverless-style event delivery)
- **Media Management:** ImageKit.io (Cloud storage & real-time transformations)
- **Authentication:** Clerk Express Middleware
- **Email Service:** Nodemailer (via SMTP)
- **File Uploads:** Multer & ImageKit.io

## ✨ Key Features

- **🌓 Dynamic Theme:** Seamless support for Dark and Light modes with a premium aesthetic.
- **💬 Real-time Messaging:** Integrated chat system with presence indicators and instant message delivery.
- **📱 Responsive Feed:** A dynamic social feed supporting text posts, multi-image galleries, and interactive elements.
- **🖼️ Stories:** transient 24-hour media sharing powered by background workers that automatically handle story expiration.
- **👥 Connections:** Comprehensive follow/unfollow system and connection requests with automated email notifications.
- **❤️ Interactions:** Real-time-like likes and comments with immediate UI feedback and cross-tab synchronization.
- **🔍 Discovery:** Robust user search and discovery features to find friends and colleagues.
- **🛡️ Secure & Scalable:** Redis-backed rate limiting to prevent API abuse and optimized caching for lightning-fast profile loads.

## 📁 Repository Structure

```text
Ping-up/
├── Client/                # React + Vite frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── api/           # Axios instance & API services
│       ├── app/           # Redux store & global providers
│       ├── components/    # Reusable UI components & modals
│       ├── features/      # Redux slices & feature-specific logic
│       ├── pages/         # Route-level screen components
│       └── assets/        # Stylesheets & static images
├── server/                # Express backend
│   ├── configs/           # Redis, ImageKit, Multer, & DB configurations
│   ├── controllers/       # Business logic for Users, Posts, Stories, etc.
│   ├── inngest/           # Event-driven functions (e.g., auto-delete stories)
│   ├── middlewares/       # Auth guards, Rate limiters, & Error handlers
│   ├── models/            # Mongoose schemas for MongoDB
│   └── routes/            # API endpoint definitions
└── readme.md
```

## 🛠️ Prerequisites

- **Node.js:** 18+ recommended
- **MongoDB:** Local instance or MongoDB Atlas
- **Redis:** Local instance or Upstash/RedisCloud
- **Clerk:** Active account for Auth keys
- **ImageKit:** Account for media storage

## 🔑 Environment Variables

Create local environment files to manage your credentials securely.

### `server/.env`
```env
MONGODB_URL=your_mongodb_connection_string
PORT=4000
REDIS_URL=your_redis_connection_url
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SENDER_EMAIL=your_verified_sender_email
FRONTEND_URL=http://localhost:5173
```

### `Client/.env`
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 🚀 Installation & Setup

1. **Install Frontend Dependencies:**
   ```bash
   cd Client
   npm install
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Run the Project:**
   Open two terminals:
   - **Terminal 1 (Backend):** `cd server && npm run server`
   - **Terminal 2 (Frontend):** `cd Client && npm run dev`

## 📜 Available Scripts

### Frontend (`Client/`)
- `npm run dev`: Start Vite development server
- `npm run build`: Generate production-ready bundle
- `npm run lint`: Run ESLint checks
- `npm run preview`: Preview production build locally

### Backend (`server/`)
- `npm run server`: Start API with hot-reload (Nodemon)
- `npm run start`: Start API in production mode

## 🧪 Verification

To ensure code quality and build stability:
```bash
cd Client && npm run lint && npm run build
```

---
*Developed with a focus on visual excellence and performance.*

