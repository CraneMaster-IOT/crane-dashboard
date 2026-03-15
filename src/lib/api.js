import { supabase } from './supabaseClient'
import { subHours, subDays, subWeeks, subMonths, subYears } from 'date-fns'

export async function fetchCurrentState() {
  const { data, error } = await supabase
    .from('motor_current_state')
    .select('*')
    .order('motor_id')
  if (error) throw error
  return data
}

export async function fetchTotalRuntime() {
  const { data, error } = await supabase.rpc('get_total_runtime_per_motor')
  if (error) throw error
  return data
}

export function getRangeStart(range) {
  const now = new Date()
  switch (range) {
    case '1h':   return subHours(now, 1)
    case '24h':  return subHours(now, 24)
    case '7d':   return subDays(now, 7)
    case '30d':  return subDays(now, 30)
    case '1y':   return subYears(now, 1)
    case 'all':  return null
    default:     return subDays(now, 7)
  }
}

export async function fetchRuntimeLog(motorId, range = '7d') {
  const rangeStart = getRangeStart(range)
  let query = supabase
    .from('motor_runtime_log')
    .select('*')
    .eq('motor_id', motorId)
    .order('started_at', { ascending: false })

  if (rangeStart) {
    query = query.gte('started_at', rangeStart.toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchAllRuntimeLog(range = '7d') {
  const rangeStart = getRangeStart(range)
  let query = supabase
    .from('motor_runtime_log')
    .select('*')
    .order('started_at', { ascending: false })

  if (rangeStart) {
    query = query.gte('started_at', rangeStart.toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return data
}
