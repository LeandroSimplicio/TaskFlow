import TaskCard from './TaskCard'

const headerStyles = {
  'A Fazer': 'bg-gray-100 text-gray-600',
  'Em andamento': 'bg-blue-100 text-blue-600',
  Concluido: 'bg-emerald-100 text-emerald-600',
}

export default function KanbanColumn({ title, tasks }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 min-w-[280px] flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${headerStyles[title] || 'bg-gray-100 text-gray-600'}`}>
          {title}
        </div>
        <span className="text-sm text-gray-400">{tasks.length}</span>
      </div>
      <div className="space-y-3 flex-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
      </div>
    </div>
  )
}
