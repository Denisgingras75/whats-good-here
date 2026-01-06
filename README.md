# What's Good Here

A mobile-first app that ranks individual dishes based on crowd-sourced "Would you order this again?" votes.

## Quick Start

### 1. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to **SQL Editor** in the Supabase dashboard
4. Run the schema file:
   - Copy the contents of `supabase/schema.sql`
   - Paste into SQL Editor and click "Run"
5. Run the seed data:
   - Copy the contents of `supabase/seed.sql`
   - Paste into SQL Editor and click "Run"
6. Configure Authentication:
   - Go to **Authentication > Providers**
   - Enable **Email** provider
   - Enable **Google** provider (optional but recommended):
     - Add your OAuth credentials
     - Set authorized redirect URLs to include `http://localhost:5173`

### 2. Configure Environment Variables

1. In your Supabase dashboard, go to **Settings > API**
2. Copy your **Project URL** and **anon public key**
3. Update `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run the App Locally

```bash
cd ~/whats-good-here
npm run dev
```

The app will open at `http://localhost:5173`

## Features Implemented

✅ Mobile-first PWA design
✅ Geolocation-based dish discovery
✅ Category filtering (Burgers, Pizza, Sushi, etc.)
✅ "Worth It" / "Avoid" voting system
✅ Google OAuth + Email magic link authentication
✅ Distance-based radius filtering (1, 5, 10, 20 miles)
✅ Confidence indicators for vote counts
✅ Optimistic UI updates
✅ Row-level security (RLS) for data protection

## Project Structure

```
whats-good-here/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   └── LoginModal.jsx      # Authentication modal
│   │   ├── CategoryFilter.jsx      # Category filter chips
│   │   ├── DishCard.jsx            # Individual dish card
│   │   ├── DishFeed.jsx            # Feed of dishes
│   │   ├── LocationPicker.jsx      # Location & radius selector
│   │   └── VoteButtons.jsx         # Worth It / Avoid buttons
│   ├── hooks/
│   │   ├── useDishes.js            # Fetch dishes from Supabase
│   │   ├── useLocation.js          # Geolocation logic
│   │   └── useVote.js              # Vote submission
│   ├── lib/
│   │   └── supabase.js             # Supabase client config
│   ├── pages/
│   │   └── Home.jsx                # Main page
│   ├── utils/
│   │   ├── distance.js             # Distance calculations
│   │   └── ranking.js              # Rating calculations
│   └── App.jsx                     # Router setup
├── supabase/
│   ├── schema.sql                  # Database schema + RLS
│   └── seed.sql                    # Sample data (30 restaurants, 120+ dishes)
└── .env.local                      # Environment variables
```

## Database Schema

### Tables

- **restaurants**: Restaurant info (name, address, lat/lng)
- **dishes**: Dish info (name, category, price, photo)
- **votes**: User votes (dish_id, user_id, would_order_again)

### Function

- `get_ranked_dishes(lat, lng, radius, category)`: Returns ranked dishes with vote stats

## Next Steps

### Before Launch
- [ ] Set up Supabase project and run schema/seed
- [ ] Add environment variables
- [ ] Test locally on mobile (iOS Safari + Android Chrome)
- [ ] Create Vercel account and deploy
- [ ] Configure Vercel environment variables
- [ ] Update Supabase auth redirect URLs to include Vercel domain

### After Launch (V1+)
- [ ] Add user-submitted photos
- [ ] Implement real-time updates
- [ ] Add PWA manifest for install prompt
- [ ] Optimize images with lazy loading
- [ ] Add analytics (Vercel Analytics)
- [ ] Field test at 3 restaurants
- [ ] Invite 5 friends to rate dishes

### V2 Features (Out of Scope for V1)
- User profiles
- Social features (comments, sharing)
- Restaurant dashboards
- Multi-city support
- Advanced search
- Maps integration

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel
- **Auth**: Supabase Auth (Google OAuth + Magic Links)

## Success Criteria

The V1 is **done** when:
1. ✅ User opens app → sees dishes within 5 miles in < 2 seconds
2. ✅ User taps "Worth It" → vote persists + UI updates
3. ✅ User filters by "Burger" → only burgers show
4. ✅ User logs in with Google → auth works, can vote
5. ✅ App works on iPhone Safari and Android Chrome
6. ✅ Deployed to Vercel with working environment variables

**Ship over perfect.**
