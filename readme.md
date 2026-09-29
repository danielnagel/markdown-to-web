# Markdown to Web

<p align="center">
  <img src="frontend/public/logo.default.svg" alt="Markdown to Web logo" width="160">
</p>

Mobile-first web app for read-only browsing of Markdown notes from configurable data sources
(primarily a git repository, optionally a local folder). Tree navigation, full-text search,
Obsidian-style `[[wikilink]]` resolution, and a JWT login.

## Architecture

Two containers, following the same pattern as this project's sibling deployments:

- **`backend`** (Express) clones/pulls configured git sources into a persistent volume, indexes
  Markdown files into a SQLite FTS5 search index, resolves wikilinks server-side, and serves a small
  JSON API behind a JWT-protected `/api/*`.
- **`frontend`** (Vue 3 + Tailwind, served by nginx) is a static SPA that proxies `/api` and `/auth`
  to the backend container.

There is no relational database - SQLite is only a search index, never the source of truth. The
actual content always comes live from the cloned git repo / local folder.

## Prerequisites

- Node.js 22+ and npm (for local development without Docker)
- Docker + Docker Compose (for running the full stack)

## Setup

1. Copy `backend/sources.config.example.json` to `backend/sources.config.json` and point it at your
   data source(s):

   ```json
   [
     { "name": "notes", "type": "local", "path": "/data/notes" },
     { "name": "wiki", "type": "git", "url": "https://github.com/user/repo.git", "pat": "ENV:WIKI_PAT" }
   ]
   ```

   Never put a PAT in plain text here - use the `ENV:VAR_NAME` placeholder shown above, resolved at
   runtime from an environment variable.

2. Copy `.env.example` to `.env` and fill in `JWT_SECRET` (and `WIKI_PAT`, if a source needs one).

3. Create a user (with the `backend` container running):

   ```
   docker compose exec backend npm run user:create
   docker compose exec backend npm run user:list
   ```

   Run without arguments, `user:create` prompts for username and password (password input hidden),
   so neither ends up in shell history. For scripting, pass both instead:
   `npm run user:create -- <username> <password>`. Users are stored in `users.sqlite` under
   `/data`; passwords are hashed with bcrypt.

## Run locally

With Docker:

```
docker compose up --build
```

Without Docker (two terminals):

```
npm install
JWT_SECRET=dev-secret npm run dev --workspace=backend
npm run dev --workspace=frontend
```

Create a local user with `npm run user:create --workspace=backend` (stored under `backend/data/`).

The frontend dev server (Vite) proxies `/api` and `/auth` to `http://localhost:3000`.

Try the demo dataset instead of your own `sources.config.json` with `MODE=demo` (see `demo/notes/`).
In demo mode a `demo`/`demo` user is created automatically on startup.

## Tests

```
npm test
```

Runs lint, backend tests (vitest + supertest) and frontend tests (vitest + Testing Library) for
both workspaces.

## Data

All persistent state lives under `/data` inside the `backend` container: cloned git repos, the
SQLite search index (`search-index.sqlite`) and the user accounts (`users.sqlite`). The repos and
the search index are not the source of truth for content, only a local clone/cache that can always
be rebuilt from the configured sources - `users.sqlite` is the only file that can't be rebuilt, so
back it up.

## Deploying alongside other apps

This app has no dependency on being deployed standalone - its images (`ghcr.io/.../markdown-to-web-backend`
and `-frontend`) are built and published by CI on every push to `main` and can be wired into an
existing reverse-proxy/Compose setup like any other two-container app. No local clone of this repo is
needed on a deployment host beyond pulling the images.
