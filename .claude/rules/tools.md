---
paths: tools/**
---

# DoD Tools

Internal web tools for managing the Data Over Dogma podcast database.

## Quick Start

```bash
# Start both servers:
bun run tools

# This opens:
# - API Server: http://localhost:3001
# - UI: http://localhost:3000
```

## Architecture

**Two-server architecture** for clean separation:

1. **Static File Server** (port 3000) - HTML, TypeScript, CSS served by Bun
2. **API Server** (port 3001) - Backend endpoints with CORS support

### Why Separated?

- **Simplicity**: Bun natively serves HTML with automatic TypeScript transpilation
- **Clean separation**: API logic separate from static file serving
- **No build step**: TypeScript transpiled on-the-fly
- **Better DX**: Restart API without reloading UI

## Running the Tools

### Option 1: Start Both (Recommended)

```bash
bun run tools
# or
bash src/scripts/start-tools.sh
```

### Option 2: Run Separately

**Terminal 1 - API Server:**
```bash
bun run tools:api
# or
bun run src/scripts/tools-server.ts
```

**Terminal 2 - Static Files:**
```bash
cd tools
bun index.html tag-vocabulary/index.html segment-verification.html review-corrections.html validate-timestamps.html
```

## Available Tools

Open http://localhost:3000:

- **Episode List** (`/`) - Browse all processed episodes
- **Tag Vocabulary** (`/tag-vocabulary/`) - Manage tags across episodes
- **Segment Verification** (`/segment-verification.html`) - Verify episode segments
- **Correction Review** (`/review-corrections.html`) - Review transcript corrections
- **Timestamp Validator** (`/validate-timestamps.html`) - Validate timestamps

## File Structure

```
tools/
├── index.html                    # Landing page
├── tag-vocabulary/               # Tag management tool
│   ├── index.html               #   UI
│   ├── main.ts                  #   Logic (TypeScript!)
│   └── styles.css               #   Styles
├── segment-verification.html
├── review-corrections.html
├── validate-timestamps.html
└── shared/
    └── utilities.ts              # Shared utilities

src/scripts/
├── tools-server.ts               # API-only server (port 3001)
└── start-tools.sh                # Startup script
```

## Development Guide

### Adding New UI Pages

1. Create folder: `tools/your-tool/`
2. Create files:
   - `tools/your-tool/index.html` (UI)
   - `tools/your-tool/main.ts` (logic)
   - `tools/your-tool/styles.css` (styles)
3. Reference assets with relative paths:
   ```html
   <link rel="stylesheet" href="./styles.css" />
   <script src="./main.ts" type="module"></script>
   ```
4. Use API_BASE_URL for API calls:
   ```typescript
   const API_BASE_URL = 'http://localhost:3001';
   const response = await fetch(`${API_BASE_URL}/api/your-endpoint`);
   ```
5. Add to `start-tools.sh` file list: `bun ... your-tool/index.html`

### Adding New API Endpoints

Edit `src/scripts/tools-server.ts`:

```typescript
// All API routes must start with /api/
if (url.pathname === '/api/your-endpoint') {
  return jsonResponse({ data: 'your data' }); // CORS included
}
```

### TypeScript in HTML

HTML files reference TypeScript directly - Bun handles transpilation:

```html
<script src="./main.ts" type="module"></script>
```

**No inline JavaScript or CSS allowed!** All logic and styles must be in separate files for:
- Type checking (TypeScript)
- Code reuse
- Maintainability
- Clean separation of concerns

## API Communication

Since servers are on different ports, CORS is configured:

**Client (tools/*.ts):**
```typescript
const API_BASE_URL = 'http://localhost:3001';

async function loadData() {
  const response = await fetch(`${API_BASE_URL}/api/endpoint`);
  return response.json();
}
```

**Server (tools-server.ts):**
```typescript
// CORS headers added automatically to all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

## Troubleshooting

**"Failed to fetch" errors:**
- Ensure both servers running (check ports 3000 and 3001)
- Check API_BASE_URL matches API server port
- Look for CORS errors in browser console

**TypeScript errors in browser:**
- Verify `.ts` files are in `tools/` directory
- Check browser network tab for 404s
- Ensure Bun is serving the static files

**Port conflicts:**
```bash
# Kill process on port
lsof -ti:3001 | xargs kill -9  # API server
lsof -ti:3000 | xargs kill -9  # Static server
```

## API Endpoints

### Tag Vocabulary
- `GET /api/tag-vocabulary/episodes` - All episodes with tags
- `GET /api/tag-vocabulary/vocabulary` - Tag vocabulary
- `GET /api/tag-vocabulary/categories` - Available categories
- `GET /api/tag-vocabulary/tag-stats` - Tag statistics
- `POST /api/tag-vocabulary/vocabulary/add` - Add new tag
- `POST /api/tag-vocabulary/migrate` - Reprocess all episodes

### Corrections
- `GET /api/review-corrections/candidates` - Pending corrections
- `POST /api/review-corrections/approve/{key}` - Approve correction
- `POST /api/review-corrections/reject/{key}` - Reject correction

### Segments
- `GET /api/segment-verification/episodes` - Episodes with segments
- `GET /api/segment-verification/segment-metadata` - Segment types
- `POST /api/segment-verification/patterns/add` - Add segment pattern
- `POST /api/segment-verification/segments/update` - Update segments

### Episodes
- `GET /api/episode/{videoId}` - Single episode data
- `GET /api/episode/{videoId}/corrections` - Episode corrections
