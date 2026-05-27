import Link from 'next/link'
import Navbar from '@/src/components/Navbar'

const benefits = [
  {
    title: 'Projetos organizados',
    description: 'Organize todos os seus projetos em um unico lugar. Crie quadros Kanban, acompanhe o progresso e mantenha sua equipe alinhada.',
    icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  },
  {
    title: 'Tarefas com prioridade',
    description: 'Defina prioridades para cada tarefa: Baixa, Media, Alta ou Urgente. Foque no que realmente importa para o sucesso do projeto.',
    icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z',
  },
  {
    title: 'Alertas de prazo',
    description: 'Receba alertas sobre prazos proximos do vencimento. Nunca perca uma data importante com o sistema de notificacoes inteligente.',
    icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },
]

const kanbanPreview = [
  {
    title: 'A Fazer',
    tasks: [
      { title: 'Implementar autenticacao', priority: 'Alta' },
      { title: 'Criar pagina de perfil', priority: 'Media' },
      { title: 'Configurar banco de dados', priority: 'Urgente' },
    ],
  },
  {
    title: 'Em andamento',
    tasks: [
      { title: 'Desenvolver dashboard', priority: 'Alta' },
      { title: 'Criar componentes UI', priority: 'Media' },
    ],
  },
  {
    title: 'Concluido',
    tasks: [
      { title: 'Setup inicial do projeto', priority: 'Baixa' },
      { title: 'Definir arquitetura', priority: 'Media' },
    ],
  },
]

const priorityColor = {
  Baixa: 'bg-gray-100 text-gray-600',
  Media: 'bg-blue-100 text-blue-600',
  Alta: 'bg-amber-100 text-amber-600',
  Urgente: 'bg-rose-100 text-rose-600',
}

const columnColors = {
  'A Fazer': 'bg-gray-100 text-gray-600',
  'Em andamento': 'bg-blue-100 text-blue-600',
  Concluido: 'bg-emerald-100 text-emerald-600',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
            Organize seus projetos e tarefas em um so lugar
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Gerencie projetos, acompanhe prazos, defina prioridades e visualize o progresso das suas tarefas com um quadro Kanban simples e eficiente.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Comecar agora
            </Link>
            <Link
              href="/login"
              className="text-gray-700 px-8 py-3.5 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Visualize seu progresso</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Organize suas tarefas em colunas e acompanhe cada etapa do seu projeto.
          </p>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {kanbanPreview.map((column) => (
              <div key={column.title} className="bg-gray-50 rounded-xl p-4 min-w-[280px] flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${columnColors[column.title]}`}>
                    {column.title}
                  </span>
                  <span className="text-sm text-gray-400">{column.tasks.length}</span>
                </div>
                <div className="space-y-3">
                  {column.tasks.map((task, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${priorityColor[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TF</span>
              </div>
              <span className="font-bold text-lg text-white">TaskFlow</span>
            </div>
            <p className="text-sm">&copy; 2026 TaskFlow. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
