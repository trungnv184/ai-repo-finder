# GitHub AI Repo Finder

Discover, search, and explore the top GitHub repositories focused on Artificial Intelligence. Browse curated AI repositories with key metrics at a glance.

## Prerequisites

- **Node.js** >= 18
- **GitHub Personal Access Token** - [Generate one here](https://github.com/settings/tokens) (no special scopes needed for public repos)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Add your GitHub token to .env
# Edit .env and replace "your_github_token_here" with your actual token

# 4. Start both backend and frontend
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both backend and frontend concurrently |
| `npm run dev:server` | Start backend only (port 3001) |
| `npm run dev:client` | Start frontend only (port 5173) |
| `npm test` | Run all tests |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | *(required)* | GitHub Personal Access Token |
| `PORT` | `3001` | Backend server port |
| `CACHE_TTL_MS` | `3600000` | Cache TTL in milliseconds (default: 1 hour) |

## API Endpoints

### `GET /api/repos`

Search AI repositories with pagination and sorting.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | `""` | Search query |
| `sort` | string | `"stars"` | Sort by: `stars`, `forks`, `updated`, `name` |
| `order` | string | `"desc"` | Order: `asc`, `desc` |
| `page` | number | `1` | Page number |
| `per_page` | number | `50` | Items per page (max 50) |

### `GET /api/health`

Health check endpoint.

## Architecture

```
src/
├── client/              # React frontend (Vite)
│   ├── components/      # UI components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client
│   ├── styles/          # CSS styles
│   └── utils/           # Formatting utilities
├── server/              # Express backend
│   ├── cache/           # CacheService (in-memory, TTL)
│   ├── middleware/      # Validation, rate limiting
│   ├── routes/          # API routes
│   └── services/        # GitHubService, GitHub client
└── shared/
    └── types/           # Shared TypeScript types
```

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Backend**: Express 5, TypeScript, Octokit
- **Testing**: Jest, React Testing Library, Supertest
- **Tooling**: ESLint, Prettier, Nodemon
