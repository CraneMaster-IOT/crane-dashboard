import { useState, useEffect, useCallback, useRef } from 'react'

export function usePolling(fetchFn, interval = 1000, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn()
      if (mountedRef.current) {
        setData(result)
        setError(null)
        setLastUpdated(new Date())
        setLoading(false)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err)
        setLoading(false)
      }
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true
    fetch()
    const id = setInterval(fetch, interval)
    return () => {
      mountedRef.current = false
      clearInterval(id)
    }
  }, [fetch, interval])

  return { data, loading, error, lastUpdated, refetch: fetch }
}
