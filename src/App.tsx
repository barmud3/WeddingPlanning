import { useMemo, useState } from 'react'
import { ExpenseFormModal } from './components/ExpenseFormModal'
import { ExpensesTable } from './components/ExpensesTable'
import { LoginPage } from './components/LoginPage'
import { SummaryCards } from './components/SummaryCards'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useExpenses } from './hooks/useExpenses'
import { shortEmail } from './lib/format'
import type { Expense, ExpenseFormValues } from './types/expense'

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

function AppShell() {
  const { user, loading: authLoading, unauthorized, signOut } = useAuth()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        טוען…
      </div>
    )
  }

  if (!user || unauthorized) {
    return <LoginPage />
  }

  return <Dashboard userId={user.id} email={user.email ?? ''} onSignOut={() => void signOut()} />
}

function Dashboard({
  userId,
  email,
  onSignOut,
}: {
  userId: string
  email: string
  onSignOut: () => void
}) {
  const [showArchived, setShowArchived] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)

  const {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    archiveExpense,
    restoreExpense,
  } = useExpenses(showArchived)

  const emailByUserId = useMemo(() => {
    const map: Record<string, string> = { [userId]: shortEmail(email) }
    for (const expense of expenses) {
      if (expense.updated_by && !map[expense.updated_by]) {
        map[expense.updated_by] = 'בן/בת הזוג'
      }
      if (expense.created_by && !map[expense.created_by]) {
        map[expense.created_by] = 'בן/בת הזוג'
      }
    }
    return map
  }, [expenses, userId, email])

  async function handleSubmit(values: ExpenseFormValues) {
    if (editing) {
      await updateExpense(editing.id, values, userId)
    } else {
      await createExpense(values, userId)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--gold)]">תכנון משותף</p>
          <h1 className="font-display mt-1 text-4xl text-[var(--leaf-deep)] sm:text-5xl">
            תקציב החתונה
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">מחוברים כ־{email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 px-4 py-2 text-sm">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="accent-[var(--leaf)]"
            />
            הצג בארכיון
          </label>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-2 text-sm hover:bg-white"
          >
            התנתקות
          </button>
        </div>
      </header>

      <div className="grid gap-6">
        <SummaryCards expenses={expenses} />

        {error && (
          <div className="rounded-2xl border border-[var(--blush)]/40 bg-[#f8ebe7] px-4 py-3 text-[var(--blush)]">
            שגיאה בטעינת ההוצאות: {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/50 px-6 py-16 text-center text-[var(--muted)]">
            טוען הוצאות…
          </div>
        ) : (
          <ExpensesTable
            expenses={expenses}
            emailByUserId={emailByUserId}
            onAdd={() => {
              setEditing(null)
              setModalOpen(true)
            }}
            onEdit={(expense) => {
              setEditing(expense)
              setModalOpen(true)
            }}
            onArchive={(expense) => {
              if (confirm(`לארכב את "${expense.name}"?`)) {
                void archiveExpense(expense.id, userId)
              }
            }}
            onRestore={(expense) => {
              void restoreExpense(expense.id, userId)
            }}
          />
        )}
      </div>

      <ExpenseFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
