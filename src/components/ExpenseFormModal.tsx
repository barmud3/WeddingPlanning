import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Expense,
  type ExpenseFormValues,
} from '../types/expense'

type Props = {
  open: boolean
  initial?: Expense | null
  onClose: () => void
  onSubmit: (values: ExpenseFormValues) => Promise<void>
}

const empty: ExpenseFormValues = {
  name: '',
  category: 'other',
  supplier: '',
  estimated_cost: 0,
  final_cost: 0,
  amount_paid: 0,
  due_date: '',
  status: 'planned',
  notes: '',
}

export function ExpenseFormModal({ open, initial, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<ExpenseFormValues>(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setValues({
        name: initial.name,
        category: initial.category,
        supplier: initial.supplier,
        estimated_cost: Number(initial.estimated_cost),
        final_cost: Number(initial.final_cost),
        amount_paid: Number(initial.amount_paid),
        due_date: initial.due_date ?? '',
        status: initial.status,
        notes: initial.notes,
      })
    } else {
      setValues(empty)
    }
    setError(null)
    setBusy(false)
  }, [open, initial])

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!values.name.trim()) {
      setError('שם ההוצאה הוא שדה חובה')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSubmit(values)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שמירה נכשלה')
      setBusy(false)
    }
  }

  function set<K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="סגירה"
        className="absolute inset-0 bg-[var(--ink)]/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[var(--shadow)] sm:rounded-3xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-[var(--leaf-deep)]">
              {initial ? 'עריכת הוצאה' : 'הוצאה חדשה'}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">מלאו את הפרטים ושמרו</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-[var(--muted)] hover:bg-black/5"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4">
          <Field label="שם ההוצאה">
            <input
              required
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              className="field"
              placeholder="למשל: צלם חתונה"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="קטגוריה">
              <select
                value={values.category}
                onChange={(e) => set('category', e.target.value as ExpenseFormValues['category'])}
                className="field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="סטטוס">
              <select
                value={values.status}
                onChange={(e) => set('status', e.target.value as ExpenseFormValues['status'])}
                className="field"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="ספק">
            <input
              value={values.supplier}
              onChange={(e) => set('supplier', e.target.value)}
              className="field"
              placeholder="שם העסק"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="משוער (₪)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={values.estimated_cost}
                onChange={(e) => set('estimated_cost', Number(e.target.value))}
                className="field"
              />
            </Field>
            <Field label="מוסכם (₪)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={values.final_cost}
                onChange={(e) => set('final_cost', Number(e.target.value))}
                className="field"
              />
            </Field>
            <Field label="שולם (₪)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={values.amount_paid}
                onChange={(e) => set('amount_paid', Number(e.target.value))}
                className="field"
              />
            </Field>
          </div>

          <Field label="תאריך תשלום">
            <input
              type="date"
              value={values.due_date}
              onChange={(e) => set('due_date', e.target.value)}
              className="field"
            />
          </Field>

          <Field label="הערות">
            <textarea
              rows={3}
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
              className="field resize-y"
              placeholder="פרטים נוספים…"
            />
          </Field>
        </div>

        {error && <p className="mt-4 text-sm text-[var(--blush)]">{error}</p>}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-[var(--ink-soft)] hover:bg-black/5"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-[var(--leaf)] px-6 py-2.5 text-white hover:bg-[var(--leaf-deep)] disabled:opacity-60"
          >
            {busy ? 'שומר…' : 'שמירה'}
          </button>
        </div>
      </form>

      <style>{`
        .field {
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.75);
          padding: 0.7rem 0.9rem;
          color: var(--ink);
          outline: none;
        }
        .field:focus {
          border-color: var(--leaf);
          box-shadow: 0 0 0 3px rgba(47, 93, 74, 0.15);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-[var(--ink-soft)]">{label}</span>
      {children}
    </label>
  )
}
