# Score Sync Edge Function

This Supabase Edge Function synchronizes NFL game scores and team statistics from SportsData.io API into the local database.

## Overview

The `score-sync` function performs the following operations:

1. **Fetches Recent NFL Data**: Retrieves schedule/results and team statistics from SportsData.io
2. **Team Mapping**: Maps external provider team codes to internal team IDs using the `team_aliases` table
3. **Games Upsert**: Updates the `games` table with current scores, status, and game information
4. **Team Stats Upsert**: Updates the `team_stats` table with season-to-date statistics
5. **Feature Alignment**: Ensures all features from `model_coefficients.feature_names` are populated

## Environment Variables Required

The following environment variables must be set in your Supabase project:

```bash
SPORTS_API_KEY=your_sportsdata_io_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Setting Environment Variables

1. **In Supabase Dashboard**:
   - Go to Project Settings → Edge Functions
   - Add the environment variables in the "Environment Variables" section

2. **Using Supabase CLI**:
   ```bash
   supabase secrets set SPORTS_API_KEY=your_api_key
   supabase secrets set SUPABASE_URL=your_project_url
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## API Endpoints Used

### SportsData.io Endpoints
- **Current Season**: `https://api.sportsdata.io/v3/nfl/scores/json/CurrentSeason`
- **Current Week**: `https://api.sportsdata.io/v3/nfl/scores/json/CurrentWeek`
- **Scores by Week**: `https://api.sportsdata.io/v3/nfl/scores/json/ScoresByWeek/{season}/{week}`
- **Team Season Stats**: `https://api.sportsdata.io/v3/nfl/scores/json/TeamSeasonStats/{season}`

## Database Operations

### Games Table Upsert
- **Unique Key**: `(year, week, season_type, home_team_id, away_team_id)`
- **Fields Updated**: `datetime`, `status`, `home_score`, `away_score`, `home_offensive_yards`, `away_offensive_yards`
- **Status Mapping**:
  - `FINAL` or `F` → `'FINAL'`
  - `IN_PROGRESS`, `LIVE`, `Q1-Q4`, `OT`, `HALF` → `'IN_PROGRESS'`
  - Everything else → `'SCHEDULED'`

### Team Stats Table Upsert
- **Unique Key**: `(team_id, year, as_of_week)`
- **Features Populated** (matching `model_coefficients.feature_names`):
  - `off_points_per_game`
  - `off_total_yards_per_game`
  - `off_passing_yards_per_game`
  - `off_rushing_yards_per_game`
  - `off_red_zone_efficiency`
  - `off_third_down_efficiency`
  - `def_points_allowed_per_game`
  - `def_total_yards_allowed_per_game`
  - `def_passing_yards_allowed_per_game`
  - `def_rushing_yards_allowed_per_game`
  - `def_red_zone_efficiency`
  - `def_third_down_efficiency`
  - `turnover_margin`
  - `penalty_yards_per_game`

## Usage

### Manual Invocation

#### Using Supabase CLI
```bash
# Deploy the function
supabase functions deploy score-sync

# Invoke for current week
supabase functions invoke score-sync

# Invoke for specific week
supabase functions invoke score-sync --data '{"season": 2024, "week": 5, "seasonType": 2}'
```

#### Using HTTP Request
```bash
# Current week
curl -X POST 'https://your-project.supabase.co/functions/v1/score-sync' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'

# Specific week
curl -X POST 'https://your-project.supabase.co/functions/v1/score-sync?season=2024&week=5&seasonType=2' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### Query Parameters

- `season` (optional): NFL season year (e.g., 2024)
- `week` (optional): Week number (1-18 for regular season)
- `seasonType` (optional): Season type (1=PRE, 2=REG, 3=POST). Default: 2

If no parameters are provided, the function will automatically fetch the current season and week from SportsData.io.

## Automated Scheduling

### Using Supabase Cron Jobs

Add to your Supabase project's `supabase/migrations/` directory:

```sql
-- Create cron job to sync scores every 15 minutes during game days
SELECT cron.schedule(
  'score-sync-gameday',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/score-sync',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '", "Content-Type": "application/json"}'::jsonb
  );
  $$
);

-- Create cron job to sync team stats daily at 6 AM ET
SELECT cron.schedule(
  'score-sync-daily',
  '0 10 * * *', -- 6 AM ET (10 AM UTC)
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/score-sync',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '", "Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

### Using External Cron Services

You can also use external services like:
- **GitHub Actions** (with scheduled workflows)
- **Vercel Cron Jobs**
- **AWS EventBridge**
- **Google Cloud Scheduler**

Example GitHub Action (`.github/workflows/score-sync.yml`):

```yaml
name: NFL Score Sync
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  sync-scores:
    runs-on: ubuntu-latest
    steps:
      - name: Sync NFL Scores
        run: |
          curl -X POST '${{ secrets.SUPABASE_URL }}/functions/v1/score-sync' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}' \
            -H 'Content-Type: application/json'
```

## Response Format

### Success Response
```json
{
  "success": true,
  "season": 2024,
  "week": 5,
  "seasonType": "REG",
  "upsertedGames": 16,
  "upsertedTeamStats": 32,
  "processedAt": "2024-10-15T18:30:00.000Z",
  "gamesProcessed": 16,
  "teamStatsProcessed": 32
}
```

### Error Response
```json
{
  "success": false,
  "error": "SPORTS_API_KEY environment variable is required",
  "timestamp": "2024-10-15T18:30:00.000Z"
}
```

## Team Mapping

The function uses the `team_aliases` table to map SportsData.io team abbreviations to internal team IDs. Make sure to run the team aliases setup:

```sql
-- Run this to add SportsData.io team mappings
\i scripts/sql/add_sportsdata_aliases.sql
```

### Fallback Mapping
If a team is not found in `team_aliases` with provider `'sportsdata'`, the function falls back to matching by the team's `abbreviation` field.

## Monitoring and Logging

The function provides comprehensive logging:

- **Info Logs**: Processing progress, API calls, record counts
- **Warning Logs**: Team mapping failures, data inconsistencies
- **Error Logs**: API failures, database errors, validation issues

View logs in the Supabase Dashboard under Functions → score-sync → Logs.

## Rate Limits

SportsData.io API has rate limits. The function is designed to:
- Make minimal API calls (2 calls per execution)
- Handle rate limit errors gracefully
- Provide detailed error messages for troubleshooting

## Troubleshooting

### Common Issues

1. **Team Mapping Failures**
   - Ensure `scripts/sql/add_sportsdata_aliases.sql` has been executed
   - Check that all NFL teams exist in the `teams` table

2. **API Key Issues**
   - Verify `SPORTS_API_KEY` is set correctly
   - Check API key permissions on SportsData.io dashboard

3. **Database Permission Errors**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
   - Verify RLS policies allow service role access

4. **Missing Environment Variables**
   - All three environment variables are required
   - Check Supabase project settings

### Debug Mode

For debugging, you can add query parameter `debug=true` to get more detailed logging:

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/score-sync?debug=true'
```

## Development

### Local Development

1. **Start Supabase locally**:
   ```bash
   supabase start
   ```

2. **Set local environment variables**:
   ```bash
   echo "SPORTS_API_KEY=your_key" >> .env.local
   ```

3. **Deploy function locally**:
   ```bash
   supabase functions deploy score-sync --no-verify-jwt
   ```

4. **Test locally**:
   ```bash
   supabase functions invoke score-sync --no-verify-jwt
   ```

### Testing

The function includes comprehensive error handling and validation. Test scenarios:

- Valid API responses
- Invalid/missing API keys
- Network failures
- Database connection issues
- Team mapping failures
- Invalid season/week parameters

## Security

- Uses Supabase service role key for database access
- Validates all input parameters
- Sanitizes external API data
- Implements proper error handling without exposing sensitive information
- CORS headers configured for web access
