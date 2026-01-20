# What's Good Here

Mobile-first food discovery app for Martha's Vineyard. Ranks dishes by crowd-sourced "Would you order this again?" votes.

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, React Router
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Hosting:** Vercel (whats-good-here.vercel.app)
- **Analytics:** PostHog, Sentry

## Quick Commands
```bash
npm run dev      # localhost:5173
npm run build    # production build
npm run test     # run tests
npm run lint     # eslint
```

## Key Docs (read these for full context)
- `NOTES.md` - Design tokens, architecture, file locations, category system
- `BACKLOG.md` - Future feature ideas
- `DEVLOG.md` - Recent work history

## Project Structure
```
src/
├── api/           # API layer (dishesApi, votesApi, etc.)
├── components/    # Shared components
├── context/       # AuthContext, LocationContext
├── hooks/         # Custom React hooks
├── lib/           # Supabase client
├── pages/         # Page components
└── utils/         # Helpers (distance, ranking, errorHandler)
supabase/
├── schema.sql     # Database schema + RLS
└── seed.sql       # Sample data
```

## Architecture Principles
- **Categories are shortcuts, NOT containers** - Browse shows 14 curated shortcuts, not all categories
- **Search is the universal access layer** - Any dish is searchable even without a Browse shortcut
- **No direct Supabase calls** - All data access goes through `src/api/`

## Design Tokens
Primary: `#F47A1F` (orange) | Rating: `#E6B84C` (gold)
Text: `#1F1F1F` / `#6B6B6B` / `#9A9A9A`
Defined in `src/index.css`

## localStorage Keys
- `wgh_has_seen_splash` - Welcome splash shown
- `wgh_has_onboarded` - Welcome modal shown
- `wgh_pending_vote` - Vote saved before auth
