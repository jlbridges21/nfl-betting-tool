/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Types for SportsData.io API responses
interface SportsDataGame {
  GameID: number;
  Season: number;
  SeasonType: number;
  Week: number;
  Date: string;
  DateTime: string;
  AwayTeam: string;
  HomeTeam: string;
  AwayScore: number | null;
  HomeScore: number | null;
  Status: string;
  AwayTeamID: number;
  HomeTeamID: number;
  StadiumID: number;
  Updated: string;
  Quarter: string;
  TimeRemainingMinutes: number | null;
  TimeRemainingSeconds: number | null;
  PointSpread: number | null;
  OverUnder: number | null;
  AwayScoreQuarter1: number | null;
  AwayScoreQuarter2: number | null;
  AwayScoreQuarter3: number | null;
  AwayScoreQuarter4: number | null;
  AwayScoreOvertime: number | null;
  HomeScoreQuarter1: number | null;
  HomeScoreQuarter2: number | null;
  HomeScoreQuarter3: number | null;
  HomeScoreQuarter4: number | null;
  HomeScoreOvertime: number | null;
  HasStarted: boolean;
  IsInProgress: boolean;
  IsOver: boolean;
  Has1stQuarterStarted: boolean;
  Has2ndQuarterStarted: boolean;
  Has3rdQuarterStarted: boolean;
  Has4thQuarterStarted: boolean;
  IsOvertime: boolean;
  DownAndDistance: string;
  QuarterDescription: string;
  Possession: string;
  YardLine: number | null;
  YardLineTerritory: string;
  RedZone: string;
  AwayTimeouts: number;
  HomeTimeouts: number;
  DayOfWeek: string;
  Channel: string;
}

interface SportsDataTeamStats {
  StatID: number;
  TeamID: number;
  SeasonType: number;
  Season: number;
  Name: string;
  Team: string;
  Wins: number;
  Losses: number;
  Ties: number;
  WinPercentage: number;
  PointsFor: number;
  PointsAgainst: number;
  NetPoints: number;
  Touchdowns: number;
  TotalYards: number;
  PassingYards: number;
  RushingYards: number;
  Penalties: number;
  PenaltyYards: number;
  Turnovers: number;
  TurnoverDifferential: number;
  RedZoneAttempts: number;
  RedZoneConversions: number;
  ThirdDownAttempts: number;
  ThirdDownConversions: number;
  TimeOfPossessionMinutes: number;
  TimeOfPossessionSeconds: number;
  FirstDowns: number;
  CompletionPercentage: number;
  PasserRating: number;
  QuarterbackRating: number;
  PassingAttempts: number;
  PassingCompletions: number;
  PassingTouchdowns: number;
  PassingInterceptions: number;
  PassingYardsPerAttempt: number;
  PassingYardsPerCompletion: number;
  RushingAttempts: number;
  RushingTouchdowns: number;
  RushingYardsPerAttempt: number;
  RushingLong: number;
  Receptions: number;
  ReceivingYards: number;
  ReceivingTouchdowns: number;
  ReceivingLong: number;
  PuntReturns: number;
  PuntReturnYards: number;
  PuntReturnTouchdowns: number;
  PuntReturnLong: number;
  KickReturns: number;
  KickReturnYards: number;
  KickReturnTouchdowns: number;
  KickReturnLong: number;
  Punts: number;
  PuntYards: number;
  PuntAverage: number;
  FieldGoals: number;
  FieldGoalAttempts: number;
  FieldGoalPercentage: number;
  FieldGoalsLongest: number;
  ExtraPoints: number;
  ExtraPointAttempts: number;
  DefensiveTouchdowns: number;
  SpecialTeamsTouchdowns: number;
  TouchdownsScored: number;
  FumblesForced: number;
  FumblesRecovered: number;
  FumbleReturnYards: number;
  FumbleReturnTouchdowns: number;
  InterceptionReturnYards: number;
  InterceptionReturnTouchdowns: number;
  BlockedKicks: number;
  Safeties: number;
  PuntBlocks: number;
  PuntBlockReturnTouchdowns: number;
  FieldGoalBlocks: number;
  FieldGoalBlockReturnTouchdowns: number;
  ExtraPointBlocks: number;
  ExtraPointBlockReturnTouchdowns: number;
  PuntReturnBlocks: number;
  PuntReturnBlockReturnTouchdowns: number;
  FieldGoalReturnBlocks: number;
  FieldGoalReturnBlockReturnTouchdowns: number;
  PuntNetYards: number;
  OpponentQBRating: number;
  OpponentPunts: number;
  OpponentPuntYards: number;
  OpponentPuntAverage: number;
  OpponentFieldGoals: number;
  OpponentFieldGoalAttempts: number;
  OpponentFieldGoalPercentage: number;
  OpponentFieldGoalsLongest: number;
  OpponentExtraPoints: number;
  OpponentExtraPointAttempts: number;
  OpponentTouchdowns: number;
  OpponentPointsFor: number;
  OpponentTotalYards: number;
  OpponentPassingYards: number;
  OpponentRushingYards: number;
  OpponentPenalties: number;
  OpponentPenaltyYards: number;
  OpponentTurnovers: number;
  OpponentRedZoneAttempts: number;
  OpponentRedZoneConversions: number;
  OpponentThirdDownAttempts: number;
  OpponentThirdDownConversions: number;
  OpponentTimeOfPossessionMinutes: number;
  OpponentTimeOfPossessionSeconds: number;
  OpponentFirstDowns: number;
  OpponentCompletionPercentage: number;
  OpponentPassingAttempts: number;
  OpponentPassingCompletions: number;
  OpponentPassingTouchdowns: number;
  OpponentPassingInterceptions: number;
  OpponentPassingYardsPerAttempt: number;
  OpponentPassingYardsPerCompletion: number;
  OpponentRushingAttempts: number;
  OpponentRushingTouchdowns: number;
  OpponentRushingYardsPerAttempt: number;
  OpponentRushingLong: number;
  OpponentReceptions: number;
  OpponentReceivingYards: number;
  OpponentReceivingTouchdowns: number;
  OpponentReceivingLong: number;
  OpponentFumblesForced: number;
  OpponentFumblesRecovered: number;
  OpponentFumbleReturnYards: number;
  OpponentFumbleReturnTouchdowns: number;
  OpponentInterceptionReturnYards: number;
  OpponentInterceptionReturnTouchdowns: number;
  Sacks: number;
  SackYards: number;
  OpponentSacks: number;
  OpponentSackYards: number;
  TacklesForLoss: number;
  TacklesForLossYards: number;
  OpponentTacklesForLoss: number;
  OpponentTacklesForLossYards: number;
  QuarterbackHits: number;
  OpponentQuarterbackHits: number;
  Updated: string;
  Games: number;
  FantasyPoints: number;
  FantasyPointsPPR: number;
  FantasyPointsFanDuel: number;
  FantasyPointsDraftKings: number;
  FantasyPointsYahoo: number;
  FantasyPointsSuperdraft: number;
  FantasyPointsFantasyDraft: number;
  OffensiveYards: number;
  DefensiveYards: number;
}

// Database types
interface Team {
  id: string;
  abbreviation: string;
  name: string;
}

interface TeamAlias {
  provider: string;
  alias: string;
  team_id: string;
}

interface GameRecord {
  id?: string;
  year: number;
  week: number;
  season_type: string;
  home_team_id: string;
  away_team_id: string;
  kickoff_time?: string;
  status: string;
  home_score?: number;
  away_score?: number;
  home_offensive_yards?: number;
  away_offensive_yards?: number;
}

interface TeamStatsRecord {
  team_id: string;
  year: number;
  as_of_week: number;
  off_points_per_game?: number;
  off_total_yards_per_game?: number;
  off_passing_yards_per_game?: number;
  off_rushing_yards_per_game?: number;
  off_red_zone_efficiency?: number;
  off_third_down_efficiency?: number;
  off_turnovers_per_game?: number;
  off_time_of_possession?: number;
  def_points_allowed_per_game?: number;
  def_total_yards_allowed_per_game?: number;
  def_passing_yards_allowed_per_game?: number;
  def_rushing_yards_allowed_per_game?: number;
  def_red_zone_efficiency?: number;
  def_third_down_efficiency?: number;
  def_turnovers_forced_per_game?: number;
  def_sacks_per_game?: number;
  turnover_margin?: number;
  penalty_yards_per_game?: number;
}

// Helper functions
function mapSeasonType(seasonType: number): string {
  switch (seasonType) {
    case 1: return 'PRE';
    case 2: return 'REG';
    case 3: return 'POST';
    default: return 'REG';
  }
}

function mapGameStatus(status: string): string {
  const statusUpper = status.toUpperCase();
  if (statusUpper.includes('FINAL') || statusUpper === 'F') {
    return 'FINAL';
  } else if (statusUpper.includes('PROGRESS') || statusUpper.includes('LIVE') || 
             statusUpper.includes('Q1') || statusUpper.includes('Q2') || 
             statusUpper.includes('Q3') || statusUpper.includes('Q4') || 
             statusUpper.includes('OT') || statusUpper.includes('HALF')) {
    return 'IN_PROGRESS';
  } else {
    return 'SCHEDULED';
  }
}

async function getTeamMapping(supabase: any): Promise<Map<string, string>> {
  const teamMap = new Map<string, string>();
  
  // Get all teams and their aliases
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, abbreviation');
    
  if (teamsError) {
    console.error('Error fetching teams:', teamsError);
    throw teamsError;
  }

  const { data: aliases, error: aliasesError } = await supabase
    .from('team_aliases')
    .select('provider, alias, team_id');
    
  if (aliasesError) {
    console.error('Error fetching team aliases:', aliasesError);
    throw aliasesError;
  }

  // Build mapping from SportsData.io aliases
  for (const alias of aliases) {
    if (alias.provider === 'sportsdata') {
      teamMap.set(alias.alias, alias.team_id);
    }
  }

  // Fallback: map by team abbreviation
  for (const team of teams) {
    if (!teamMap.has(team.abbreviation)) {
      teamMap.set(team.abbreviation, team.id);
    }
  }

  return teamMap;
}

async function fetchSportsDataGames(apiKey: string, season: number, week: number, seasonType: number = 2): Promise<SportsDataGame[]> {
  const seasonTypeStr = seasonType === 1 ? 'PRE' : seasonType === 3 ? 'POST' : 'REG';
  const seasonParam = `${season}${seasonTypeStr}`;
  
  const url = `https://api.sportsdata.io/v3/nfl/scores/json/ScoresByWeek/${seasonParam}/${week}?key=${apiKey}`;
  
  console.log(`Fetching games from: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SportsData.io API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

async function fetchSportsDataTeamStats(apiKey: string, season: number, seasonType: number = 2): Promise<SportsDataTeamStats[]> {
  const seasonTypeStr = seasonType === 1 ? 'PRE' : seasonType === 3 ? 'POST' : 'REG';
  const seasonParam = `${season}${seasonTypeStr}`;
  
  const url = `https://api.sportsdata.io/v3/nfl/scores/json/TeamSeasonStats/${seasonParam}?key=${apiKey}`;
  
  console.log(`Fetching team stats from: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SportsData.io API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

async function upsertGames(supabase: any, games: GameRecord[]): Promise<number> {
  if (games.length === 0) return 0;

  const { data, error } = await supabase
    .from('games')
    .upsert(games, {
      onConflict: 'year,week,season_type,home_team_id,away_team_id',
      ignoreDuplicates: false
    })
    .select('id');

  if (error) {
    console.error('Error upserting games:', error);
    throw error;
  }

  return data?.length || 0;
}

async function upsertTeamStats(supabase: any, teamStats: TeamStatsRecord[]): Promise<number> {
  if (teamStats.length === 0) return 0;

  const { data, error } = await supabase
    .from('team_stats')
    .upsert(teamStats, {
      onConflict: 'team_id,year,as_of_week',
      ignoreDuplicates: false
    })
    .select('id');

  if (error) {
    console.error('Error upserting team stats:', error);
    throw error;
  }

  return data?.length || 0;
}

function calculateTeamStatsFromSportsData(sportsDataStats: SportsDataTeamStats, games: number): TeamStatsRecord {
  const gamesPlayed = games || sportsDataStats.Games || 1; // Avoid division by zero
  
  return {
    team_id: '', // Will be set by caller
    year: sportsDataStats.Season,
    as_of_week: 0, // Will be set by caller
    off_points_per_game: sportsDataStats.PointsFor / gamesPlayed,
    off_total_yards_per_game: sportsDataStats.TotalYards / gamesPlayed,
    off_passing_yards_per_game: sportsDataStats.PassingYards / gamesPlayed,
    off_rushing_yards_per_game: sportsDataStats.RushingYards / gamesPlayed,
    off_red_zone_efficiency: sportsDataStats.RedZoneAttempts > 0 ? 
      (sportsDataStats.RedZoneConversions / sportsDataStats.RedZoneAttempts) * 100 : 0,
    off_third_down_efficiency: sportsDataStats.ThirdDownAttempts > 0 ? 
      (sportsDataStats.ThirdDownConversions / sportsDataStats.ThirdDownAttempts) * 100 : 0,
    off_turnovers_per_game: sportsDataStats.Turnovers / gamesPlayed,
    off_time_of_possession: sportsDataStats.TimeOfPossessionMinutes + (sportsDataStats.TimeOfPossessionSeconds / 60),
    def_points_allowed_per_game: sportsDataStats.OpponentPointsFor / gamesPlayed,
    def_total_yards_allowed_per_game: sportsDataStats.OpponentTotalYards / gamesPlayed,
    def_passing_yards_allowed_per_game: sportsDataStats.OpponentPassingYards / gamesPlayed,
    def_rushing_yards_allowed_per_game: sportsDataStats.OpponentRushingYards / gamesPlayed,
    def_red_zone_efficiency: sportsDataStats.OpponentRedZoneAttempts > 0 ? 
      (sportsDataStats.OpponentRedZoneConversions / sportsDataStats.OpponentRedZoneAttempts) * 100 : 0,
    def_third_down_efficiency: sportsDataStats.OpponentThirdDownAttempts > 0 ? 
      (sportsDataStats.OpponentThirdDownConversions / sportsDataStats.OpponentThirdDownAttempts) * 100 : 0,
    def_turnovers_forced_per_game: sportsDataStats.OpponentTurnovers / gamesPlayed,
    def_sacks_per_game: sportsDataStats.Sacks / gamesPlayed,
    turnover_margin: sportsDataStats.TurnoverDifferential / gamesPlayed,
    penalty_yards_per_game: sportsDataStats.PenaltyYards / gamesPlayed
  };
}

async function getCurrentWeek(apiKey: string): Promise<{ season: number; week: number; seasonType: number }> {
  try {
    const url = `https://api.sportsdata.io/v3/nfl/scores/json/CurrentSeason?key=${apiKey}`;
    const seasonResponse = await fetch(url);
    const season = await seasonResponse.json();
    
    const weekUrl = `https://api.sportsdata.io/v3/nfl/scores/json/CurrentWeek?key=${apiKey}`;
    const weekResponse = await fetch(weekUrl);
    const week = await weekResponse.json();
    
    // For now, assume regular season. In a production system, you'd want to determine this more accurately
    return {
      season: season || new Date().getFullYear(),
      week: week || 1,
      seasonType: 2 // Regular season
    };
  } catch (error) {
    console.error('Error getting current week, using defaults:', error);
    return {
      season: new Date().getFullYear(),
      week: 1,
      seasonType: 2
    };
  }
}

Deno.serve(async (req: Request) => {
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Get environment variables
    const SPORTS_API_KEY = Deno.env.get('SPORTS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SPORTS_API_KEY) {
      throw new Error('SPORTS_API_KEY environment variable is required');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are required');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current week info or use query parameters
    const url = new URL(req.url);
    const seasonParam = url.searchParams.get('season');
    const weekParam = url.searchParams.get('week');
    const seasonTypeParam = url.searchParams.get('seasonType');

    let season: number, week: number, seasonType: number;

    if (seasonParam && weekParam) {
      season = parseInt(seasonParam);
      week = parseInt(weekParam);
      seasonType = seasonTypeParam ? parseInt(seasonTypeParam) : 2;
    } else {
      const current = await getCurrentWeek(SPORTS_API_KEY);
      season = current.season;
      week = current.week;
      seasonType = current.seasonType;
    }

    console.log(`Processing season ${season}, week ${week}, seasonType ${seasonType}`);

    // Get team mapping
    const teamMap = await getTeamMapping(supabase);
    console.log(`Loaded ${teamMap.size} team mappings`);

    // Fetch games from SportsData.io
    const sportsDataGames = await fetchSportsDataGames(SPORTS_API_KEY, season, week, seasonType);
    console.log(`Fetched ${sportsDataGames.length} games from SportsData.io`);

    // Convert to our game format
    const gameRecords: GameRecord[] = [];
    for (const game of sportsDataGames) {
      const homeTeamId = teamMap.get(game.HomeTeam);
      const awayTeamId = teamMap.get(game.AwayTeam);

      if (!homeTeamId || !awayTeamId) {
        console.warn(`Could not map teams: ${game.HomeTeam} -> ${homeTeamId}, ${game.AwayTeam} -> ${awayTeamId}`);
        continue;
      }

      const gameRecord: GameRecord = {
        year: game.Season,
        week: game.Week,
        season_type: mapSeasonType(game.SeasonType),
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        kickoff_time: game.DateTime ? new Date(game.DateTime).toISOString() : undefined,
        status: mapGameStatus(game.Status),
        home_score: game.HomeScore ?? undefined,
        away_score: game.AwayScore ?? undefined,
        // Note: SportsData.io doesn't provide offensive yards in the scores endpoint
        // You might need to fetch this from box scores or team stats
        home_offensive_yards: undefined,
        away_offensive_yards: undefined
      };

      gameRecords.push(gameRecord);
    }

    // Upsert games
    const upsertedGames = await upsertGames(supabase, gameRecords);
    console.log(`Upserted ${upsertedGames} games`);

    // Fetch and process team stats
    const sportsDataTeamStats = await fetchSportsDataTeamStats(SPORTS_API_KEY, season, seasonType);
    console.log(`Fetched ${sportsDataTeamStats.length} team stats from SportsData.io`);

    // Convert to our team stats format
    const teamStatsRecords: TeamStatsRecord[] = [];
    for (const stats of sportsDataTeamStats) {
      const teamId = teamMap.get(stats.Team);
      
      if (!teamId) {
        console.warn(`Could not map team: ${stats.Team}`);
        continue;
      }

      const teamStatsRecord = calculateTeamStatsFromSportsData(stats, stats.Games);
      teamStatsRecord.team_id = teamId;
      teamStatsRecord.as_of_week = week; // Use current week as "as of" week

      teamStatsRecords.push(teamStatsRecord);
    }

    // Upsert team stats
    const upsertedTeamStats = await upsertTeamStats(supabase, teamStatsRecords);
    console.log(`Upserted ${upsertedTeamStats} team stats records`);

    // Return summary
    const summary = {
      success: true,
      season,
      week,
      seasonType: mapSeasonType(seasonType),
      upsertedGames,
      upsertedTeamStats,
      processedAt: new Date().toISOString(),
      gamesProcessed: gameRecords.length,
      teamStatsProcessed: teamStatsRecords.length
    };

    console.log('Score sync completed successfully:', summary);

    return new Response(
      JSON.stringify(summary),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Score sync error:', error);
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
