export function formatDateBR(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function isOverdue(dateString: string | null | undefined, status: string): boolean {
  if (!dateString || status === 'done') return false
  const due = new Date(dateString + 'T12:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return due < now
}

export function isDueSoon(dateString: string | null | undefined, status: string, hours = 48): boolean {
  if (!dateString || status === 'done') return false
  const due = new Date(dateString + 'T12:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const limit = new Date(now)
  limit.setHours(limit.getHours() + hours)
  return due >= now && due <= limit
}

export interface DateDisplayInfo {
  text: string
  color: string
  label: string
  badgeClass: string
}

export function getDateDisplayInfo(dateString: string | null | undefined, status: string): DateDisplayInfo {
  if (!dateString || status === 'done') {
    return {
      text: dateString ? formatDateBR(dateString) : '-',
      color: 'text-gray-400',
      label: '',
      badgeClass: '',
    }
  }

  const due = new Date(dateString + 'T12:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (due < now) {
    return {
      text: formatDateBR(dateString),
      color: 'text-red-600 font-semibold',
      label: 'Atrasada',
      badgeClass: 'bg-red-50 text-red-600',
    }
  }

  const in48h = new Date(now)
  in48h.setHours(in48h.getHours() + 48)

  if (due <= in48h) {
    return {
      text: formatDateBR(dateString),
      color: 'text-amber-600 font-semibold',
      label: 'Próximo do prazo',
      badgeClass: 'bg-amber-50 text-amber-600',
    }
  }

  return {
    text: formatDateBR(dateString),
    color: 'text-gray-500',
    label: '',
    badgeClass: '',
  }
}
