import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create Supabase server client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Missing Supabase configuration' 
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test database connectivity by querying model_coefficients table
    const { data, error } = await supabase
      .from('model_coefficients')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { 
          ok: false, 
          error: `Database connection failed: ${error.message}` 
        },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      ok: true,
      db: 'connected'
    })

  } catch (error) {
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
