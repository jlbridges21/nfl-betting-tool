-- Add SportsData.io team aliases to team_aliases table
-- This maps SportsData.io team abbreviations to our internal team IDs

INSERT INTO public.team_aliases (provider, alias, team_id) 
SELECT 'sportsdata', 'BUF', id FROM public.teams WHERE abbreviation = 'BUF'
UNION ALL
SELECT 'sportsdata', 'MIA', id FROM public.teams WHERE abbreviation = 'MIA'
UNION ALL
SELECT 'sportsdata', 'NE', id FROM public.teams WHERE abbreviation = 'NE'
UNION ALL
SELECT 'sportsdata', 'NYJ', id FROM public.teams WHERE abbreviation = 'NYJ'
UNION ALL
SELECT 'sportsdata', 'BAL', id FROM public.teams WHERE abbreviation = 'BAL'
UNION ALL
SELECT 'sportsdata', 'CIN', id FROM public.teams WHERE abbreviation = 'CIN'
UNION ALL
SELECT 'sportsdata', 'CLE', id FROM public.teams WHERE abbreviation = 'CLE'
UNION ALL
SELECT 'sportsdata', 'PIT', id FROM public.teams WHERE abbreviation = 'PIT'
UNION ALL
SELECT 'sportsdata', 'HOU', id FROM public.teams WHERE abbreviation = 'HOU'
UNION ALL
SELECT 'sportsdata', 'IND', id FROM public.teams WHERE abbreviation = 'IND'
UNION ALL
SELECT 'sportsdata', 'JAX', id FROM public.teams WHERE abbreviation = 'JAX'
UNION ALL
SELECT 'sportsdata', 'TEN', id FROM public.teams WHERE abbreviation = 'TEN'
UNION ALL
SELECT 'sportsdata', 'DEN', id FROM public.teams WHERE abbreviation = 'DEN'
UNION ALL
SELECT 'sportsdata', 'KC', id FROM public.teams WHERE abbreviation = 'KC'
UNION ALL
SELECT 'sportsdata', 'LV', id FROM public.teams WHERE abbreviation = 'LV'
UNION ALL
SELECT 'sportsdata', 'LAC', id FROM public.teams WHERE abbreviation = 'LAC'
UNION ALL
SELECT 'sportsdata', 'DAL', id FROM public.teams WHERE abbreviation = 'DAL'
UNION ALL
SELECT 'sportsdata', 'NYG', id FROM public.teams WHERE abbreviation = 'NYG'
UNION ALL
SELECT 'sportsdata', 'PHI', id FROM public.teams WHERE abbreviation = 'PHI'
UNION ALL
SELECT 'sportsdata', 'WAS', id FROM public.teams WHERE abbreviation = 'WSH'  -- SportsData.io uses WAS
UNION ALL
SELECT 'sportsdata', 'CHI', id FROM public.teams WHERE abbreviation = 'CHI'
UNION ALL
SELECT 'sportsdata', 'DET', id FROM public.teams WHERE abbreviation = 'DET'
UNION ALL
SELECT 'sportsdata', 'GB', id FROM public.teams WHERE abbreviation = 'GB'
UNION ALL
SELECT 'sportsdata', 'MIN', id FROM public.teams WHERE abbreviation = 'MIN'
UNION ALL
SELECT 'sportsdata', 'ATL', id FROM public.teams WHERE abbreviation = 'ATL'
UNION ALL
SELECT 'sportsdata', 'CAR', id FROM public.teams WHERE abbreviation = 'CAR'
UNION ALL
SELECT 'sportsdata', 'NO', id FROM public.teams WHERE abbreviation = 'NO'
UNION ALL
SELECT 'sportsdata', 'TB', id FROM public.teams WHERE abbreviation = 'TB'
UNION ALL
SELECT 'sportsdata', 'ARI', id FROM public.teams WHERE abbreviation = 'ARI'
UNION ALL
SELECT 'sportsdata', 'LAR', id FROM public.teams WHERE abbreviation = 'LAR'
UNION ALL
SELECT 'sportsdata', 'SF', id FROM public.teams WHERE abbreviation = 'SF'
UNION ALL
SELECT 'sportsdata', 'SEA', id FROM public.teams WHERE abbreviation = 'SEA'

ON CONFLICT (provider, alias) DO NOTHING;
