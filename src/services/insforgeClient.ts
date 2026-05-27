import { createClient } from '@insforge/sdk'

function getAdminKey(): string {
  const fromEnv = process.env.INSFORGE_API_KEY
  if (fromEnv) return fromEnv
  try {
    const config = require('../../.insforge/project.json')
    return config.api_key
  } catch {
    throw new Error('INSFORGE_API_KEY nao definido. Defina INSFORGE_API_KEY no ambiente ou mantenha .insforge/project.json.')
  }
}

export function createInsForgeServerClient(accessToken: string) {
  const client = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    isServerMode: true,
  })

  if (accessToken) {
    client.setAccessToken(accessToken)
  }

  return client
}

export function createInsForgeAdminClient() {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: getAdminKey(),
    isServerMode: true,
  })
}
