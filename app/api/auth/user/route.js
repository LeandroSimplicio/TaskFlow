import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createInsForgeServerClient } from '@/src/services/insforgeClient'

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('insforge_access_token')?.value
  if (!accessToken) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const insforge = createInsForgeServerClient(accessToken)
  const { data, error } = await insforge.auth.getCurrentUser()
  if (error || !data?.user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user: data.user })
}
