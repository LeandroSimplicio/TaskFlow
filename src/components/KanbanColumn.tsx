import TaskCard from '@/src/components/TaskCard'
import type { Task, TaskStatus } from '@/types/task'
import { STATUS_LABELS } from '@/types/task'

interface KanbanColumnProps {
  title: TaskStatus
  tasks: Task[]
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
}

const headerStyles: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-600',
  doing: 'bg-blue-100 text-blue-600',
  done: 'bg-emerald-100 text-emerald-600',
}

const nextStatus: Record<TaskStatus, TaskStatus | null> = {
  todo: 'doing',
  doing: 'done',
  done: null,
}

const prevStatus: Record<TaskStatus, TaskStatus | null> = {
  todo: null,
  doing: 'todo',
  done: 'doing',
}

export default function KanbanColumn({ title, tasks, onStatusChange, onEditTask, onDeleteTask }: KanbanColumnProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 min-w-[280px] flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${headerStyles[title] || 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[title]}
        </div>
        <span className="text-sm text-gray-400">{tasks?.length || 0}</span>
      </div>
      <div className="space-y-3 flex-1">
        {tasks?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            canMoveForward={!!nextStatus[title]}
            canMoveBackward={!!prevStatus[title]}
            nextStatusLabel={nextStatus[title]}
            prevStatusLabel={prevStatus[title]}
          />
        ))}
      </div>
    </div>
  )
}
