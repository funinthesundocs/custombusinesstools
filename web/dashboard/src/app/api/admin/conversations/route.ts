import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('external_agent_conversations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (data ?? []) as Array<{ device_id: string; created_at: string; [key: string]: unknown }>

    // Group by device_id
    const groups: Record<string, { device_id: string; count: number; last_active: string }> = {}
    for (const row of rows) {
      const id = row.device_id
      if (!groups[id]) {
        groups[id] = { device_id: id, count: 0, last_active: row.created_at }
      }
      groups[id].count++
      if (row.created_at > groups[id].last_active) {
        groups[id].last_active = row.created_at
      }
    }

    return NextResponse.json({
      total: rows.length,
      devices: Object.values(groups),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const deviceId = request.nextUrl.searchParams.get('device_id')

    if (deviceId) {
      const { error } = await supabase
        .from('external_agent_conversations')
        .delete()
        .eq('device_id', deviceId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase
        .from('external_agent_conversations')
        .delete()
        .neq('device_id', '')
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
