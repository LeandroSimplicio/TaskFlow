'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '@/src/components/AppLayout'
import StatCard from '@/src/components/StatCard'
import ProjectCard from '@/src/components/ProjectCard'
import Button from '@/src/components/Button'
import { listProjects } from '@/src/services/projectService'
import { getUserTasks } from '@/src/services/taskService'
import type { Project } from '@/types/project'
import type { Task } from '@/types/task'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types/task'
import { getPriorityColor, getStatusColor } from '@/src/utils/taskUtils'
import { formatDateBR, isOverdue, isDueSoon } from '@/src/utils/dateUtils'

interface Stat {
  title: string
  value: string
  description: string
  color: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<Stat[]>([
    { title: 'Total de projetos', value: '0', description: 'Carregando...', color: 'indigo' },
    { title: 'Total de tarefas', value: '0', description: 'Carregando...', color: 'emerald' },
    { title: 'Tarefas concluidas', value: '0', description: 'Carregando...', color: 'amber' },
    { title: 'Proximas do prazo', value: '0', description: 'Carregando...', color: 'rose' },
  ])
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [emailResult, setEmailResult] = useState<string | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [projRes, tasksRes] = await Promise.all([
        listProjects(),
        getUserTasks(),
      ])

      if (projRes.error) {
        setLoading(false)
        return
      }

      const projectsData = projRes.data ?? []
      const tasksData = tasksRes.data ?? []

      const totalTasks = tasksData.length
      const completedTasks = tasksData.filter((t) => t.status === 'done').length
      const urgentTasks = tasksData.filter((t) => t.priority === 'urgent' && t.status !== 'done').length

      const overdue = tasksData.filter((t) => isOverdue(t.due_date, t.status))
      const soon = tasksData.filter((t) => isDueSoon(t.due_date, t.status, 48) && !isOverdue(t.due_date, t.status))
      const nearDeadline = overdue.length + soon.length

      setProjects(projectsData.slice(0, 4))
      setStats([
        { title: 'Total de projetos', value: String(projectsData.length), description: 'Projetos criados', color: 'indigo' },
        { title: 'Total de tarefas', value: String(totalTasks), description: `${urgentTasks} urgentes`, color: 'emerald' },
        { title: 'Tarefas concluidas', value: String(completedTasks), description: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% de conclusao`, color: 'amber' },
        { title: 'Proximas do prazo', value: String(nearDeadline), description: `${overdue.length} atrasadas, ${soon.length} em 48h`, color: 'rose' },
      ])

      const sorted = [...overdue, ...soon].slice(0, 10)
      setUpcomingTasks(soon)
      setOverdueTasks(overdue)
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">Bem-vindo ao TaskFlow</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          className="text-xs gap-2"
          disabled={emailLoading}
          onClick={async () => {
            setEmailLoading(true)
            setEmailResult(null)
            try {
              const res = await fetch('/api/tasks/check-expiring', {
                headers: { Authorization: `Bearer cron_taskflow_secret_2026` },
              })
              const json = await res.json()
              setEmailResult(json.success ? `Enviados: ${json.sent} | Falhas: ${json.failed} | Verificadas: ${json.checked}` : `Erro: ${json.error}`)
            } catch {
              setEmailResult('Erro ao conectar com a rota')
            }
            setEmailLoading(false)
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          {emailLoading ? 'Verificando...' : 'Testar alertas de vencimento'}
        </Button>
        {emailResult && (
          <span className={`text-xs font-medium ${emailResult.startsWith('Enviados') ? 'text-emerald-600' : 'text-rose-600'}`}>
            {emailResult}
          </span>
        )}
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Projetos recentes</h2>
          <Link href="/projects" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Ver todos</Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando projetos...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 mb-2">Nenhum projeto ainda</p>
            <Link href="/projects" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">Criar seu primeiro projeto</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} id={project.id} name={project.name} description={project.description} tasksCount={0} progress={0} />
            ))}
          </div>
        )}
      </section>

      {overdueTasks.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarefas atrasadas</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Tarefa</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Prioridade</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Prazo</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {overdueTasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-red-600 font-semibold">{formatDateBR(task.due_date)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>
                        {STATUS_LABELS[task.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarefas próximas do prazo</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Tarefa</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Prioridade</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Prazo</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingTasks.length === 0 && overdueTasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Carregando...' : 'Nenhuma tarefa pendente com prazo proximo'}
                  </td>
                </tr>
              ) : upcomingTasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma tarefa proxima do prazo
                  </td>
                </tr>
              ) : (
                upcomingTasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-amber-600 font-semibold">{formatDateBR(task.due_date)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>
                        {STATUS_LABELS[task.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  )
}
