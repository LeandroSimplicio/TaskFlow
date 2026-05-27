import { NextRequest, NextResponse } from 'next/server'
import { createInsForgeAdminClient } from '@/src/services/insforgeClient'
import { sendTaskExpirationEmail } from '@/src/services/emailService'
import { getProfileByUserId } from '@/src/services/profileService'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const db = createInsForgeAdminClient()

  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const today = now.toISOString().split('T')[0]
  const tomorrow = in24h.toISOString().split('T')[0]

  console.log(`[TaskFlow] Verificando tarefas com due_date entre ${today} e ${tomorrow}`)

  const { data: tasks, error } = await db.database
    .from('tasks')
    .select('*')
    .neq('status', 'done')
    .eq('email_sent', false)
    .gte('due_date', today)
    .lte('due_date', tomorrow)

  if (error) {
    console.error('[TaskFlow] Erro ao buscar tarefas para email:', JSON.stringify(error))
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  console.log(`[TaskFlow] ${tasks?.length ?? 0} tarefas encontradas para processar`)

  let sent = 0
  let failed = 0
  const errors: { taskId: string; step: string; message: string }[] = []

  for (const task of tasks ?? []) {
    const taskId = task.id
    const taskTitle = task.title
    const userId = task.user_id

    console.log(`[TaskFlow] Processando tarefa ${taskId}: "${taskTitle}" (due: ${task.due_date}, user_id: ${userId})`)

    try {
      const profile = await getProfileByUserId(userId)

      if (!profile || !profile.email) {
        console.warn(`[TaskFlow] Perfil nao encontrado para o usuario ${userId}`)
        errors.push({ taskId, step: 'buscar_perfil', message: `Perfil nao encontrado para usuario ${userId}` })
        failed++
        continue
      }

      console.log(`[TaskFlow] Perfil encontrado: id=${profile.id}, email=${profile.email}, name=${profile.name}`)

      const { data: projectData } = await db.database
        .from('projects')
        .select('name')
        .eq('id', task.project_id)
        .single()

      const projectName = projectData?.name ?? 'Projeto'
      console.log(`[TaskFlow] Projeto: ${projectName} (${task.project_id})`)

      console.log('[TaskFlow] Dados enviados ao Resend:', {
        to: profile.email,
        taskTitle,
        projectName,
        dueDate: task.due_date,
      })

      await sendTaskExpirationEmail({
        to: profile.email,
        taskTitle,
        projectName,
        dueDate: task.due_date,
      })

      console.log(`[TaskFlow] Email enviado com sucesso para ${profile.email} (tarefa: ${taskId})`)

      const { error: updateError } = await db.database
        .from('tasks')
        .update({ email_sent: true })
        .eq('id', taskId)

      if (updateError) {
        console.warn(`[TaskFlow] Email enviado mas falha ao marcar email_sent para task ${taskId}:`, JSON.stringify(updateError))
      } else {
        console.log(`[TaskFlow] Task ${taskId} marcada como email_sent=true`)
      }

      sent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[TaskFlow] Falha ao processar tarefa ${taskId}:`, msg)
      errors.push({ taskId, step: 'envio', message: msg })
      failed++
    }
  }

  console.log(`[TaskFlow] Resultado: ${sent} enviados, ${failed} falhas, ${tasks?.length ?? 0} verificadas`)

  return NextResponse.json({
    success: true,
    checked: tasks?.length ?? 0,
    sent,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  })
}
