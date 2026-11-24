const currency = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
})

const currencyExact = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatMoney(value: number | null | undefined): string {
  const n = Number(value ?? 0)
  return Number.isInteger(n) ? currency.format(n) : currencyExact.format(n)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('he-IL')
}

export function shortEmail(email: string | null | undefined): string {
  if (!email) return '—'
  return email.split('@')[0] ?? email
}
