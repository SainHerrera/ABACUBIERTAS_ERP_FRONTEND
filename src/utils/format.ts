const esCOLocale = 'es-CO'

export const formatCurrency = (value: number | string) => {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '$0'
  return `$${n.toLocaleString(esCOLocale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export const formatNumber = (value: number | string) => {
  if (typeof value === 'string' && value.trim() === '') return ''
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString(esCOLocale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

export const formatMonthLabel = (key: string): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(key)
  if (!match) return key
  const year = match[1]
  const month = Number(match[2]) - 1
  const monthName = MONTHS_ES[month] ?? match[2]
  return `${monthName}. ${year}`
}
