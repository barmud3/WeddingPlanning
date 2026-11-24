import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Expense, ExpenseFormValues } from '../types/expense'

export function useExpenses(includeArchived: boolean) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!includeArchived) {
      query = query.is('archived_at', null)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
      setExpenses([])
    } else {
      setExpenses((data as Expense[]) ?? [])
    }
    setLoading(false)
  }, [includeArchived])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createExpense = useCallback(
    async (values: ExpenseFormValues, userId: string) => {
      const { error: insertError } = await supabase.from('expenses').insert({
        name: values.name.trim(),
        category: values.category,
        supplier: values.supplier.trim(),
        estimated_cost: values.estimated_cost,
        final_cost: values.final_cost,
        amount_paid: values.amount_paid,
        due_date: values.due_date || null,
        status: values.status,
        notes: values.notes.trim(),
        created_by: userId,
        updated_by: userId,
      })
      if (insertError) throw insertError
      await refresh()
    },
    [refresh],
  )

  const updateExpense = useCallback(
    async (id: string, values: ExpenseFormValues, userId: string) => {
      const { error: updateError } = await supabase
        .from('expenses')
        .update({
          name: values.name.trim(),
          category: values.category,
          supplier: values.supplier.trim(),
          estimated_cost: values.estimated_cost,
          final_cost: values.final_cost,
          amount_paid: values.amount_paid,
          due_date: values.due_date || null,
          status: values.status,
          notes: values.notes.trim(),
          updated_by: userId,
        })
        .eq('id', id)
      if (updateError) throw updateError
      await refresh()
    },
    [refresh],
  )

  const archiveExpense = useCallback(
    async (id: string, userId: string) => {
      const { error: archiveError } = await supabase
        .from('expenses')
        .update({
          archived_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', id)
      if (archiveError) throw archiveError
      await refresh()
    },
    [refresh],
  )

  const restoreExpense = useCallback(
    async (id: string, userId: string) => {
      const { error: restoreError } = await supabase
        .from('expenses')
        .update({
          archived_at: null,
          updated_by: userId,
        })
        .eq('id', id)
      if (restoreError) throw restoreError
      await refresh()
    },
    [refresh],
  )

  return {
    expenses,
    loading,
    error,
    refresh,
    createExpense,
    updateExpense,
    archiveExpense,
    restoreExpense,
  }
}
