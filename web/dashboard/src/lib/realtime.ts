'use client'

import { useEffect } from 'react'
import { supabase } from './supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RealtimeCallback = (payload: Record<string, unknown>) => void

export function useRealtimeSubscription(
  table: string,
  callback: RealtimeCallback,
  filter?: string
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, callback, filter])
}
