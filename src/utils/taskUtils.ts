import type { Task, TaskPriority, TaskStatus } from '@/types/task'
import { PRIORITY_LABELS, STATUS_LABELS } from '@/types/task'

export function getPriorityLabel(priority: TaskPriority): string {
  return PRIORITY_LABELS[priority] || priority
}

export function getStatusLabel(status: TaskStatus): string {
  return STATUS_LABELS[status] || status
}

export function getPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  }
  return colors[priority] || 'bg-gray-100 text-gray-600'
}

export function getStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    todo: 'bg-gray-100 text-gray-600',
    doing: 'bg-blue-100 text-blue-700',
    done: 'bg-emerald-100 text-emerald-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

export function calculateProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  const done = tasks.filter((t) => t.status === 'done').length
  return Math.round((done / tasks.length) * 100)
}

export function shouldSendExpirationEmail(task: Task): boolean {
  if (!task.due_date) return false
  if (task.status === 'done') return false
  if (task.email_sent) return false

  const due = new Date(task.due_date + 'T12:00:00')
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  return due >= now && due <= in24h
}
