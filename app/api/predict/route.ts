import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for request body
const predictSchema = z.object({
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  seasonYear: z.number().int().min(2020).max(2030).default(2025),
  seasonType: z.enum(['REG', 'POST']).default('REG'),
  forceNewPredictionForPostseason: z.boolean().optional().default(false)
})

// In-memory rate limiting (simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 10 // 10 requests per minute per user

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Extract JWT from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const jwt = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Parse and validate request body
    const body = await request.json()
    const validatedBody = predictSchema.parse(body)

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Check if user can consume prediction
    const { data: canConsume, error: consumeError } = await supabase
      .rpc('fn_can_consume_prediction', { u_id: user.id })

    if (consumeError) {
      return NextResponse.json(
        { error: `Failed to check prediction limit: ${consumeError.message}` },
        { status: 500 }
      )
    }

    if (!canConsume) {
      return NextResponse.json(
        { error: 'Upgrade required' },
        { status: 402 }
      )
    }

    // Check for historical game if REG season and not forcing new prediction
    if (validatedBody.seasonType === 'REG' && !validatedBody.forceNewPredictionForPostseason) {
      const { data: existingGame, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('year', validatedBody.seasonYear)
        .eq('home_team_id', validatedBody.homeTeamId)
        .eq('away_team_id', validatedBody.awayTeamId)
        .eq('status', 'FINAL')
        .single()

      if (!gameError && existingGame) {
        // Historical mode - insert prediction with actual scores
        const { data: userPrediction, error: insertError } = await supabase
          .from('user_predictions')
          .insert({
            user_id: user.id,
            home_team_id: validatedBody.homeTeamId,
            away_team_id: validatedBody.awayTeamId,
            game_id: existingGame.id,
            predicted_home_score: existingGame.home_score,
            predicted_away_score: existingGame.away_score,
            actual_home_score: existingGame.home_score,
            actual_away_score: existingGame.away_score,
            was_accurate: null, // Will be calculated by trigger
            mode: 'historical',
            season_year: validatedBody.seasonYear
          })
          .select()
          .single()

        if (insertError) {
          return NextResponse.json(
            { error: `Failed to create historical prediction: ${insertError.message}` },
            { status: 500 }
          )
        }

        return NextResponse.json({
          mode: 'historical',
          week: existingGame.week,
          actual_home_score: existingGame.home_score,
          actual_away_score: existingGame.away_score,
          user_prediction_id: userPrediction.id
        })
      }
    }

    // Prediction mode - get team stats and model coefficients
    const [teamStatsResult, coefficientsResult] = await Promise.all([
      supabase
        .from('team_stats_latest')
        .select('*')
        .eq('year', validatedBody.seasonYear)
        .in('team_id', [validatedBody.homeTeamId, validatedBody.awayTeamId]),
      supabase
        .from('model_coefficients')
        .select('*')
        .eq('id', 1)
        .single()
    ])

    if (teamStatsResult.error) {
      return NextResponse.json(
        { error: `Failed to fetch team stats: ${teamStatsResult.error.message}` },
        { status: 500 }
      )
    }

    if (coefficientsResult.error) {
      return NextResponse.json(
        { error: `Failed to fetch model coefficients: ${coefficientsResult.error.message}` },
        { status: 500 }
      )
    }

    const teamStats = teamStatsResult.data
    const coefficients = coefficientsResult.data

    if (teamStats.length !== 2) {
      return NextResponse.json(
        { error: 'Could not find stats for both teams' },
        { status: 400 }
      )
    }

    // Find home and away team stats
    const homeStats = teamStats.find(stat => stat.team_id === validatedBody.homeTeamId)
    const awayStats = teamStats.find(stat => stat.team_id === validatedBody.awayTeamId)

    if (!homeStats || !awayStats) {
      return NextResponse.json(
        { error: 'Could not find stats for both teams' },
        { status: 400 }
      )
    }

    // Build feature vector based on feature_names order
    const featureNames = coefficients.feature_names
    const features: number[] = []

    for (const featureName of featureNames) {
      let featureValue = 0

      // Map feature names to stat differences (home advantage)
      switch (featureName) {
        case 'off_points_per_game_diff':
          featureValue = (homeStats.off_points_per_game || 0) - (awayStats.def_points_allowed_per_game || 0)
          break
        case 'off_total_yards_per_game_diff':
          featureValue = (homeStats.off_total_yards_per_game || 0) - (awayStats.def_total_yards_allowed_per_game || 0)
          break
        case 'off_passing_yards_per_game_diff':
          featureValue = (homeStats.off_passing_yards_per_game || 0) - (awayStats.def_passing_yards_allowed_per_game || 0)
          break
        case 'off_rushing_yards_per_game_diff':
          featureValue = (homeStats.off_rushing_yards_per_game || 0) - (awayStats.def_rushing_yards_allowed_per_game || 0)
          break
        case 'off_red_zone_efficiency_diff':
          featureValue = (homeStats.off_red_zone_efficiency || 0) - (awayStats.def_red_zone_efficiency || 0)
          break
        case 'off_third_down_efficiency_diff':
          featureValue = (homeStats.off_third_down_efficiency || 0) - (awayStats.def_third_down_efficiency || 0)
          break
        case 'turnover_margin_diff':
          featureValue = (homeStats.turnover_margin || 0) - (awayStats.turnover_margin || 0)
          break
        default:
          // Fallback to simple home - away difference
          const homeValue = (homeStats as any)[featureName.replace('_diff', '')] || 0
          const awayValue = (awayStats as any)[featureName.replace('_diff', '')] || 0
          featureValue = homeValue - awayValue
      }

      features.push(featureValue)
    }

    // Calculate predictions using dot product
    const homeCoefs = coefficients.home_coefs.map(Number)
    const awayCoefs = coefficients.away_coefs.map(Number)
    const homeIntercept = Number(coefficients.home_intercept)
    const awayIntercept = Number(coefficients.away_intercept)

    let predictedHomeScore = homeIntercept
    let predictedAwayScore = awayIntercept

    for (let i = 0; i < features.length; i++) {
      predictedHomeScore += features[i] * homeCoefs[i]
      predictedAwayScore += features[i] * awayCoefs[i]
    }

    // Round to 2 decimal places
    predictedHomeScore = Math.round(predictedHomeScore * 100) / 100
    predictedAwayScore = Math.round(predictedAwayScore * 100) / 100

    // Insert user prediction
    const { data: userPrediction, error: insertError } = await supabase
      .from('user_predictions')
      .insert({
        user_id: user.id,
        home_team_id: validatedBody.homeTeamId,
        away_team_id: validatedBody.awayTeamId,
        predicted_home_score: predictedHomeScore,
        predicted_away_score: predictedAwayScore,
        mode: 'prediction',
        season_year: validatedBody.seasonYear
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to create prediction: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Insert model prediction
    const { error: modelInsertError } = await supabase
      .from('model_predictions')
      .insert({
        user_prediction_id: userPrediction.id,
        home_team_features: homeStats,
        away_team_features: awayStats,
        feature_vector: features,
        model_version: coefficients.model_version
      })

    if (modelInsertError) {
      return NextResponse.json(
        { error: `Failed to create model prediction: ${modelInsertError.message}` },
        { status: 500 }
      )
    }

    // Check if user is premium, if not increment free predictions
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()

    if (profile && !profile.is_premium) {
      const { error: incrementError } = await supabase
        .rpc('fn_increment_free_predictions', { u_id: user.id })

      if (incrementError) {
        // Log error but don't fail the request
        console.error('Failed to increment free predictions:', incrementError)
      }
    }

    return NextResponse.json({
      mode: 'predicted',
      predicted_home_score: predictedHomeScore,
      predicted_away_score: predictedAwayScore,
      user_prediction_id: userPrediction.id
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Invalid request body: ${error.issues.map(e => e.message).join(', ')}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
