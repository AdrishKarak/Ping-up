# Repository Guidelines

## Project Structure & Module Organization
This repository currently contains a single frontend app in `Client/`, built with React and Vite. Application code lives in `Client/src/`. Use `src/pages/` for route-level screens such as `Feed.jsx` or `Profile.jsx`, `src/components/` for reusable UI, and `src/assets/` for images plus shared mock data in `assets.js`. Static public files belong in `Client/public/`. Build output is generated in `Client/dist/` and should not be edited manually.

## Build, Test, and Development Commands
Run commands from `Client/`.

- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server with hot reload.
- `npm run build`: create a production bundle in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint across the app.

## Coding Style & Naming Conventions
The codebase uses ES modules, JSX, and Tailwind CSS utility classes. Follow the existing pattern of PascalCase for React components and page files (`StoryViewer.jsx`, `CreatePost.jsx`) and camelCase for variables, props, and helper values. Prefer functional components and colocate imports at the top of each file. ESLint is configured in `Client/eslint.config.js`; fix lint errors before opening a PR. Existing files mostly use 4-space indentation, so keep that style consistent within edited files.

## Testing Guidelines
There is no test runner configured yet. Until one is added, treat `npm run lint` and `npm run build` as the minimum verification step for every change. If you introduce tests later, place them under `Client/src/__tests__/` or beside the component as `ComponentName.test.jsx`, and favor React-focused behavioral tests over snapshot-heavy coverage.

## Commit & Pull Request Guidelines
Recent Git history uses short, inconsistent messages, so do not copy that pattern. Use clear imperative commit subjects such as `Add mobile menu toggle` or `Fix profile route loading state`. Keep pull requests focused, describe user-visible changes, list verification commands, and include screenshots or short recordings for UI updates. Link the related issue when one exists.

## Security & Configuration Tips
Clerk is used for authentication. Keep secrets in local environment files rather than hardcoding them in source, and do not commit credentials or production keys.
