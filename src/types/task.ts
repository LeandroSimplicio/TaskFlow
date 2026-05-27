export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'doing' | 'done'

export interface Task {
  id: string
  created_at?: string
  updated_at?: string
  user_id: string
  project_id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date?: string | null
  email_sent?: boolean
}

export interface CreateTaskData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string | null
  user_id: string
  project_id: string
  email_sent?: boolean
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'A Fazer',
  doing: 'Em andamento',
  done: 'Concluído',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}
