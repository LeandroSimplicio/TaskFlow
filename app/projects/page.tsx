'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/src/components/AppLayout'
import ProjectCard from '@/src/components/ProjectCard'
import Button from '@/src/components/Button'
import Input from '@/src/components/Input'
import Modal from '@/src/components/Modal'
import { listProjects, createProject, updateProject, deleteProject } from '@/src/services/projectService'
import type { Project } from '@/types/project'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const loadProjects = useCallback(async () => {
    const { data, error } = await listProjects()
    if (!error && data) setProjects(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError('')

    const fd = new FormData()
    fd.set('name', createForm.name)
    fd.set('description', createForm.description)

    const result = await createProject(fd)

    if (result.error) {
      setCreateError(result.error)
      setCreating(false)
    } else {
      setCreateOpen(false)
      setCreateForm({ name: '', description: '' })
      setCreating(false)
      router.refresh()
      loadProjects()
    }
  }

  const handleEditProject = (project: { id: string; name: string; description?: string | null }) => {
    setEditTarget(projects.find((p) => p.id === project.id) ?? null)
    setEditForm({ name: project.name, description: project.description ?? '' })
    setEditError('')
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setSaving(true)
    setEditError('')

    const fd = new FormData()
    fd.set('name', editForm.name)
    fd.set('description', editForm.description)

    const result = await updateProject(editTarget.id, fd)

    if (result.error) {
      setEditError(result.error)
      setSaving(false)
    } else {
      setEditTarget(null)
      setSaving(false)
      router.refresh()
      loadProjects()
    }
  }

  const handleDeleteProject = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')

    const result = await deleteProject(deleteTarget)

    if (result.error) {
      setDeleteError(result.error)
      setDeleting(false)
    } else {
      setDeleteTarget(null)
      setDeleting(false)
      router.refresh()
      loadProjects()
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Projetos</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} projetos ativos</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Projeto
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Carregando projetos...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg mb-4">Nenhum projeto ainda</p>
          <Button onClick={() => setCreateOpen(true)}>Criar primeiro projeto</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              tasksCount={0}
              progress={0}
              onEdit={handleEditProject}
              onDelete={(id) => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setCreateError('') }} title="Novo Projeto">
        <form onSubmit={handleCreateProject} className="space-y-5">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">{createError}</div>
          )}
          <Input
            label="Nome do projeto"
            type="text"
            name="name"
            placeholder="Digite o nome do projeto"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
          />
          <div className="space-y-1.5">
            <label htmlFor="createDescription" className="block text-sm font-medium text-gray-700">Descricao</label>
            <textarea
              id="createDescription"
              name="description"
              rows={3}
              placeholder="Descreva o projeto"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder-gray-400 bg-white resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => { setCreateOpen(false); setCreateError('') }}>Cancelar</Button>
            <Button type="submit" disabled={creating}>{creating ? 'Criando...' : 'Criar Projeto'}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editTarget} onClose={() => { setEditTarget(null); setEditError('') }} title="Editar Projeto">
        <form onSubmit={handleSaveEdit} className="space-y-5">
          {editError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">{editError}</div>
          )}
          <Input
            label="Nome do projeto"
            type="text"
            name="name"
            placeholder="Digite o nome do projeto"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <div className="space-y-1.5">
            <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">Descricao</label>
            <textarea
              id="editDescription"
              name="description"
              rows={3}
              placeholder="Descreva o projeto"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder-gray-400 bg-white resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => { setEditTarget(null); setEditError('') }}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeleteError('') }} title="Excluir Projeto">
        <p className="text-gray-600 mb-4">Tem certeza que deseja excluir este projeto? Todas as tarefas vinculadas tambem serao removidas.</p>
        {deleteError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600 mb-4">{deleteError}</div>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { setDeleteTarget(null); setDeleteError('') }}>Cancelar</Button>
          <Button type="button" variant="primary" className="bg-rose-600 hover:bg-rose-700" disabled={deleting} onClick={handleDeleteProject}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </AppLayout>
  )
}
