# Ping-up

Ping-up is a social networking app with a React + Vite frontend and a small Express + MongoDB backend. The current client already includes authenticated routing with Clerk, a feed, stories, messaging screens, profile pages, people discovery, and create-post UI. Much of the frontend still runs on local dummy data, while the backend is currently a lightweight server and database connection layer.

## Tech Stack

- Frontend: React 19, Vite, React Router, Tailwind CSS, Clerk
- Backend: Express, MongoDB with Mongoose
- Tooling: ESLint, Nodemon

## Current Features

- Clerk-based auth wrapper in the client
- Feed screen with stories, posts, and recent messages
- Profile screen with posts, media, and likes tabs
- Discover people search UI
- Messages list and chat route
- Create-post page and reusable social UI components
- Express server with CORS, JSON parsing, and MongoDB connection

## Repository Structure

```text
Ping-up/
├── Client/                # React + Vite frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── assets/        # Images and dummy data
│       ├── components/    # Reusable UI components
│       └── pages/         # Route-level screens
├── server/                # Express backend
│   ├── configs/           # Server configuration
│   ├── ingest/            # Inngest-related code
│   └── models/            # Mongoose models
└── readme.md
```

## Prerequisites

- Node.js 18+ recommended
- npm
- MongoDB connection string
- Clerk app keys for the frontend

## Environment Variables

Create local environment files and keep secrets out of source control.

### `server/.env`

```env
MONGODB_URL=mongodb://127.0.0.1:27017
PORT=4000
```

The server app connects to `${MONGODB_URL}/Ping-up`, so the database name is appended in code.

### `Client/.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

The frontend uses `ClerkProvider`, so a valid Clerk publishable key is required for the app to boot correctly.

## Installation

Install dependencies separately for the client and server.

```bash
cd Client
npm install
```

```bash
cd server
npm install
```

## Running the Project

Start the backend:

```bash
cd server
npm run server
```

Start the frontend in a second terminal:

```bash
cd Client
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Available Scripts

### Frontend (`Client/`)

- `npm run dev`: start the Vite development server
- `npm run build`: create a production build
- `npm run preview`: preview the production build locally
- `npm run lint`: run ESLint

### Backend (`server/`)

- `npm run server`: start the API with Nodemon
- `npm run start`: start the API with Node

## Verification

For the current codebase, the minimum verification steps are:

```bash
cd Client
npm run lint
npm run build
```

## Notes

- The frontend currently relies heavily on mock data from `Client/src/assets/assets.js`.
- The backend is connected to MongoDB but is still minimal and does not yet expose the social features used by the UI.
- Build output is generated in `Client/dist/` and should not be edited manually.

## Next Steps

- Replace dummy client data with API calls
- Add backend routes for posts, users, messages, and connections
- Protect server routes with auth
- Add automated tests for the frontend and backend
