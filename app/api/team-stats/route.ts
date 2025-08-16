import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for query parameters
const teamStatsSchema = z.object({
  year: z.string().transform((val) => {
    const num = parseInt(val, 10)
    if (isNaN(num) || num < 2020 || num > 2030) {
      throw new Error('Year must be between 2020 and 2030')
    }
    return num
  }),
  asOfWeek: z.string().optional().transform((val) => {
    if (!val || val === 'latest') {
      return 'latest'
    }
    const num = parseInt(val, 10)
    if (isNaN(num) || num < 1 || num > 18) {
      throw new Error('asOfWeek must be "latest" or a number between 1 and 18')
    }
    return num
  })
})

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters safely
    const url = new URL(request.url)
    const yearParam = url.searchParams.get('year')
    const asOfWeekParam = url.searchParams.get('asOfWeek')

    if (!yearParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: year' },
        { status: 400 }
      )
    }

    // Validate parameters with Zod
    const validatedParams = teamStatsSchema.parse({
      year: yearParam,
      asOfWeek: asOfWeekParam
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

    let data, error

    if (validatedParams.asOfWeek === 'latest') {
      // Use the team_stats_latest view for latest stats
      const result = await supabase
        .from('team_stats_latest')
        .select(`
          *,
          team:teams(id, name, abbreviation, conference, division)
        `)
        .eq('year', validatedParams.year)
        .order('team(name)')

      data = result.data
      error = result.error
    } else {
      // Query specific week from team_stats table
      const result = await supabase
        .from('team_stats')
        .select(`
          *,
          team:teams(id, name, abbreviation, conference, division)
        `)
        .eq('year', validatedParams.year)
        .eq('as_of_week', validatedParams.asOfWeek)
        .order('team(name)')

      data = result.data
      error = result.error
    }

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch team stats: ${error.message}` },
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
