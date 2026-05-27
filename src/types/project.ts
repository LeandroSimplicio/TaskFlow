export interface Project {
  id: string
  created_at?: string
  updated_at?: string
  user_id: string
  name: string
  description?: string | null
}

export interface CreateProjectData {
  name: string
  description?: string
  user_id: string
}
