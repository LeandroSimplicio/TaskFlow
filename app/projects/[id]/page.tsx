'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/src/components/AppLayout'
import KanbanColumn from '@/src/components/KanbanColumn'
import Button from '@/src/components/Button'
import Input from '@/src/components/Input'
import Modal from '@/src/components/Modal'
import { getProject } from '@/src/services/projectService'
import { getTasksByProject, createTask, updateTask, updateTaskStatus, deleteTask } from '@/src/services/taskService'
import type { Project } from '@/types/project'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types/task'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [columns, setColumns] = useState<Record<TaskStatus, Task[]>>({ todo: [], doing: [], done: [] })
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '', description: '', priority: 'medium' as TaskPriority, due_date: '', status: 'todo' as TaskStatus,
  })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [editTarget, setEditTarget] = useState<Task | null>(null)
  const [editForm, setEditForm] = useState({
    title: '', description: '', priority: 'medium' as TaskPriority, due_date: '', status: 'todo' as TaskStatus,
  })
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    const [projResult, tasksResult] = await Promise.all([
      getProject(id),
      getTasksByProject(id),
    ])
    if (projResult.data) setProject(projResult.data)
    if (!tasksResult.error && tasksResult.data) setColumns(tasksResult.data)
    setLoading(false)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError('')

    const fd = new FormData()
    fd.set('project_id', id)
    fd.set('title', createForm.title)
    fd.set('description', createForm.description)
    fd.set('priority', createForm.priority)
    fd.set('status', createForm.status)
    fd.set('due_date', createForm.due_date)

    const result = await createTask(fd)

    if (result.error) {
      setCreateError(result.error)
      setCreating(false)
    } else {
      setCreateOpen(false)
      setCreateForm({ title: '', description: '', priority: 'medium', due_date: '', status: 'todo' })
      setCreating(false)
      router.refresh()
      loadData()
    }
  }

  const handleEditTask = (task: Task) => {
    setEditTarget(task)
    setEditForm({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      due_date: task.due_date ?? '',
      status: task.status,
    })
    setEditError('')
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setSaving(true)
    setEditError('')

    const fd = new FormData()
    fd.set('title', editForm.title)
    fd.set('description', editForm.description)
    fd.set('priority', editForm.priority)
    fd.set('status', editForm.status)
    fd.set('due_date', editForm.due_date)

    const result = await updateTask(editTarget.id, fd)

    if (result.error) {
      setEditError(result.error)
      setSaving(false)
    } else {
      setEditTarget(null)
      setSaving(false)
      router.refresh()
      loadData()
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const prevTask = Object.values(columns).flat().find((t) => t.id === taskId)
    if (!prevTask || prevTask.status === newStatus) return

    const result = await updateTaskStatus(taskId, newStatus)
    if (!result.error) {
      setColumns((prev) => {
        const updated = { ...prev }
        for (const key of Object.keys(updated) as TaskStatus[]) {
          updated[key] = updated[key].filter((t) => t.id !== taskId)
        }
        const moved = { ...prevTask, status: newStatus }
        updated[newStatus] = [...updated[newStatus], moved]
        return updated
      })
    } else {
      loadData()
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    setDeleting(true)
    const result = await deleteTask(taskId)
    if (!result.error) {
      setColumns((prev) => {
        const updated = { ...prev }
        for (const key of Object.keys(updated) as TaskStatus[]) {
          updated[key] = updated[key].filter((t) => t.id !== taskId)
        }
        return updated
      })
    }
    setConfirmDelete(null)
    setDeleting(false)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-gray-500">Carregando projeto...</div>
      </AppLayout>
    )
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Projeto nao encontrado</h1>
          <p className="text-gray-500">O projeto que voce esta procurando nao existe ou foi removido.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          </div>
          <Button className="gap-2 shrink-0" onClick={() => setCreateOpen(true)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova Tarefa
          </Button>
        </div>

        <div className="flex gap-4 mt-8 overflow-x-auto pb-4">
          {Object.entries(columns).map(([title, tasks]) => (
            <KanbanColumn
              key={title}
              title={title as TaskStatus}
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEditTask={handleEditTask}
              onDeleteTask={(taskId) => setConfirmDelete(taskId)}
            />
          ))}
        </div>
      </div>

      {/* Create task modal */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setCreateError('') }} title="Nova Tarefa">
        <form onSubmit={handleCreateTask} className="space-y-5">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">{createError}</div>
          )}
          <Input
            label="Titulo"
            type="text"
            name="title"
            placeholder="Digite o titulo da tarefa"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
          />
          <div className="space-y-1.5">
            <label htmlFor="createTaskDescription" className="block text-sm font-medium text-gray-700">Descricao</label>
            <textarea
              id="createTaskDescription"
              name="description"
              rows={2}
              placeholder="Descreva a tarefa"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder-gray-400 bg-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="createTaskPriority" className="block text-sm font-medium text-gray-700">Prioridade</label>
              <select
                id="createTaskPriority"
                name="priority"
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as TaskPriority })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white"
              >
                {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="createTaskStatus" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="createTaskStatus"
                name="status"
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as TaskStatus })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white"
              >
                {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Prazo"
            type="date"
            name="due_date"
            value={createForm.due_date}
            onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => { setCreateOpen(false); setCreateError('') }}>Cancelar</Button>
            <Button type="submit" disabled={creating}>{creating ? 'Criando...' : 'Criar Tarefa'}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit task modal */}
      <Modal isOpen={!!editTarget} onClose={() => { setEditTarget(null); setEditError('') }} title="Editar Tarefa">
        <form onSubmit={handleSaveEdit} className="space-y-5">
          {editError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">{editError}</div>
          )}
          <Input
            label="Titulo"
            type="text"
            name="title"
            placeholder="Digite o titulo da tarefa"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <div className="space-y-1.5">
            <label htmlFor="editTaskDescription" className="block text-sm font-medium text-gray-700">Descricao</label>
            <textarea
              id="editTaskDescription"
              name="description"
              rows={2}
              placeholder="Descreva a tarefa"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder-gray-400 bg-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="editTaskPriority" className="block text-sm font-medium text-gray-700">Prioridade</label>
              <select
                id="editTaskPriority"
                name="priority"
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as TaskPriority })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white"
              >
                {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="editTaskStatus" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="editTaskStatus"
                name="status"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TaskStatus })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white"
              >
                {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Prazo"
            type="date"
            name="due_date"
            value={editForm.due_date}
            onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => { setEditTarget(null); setEditError('') }}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete task confirmation */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Excluir tarefa">
        <p className="text-gray-600 mb-6">Tem certeza que deseja excluir esta tarefa? Esta acao nao pode ser desfeita.</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setConfirmDelete(null)} disabled={deleting}>Cancelar</Button>
          <Button type="button" variant="primary" className="bg-rose-600 hover:bg-rose-700" disabled={deleting} onClick={() => handleDeleteTask(confirmDelete!)}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </AppLayout>
  )
}
