import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for query parameters
const scoreboardSchema = z.object({
  year: z.string().transform((val) => {
    const num = parseInt(val, 10)
    if (isNaN(num) || num < 2020 || num > 2030) {
      throw new Error('Year must be between 2020 and 2030')
    }
    return num
  }),
  week: z.string().transform((val) => {
    const num = parseInt(val, 10)
    if (isNaN(num) || num < 1 || num > 18) {
      throw new Error('Week must be between 1 and 18')
    }
    return num
  })
})

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters safely
    const url = new URL(request.url)
    const yearParam = url.searchParams.get('year')
    const weekParam = url.searchParams.get('week')

    if (!yearParam || !weekParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: year and week' },
        { status: 400 }
      )
    }

    // Validate parameters with Zod
    const validatedParams = scoreboardSchema.parse({
      year: yearParam,
      week: weekParam
    })

    // Create Supabase server client with service role key
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

    // Fetch games for the specified year and week
    const { data, error } = await supabase
      .from('games')
      .select(`
        id,
        year,
        week,
        season_type,
        home_team_id,
        away_team_id,
        kickoff_time,
        status,
        home_score,
        away_score,
        home_offensive_yards,
        away_offensive_yards,
        home_team:teams!games_home_team_id_fkey(id, name, abbreviation),
        away_team:teams!games_away_team_id_fkey(id, name, abbreviation)
      `)
      .eq('year', validatedParams.year)
      .eq('week', validatedParams.week)
      .order('kickoff_time', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch games: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Invalid parameters: ${error.issues.map((e: any) => e.message).join(', ')}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
