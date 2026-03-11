import { NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed'

export async function POST() {
  try {
    const dealId = await seedDatabase()
    return NextResponse.json({ dealId, seeded: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
