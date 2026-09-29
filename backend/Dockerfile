# Build context is the repository root (npm workspaces), see the
# `build.context`/`build.dockerfile` settings in the root docker-compose.yml.

FROM node:22-alpine

WORKDIR /app

# bcrypt and better-sqlite3 both ship native addons that need to be compiled
# on install. The build toolchain is removed again right after `npm ci` so it
# doesn't bloat the final image.
RUN apk add --no-cache --virtual .build-deps python3 make g++

# Only the workspace manifests are needed to resolve dependencies via the
# single root package-lock.json (frontend/package.json must be present too so
# npm recognizes the full workspaces list, even though its deps aren't
# installed here).
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --workspace=backend --omit=dev

RUN apk del .build-deps

# simple-git (git sources, see src/sync/git.js) shells out to the git binary,
# which node:alpine doesn't ship.
RUN apk add --no-cache git

COPY backend ./backend
COPY demo/notes ./backend/demo-notes

WORKDIR /app/backend

EXPOSE 3000

CMD ["npm", "start"]
