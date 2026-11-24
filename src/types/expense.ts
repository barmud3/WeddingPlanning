export const CATEGORIES = [
  'venue',
  'catering',
  'photography',
  'music',
  'attire',
  'decor',
  'invitations',
  'transportation',
  'beauty',
  'other',
] as const

export type Category = (typeof CATEGORIES)[number]

export const STATUSES = [
  'planned',
  'booked',
  'partially_paid',
  'paid',
  'cancelled',
] as const

export type Status = (typeof STATUSES)[number]

export interface Expense {
  id: string
  name: string
  category: Category
  supplier: string
  estimated_cost: number
  final_cost: number
  amount_paid: number
  due_date: string | null
  status: Status
  notes: string
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

export type ExpenseFormValues = {
  name: string
  category: Category
  supplier: string
  estimated_cost: number
  final_cost: number
  amount_paid: number
  due_date: string
  status: Status
  notes: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  venue: 'אולם / מקום',
  catering: 'קייטרינג',
  photography: 'צילום',
  music: 'מוזיקה',
  attire: 'לבוש',
  decor: 'עיצוב',
  invitations: 'הזמנות',
  transportation: 'הסעות',
  beauty: 'יופי וטיפוח',
  other: 'אחר',
}

export const STATUS_LABELS: Record<Status, string> = {
  planned: 'מתוכנן',
  booked: 'הוזמן',
  partially_paid: 'שולם חלקית',
  paid: 'שולם',
  cancelled: 'בוטל',
}

export function remainingBalance(expense: Pick<Expense, 'final_cost' | 'amount_paid'>): number {
  return Number(expense.final_cost) - Number(expense.amount_paid)
}
