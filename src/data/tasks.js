export const upcomingTasks = [
  { id: 1, title: 'Revisar prototipo do dashboard', priority: 'Alta', dueDate: 'Amanha', status: 'A Fazer' },
  { id: 2, title: 'Corrigir bug no login social', priority: 'Urgente', dueDate: 'Hoje', status: 'Em andamento' },
  { id: 3, title: 'Atualizar documentacao da API', priority: 'Media', dueDate: 'Em 3 dias', status: 'A Fazer' },
  { id: 4, title: 'Testar fluxo de pagamento', priority: 'Alta', dueDate: 'Amanha', status: 'A Fazer' },
  { id: 5, title: 'Otimizar queries do banco', priority: 'Media', dueDate: 'Em 5 dias', status: 'Em andamento' },
  { id: 6, title: 'Deploy em producao', priority: 'Urgente', dueDate: 'Hoje', status: 'A Fazer' },
]

export const kanbanColumns = {
  'A Fazer': [
    { id: 1, title: 'Implementar autenticacao', description: 'Criar sistema de login com JWT e OAuth2', priority: 'Alta', dueDate: '15/06/2026', status: 'A Fazer' },
    { id: 2, title: 'Criar pagina de perfil', description: 'Pagina de perfil do usuario com edicao de dados', priority: 'Media', dueDate: '20/06/2026', status: 'A Fazer' },
    { id: 3, title: 'Configurar CI/CD', description: 'Pipeline de integracao e deploy continuo', priority: 'Urgente', dueDate: '12/06/2026', status: 'A Fazer' },
    { id: 4, title: 'Testes de integracao', description: 'Cobrir rotas da API com testes automatizados', priority: 'Media', dueDate: '22/06/2026', status: 'A Fazer' },
  ],
  'Em andamento': [
    { id: 5, title: 'Desenvolver dashboard', description: 'Painel principal com graficos e metricas', priority: 'Alta', dueDate: '14/06/2026', status: 'Em andamento' },
    { id: 6, title: 'Criar componentes UI', description: 'Componentes reutilizaveis com Tailwind CSS', priority: 'Media', dueDate: '18/06/2026', status: 'Em andamento' },
    { id: 7, title: 'Integrar API REST', description: 'Conexao do frontend com a API backend', priority: 'Alta', dueDate: '16/06/2026', status: 'Em andamento' },
  ],
  Concluido: [
    { id: 8, title: 'Setup inicial do projeto', description: 'Configuracao inicial do Next.js e Tailwind', priority: 'Baixa', dueDate: '01/06/2026', status: 'Concluido' },
    { id: 9, title: 'Definir arquitetura', description: 'Documentacao da arquitetura do sistema', priority: 'Media', dueDate: '05/06/2026', status: 'Concluido' },
    { id: 10, title: 'Prototipar telas', description: 'Criacao dos prototipos no Figma', priority: 'Media', dueDate: '08/06/2026', status: 'Concluido' },
    { id: 11, title: 'Configurar banco de dados', description: 'Setup do PostgreSQL e schema inicial', priority: 'Urgente', dueDate: '10/06/2026', status: 'Concluido' },
  ],
}

export const priorityStyles = {
  Baixa: 'bg-gray-100 text-gray-600',
  Media: 'bg-blue-100 text-blue-600',
  Alta: 'bg-amber-100 text-amber-600',
  Urgente: 'bg-rose-100 text-rose-600',
}

export const statusStyles = {
  'A Fazer': 'bg-gray-100 text-gray-500',
  'Em andamento': 'bg-blue-100 text-blue-600',
  Concluido: 'bg-emerald-100 text-emerald-600',
}
