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

    // Query user metrics from the view
    const { data: summary, error: summaryError } = await supabase
      .from('v_user_metrics')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (summaryError && summaryError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return NextResponse.json(
        { error: `Failed to fetch user metrics: ${summaryError.message}` },
        { status: 500 }
      )
    }

    // Query per-team accuracy from the view
    const { data: perTeam, error: perTeamError } = await supabase
      .from('v_user_team_accuracy')
      .select('*')
      .eq('user_id', user.id)
      .order('accuracy_percentage', { ascending: false })

    if (perTeamError) {
      return NextResponse.json(
        { error: `Failed to fetch team accuracy: ${perTeamError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      summary: summary || {
        total_predictions: 0,
        accurate_predictions: 0,
        accuracy_percentage: null,
        avg_home_error: null,
        avg_away_error: null,
        mae_home: null,
        mae_away: null,
        mae_spread: null,
        mae_total: null
      },
      perTeam: perTeam || []
    })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
