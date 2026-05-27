'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createInsForgeServerClient } from './insforgeClient'
import { upsertProfile } from './profileService'

const ACCESS_COOKIE = 'insforge_access_token'
const REFRESH_COOKIE = 'insforge_refresh_token'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}

function getClient() {
  return createInsForgeServerClient()
}

export async function signIn(formData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { success: false, error: 'E-mail e senha são obrigatórios.' }
  }

  const insforge = getClient()
  const { data, error } = await insforge.auth.signInWithPassword({ email, password })

  if (error || !data?.accessToken || !data?.refreshToken) {
    if (error?.statusCode === 403) {
      return { success: false, error: 'E-mail não verificado. Verifique sua caixa de entrada.', requireVerification: true, email }
    }
    return { success: false, error: error?.message ?? 'Falha ao entrar.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(ACCESS_COOKIE, data.accessToken, { ...cookieOptions, maxAge: 60 * 15 })
  cookieStore.set(REFRESH_COOKIE, data.refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 })

  return { success: true }
}

export async function signUp(formData) {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!name || !email || !password) {
    return { success: false, error: 'Todos os campos são obrigatórios.' }
  }

  if (password.length < 6) {
    return { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' }
  }

  const insforge = getClient()
  const { data, error } = await insforge.auth.signUp({
    name,
    email,
    password,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  })

  if (error) {
    return { success: false, error: error?.message ?? 'Falha ao cadastrar.' }
  }

  const userData = data?.user ?? null

  if (userData?.id) {
    await upsertProfile(userData.id, userData.name ?? name, userData.email ?? email)
  }

  if (data?.requireEmailVerification) {
    return { success: true, requireEmailVerification: true, email }
  }

  if (data?.accessToken) {
    const cookieStore = await cookies()
    cookieStore.set(ACCESS_COOKIE, data.accessToken, { ...cookieOptions, maxAge: 60 * 15 })
    cookieStore.set(REFRESH_COOKIE, data.refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 })
    return { success: true }
  }

  return { success: true, requireEmailVerification: true, email }
}

export async function verifyEmail(formData) {
  const email = String(formData.get('email') ?? '').trim()
  const otp = String(formData.get('otp') ?? '').trim()

  if (!email || !otp) {
    return { success: false, error: 'E-mail e código são obrigatórios.' }
  }

  const insforge = getClient()
  const { data, error } = await insforge.auth.verifyEmail({ email, otp })

  if (error) {
    return { success: false, error: error?.message ?? 'Código inválido.' }
  }

  if (data?.accessToken) {
    const cookieStore = await cookies()
    cookieStore.set(ACCESS_COOKIE, data.accessToken, { ...cookieOptions, maxAge: 60 * 15 })
    if (data.refreshToken) {
      cookieStore.set(REFRESH_COOKIE, data.refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 })
    }

    const verifiedUser = data?.user ?? null
    if (verifiedUser?.id) {
      await upsertProfile(verifiedUser.id, verifiedUser.name ?? '', verifiedUser.email ?? email)
    }

    return { success: true }
  }

  return { success: true }
}

export async function resendVerificationEmail(formData) {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { success: false, error: 'E-mail é obrigatório.' }

  const insforge = getClient()
  const { error } = await insforge.auth.resendVerificationEmail({
    email,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value
  if (!accessToken) return null

  const insforge = createInsForgeServerClient(accessToken)
  const { data, error } = await insforge.auth.getCurrentUser()
  if (error || !data?.user) return null

  return data.user
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_COOKIE)
  cookieStore.delete(REFRESH_COOKIE)
  redirect('/login')
}

export async function initiateOAuth(provider) {
  const insforge = getClient()
  const { data, error } = await insforge.auth.signInWithOAuth({
    provider,
    redirectTo: new URL('/api/auth/callback', process.env.NEXT_PUBLIC_APP_URL).toString(),
    skipBrowserRedirect: true,
  })

  if (error || !data?.url) {
    throw new Error(error?.message ?? 'Falha ao iniciar OAuth.')
  }

  const cookieStore = await cookies()
  cookieStore.set('insforge_code_verifier', data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })

  redirect(data.url)
}

export async function sendResetCode(formData) {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { success: false, error: 'E-mail é obrigatório.' }

  const insforge = getClient()
  const { error } = await insforge.auth.resetPasswordWithCode({
    email,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  })

  if (error) return { success: false, error: error.message }
  return { success: true, email }
}

export async function resetPassword(formData) {
  const email = String(formData.get('email') ?? '').trim()
  const code = String(formData.get('code') ?? '').trim()
  const newPassword = String(formData.get('newPassword') ?? '')

  if (!email || !code || !newPassword) {
    return { success: false, error: 'Todos os campos são obrigatórios.' }
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' }
  }

  const insforge = getClient()
  const { data, error } = await insforge.auth.resetPassword({
    email,
    code,
    password: newPassword,
  })

  if (error) return { success: false, error: error.message }

  if (data?.accessToken) {
    const cookieStore = await cookies()
    cookieStore.set(ACCESS_COOKIE, data.accessToken, { ...cookieOptions, maxAge: 60 * 15 })
    if (data.refreshToken) {
      cookieStore.set(REFRESH_COOKIE, data.refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 })
    }
  }

  return { success: true }
}
