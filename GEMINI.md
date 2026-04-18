# Gemini Context: Ping-up

Ping-up is a modern social networking application built with a React 19 frontend and an Express 5 backend. It features real-time-like interactions, media sharing, and social connectivity.

## Project Overview

- **Architecture:** Monorepo-style structure with separate `Client/` (frontend) and `server/` (backend) directories.
- **Frontend:**
  - **Framework:** React 19 with Vite.
  - **Styling:** Tailwind CSS 4.
  - **State Management:** Redux Toolkit.
  - **Routing:** React Router 7.
  - **Authentication:** Clerk (via `@clerk/react`).
  - **Icons:** Lucide React.
  - **Notifications:** React Hot Toast.
- **Backend:**
  - **Framework:** Express 5.
  - **Database:** MongoDB with Mongoose.
  - **Authentication:** Clerk (via `@clerk/express`).
  - **Media Management:** ImageKit.io for cloud storage and transformations.
  - **Background Jobs:** Inngest for event-driven workflows (e.g., connection request emails).
  - **File Uploads:** Multer for handling multipart/form-data.
  - **Email:** Nodemailer for sending notifications.

## Building and Running

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Clerk API keys (Publishable and Secret)
- ImageKit credentials

### Environment Setup

#### Backend (`server/.env`)
```env
MONGODB_URL=mongodb://127.0.0.1:27017
PORT=4000
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
EMAIL_USER=...
EMAIL_PASS=...
```

#### Frontend (`Client/.env`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Installation
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd Client
npm install
```

### Running Locally
```bash
# Start backend (default: http://localhost:4000)
cd server
npm run server

# Start frontend (default: http://localhost:5173)
cd Client
npm run dev
```

## Development Conventions

### Backend
- **ES Modules:** The project uses native ES modules (`"type": "module"`).
- **Controllers:** Business logic is encapsulated in controllers (e.g., `userController.js`, `postController.js`).
- **Routes:** Explicit route definitions in `routes/` directory.
- **Middlewares:** Authentication is handled by a `protect` middleware using Clerk.
- **Models:** Mongoose models are located in `models/`.

### Frontend
- **Components:** Reusable UI components are in `src/components/`.
- **Pages:** Route-level components are in `src/pages/`.
- **Redux:** Slices for global state (user, connections, messages) are in `src/features/`.
- **API Calls:** Handled via Axios in `src/api/axios.js`.
- **Theme:** Supports dark/light mode via Tailwind's `dark` class.

## Key Directories
- `Client/src/assets/`: Contains dummy data and static images.
- `server/configs/`: Configuration for DB, ImageKit, Multer, and Nodemailer.
- `server/inngest/`: Background job definitions and functions.

## Verification
```bash
# Lint frontend
cd Client
npm run lint

# Build frontend
cd Client
npm run build
```
