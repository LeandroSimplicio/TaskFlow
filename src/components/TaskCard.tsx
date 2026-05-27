'use client'

import type { Task, TaskStatus } from '@/types/task'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types/task'
import { getPriorityColor, getStatusColor } from '@/src/utils/taskUtils'
import { getDateDisplayInfo } from '@/src/utils/dateUtils'

interface TaskCardProps {
  task: Task
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  canMoveForward?: boolean
  canMoveBackward?: boolean
  nextStatusLabel?: TaskStatus | null
  prevStatusLabel?: TaskStatus | null
}

export default function TaskCard({
  task,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  canMoveForward,
  canMoveBackward,
  nextStatusLabel,
  prevStatusLabel,
}: TaskCardProps) {
  if (!task) return null

  const dateInfo = getDateDisplayInfo(task.due_date, task.status)

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-2 gap-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">{task.title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getPriorityColor(task.priority)}`}>
          {PRIORITY_LABELS[task.priority] || task.priority}
        </span>
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className={dateInfo.color}>{dateInfo.text}</span>
          {dateInfo.label && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${dateInfo.badgeClass}`}>
              {dateInfo.label}
            </span>
          )}
        </div>
        <select
          value={task.status}
          onChange={(e) => {
            const val = e.target.value as TaskStatus
            if (val !== task.status) onStatusChange?.(task.id, val)
          }}
          className={`px-1.5 py-0.5 rounded font-medium text-xs ${getStatusColor(task.status)} cursor-pointer outline-none border-0 bg-none`}
        >
          {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
        {canMoveBackward && onStatusChange && prevStatusLabel && (
          <button
            onClick={() => onStatusChange(task.id, prevStatusLabel)}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title={`Mover para ${STATUS_LABELS[prevStatusLabel]}`}
          >
            &larr;
          </button>
        )}
        {canMoveForward && onStatusChange && nextStatusLabel && (
          <button
            onClick={() => onStatusChange(task.id, nextStatusLabel)}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title={`Mover para ${STATUS_LABELS[nextStatusLabel]}`}
          >
            &rarr;
          </button>
        )}
        <div className="flex-1" />
        {onEditTask && (
          <button
            onClick={() => onEditTask(task)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Editar tarefa"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        )}
        {onDeleteTask && (
          <button
            onClick={() => onDeleteTask(task.id)}
            className="px-2 py-1 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
            title="Excluir tarefa"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  )
}
