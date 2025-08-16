import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    // Query user predictions with joined data
    const { data: predictions, error: queryError } = await supabase
      .from('user_predictions')
      .select(`
        *,
        home_team:teams!user_predictions_home_team_id_fkey(id, name, abbreviation),
        away_team:teams!user_predictions_away_team_id_fkey(id, name, abbreviation),
        model_predictions(*),
        game:games(
          id,
          week,
          season_type,
          status,
          home_score,
          away_score,
          home_offensive_yards,
          away_offensive_yards
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (queryError) {
      return NextResponse.json(
        { error: `Failed to fetch predictions: ${queryError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(predictions || [])

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
