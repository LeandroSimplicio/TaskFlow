import { createInsForgeAdminClient } from './insforgeClient'

export interface Profile {
  id: string
  user_id: string
  name: string
  email: string
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const db = createInsForgeAdminClient()

  const { data, error } = await db.database
    .from('profiles')
    .select('id, user_id, name, email')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('[ProfileService] Erro ao buscar perfil:', JSON.stringify(error))
    return null
  }

  return data as Profile | null
}

export async function upsertProfile(userId: string, name: string, email: string): Promise<boolean> {
  const db = createInsForgeAdminClient()

  const { error } = await db.database
    .from('profiles')
    .upsert({
      user_id: userId,
      name,
      email,
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('[ProfileService] Erro ao criar/atualizar perfil:', JSON.stringify(error))
    return false
  }

  console.log(`[ProfileService] Perfil criado/atualizado para usuario ${userId} (${email})`)
  return true
}
