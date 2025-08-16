import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Upsert the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Profile upsert error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Init profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
