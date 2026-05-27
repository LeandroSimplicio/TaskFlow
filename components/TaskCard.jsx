const priorityStyles = {
  Baixa: 'bg-gray-100 text-gray-600',
  Media: 'bg-blue-100 text-blue-600',
  Alta: 'bg-amber-100 text-amber-600',
  Urgente: 'bg-rose-100 text-rose-600',
}

const statusStyles = {
  'A Fazer': 'bg-gray-100 text-gray-500',
  'Em andamento': 'bg-blue-100 text-blue-600',
  Concluido: 'bg-emerald-100 text-emerald-600',
}

export default function TaskCard({ title, description, priority, dueDate, status }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-2 gap-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">{title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${priorityStyles[priority] || priorityStyles.Baixa}`}>
          {priority}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{dueDate}</span>
        <span className={`px-1.5 py-0.5 rounded font-medium ${statusStyles[status] || statusStyles['A Fazer']}`}>
          {status}
        </span>
      </div>
    </div>
  )
}
