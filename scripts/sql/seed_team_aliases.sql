-- Seed data for team_aliases table
-- This maps external provider codes to internal team IDs
-- Note: This assumes teams have been inserted first with specific IDs or names

-- First, we need to get team IDs. This script assumes teams exist.
-- In practice, you would replace these with actual UUIDs from your teams table.

-- Example provider aliases for common sports data providers
-- ESPN, NFL.com, SportsRadar, etc. often use different abbreviations

-- AFC East
INSERT INTO public.team_aliases (provider, alias, team_id) 
SELECT 'espn', 'BUF', id FROM public.teams WHERE abbreviation = 'BUF'
UNION ALL
SELECT 'espn', 'MIA', id FROM public.teams WHERE abbreviation = 'MIA'
UNION ALL
SELECT 'espn', 'NE', id FROM public.teams WHERE abbreviation = 'NE'
UNION ALL
SELECT 'espn', 'NYJ', id FROM public.teams WHERE abbreviation = 'NYJ'

-- AFC North
UNION ALL
SELECT 'espn', 'BAL', id FROM public.teams WHERE abbreviation = 'BAL'
UNION ALL
SELECT 'espn', 'CIN', id FROM public.teams WHERE abbreviation = 'CIN'
UNION ALL
SELECT 'espn', 'CLE', id FROM public.teams WHERE abbreviation = 'CLE'
UNION ALL
SELECT 'espn', 'PIT', id FROM public.teams WHERE abbreviation = 'PIT'

-- AFC South
UNION ALL
SELECT 'espn', 'HOU', id FROM public.teams WHERE abbreviation = 'HOU'
UNION ALL
SELECT 'espn', 'IND', id FROM public.teams WHERE abbreviation = 'IND'
UNION ALL
SELECT 'espn', 'JAX', id FROM public.teams WHERE abbreviation = 'JAX'
UNION ALL
SELECT 'espn', 'TEN', id FROM public.teams WHERE abbreviation = 'TEN'

-- AFC West
UNION ALL
SELECT 'espn', 'DEN', id FROM public.teams WHERE abbreviation = 'DEN'
UNION ALL
SELECT 'espn', 'KC', id FROM public.teams WHERE abbreviation = 'KC'
UNION ALL
SELECT 'espn', 'LV', id FROM public.teams WHERE abbreviation = 'LV'
UNION ALL
SELECT 'espn', 'LAC', id FROM public.teams WHERE abbreviation = 'LAC'

-- NFC East
UNION ALL
SELECT 'espn', 'DAL', id FROM public.teams WHERE abbreviation = 'DAL'
UNION ALL
SELECT 'espn', 'NYG', id FROM public.teams WHERE abbreviation = 'NYG'
UNION ALL
SELECT 'espn', 'PHI', id FROM public.teams WHERE abbreviation = 'PHI'
UNION ALL
SELECT 'espn', 'WSH', id FROM public.teams WHERE abbreviation = 'WSH'

-- NFC North
UNION ALL
SELECT 'espn', 'CHI', id FROM public.teams WHERE abbreviation = 'CHI'
UNION ALL
SELECT 'espn', 'DET', id FROM public.teams WHERE abbreviation = 'DET'
UNION ALL
SELECT 'espn', 'GB', id FROM public.teams WHERE abbreviation = 'GB'
UNION ALL
SELECT 'espn', 'MIN', id FROM public.teams WHERE abbreviation = 'MIN'

-- NFC South
UNION ALL
SELECT 'espn', 'ATL', id FROM public.teams WHERE abbreviation = 'ATL'
UNION ALL
SELECT 'espn', 'CAR', id FROM public.teams WHERE abbreviation = 'CAR'
UNION ALL
SELECT 'espn', 'NO', id FROM public.teams WHERE abbreviation = 'NO'
UNION ALL
SELECT 'espn', 'TB', id FROM public.teams WHERE abbreviation = 'TB'

-- NFC West
UNION ALL
SELECT 'espn', 'ARI', id FROM public.teams WHERE abbreviation = 'ARI'
UNION ALL
SELECT 'espn', 'LAR', id FROM public.teams WHERE abbreviation = 'LAR'
UNION ALL
SELECT 'espn', 'SF', id FROM public.teams WHERE abbreviation = 'SF'
UNION ALL
SELECT 'espn', 'SEA', id FROM public.teams WHERE abbreviation = 'SEA'

ON CONFLICT (provider, alias) DO NOTHING;

-- Alternative provider aliases (NFL.com style)
INSERT INTO public.team_aliases (provider, alias, team_id) 
SELECT 'nfl', 'BUF', id FROM public.teams WHERE abbreviation = 'BUF'
UNION ALL
SELECT 'nfl', 'MIA', id FROM public.teams WHERE abbreviation = 'MIA'
UNION ALL
SELECT 'nfl', 'NE', id FROM public.teams WHERE abbreviation = 'NE'
UNION ALL
SELECT 'nfl', 'NYJ', id FROM public.teams WHERE abbreviation = 'NYJ'
UNION ALL
SELECT 'nfl', 'BAL', id FROM public.teams WHERE abbreviation = 'BAL'
UNION ALL
SELECT 'nfl', 'CIN', id FROM public.teams WHERE abbreviation = 'CIN'
UNION ALL
SELECT 'nfl', 'CLE', id FROM public.teams WHERE abbreviation = 'CLE'
UNION ALL
SELECT 'nfl', 'PIT', id FROM public.teams WHERE abbreviation = 'PIT'
UNION ALL
SELECT 'nfl', 'HOU', id FROM public.teams WHERE abbreviation = 'HOU'
UNION ALL
SELECT 'nfl', 'IND', id FROM public.teams WHERE abbreviation = 'IND'
UNION ALL
SELECT 'nfl', 'JAC', id FROM public.teams WHERE abbreviation = 'JAX'  -- Note: NFL.com uses JAC instead of JAX
UNION ALL
SELECT 'nfl', 'TEN', id FROM public.teams WHERE abbreviation = 'TEN'
UNION ALL
SELECT 'nfl', 'DEN', id FROM public.teams WHERE abbreviation = 'DEN'
UNION ALL
SELECT 'nfl', 'KC', id FROM public.teams WHERE abbreviation = 'KC'
UNION ALL
SELECT 'nfl', 'LV', id FROM public.teams WHERE abbreviation = 'LV'
UNION ALL
SELECT 'nfl', 'LAC', id FROM public.teams WHERE abbreviation = 'LAC'
UNION ALL
SELECT 'nfl', 'DAL', id FROM public.teams WHERE abbreviation = 'DAL'
UNION ALL
SELECT 'nfl', 'NYG', id FROM public.teams WHERE abbreviation = 'NYG'
UNION ALL
SELECT 'nfl', 'PHI', id FROM public.teams WHERE abbreviation = 'PHI'
UNION ALL
SELECT 'nfl', 'WAS', id FROM public.teams WHERE abbreviation = 'WSH'  -- Note: NFL.com uses WAS instead of WSH
UNION ALL
SELECT 'nfl', 'CHI', id FROM public.teams WHERE abbreviation = 'CHI'
UNION ALL
SELECT 'nfl', 'DET', id FROM public.teams WHERE abbreviation = 'DET'
UNION ALL
SELECT 'nfl', 'GB', id FROM public.teams WHERE abbreviation = 'GB'
UNION ALL
SELECT 'nfl', 'MIN', id FROM public.teams WHERE abbreviation = 'MIN'
UNION ALL
SELECT 'nfl', 'ATL', id FROM public.teams WHERE abbreviation = 'ATL'
UNION ALL
SELECT 'nfl', 'CAR', id FROM public.teams WHERE abbreviation = 'CAR'
UNION ALL
SELECT 'nfl', 'NO', id FROM public.teams WHERE abbreviation = 'NO'
UNION ALL
SELECT 'nfl', 'TB', id FROM public.teams WHERE abbreviation = 'TB'
UNION ALL
SELECT 'nfl', 'ARI', id FROM public.teams WHERE abbreviation = 'ARI'
UNION ALL
SELECT 'nfl', 'LAR', id FROM public.teams WHERE abbreviation = 'LAR'
UNION ALL
SELECT 'nfl', 'SF', id FROM public.teams WHERE abbreviation = 'SF'
UNION ALL
SELECT 'nfl', 'SEA', id FROM public.teams WHERE abbreviation = 'SEA'

ON CONFLICT (provider, alias) DO NOTHING;

-- SportsRadar style aliases (often use different formats)
INSERT INTO public.team_aliases (provider, alias, team_id) 
SELECT 'sportsradar', 'BUF', id FROM public.teams WHERE abbreviation = 'BUF'
UNION ALL
SELECT 'sportsradar', 'MIA', id FROM public.teams WHERE abbreviation = 'MIA'
UNION ALL
SELECT 'sportsradar', 'NE', id FROM public.teams WHERE abbreviation = 'NE'
UNION ALL
SELECT 'sportsradar', 'NYJ', id FROM public.teams WHERE abbreviation = 'NYJ'
UNION ALL
SELECT 'sportsradar', 'BAL', id FROM public.teams WHERE abbreviation = 'BAL'
UNION ALL
SELECT 'sportsradar', 'CIN', id FROM public.teams WHERE abbreviation = 'CIN'
UNION ALL
SELECT 'sportsradar', 'CLE', id FROM public.teams WHERE abbreviation = 'CLE'
UNION ALL
SELECT 'sportsradar', 'PIT', id FROM public.teams WHERE abbreviation = 'PIT'
UNION ALL
SELECT 'sportsradar', 'HOU', id FROM public.teams WHERE abbreviation = 'HOU'
UNION ALL
SELECT 'sportsradar', 'IND', id FROM public.teams WHERE abbreviation = 'IND'
UNION ALL
SELECT 'sportsradar', 'JAX', id FROM public.teams WHERE abbreviation = 'JAX'
UNION ALL
SELECT 'sportsradar', 'TEN', id FROM public.teams WHERE abbreviation = 'TEN'
UNION ALL
SELECT 'sportsradar', 'DEN', id FROM public.teams WHERE abbreviation = 'DEN'
UNION ALL
SELECT 'sportsradar', 'KC', id FROM public.teams WHERE abbreviation = 'KC'
UNION ALL
SELECT 'sportsradar', 'LV', id FROM public.teams WHERE abbreviation = 'LV'
UNION ALL
SELECT 'sportsradar', 'LAC', id FROM public.teams WHERE abbreviation = 'LAC'
UNION ALL
SELECT 'sportsradar', 'DAL', id FROM public.teams WHERE abbreviation = 'DAL'
UNION ALL
SELECT 'sportsradar', 'NYG', id FROM public.teams WHERE abbreviation = 'NYG'
UNION ALL
SELECT 'sportsradar', 'PHI', id FROM public.teams WHERE abbreviation = 'PHI'
UNION ALL
SELECT 'sportsradar', 'WSH', id FROM public.teams WHERE abbreviation = 'WSH'
UNION ALL
SELECT 'sportsradar', 'CHI', id FROM public.teams WHERE abbreviation = 'CHI'
UNION ALL
SELECT 'sportsradar', 'DET', id FROM public.teams WHERE abbreviation = 'DET'
UNION ALL
SELECT 'sportsradar', 'GB', id FROM public.teams WHERE abbreviation = 'GB'
UNION ALL
SELECT 'sportsradar', 'MIN', id FROM public.teams WHERE abbreviation = 'MIN'
UNION ALL
SELECT 'sportsradar', 'ATL', id FROM public.teams WHERE abbreviation = 'ATL'
UNION ALL
SELECT 'sportsradar', 'CAR', id FROM public.teams WHERE abbreviation = 'CAR'
UNION ALL
SELECT 'sportsradar', 'NO', id FROM public.teams WHERE abbreviation = 'NO'
UNION ALL
SELECT 'sportsradar', 'TB', id FROM public.teams WHERE abbreviation = 'TB'
UNION ALL
SELECT 'sportsradar', 'ARI', id FROM public.teams WHERE abbreviation = 'ARI'
UNION ALL
SELECT 'sportsradar', 'LAR', id FROM public.teams WHERE abbreviation = 'LAR'
UNION ALL
SELECT 'sportsradar', 'SF', id FROM public.teams WHERE abbreviation = 'SF'
UNION ALL
SELECT 'sportsradar', 'SEA', id FROM public.teams WHERE abbreviation = 'SEA'

ON CONFLICT (provider, alias) DO NOTHING;
