# NFL Betting Tool

A comprehensive NFL betting analysis and prediction tool built with Next.js 14, TypeScript, and Supabase.

## Features

- **NFL Game Analysis**: Comprehensive analysis of NFL games with statistical insights
- **Betting Predictions**: AI-powered predictions for NFL betting markets
- **Real-time Data**: Live updates on games, odds, and betting lines
- **User Dashboard**: Personalized dashboard for tracking bets and performance
- **Historical Data**: Access to historical NFL data and betting trends

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, React
- **UI Components**: shadcn/ui with Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **Data Management**: TanStack Query for state management
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Tables**: TanStack Table for data display

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `STRIPE_PUBLIC_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PRICE_ID_MONTHLY`: Stripe price ID for monthly subscription
- `SPORTS_API_KEY`: Sports data API key

## License

MIT License
