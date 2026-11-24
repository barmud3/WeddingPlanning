import { formatMoney } from '../lib/format'
import type { Expense } from '../types/expense'

type Props = {
  expenses: Expense[]
}

export function SummaryCards({ expenses }: Props) {
  const active = expenses.filter((e) => !e.archived_at && e.status !== 'cancelled')

  const totalEstimated = sum(active.map((e) => e.estimated_cost))
  const totalAgreed = sum(active.map((e) => e.final_cost))
  const totalPaid = sum(active.map((e) => e.amount_paid))
  const remaining = totalAgreed - totalPaid

  const cards = [
    { label: 'סה״כ משוער', value: totalEstimated },
    { label: 'סה״כ מוסכם', value: totalAgreed },
    { label: 'שולם', value: totalPaid },
    { label: 'יתרה לתשלום', value: remaining, emphasize: true },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-2xl border border-[var(--line)] px-5 py-4 ${
            card.emphasize
              ? 'bg-[var(--leaf)] text-white shadow-[var(--shadow)]'
              : 'bg-white/70 backdrop-blur-sm'
          }`}
        >
          <p
            className={`text-sm ${
              card.emphasize ? 'text-white/80' : 'text-[var(--muted)]'
            }`}
          >
            {card.label}
          </p>
          <p className="mt-2 font-display text-3xl tabular-nums tracking-tight">
            {formatMoney(card.value)}
          </p>
        </article>
      ))}
    </section>
  )
}

function sum(values: number[]): number {
  return values.reduce((acc, n) => acc + Number(n || 0), 0)
}
