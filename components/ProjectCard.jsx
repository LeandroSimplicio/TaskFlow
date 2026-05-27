import Link from 'next/link'

export default function ProjectCard({ id, name, description, tasksCount, progress }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>{tasksCount} tarefas</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        Ver projeto
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  )
}
