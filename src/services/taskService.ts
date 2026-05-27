'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createInsForgeServerClient, createInsForgeAdminClient } from './insforgeClient'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'

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

export async function listTasks(projectId: string): Promise<ServiceResult<Task[]>> {
  try {
    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const { data, error } = await db.database
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function getUserTasks(): Promise<ServiceResult<Task[]>> {
  try {
    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const { data, error } = await db.database
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function createTask(formData: FormData): Promise<ServiceResult<Task>> {
  try {
    const project_id = String(formData.get('project_id') ?? '').trim()
    const title = String(formData.get('title') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const priority = String(formData.get('priority') ?? 'medium') as TaskPriority
    const status = String(formData.get('status') ?? 'todo') as TaskStatus
    const due_date = String(formData.get('due_date') ?? '')

    if (!title) throw new Error('Titulo da tarefa e obrigatorio.')

    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const payload: Record<string, unknown> = { project_id, title, description, priority, status, user_id: userId, email_sent: false }
    if (due_date) payload.due_date = due_date

    const { data, error } = await db.database
      .from('tasks')
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    revalidatePath(`/projects/${project_id}`)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function updateTask(taskId: string, formData: FormData): Promise<ServiceResult<Task>> {
  try {
    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const title = String(formData.get('title') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const priority = String(formData.get('priority') ?? 'medium') as TaskPriority
    const status = String(formData.get('status') ?? 'todo') as TaskStatus
    const due_date = String(formData.get('due_date') ?? '')

    if (!title) throw new Error('Titulo da tarefa e obrigatorio.')

    const payload: Record<string, unknown> = { title, description, priority, status }
    if (due_date) {
      payload.due_date = due_date
    } else {
      payload.due_date = null
    }

    const { data, error } = await db.database
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    revalidatePath(`/projects/${data.project_id}`)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<ServiceResult<Task>> {
  try {
    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const { data, error } = await db.database
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    revalidatePath(`/projects/${data.project_id}`)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function deleteTask(taskId: string): Promise<{ error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const { data: task } = await db.database
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    const { error } = await db.database
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId)

    if (error) throw error
    if (task?.project_id) revalidatePath(`/projects/${task.project_id}`)
    return { error: null }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function getTasksByProject(projectId: string): Promise<ServiceResult<Record<TaskStatus, Task[]>>> {
  try {
    const userId = await getCurrentUserId()
    const db = createInsForgeAdminClient()

    const { data, error } = await db.database
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error

    const columns: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] }
    for (const task of data ?? []) {
      const col = columns[task.status as TaskStatus]
      if (col) col.push(task)
    }

    return { data: columns, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}
