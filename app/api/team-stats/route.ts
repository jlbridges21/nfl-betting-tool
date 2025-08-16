// app/api/team-stats/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// ---- Query validation ----
const QuerySchema = z.object({
  year: z
    .string()
    .transform((v) => Number.parseInt(v, 10))
    .refine((n) => Number.isFinite(n) && n >= 2020 && n <= 2030, {
      message: 'year must be an integer between 2020 and 2030',
    }),
  asOfWeek: z
    .string()
    .optional()
    // normalize: undefined | '' | 'latest' => 'latest'
    .transform((v) => (v == null || v === '' || v === 'latest' ? 'latest' : v))
    .pipe(
      z.union([
        z.literal('latest'),
        z
          .string()
          .transform((v) => Number.parseInt(v, 10))
          .refine((n) => Number.isFinite(n) && n >= 1 && n <= 30, {
            message: 'asOfWeek must be "latest" or an integer between 1 and 30',
          }),
      ])
    ),
});

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing Supabase env vars' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.safeParse({
      year: searchParams.get('year'),
      asOfWeek: searchParams.get('asOfWeek'),
    });

    if (!parsed.success) {
      const msg =
        parsed.error.issues?.[0]?.message ?? 'invalid query parameters';
      return NextResponse.json({ error: `Invalid parameters: ${msg}` }, { status: 400 });
    }

    const { year, asOfWeek } = parsed.data;

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Base select with nested team info
    const selectCols = `
      *,
      team:teams(id, name, abbreviation, conference, division)
    `;

    if (asOfWeek === 'latest') {
      // Use the materialized/latest view for speed
      const { data, error } = await supabase
        .from('team_stats_latest')
        .select(selectCols)
        .eq('year', year)
        // order by related table column using foreignTable option
        .order('name', { ascending: true, foreignTable: 'teams' });

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch latest team stats: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(asArray(data), { status: 200 });
    }

    // Specific week (number)
    const weekNum = asOfWeek as number;
    const { data, error } = await supabase
      .from('team_stats')
      .select(selectCols)
      .eq('year', year)
      .eq('as_of_week', weekNum)
      .order('name', { ascending: true, foreignTable: 'teams' });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch team stats: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(asArray(data), { status: 200 });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}