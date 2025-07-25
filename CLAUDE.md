# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with Turbopack for faster builds
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint TypeScript and React code
npm run lint
```

## Architecture Overview

This is a Next.js 15 group management application built with the App Router pattern. The application creates optimal group assignments while avoiding previous member pairings.

### Core Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, and Tailwind CSS
- **API Layer**: Next.js API routes in `src/app/api/`
- **Data Persistence**: Vercel KV for member lists and group history
- **Group Algorithm**: Random assignment with diversity scoring (OpenAI integration disabled)

### Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components for UI
- `src/lib/` - Core business logic and utilities

### Data Flow

1. **Member Management**: Users input members → saved to Vercel KV
2. **Group Creation**: Members + group count → diversity algorithm → optimal groups
3. **History Tracking**: Each group assignment saved with timestamp for future diversity calculations

### Core Business Logic

The group assignment algorithm (`src/lib/openai.ts:createOptimalGroups`) performs intelligent member distribution:

- Retrieves previous group history from Vercel KV
- Generates multiple random group combinations (50 attempts when history exists)
- Calculates diversity scores based on previous member pairings
- Selects the combination with minimal repeated pairings

### Environment Variables Required

```bash
# Optional: OpenAI API (currently disabled in favor of random algorithm)
OPENAI_API_KEY=your_openai_api_key

# Required: Vercel KV for data persistence
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

### Key Components

- **GroupForm** (`src/components/GroupForm.tsx`): Member input and group count selection
- **GroupDisplay** (`src/components/GroupDisplay.tsx`): Results visualization
- **MemberList** (`src/components/MemberList.tsx`): Member management interface
- **PresetManager** (`src/components/PresetManager.tsx`): Saved member list management

### API Endpoints

- `POST /api/groups` - Create group assignments
- `GET/POST /api/members` - Member CRUD operations
- `GET /api/history` - Retrieve group history
- `GET/POST/DELETE /api/presets` - Member preset management

### Development Notes

- The application prioritizes group diversity over OpenAI optimization (OpenAI disabled in current implementation)
- All member data and group history persists in Vercel KV
- The diversity algorithm prevents repeated pairings across group sessions
- Japanese UI text throughout the application