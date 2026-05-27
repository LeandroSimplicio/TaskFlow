'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createInsForgeServerClient, createInsForgeAdminClient } from './insforgeClient'
import type { Project } from '@/types/project'

type ServiceResult<T> = { data: T; error: null } | { data: null; error: string }

async function getAuthClient() {
  const cookieStore = await cookies()
  const token = cookieStore.get('insforge_access_token')?.value
  if (!token) throw new Error('Nao autenticado')
  return createInsForgeServerClient(token)
}

async function getCurrentUserId(): Promise<string> {
  const authClient = await getAuthClient()
  const { data, error } = await authClient.auth.getCurrentUser()
  if (error || !data?.user) throw new Error('Usuario nao autenticado')
  return data.user.id
}

export async function listProjects(): Promise<ServiceResult<Project[]>> {
  try {
    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const { data, error } = await db.database
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function getProject(id: string): Promise<ServiceResult<Project | null>> {
  try {
    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const { data, error } = await db.database
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return { data, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function createProject(formData: FormData): Promise<ServiceResult<Project>> {
  try {
    const name = String(formData.get('name') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    if (!name) throw new Error('Nome do projeto e obrigatorio.')

    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const payload = { name, description, user_id: userId }

    const { data, error } = await db.database
      .from('projects')
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    revalidatePath('/projects')
    revalidatePath('/dashboard')
    return { data, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function updateProject(id: string, formData: FormData): Promise<ServiceResult<Project>> {
  try {
    const name = String(formData.get('name') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    if (!name) throw new Error('Nome do projeto e obrigatorio.')

    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const payload: Record<string, unknown> = { name }
    if (description) payload.description = description

    const { data, error } = await db.database
      .from('projects')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    revalidatePath('/projects')
    revalidatePath('/dashboard')
    return { data, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function deleteProject(id: string): Promise<{ error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const { error } = await db.database
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
    revalidatePath('/projects')
    return { error: null }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
