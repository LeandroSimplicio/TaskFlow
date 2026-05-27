import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createInsForgeServerClient } from '@/src/services/insforgeClient'
import { upsertProfile } from '@/src/services/profileService'

export async function GET(request) {
  const params = request.nextUrl.searchParams
  const code = params.get('insforge_code')
  const error = params.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=${error ?? 'oauth_failed'}`, request.url))
  }

  const cookieStore = await cookies()
  const codeVerifier = cookieStore.get('insforge_code_verifier')?.value

  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/login?error=missing_verifier', request.url))
  }

  const insforge = createInsForgeServerClient()
  const { data, error: exchangeError } = await insforge.auth.exchangeOAuthCode(code, codeVerifier)

  if (exchangeError || !data) {
    return NextResponse.redirect(new URL(`/login?error=${exchangeError?.message ?? 'exchange_failed'}`, request.url))
  }

  cookieStore.set('insforge_access_token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  })
  if (data.refreshToken) {
    cookieStore.set('insforge_refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  cookieStore.delete('insforge_code_verifier')

  const oauthUser = data?.user ?? null
  if (oauthUser?.id) {
    await upsertProfile(oauthUser.id, oauthUser.name ?? '', oauthUser.email ?? '')
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
