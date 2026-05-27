import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error('RESEND_API_KEY nao configurado')
  }
  return new Resend(key)
}

function formatDateBR(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export async function sendTaskExpirationEmail({
  to,
  taskTitle,
  projectName,
  dueDate,
}: {
  to: string
  taskTitle: string
  projectName: string
  dueDate: string
}) {
  const formattedDate = formatDateBR(dueDate)

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="width: 40px; height: 40px; background: #4f46e5; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
      <span style="color: white; font-weight: bold; font-size: 16px;">TF</span>
    </div>
    <h1 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 8px;">Tarefa próxima do vencimento</h1>
    <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px; line-height: 1.5;">
      A tarefa <strong style="color: #111827;">${taskTitle}</strong>
      do projeto <strong style="color: #111827;">${projectName}</strong>
      está próxima do vencimento.
    </p>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 13px; color: #991b1b;">
        <strong>Data de vencimento:</strong> ${formattedDate}
      </p>
    </div>
    <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">
      Acesse o <a href="${process.env.NEXT_PUBLIC_APP_URL ?? '#'}/dashboard" style="color: #4f46e5; text-decoration: none; font-weight: 500;">TaskFlow</a>
      para gerenciar suas tarefas.
    </p>
  </div>
</body>
</html>
  `

  console.log('[TaskFlow][Resend] Enviando email:', {
    to,
    subject: `Tarefa próxima do vencimento: ${taskTitle}`,
  })

  const { data, error } = await getResend().emails.send({
    from: 'TaskFlow <onboarding@resend.dev>',
    to,
    subject: `Tarefa próxima do vencimento: ${taskTitle}`,
    html,
  })

  if (error) {
    console.error('[TaskFlow][Resend] Erro completo retornado:', JSON.stringify(error, null, 2))
    throw new Error(error.message)
  }

  console.log('[TaskFlow][Resend] Email enviado com sucesso:', JSON.stringify(data))
  return data
}
