import { useMemo, useState } from 'react'
import { formatDate, formatMoney, shortEmail } from '../lib/format'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  STATUSES,
  STATUS_LABELS,
  remainingBalance,
  type Category,
  type Expense,
  type Status,
} from '../types/expense'

type SortKey =
  | 'name'
  | 'estimated_cost'
  | 'final_cost'
  | 'amount_paid'
  | 'remaining'
  | 'due_date'

type Props = {
  expenses: Expense[]
  emailByUserId: Record<string, string>
  onAdd: () => void
  onEdit: (expense: Expense) => void
  onArchive: (expense: Expense) => void
  onRestore: (expense: Expense) => void
}

export function ExpensesTable({
  expenses,
  emailByUserId,
  onAdd,
  onEdit,
  onArchive,
  onRestore,
}: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [status, setStatus] = useState<Status | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rows = expenses.filter((e) => {
      if (category !== 'all' && e.category !== category) return false
      if (status !== 'all' && e.status !== status) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.supplier.toLowerCase().includes(q)
      )
    })

    const dir = sortDir === 'asc' ? 1 : -1
    rows.sort((a, b) => {
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
    return rows
  }, [expenses, search, category, status, sortKey, sortDir])

  const totals = useMemo(() => {
    const active = filtered.filter((e) => !e.archived_at && e.status !== 'cancelled')
    return {
      estimated: sum(active.map((e) => e.estimated_cost)),
      final: sum(active.map((e) => e.final_cost)),
      paid: sum(active.map((e) => e.amount_paid)),
      remaining: sum(active.map((e) => remainingBalance(e))),
    }
  }, [filtered])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--line)] bg-white/65 shadow-[var(--shadow)] backdrop-blur-sm">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl text-[var(--leaf-deep)]">הוצאות</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            חיפוש, סינון ועריכה מהירה של כל סעיפי התקציב
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full bg-[var(--leaf)] px-5 py-2.5 text-white transition hover:bg-[var(--leaf-deep)]"
        >
          + הוספת הוצאה
        </button>
      </div>

      <div className="grid gap-3 border-b border-[var(--line)] p-4 sm:grid-cols-3 sm:p-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם או ספק…"
          className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 outline-none focus:border-[var(--leaf)]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | 'all')}
          className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 outline-none focus:border-[var(--leaf)]"
        >
          <option value="all">כל הקטגוריות</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status | 'all')}
          className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 outline-none focus:border-[var(--leaf)]"
        >
          <option value="all">כל הסטטוסים</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-[var(--muted)]">
              <SortableTh label="שם" active={sortKey === 'name'} dir={sortDir} onClick={() => toggleSort('name')} />
              <th className="px-3 py-3 text-start font-medium">קטגוריה</th>
              <th className="px-3 py-3 text-start font-medium">ספק</th>
              <SortableTh label="משוער" active={sortKey === 'estimated_cost'} dir={sortDir} onClick={() => toggleSort('estimated_cost')} />
              <SortableTh label="מוסכם" active={sortKey === 'final_cost'} dir={sortDir} onClick={() => toggleSort('final_cost')} />
              <SortableTh label="שולם" active={sortKey === 'amount_paid'} dir={sortDir} onClick={() => toggleSort('amount_paid')} />
              <SortableTh label="יתרה" active={sortKey === 'remaining'} dir={sortDir} onClick={() => toggleSort('remaining')} />
              <SortableTh label="תאריך תשלום" active={sortKey === 'due_date'} dir={sortDir} onClick={() => toggleSort('due_date')} />
              <th className="px-3 py-3 text-start font-medium">סטטוס</th>
              <th className="px-3 py-3 text-start font-medium">עודכן ע״י</th>
              <th className="px-3 py-3 text-start font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-[var(--muted)]">
                  אין הוצאות להצגה. לחצו על ״הוספת הוצאה״ כדי להתחיל.
                </td>
              </tr>
            ) : (
              filtered.map((expense) => {
                const remaining = remainingBalance(expense)
                const updater =
                  emailByUserId[expense.updated_by ?? ''] ??
                  shortEmail(expense.updated_by)
                return (
                  <tr
                    key={expense.id}
                    className={`border-b border-[var(--line)] transition hover:bg-[var(--paper-2)]/60 ${
                      expense.archived_at ? 'opacity-55' : ''
                    }`}
                  >
                    <td className="px-3 py-3 font-medium text-[var(--ink)]">{expense.name}</td>
                    <td className="px-3 py-3">{CATEGORY_LABELS[expense.category]}</td>
                    <td className="px-3 py-3">{expense.supplier || '—'}</td>
                    <td className="px-3 py-3 tabular-nums">{formatMoney(expense.estimated_cost)}</td>
                    <td className="px-3 py-3 tabular-nums">{formatMoney(expense.final_cost)}</td>
                    <td className="px-3 py-3 tabular-nums">{formatMoney(expense.amount_paid)}</td>
                    <td className="px-3 py-3 tabular-nums font-semibold text-[var(--leaf-deep)]">
                      {formatMoney(remaining)}
                    </td>
                    <td className="px-3 py-3">{formatDate(expense.due_date)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="px-3 py-3 text-[var(--muted)]">{updater}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(expense)}
                          className="rounded-full border border-[var(--line)] px-3 py-1 hover:bg-white"
                        >
                          עריכה
                        </button>
                        {expense.archived_at ? (
                          <button
                            type="button"
                            onClick={() => onRestore(expense)}
                            className="rounded-full border border-[var(--line)] px-3 py-1 hover:bg-white"
                          >
                            שחזור
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onArchive(expense)}
                            className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--blush)] hover:bg-white"
                          >
                            ארכוב
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-[var(--paper-2)]/70 font-semibold">
              <td className="px-3 py-3" colSpan={3}>
                סה״כ ({filtered.length})
              </td>
              <td className="px-3 py-3 tabular-nums">{formatMoney(totals.estimated)}</td>
              <td className="px-3 py-3 tabular-nums">{formatMoney(totals.final)}</td>
              <td className="px-3 py-3 tabular-nums">{formatMoney(totals.paid)}</td>
              <td className="px-3 py-3 tabular-nums text-[var(--leaf-deep)]">
                {formatMoney(totals.remaining)}
              </td>
              <td colSpan={4} />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
}) {
  return (
    <th className="px-3 py-3 text-start font-medium">
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:text-[var(--ink)]">
        {label}
        <span className="text-xs opacity-70">{active ? (dir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    planned: 'bg-[var(--paper-2)] text-[var(--ink-soft)]',
    booked: 'bg-[#dce8e1] text-[var(--leaf-deep)]',
    partially_paid: 'bg-[#f3e6c8] text-[#7a5a1c]',
    paid: 'bg-[#d7eee6] text-[#1f5a3d]',
    cancelled: 'bg-[#f0ddd8] text-[var(--blush)]',
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function sortValue(expense: Expense, key: SortKey): string | number {
  switch (key) {
    case 'name':
      return expense.name.toLowerCase()
    case 'estimated_cost':
      return Number(expense.estimated_cost)
    case 'final_cost':
      return Number(expense.final_cost)
    case 'amount_paid':
      return Number(expense.amount_paid)
    case 'remaining':
      return remainingBalance(expense)
    case 'due_date':
      return expense.due_date ?? ''
  }
}

function sum(values: number[]): number {
  return values.reduce((acc, n) => acc + Number(n || 0), 0)
}
